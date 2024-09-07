$Firefly
		.createClass(
				"sap.firefly.InfoObjectAuthorization",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(authSelObject, aAuthActivity) {
							var iMasterdataAuthorization = new sap.firefly.InfoObjectAuthorization();
							iMasterdataAuthorization.setup(authSelObject,
									aAuthActivity);
							return iMasterdataAuthorization;
						}
					},
					m_auth_sel_object : null,
					m_auth_activities : null,
					setup : function(authSelObject, aAuthActivity) {
						this.m_auth_sel_object = authSelObject;
						if (aAuthActivity !== null) {
							this.m_auth_activities = aAuthActivity;
						} else {
							this.m_auth_activities = sap.firefly.XList.create();
						}
					},
					addAuthActivity : function(authActivity) {
						if (!this.m_auth_activities.contains(authActivity)) {
							this.m_auth_activities.add(authActivity);
						}
					},
					getAuthSelObject : function() {
						return this.m_auth_sel_object;
					},
					getAuthActivites : function() {
						return this.m_auth_activities;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectBaseManager",
				sap.firefly.XObject,
				{
					$statics : {
						createIInfoObjectBaseManager : function() {
							var iInfoObjectBaseManager = new sap.firefly.InfoObjectBaseManager();
							iInfoObjectBaseManager.setupBase();
							return iInfoObjectBaseManager;
						}
					},
					m_dimension_base : null,
					m_requested_ordered_fields : null,
					m_authorizations : null,
					m_instance_id : null,
					m_root_tuple : null,
					m_tuple_count : 0,
					m_max_tuple_count : 0,
					m_line_id : 0,
					m_info_object_metadata : null,
					setupBase : function() {
						this.m_instance_id = sap.firefly.XGuid.getGuid();
						this.m_authorizations = sap.firefly.XList.create();
						this.m_requested_ordered_fields = sap.firefly.XListOfString
								.create();
					},
					getInstanceId : function() {
						return this.m_instance_id;
					},
					setIQDimension : function(iQDimensionBase) {
						this.m_dimension_base = iQDimensionBase;
						this.m_info_object_metadata = sap.firefly.InfoObjectMetadata
								.createIInfoObjectMetadata(iQDimensionBase);
					},
					getDimension : function() {
						return this.getBaseDimension();
					},
					getMetadata : function() {
						return this.m_info_object_metadata;
					},
					getBaseDimension : function() {
						return this.m_dimension_base;
					},
					getFieldByName : function(name) {
						return this.getFieldBaseByName(name);
					},
					getFieldBaseByName : function(name) {
						return this.m_dimension_base.getFieldContainer()
								.getFieldByName(name);
					},
					addRequestedOrderedField : function(fieldName) {
						this.m_requested_ordered_fields.add(fieldName);
					},
					getRequestedOrderedFields : function() {
						return this.m_requested_ordered_fields;
					},
					resetRequestedOrderedFields : function() {
						this.m_requested_ordered_fields = sap.firefly.XListOfString
								.create();
					},
					getFields : function() {
						return this.m_dimension_base.getFieldContainer()
								.getFields();
					},
					addAuthorization : function(authorization) {
						if (authorization !== null) {
							this.m_authorizations.add(authorization);
						}
					},
					getAuthorizations : function() {
						return this.m_authorizations;
					},
					setTupleCount : function(tupleCount) {
						this.m_tuple_count = tupleCount;
					},
					getTupleCount : function() {
						return this.m_tuple_count;
					},
					setRootTuple : function(rootTuple) {
						this.m_root_tuple = rootTuple;
					},
					getRootTuple : function() {
						return this.m_root_tuple;
					},
					setMaxTupleCount : function(maxTupleCount) {
						this.m_max_tuple_count = maxTupleCount;
					},
					getMaxTupleCount : function() {
						return this.m_max_tuple_count;
					},
					clear : function(infoObjectClearOperation) {
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectCheckResult",
				sap.firefly.XObject,
				{
					$statics : {
						createIInfoObjectCheckResult : function(iXObject,
								technicalId, checkOperation, aIXMessage) {
							var iInfoObjectCheckResult = new sap.firefly.InfoObjectCheckResult();
							iInfoObjectCheckResult.setupBase(iXObject,
									technicalId, checkOperation, aIXMessage);
							return iInfoObjectCheckResult;
						}
					},
					m_object : null,
					m_technica_id : null,
					m_check_operation : null,
					m_messages : null,
					setupBase : function(iXObject, technicalId, checkOperation,
							aIXMessage) {
						this.m_object = iXObject;
						this.m_technica_id = technicalId;
						this.m_check_operation = checkOperation;
						this.m_messages = aIXMessage;
						if (this.m_messages === null) {
							this.m_messages = sap.firefly.XList.create();
						}
					},
					getCheckOperation : function() {
						return this.m_check_operation;
					},
					addCheckMessage : function(iXMessage) {
						if (iXMessage !== null) {
							this.m_messages.add(iXMessage);
						}
					},
					getCheckMessages : function() {
						return this.m_messages;
					},
					getCheckReference : function() {
						return this.m_object;
					},
					getTechnicalId : function() {
						return this.m_technica_id;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectCheckResultManager",
				sap.firefly.XObject,
				{
					$statics : {
						createIInfoObjectCheckResultManager : function(
								aIInfoObjectCheckResult) {
							var iInfoObjectCheckResultManager = new sap.firefly.InfoObjectCheckResultManager();
							iInfoObjectCheckResultManager
									.setupBase(aIInfoObjectCheckResult);
							return iInfoObjectCheckResultManager;
						}
					},
					m_aIInfoObjectCheckResult : null,
					m_severity : null,
					setupBase : function(aIInfoObjectCheckResult) {
						var iteratorCheck;
						this.m_severity = sap.firefly.Severity.INFO;
						this.m_aIInfoObjectCheckResult = sap.firefly.XHashMapByString
								.create();
						if (aIInfoObjectCheckResult !== null) {
							iteratorCheck = aIInfoObjectCheckResult
									.getIterator();
							while (iteratorCheck.hasNext()) {
								this.addInfoObjectCheckResult(iteratorCheck
										.next());
							}
						}
					},
					addInfoObjectCheckResult : function(iInfoObjectCheckResult) {
						var aIXMessage;
						var iTIXMessage;
						var iXMessage;
						if (iInfoObjectCheckResult === null) {
							return;
						}
						this.m_aIInfoObjectCheckResult.put(
								(iInfoObjectCheckResult).getTechnicalId(),
								iInfoObjectCheckResult);
						aIXMessage = iInfoObjectCheckResult.getCheckMessages();
						iTIXMessage = aIXMessage.getIterator();
						if (iTIXMessage.hasNext()) {
							iXMessage = iTIXMessage.next();
							if (this.m_severity === sap.firefly.Severity.INFO) {
								if (sap.firefly.Severity.ERROR === iXMessage
										.getSeverity()) {
									this.m_severity = sap.firefly.Severity.ERROR;
								} else {
									if (sap.firefly.Severity.SEMANTICAL_ERROR === iXMessage
											.getSeverity()) {
										this.m_severity = sap.firefly.Severity.SEMANTICAL_ERROR;
									} else {
										if (sap.firefly.Severity.WARNING === iXMessage
												.getSeverity()) {
											this.m_severity = sap.firefly.Severity.WARNING;
										}
									}
								}
							} else {
								if (this.m_severity === sap.firefly.Severity.WARNING) {
									if (sap.firefly.Severity.ERROR === iXMessage
											.getSeverity()) {
										this.m_severity = sap.firefly.Severity.ERROR;
									} else {
										if (sap.firefly.Severity.SEMANTICAL_ERROR === iXMessage
												.getSeverity()) {
											this.m_severity = sap.firefly.Severity.SEMANTICAL_ERROR;
										}
									}
								} else {
									if (this.m_severity === sap.firefly.Severity.SEMANTICAL_ERROR) {
										if (sap.firefly.Severity.ERROR === iXMessage
												.getSeverity()) {
											this.m_severity = sap.firefly.Severity.ERROR;
										}
									}
								}
							}
						}
					},
					getCheckResult : function() {
						var aIInfoObjectCheckResult = sap.firefly.XList
								.create();
						var itIInfoObjectCheckResult = this.m_aIInfoObjectCheckResult
								.getIterator();
						while (itIInfoObjectCheckResult.hasNext()) {
							aIInfoObjectCheckResult
									.add(itIInfoObjectCheckResult.next());
						}
						return aIInfoObjectCheckResult;
					},
					getCheckResultById : function(technicalId) {
						return this.m_aIInfoObjectCheckResult
								.getByKey(technicalId);
					},
					getCheckSeverity : function() {
						return this.m_severity;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectHierarchyManagerFactory",
				sap.firefly.XObject,
				{
					$statics : {
						MIN_DATE : "10000101",
						MAX_DATE : "99991231",
						createIInfoObjectHierarchyManagerFactory : function(
								iInfoObjectDimensionManager, application,
								config, iQHierarchyValueHelp) {
							var iInfoObjectHierarchyManagerFactory = new sap.firefly.InfoObjectHierarchyManagerFactory();
							iInfoObjectHierarchyManagerFactory.setup(
									iInfoObjectDimensionManager, application,
									config, iQHierarchyValueHelp);
							return iInfoObjectHierarchyManagerFactory;
						}
					},
					m_application : null,
					m_config : null,
					m_server_metadata : null,
					m_dimension_manager : null,
					m_hierarchy_to_hierarchy_manager : null,
					m_hierarchy_value_help : null,
					m_hierarchy_dimension_value_help : null,
					m_hierarchy_dimension : null,
					m_hierarchy_interval_dimension : null,
					setup : function(iInfoObjectDimensionManager, application,
							config, iQHierarchyValueHelp) {
						var connectionPoolSetup;
						var connectionSetup;
						var iQDimension;
						var iXNameValuePair;
						this.m_config = config;
						this.m_application = application;
						connectionPoolSetup = this.m_application
								.getConnectionPool();
						connectionSetup = connectionPoolSetup
								.getConnection(this.m_config.getSystemName());
						this.m_server_metadata = connectionSetup
								.getServerMetadata();
						this.m_dimension_manager = iInfoObjectDimensionManager;
						this.m_hierarchy_value_help = iQHierarchyValueHelp;
						if (this.m_hierarchy_value_help === null) {
							this.m_hierarchy_value_help = this.m_dimension_manager
									.getIQHierarchyValueHelp();
						}
						if (this.m_hierarchy_value_help !== null) {
							this.m_hierarchy_dimension_value_help = this.m_hierarchy_value_help
									.getQueryModel()
									.getDimensionByType(
											sap.firefly.DimensionType.DIMENSION);
						}
						this.m_hierarchy_dimension = this
								.getInfoObjectHierarchyMemberMetadata();
						iQDimension = this.m_dimension_manager.getDimension();
						iXNameValuePair = iQDimension
								.getNameValuePair(sap.firefly.InAConstants.QY_HIERARCHY_INTERVALS);
						if ((iXNameValuePair !== null)
								&& sap.firefly.XString.isEqual("true",
										iXNameValuePair.getValue())) {
							this.m_hierarchy_interval_dimension = this
									.getInfoObjectHierarchyIntervalMetadata();
						}
						this.m_hierarchy_to_hierarchy_manager = sap.firefly.XHashMapByString
								.create();
					},
					getHierarchyManager : function(iQHierarchy) {
						var iInfoObjectHierarchyManager = (this.m_dimension_manager)
								.getHierarchyManager();
						var iInfoObjectHierarchyManagerNull;
						var iQDimension;
						var iXNameValuePair;
						var iInfoObjectHierarchyIntervalManager;
						var iInfoObjectHierarchyManagerOld;
						var iInfoObjectHierarchyManagerNew;
						var iQDimensionIQHierarchy;
						var iXNameValuePairIQHierarchy;
						var iInfoObjectHierarchyIntervalManagerIQHierarchy;
						if (iInfoObjectHierarchyManager === null) {
							if (this.m_hierarchy_value_help === null) {
								this.m_hierarchy_value_help = this.m_dimension_manager
										.getIQHierarchyValueHelp();
							}
							iInfoObjectHierarchyManagerNull = sap.firefly.InfoObjectHierarchyManager
									.createIInfoObjectHierarchyManager(
											this.m_dimension_manager,
											this.m_hierarchy_value_help,
											this.m_hierarchy_dimension,
											this.m_server_metadata, iQHierarchy);
							(this.m_dimension_manager)
									.setHierarchyManager(iInfoObjectHierarchyManagerNull);
							iQDimension = this.m_dimension_manager
									.getDimension();
							iXNameValuePair = iQDimension
									.getNameValuePair(sap.firefly.InAConstants.QY_HIERARCHY_INTERVALS);
							if ((iXNameValuePair !== null)
									&& sap.firefly.XString.isEqual("true",
											iXNameValuePair.getValue())) {
								iInfoObjectHierarchyIntervalManager = sap.firefly.InfoObjectHierarchyIntervalManager
										.createInfoObjectHierarchyIntervalManager(
												(this.m_dimension_manager)
														.getHierarchyManager(),
												this.m_hierarchy_interval_dimension);
								((this.m_dimension_manager)
										.getHierarchyManager())
										.setHierarchyIntervalManager(iInfoObjectHierarchyIntervalManager);
							}
							if (!sap.firefly.XString
									.isEqual(
											iQHierarchy.getHierId(),
											sap.firefly.InfoObjectHierarchyManager.HIERARCHY_ID_VALUE_INITIAL)) {
								this.m_hierarchy_to_hierarchy_manager.put(
										iQHierarchy.getHierId(),
										iInfoObjectHierarchyManagerNull);
							}
							return iInfoObjectHierarchyManagerNull;
						}
						if (this.m_hierarchy_to_hierarchy_manager
								.containsKey(iQHierarchy.getHierId())) {
							iInfoObjectHierarchyManagerOld = this.m_hierarchy_to_hierarchy_manager
									.getByKey(iQHierarchy.getHierId());
							(this.m_dimension_manager)
									.setHierarchyManager(iInfoObjectHierarchyManagerOld);
							return iInfoObjectHierarchyManagerOld;
						}
						if (this.m_hierarchy_value_help === null) {
							this.m_hierarchy_value_help = this.m_dimension_manager
									.getIQHierarchyValueHelp();
						}
						iInfoObjectHierarchyManagerNew = sap.firefly.InfoObjectHierarchyManager
								.createIInfoObjectHierarchyManager(
										this.m_dimension_manager,
										this.m_hierarchy_value_help,
										this.m_hierarchy_dimension,
										this.m_server_metadata, iQHierarchy);
						(this.m_dimension_manager)
								.setHierarchyManager(iInfoObjectHierarchyManagerNew);
						iQDimensionIQHierarchy = this.m_dimension_manager
								.getDimension();
						iXNameValuePairIQHierarchy = iQDimensionIQHierarchy
								.getNameValuePair(sap.firefly.InAConstants.QY_HIERARCHY_INTERVALS);
						if ((iXNameValuePairIQHierarchy !== null)
								&& sap.firefly.XString.isEqual("true",
										iXNameValuePairIQHierarchy.getValue())) {
							iInfoObjectHierarchyIntervalManagerIQHierarchy = sap.firefly.InfoObjectHierarchyIntervalManager
									.createInfoObjectHierarchyIntervalManager(
											(this.m_dimension_manager)
													.getHierarchyManager(),
											this.m_hierarchy_interval_dimension);
							((this.m_dimension_manager).getHierarchyManager())
									.setHierarchyIntervalManager(iInfoObjectHierarchyIntervalManagerIQHierarchy);
						}
						if (!sap.firefly.XString
								.isEqual(
										iQHierarchy.getHierId(),
										sap.firefly.InfoObjectHierarchyManager.HIERARCHY_ID_VALUE_INITIAL)) {
							this.m_hierarchy_to_hierarchy_manager.put(
									iQHierarchy.getHierId(),
									iInfoObjectHierarchyManagerNew);
						}
						return iInfoObjectHierarchyManagerNew;
					},
					clearHierarchyManager : function(iQHierarchy) {
						if (iQHierarchy === null) {
							return;
						}
						this.m_hierarchy_to_hierarchy_manager
								.remove(iQHierarchy.getHierId());
					},
					getInitialIQHierarchy : function(name) {
						var iQHierarchy = sap.firefly.QHierarchy.create(
								this.m_hierarchy_dimension_value_help
										.getContext(),
								this.m_hierarchy_dimension_value_help, name);
						iQHierarchy
								.setHierId(sap.firefly.InfoObjectHierarchyManager.HIERARCHY_ID_VALUE_INITIAL);
						iQHierarchy
								.setDateFrom(sap.firefly.XDate
										.createDateFromSAPFormat(sap.firefly.InfoObjectHierarchyManagerFactory.MIN_DATE));
						iQHierarchy
								.setDateTo(sap.firefly.XDate
										.createDateFromSAPFormat(sap.firefly.InfoObjectHierarchyManagerFactory.MAX_DATE));
						iQHierarchy
								.setHierType(sap.firefly.InAConstants.VA_HIERARCHY_TYPE_MD_IO);
						return iQHierarchy;
					},
					getInfoObjectHierarchyMemberMetadata : function() {
						var identifier = this.m_config.getDataSource();
						var serviceConfig;
						var serviceExtResult;
						var iQueryManager;
						identifier
								.setType(sap.firefly.MetaObjectType.HIERARCHY_MEMBER);
						serviceConfig = sap.firefly.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER
								.createServiceConfig(this.m_application);
						serviceConfig
								.setProviderType(sap.firefly.ProviderType.ANALYTICS);
						serviceConfig.setSystemName(this.m_config
								.getSystemName());
						serviceConfig.setDataSource(identifier);
						serviceExtResult = serviceConfig
								.processQueryManagerCreation(
										sap.firefly.SyncType.BLOCKING, null,
										null);
						if (serviceExtResult === null) {
							throw sap.firefly.XException
									.createRuntimeException("IQueryConsumerService is NULL");
						}
						if (serviceExtResult.hasErrors()
								|| (serviceExtResult.getData() === null)) {
							throw sap.firefly.XException
									.createRuntimeException(serviceExtResult
											.getSummary());
						}
						iQueryManager = serviceExtResult.getData();
						if (iQueryManager !== null) {
							return iQueryManager
									.getQueryModel()
									.getDimensionByType(
											sap.firefly.DimensionType.DIMENSION);
						}
						return null;
					},
					getInfoObjectHierarchyIntervalMetadata : function() {
						var identifier = this.m_config.getDataSource();
						var serviceConfig;
						var serviceExtResult;
						var iQueryManager;
						identifier
								.setType(sap.firefly.MetaObjectType.HIERARCHY_INTERVAL);
						serviceConfig = sap.firefly.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER
								.createServiceConfig(this.m_application);
						serviceConfig
								.setProviderType(sap.firefly.ProviderType.ANALYTICS);
						serviceConfig.setSystemName(this.m_config
								.getSystemName());
						serviceConfig.setDataSource(identifier);
						serviceExtResult = serviceConfig
								.processQueryManagerCreation(
										sap.firefly.SyncType.BLOCKING, null,
										null);
						if (serviceExtResult === null) {
							throw sap.firefly.XException
									.createRuntimeException("IQueryConsumerService is NULL");
						}
						if (serviceExtResult.hasErrors()
								|| (serviceExtResult.getData() === null)) {
							throw sap.firefly.XException
									.createRuntimeException(serviceExtResult
											.getSummary());
						}
						iQueryManager = serviceExtResult.getData();
						if (iQueryManager !== null) {
							return iQueryManager
									.getQueryModel()
									.getDimensionByType(
											sap.firefly.DimensionType.DIMENSION);
						}
						return null;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectMetadata",
				sap.firefly.XObject,
				{
					$statics : {
						createIInfoObjectMetadata : function(iQDimension) {
							var iInfoObjectMetadata = new sap.firefly.InfoObjectMetadata();
							iInfoObjectMetadata.setup(iQDimension);
							return iInfoObjectMetadata;
						}
					},
					m_dimension : null,
					setup : function(iQDimension) {
						if (iQDimension === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("IQDimension is NULL");
						}
						this.m_dimension = iQDimension;
					},
					checkHierarchy : function(iQHierarchy, propertyName1,
							propertyName2) {
						var iXNameValuePairLocal;
						var iXNameValuePair;
						if (iQHierarchy === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("IQHierarchy is NULL");
						}
						if (sap.firefly.XString.isEqual(iQHierarchy
								.getHierType(),
								sap.firefly.InAConstants.VA_HIERARCHY_TYPE_LH)) {
							iXNameValuePairLocal = this.m_dimension
									.getNameValuePair(propertyName1);
							if ((iXNameValuePairLocal !== null)
									&& sap.firefly.XString.isEqual("true",
											iXNameValuePairLocal.getValue())) {
								return true;
							}
						} else {
							iXNameValuePair = this.m_dimension
									.getNameValuePair(propertyName2);
							if ((iXNameValuePair !== null)
									&& sap.firefly.XString.isEqual("true",
											iXNameValuePair.getValue())) {
								return true;
							}
						}
						return false;
					},
					isHierarchyMaintenanceAllowed : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_MAINTENANCE,
										sap.firefly.InAConstants.QY_HIERARCHY_MAINTENANCE);
					},
					isHierarchyCreationAllowed : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_CREATION,
										sap.firefly.InAConstants.QY_HIERARCHY_CREATION);
					},
					isHierarchyCreationByReferenceAllowed : function(
							iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_CREATION_BY_REFERENCE,
										sap.firefly.InAConstants.QY_HIERARCHY_CREATION_BY_REFERENCE);
					},
					isHierarchyUpdateAllowed : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_UPDATE,
										sap.firefly.InAConstants.QY_HIERARCHY_UPDATE);
					},
					isHierarchyCopyAllowed : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_COPY,
										sap.firefly.InAConstants.QY_HIERARCHY_COPY);
					},
					isHierarchyDeletionAllowed : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_DELETION,
										sap.firefly.InAConstants.QY_HIERARCHY_DELETION);
					},
					isHierarchySavingAllowed : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_SAVING,
										sap.firefly.InAConstants.QY_HIERARCHY_SAVING);
					},
					isHierarchyActivationAllowed : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_ACTIVATION,
										sap.firefly.InAConstants.QY_HIERARCHY_ACTIVATION);
					},
					isHierarchyExternalDimensionAllowed : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_EXTERNAL_DIMENSION,
										sap.firefly.InAConstants.QY_HIERARCHY_EXTERNAL_DIMENSION);
					},
					isHierarchyReverseSignAllowed : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_REVERSE_SIGN,
										sap.firefly.InAConstants.QY_HIERARCHY_REVERSE_SIGN);
					},
					isHierarchyIntervalAllowed : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_INTERVALS,
										sap.firefly.InAConstants.QY_HIERARCHY_INTERVALS);
					},
					isHierarchyStructureTimeDependent : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_STRUCTURE_TIME_DEP,
										sap.firefly.InAConstants.QY_HIERARCHY_STRUCTURE_TIME_DEP);
					},
					isHierarchyTimeDependent : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_TIME_DEP,
										sap.firefly.InAConstants.QY_HIERARCHY_TIME_DEP);
					},
					isHierarchyVersionDependent : function(iQHierarchy) {
						return this
								.checkHierarchy(
										iQHierarchy,
										sap.firefly.InAConstants.QY_HIERARCHY_LOCAL_VERSION_DEP,
										sap.firefly.InAConstants.QY_HIERARCHY_VERSION_DEP);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectResult",
				sap.firefly.XObject,
				{
					$statics : {
						FIELD_NAME_CHECK_REFID : "REFID",
						FIELD_NAME_CHECK_ORDERID : "ORDERID",
						FIELD_NAME_CHECK_OPERATION : "OPERATION",
						FIELD_NAME_CHECK_SEVERITY : "SEVERITY",
						FIELD_NAME_CHECK_MESSAGE : "MESSAGE",
						create : function(application,
								iInfoObjectServiceConfig,
								iInfoObjectDimensionManager) {
							var iInfoObjectResult = new sap.firefly.InfoObjectResult();
							iInfoObjectResult.setup(application,
									iInfoObjectServiceConfig,
									iInfoObjectDimensionManager);
							return iInfoObjectResult;
						}
					},
					m_application : null,
					m_config : null,
					m_import_aggregator : null,
					m_mode : null,
					m_dimension_manager : null,
					m_manager : null,
					m_check_result_manager : null,
					m_check_refs : null,
					m_messages : null,
					setup : function(application, iInfoObjectServiceConfig,
							iInfoObjectDimensionManager) {
						this.m_application = application;
						this.m_config = iInfoObjectServiceConfig;
						this.m_import_aggregator = sap.firefly.QInAImportFactory
								.createForMetadata(
										this.m_application,
										sap.firefly.CapabilityContainer
												.create(sap.firefly.InAConstants.QY_BW_MASTER_DATA));
						this.m_mode = sap.firefly.InfoObjectMode._NONE;
						this.m_dimension_manager = iInfoObjectDimensionManager;
						if (iInfoObjectDimensionManager === null) {
							this.m_dimension_manager = sap.firefly.InfoObjectDimensionManager
									.createIInfoObjectDimensionManager(
											this.m_application, this.m_config);
						}
						this.m_check_refs = sap.firefly.XListOfString.create();
						this.m_messages = sap.firefly.XList.create();
					},
					getDimensionManager : function() {
						return this.m_dimension_manager;
					},
					getInfoObjectMode : function() {
						return this.m_mode;
					},
					getCheckResultManager : function() {
						return this.m_check_result_manager;
					},
					parse : function(iPrStructure, mode) {
						this.m_mode = mode;
						if (this.m_mode.getIsHierarchy()) {
							if ((this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_METADATA)
									|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_GET)
									|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_CHECK)
									|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_MODIFY)) {
								if (this.m_dimension_manager
										.getHierarchyManager() !== null) {
									this.m_check_result_manager = sap.firefly.InfoObjectCheckResultManager
											.createIInfoObjectCheckResultManager((this.m_dimension_manager
													.getHierarchyManager()
													.getHierarchyIntervalManager())
													.getHierarchyIntervalMemberForCheck());
								}
								this.m_manager = this.m_dimension_manager
										.getHierarchyManager()
										.getHierarchyIntervalManager();
								this.m_manager
										.clear(sap.firefly.InfoObjectClearOperation._CLEAR_ALL);
							} else {
								if (this.m_dimension_manager
										.getHierarchyManager() !== null) {
									if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_CHECK) {
										this.m_check_result_manager = sap.firefly.InfoObjectCheckResultManager
												.createIInfoObjectCheckResultManager((this.m_dimension_manager
														.getHierarchyManager())
														.getIQHierarchyForCheck());
									} else {
										this.m_check_result_manager = sap.firefly.InfoObjectCheckResultManager
												.createIInfoObjectCheckResultManager((this.m_dimension_manager
														.getHierarchyManager())
														.getHierarchyMemberForCheck());
									}
								}
								this.m_manager = this.m_dimension_manager
										.getHierarchyManager();
								if ((this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_METADATA)
										|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_GET)
										|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_MODIFY)) {
									this.m_manager
											.clear(sap.firefly.InfoObjectClearOperation._CLEAR_HIERARCHY_MEMBER);
								} else {
									if ((this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_GET)
											|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MODIFY)
											|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_COPY)) {
										this.m_manager
												.clear(sap.firefly.InfoObjectClearOperation._CLEAR_HIERARCHY);
									} else {
										if ((this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_SAVE)
												|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_ACTIVATE)
												|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_SAVE_AND_ACTIVATE)) {
											this.m_manager
													.clear(sap.firefly.InfoObjectClearOperation._CLEAR_ALL);
										}
									}
								}
							}
						} else {
							this.m_manager = this.m_dimension_manager;
							this.m_manager
									.clear(sap.firefly.InfoObjectClearOperation._CLEAR_ALL);
						}
						if (this.m_mode === sap.firefly.InfoObjectMode._METADATA) {
							this.parseMetadata(iPrStructure);
						} else {
							if (this.m_mode === sap.firefly.InfoObjectMode._GET) {
								this.parseGet(iPrStructure);
							} else {
								if (this.m_mode === sap.firefly.InfoObjectMode._MODIFY) {
									this.parseSet(iPrStructure);
								} else {
									if ((this.m_mode === sap.firefly.InfoObjectMode._SAVE)
											|| (this.m_mode === sap.firefly.InfoObjectMode._SAVE_AND_ACTIVATE)) {
										this.parseSave(iPrStructure);
									} else {
										if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_METADATA) {
											this.parseMetadata(iPrStructure);
										} else {
											if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_GET) {
												this.parseGet(iPrStructure);
												if (this.m_mode
														.getIsHierarchy()) {
													(this.m_dimension_manager
															.getHierarchyManager())
															.sortParentHierarchyMember();
												}
											} else {
												if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_CHECK) {
													this
															.parseCheck(iPrStructure);
												} else {
													if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_MODIFY) {
														this
																.parseSet(iPrStructure);
														if (this.m_mode
																.getIsHierarchy()) {
															(this.m_dimension_manager
																	.getHierarchyManager())
																	.sortParentHierarchyMember();
														}
													} else {
														if ((this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_SAVE)
																|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_SAVE_AND_ACTIVATE)
																|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_ACTIVATE)) {
															this
																	.parseSave(iPrStructure);
															if (this.m_mode
																	.getIsHierarchy()) {
																(this.m_dimension_manager
																		.getHierarchyManager())
																		.sortParentHierarchyMember();
															}
														} else {
															if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_CHECK) {
																this
																		.parseCheck(iPrStructure);
															} else {
																if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MODIFY) {
																	this
																			.parseSet(iPrStructure);
																} else {
																	if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_COPY) {
																		this
																				.parseSet(iPrStructure);
																	} else {
																		if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_METADATA) {
																			this
																					.parseMetadata(iPrStructure);
																		} else {
																			if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_GET) {
																				this
																						.parseGet(iPrStructure);
																			} else {
																				if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_CHECK) {
																					this
																							.parseCheck(iPrStructure);
																				} else {
																					if (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_MODIFY) {
																						this
																								.parseSet(iPrStructure);
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					},
					parseInfoObject : function(iPrStructure) {
						var prElementTypeInfoObject;
						var iPrStructureInfoObject;
						var prElementTypeCube;
						var iPrStructureCube;
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_MASTERDATA)) {
							prElementTypeInfoObject = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_MASTERDATA);
							if (prElementTypeInfoObject === sap.firefly.PrElementType.STRUCTURE) {
								iPrStructureInfoObject = iPrStructure
										.getStructureByName(sap.firefly.InAConstants.QY_MASTERDATA);
								if (iPrStructureInfoObject !== null) {
									this
											.parseDataSource(iPrStructureInfoObject);
									this
											.parseAuthorizations(iPrStructureInfoObject);
									this
											.parseDimensions(iPrStructureInfoObject);
								}
							}
						} else {
							if (iPrStructure
									.hasValueByName(sap.firefly.InAConstants.QY_CUBE)) {
								prElementTypeCube = iPrStructure
										.getElementTypeByName(sap.firefly.InAConstants.QY_CUBE);
								if (prElementTypeCube === sap.firefly.PrElementType.STRUCTURE) {
									iPrStructureCube = iPrStructure
											.getStructureByName(sap.firefly.InAConstants.QY_CUBE);
									if (iPrStructureCube !== null) {
										this.parseDataSource(iPrStructureCube);
										this
												.parseAuthorizations(iPrStructureCube);
										this.parseDimensions(iPrStructureCube);
									}
								}
							}
						}
					},
					parseDataSource : function(iPrStructure) {
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_DATA_SOURCE)) {
							this.m_import_aggregator
									.importDataSource(iPrStructure);
						}
					},
					parseAuthorizations : function(iPrStructure) {
						var prElementTypeAuthorizations;
						var iPrListAuthorizations;
						var iAuthorizations;
						var iPrStructureArray;
						var prElementTypeSelectionObject;
						var iPrStructureSelectionObject;
						var selectionObjectName;
						var infoobjectAuthSelObject;
						var aAuthActivity;
						var prElementTypeActivities;
						var iPrListActivities;
						var iActivities;
						var activity;
						var infoobjectAuthActivity;
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_AUTHORIZATIONS)) {
							prElementTypeAuthorizations = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_AUTHORIZATIONS);
							if (prElementTypeAuthorizations === sap.firefly.PrElementType.LIST) {
								iPrListAuthorizations = iPrStructure
										.getListByName(sap.firefly.InAConstants.QY_AUTHORIZATIONS);
								for (iAuthorizations = 0; iAuthorizations < iPrListAuthorizations
										.size(); iAuthorizations++) {
									iPrStructureArray = iPrListAuthorizations
											.getStructureByIndex(iAuthorizations);
									if ((iPrStructureArray !== null)
											&& iPrStructureArray
													.hasValueByName(sap.firefly.InAConstants.QY_SELECTION_OBJECT)) {
										prElementTypeSelectionObject = iPrStructureArray
												.getElementTypeByName(sap.firefly.InAConstants.QY_SELECTION_OBJECT);
										if (prElementTypeSelectionObject === sap.firefly.PrElementType.STRUCTURE) {
											iPrStructureSelectionObject = iPrStructureArray
													.getStructureByName(sap.firefly.InAConstants.QY_SELECTION_OBJECT);
											if (iPrStructureSelectionObject !== null) {
												selectionObjectName = iPrStructureSelectionObject
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_NAME,
																null);
												infoobjectAuthSelObject = sap.firefly.InfoObjectAuthSelObject
														.getAuthSelObject(selectionObjectName);
												aAuthActivity = sap.firefly.XList
														.create();
												if (iPrStructureSelectionObject
														.hasValueByName(sap.firefly.InAConstants.QY_ACTIVITIES)) {
													prElementTypeActivities = iPrStructureSelectionObject
															.getElementTypeByName(sap.firefly.InAConstants.QY_ACTIVITIES);
													if (prElementTypeActivities === sap.firefly.PrElementType.LIST) {
														iPrListActivities = iPrStructureSelectionObject
																.getListByName(sap.firefly.InAConstants.QY_ACTIVITIES);
														for (iActivities = 0; iActivities < iPrListActivities
																.size(); iActivities++) {
															activity = iPrListActivities
																	.getStringByIndex(iActivities);
															infoobjectAuthActivity = sap.firefly.InfoObjectAuthActivity
																	.getAuthActivity(activity);
															aAuthActivity
																	.add(infoobjectAuthActivity);
														}
													}
												}
												this.m_manager
														.addAuthorization(sap.firefly.InfoObjectAuthorization
																.create(
																		infoobjectAuthSelObject,
																		aAuthActivity));
											}
										}
									}
								}
							}
						}
					},
					parseMetadata : function(iPrStructure) {
						this.parseInfoObject(iPrStructure);
					},
					parseGet : function(iPrStructure) {
						this.parseGrids(iPrStructure);
					},
					parseSet : function(iPrStructure) {
						this.parseGrids(iPrStructure);
					},
					parseCheck : function(iPrStructure) {
						this.parseGrids(iPrStructure);
					},
					parseSave : function(iPrStructure) {
						this.parseGrids(iPrStructure);
					},
					parseGrids : function(iPrStructure) {
						var prElementTypeGrids;
						var iPrListGrids;
						var iGrids;
						var iPrStructureGrid;
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_GRIDS)) {
							prElementTypeGrids = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_GRIDS);
							if (prElementTypeGrids === sap.firefly.PrElementType.LIST) {
								iPrListGrids = iPrStructure
										.getListByName(sap.firefly.InAConstants.QY_GRIDS);
								for (iGrids = 0; iGrids < iPrListGrids.size(); iGrids++) {
									iPrStructureGrid = iPrListGrids
											.getStructureByIndex(iGrids);
									if (iPrStructureGrid !== null) {
										this.parseAxes(iPrStructureGrid);
									}
								}
							}
						}
					},
					parseAxes : function(iPrStructure) {
						var prElementTypeAxes;
						var iPrListAxes;
						var iAxes;
						var iPrStructureAxis;
						var tupleCount;
						var maxTupleCount;
						var rootTuple;
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_AXES)) {
							prElementTypeAxes = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_AXES);
							if (prElementTypeAxes === sap.firefly.PrElementType.LIST) {
								iPrListAxes = iPrStructure
										.getListByName(sap.firefly.InAConstants.QY_AXES);
								for (iAxes = 0; iAxes < iPrListAxes.size(); iAxes++) {
									iPrStructureAxis = iPrListAxes
											.getStructureByIndex(iAxes);
									if (iPrStructureAxis !== null) {
										tupleCount = iPrStructureAxis
												.getIntegerByNameWithDefault(
														sap.firefly.InAConstants.QY_TUPLE_COUNT,
														0);
										this.m_manager
												.setTupleCount(tupleCount);
										maxTupleCount = iPrStructureAxis
												.getIntegerByNameWithDefault(
														sap.firefly.InAConstants.QY_MAX_TUPLE_COUNT,
														0);
										this.m_manager
												.setMaxTupleCount(maxTupleCount);
										rootTuple = iPrStructureAxis
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_ROOT_TUPLE,
														null);
										this.m_manager.setRootTuple(rootTuple);
										this.parseDimensions(iPrStructureAxis);
									}
								}
							}
						}
					},
					parseDimensions : function(iPrStructure) {
						var prElementTypeDimensions;
						var iPrListDimensions;
						var iDimensions;
						var iPrStructureDimension;
						var name;
						var description;
						var iQAttributeBase;
						var iQDimensionBaseMetadata;
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_DIMENSIONS)) {
							prElementTypeDimensions = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_DIMENSIONS);
							if (prElementTypeDimensions === sap.firefly.PrElementType.LIST) {
								iPrListDimensions = iPrStructure
										.getListByName(sap.firefly.InAConstants.QY_DIMENSIONS);
								for (iDimensions = 0; iDimensions < iPrListDimensions
										.size(); iDimensions++) {
									iPrStructureDimension = iPrListDimensions
											.getStructureByIndex(iDimensions);
									if (iPrStructureDimension !== null) {
										name = iPrStructureDimension
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_NAME,
														null);
										description = iPrStructureDimension
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_DESCRIPTION,
														null);
										iQAttributeBase = null;
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.InfoObjectMode._METADATA
																.getName(),
														this.m_mode.getName())) {
											if (sap.firefly.XString.isEqual(
													name, this.m_config
															.getDataSource()
															.getObjectName())) {
												iQDimensionBaseMetadata = this.m_import_aggregator
														.importDimension(
																iPrStructureDimension,
																null);
												iQDimensionBaseMetadata
														.setAxis(sap.firefly.InfoObjectQAxis
																.createAxis(sap.firefly.AxisType.ROWS));
												iQDimensionBaseMetadata
														.addSupportedFieldLayoutType(sap.firefly.FieldLayoutType.ATTRIBUTE_BASED);
												iQDimensionBaseMetadata
														.addSupportedFieldLayoutType(sap.firefly.FieldLayoutType.FIELD_BASED);
												iQDimensionBaseMetadata
														.setFieldLayoutType(sap.firefly.FieldLayoutType.ATTRIBUTE_BASED);
												iQAttributeBase = sap.firefly.QAttribute
														.createAttribute(null,
																iQDimensionBaseMetadata);
												iQAttributeBase.setName(name);
												iQAttributeBase
														.setText(description);
												iQDimensionBaseMetadata
														.getAttributeContainerBase()
														.setMainAttribute(
																iQAttributeBase);
												iQDimensionBaseMetadata
														.getAttributeContainerBase()
														.addAttribute(
																iQAttributeBase);
												this.m_manager
														.setIQDimension(iQDimensionBaseMetadata);
											} else {
												iQAttributeBase = sap.firefly.QAttribute
														.createAttribute(
																null,
																this.m_manager
																		.getBaseDimension());
												iQAttributeBase.setName(name);
												iQAttributeBase
														.setText(description);
												this.m_manager
														.getBaseDimension()
														.getAttributeContainerBase()
														.addAttribute(
																iQAttributeBase);
											}
										}
										this.parseAttributes(
												iPrStructureDimension,
												iQAttributeBase);
									}
								}
							}
						}
					},
					parseAttributes : function(iPrStructure, iQAttributeBase) {
						var prElementTypeAttributes;
						var iPrListAttributes;
						var iAttributes;
						var isFinal;
						var iPrStructureAttribute;
						var name;
						var description;
						var isFilterable;
						var dataTypeString;
						var dataType;
						var presentationTypeString;
						var presentationType;
						var fieldName;
						var length;
						var decimals;
						var initialValue;
						var lowerCaseEnabled;
						var conversionRoutine;
						var visibilityType;
						var iQFieldBaseMetadata;
						if ((this.m_mode !== sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_CHECK)
								&& (this.m_mode !== sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_CHECK)
								&& (this.m_mode !== sap.firefly.InfoObjectMode._HIERARCHY_CHECK)) {
							this.m_manager.resetRequestedOrderedFields();
						}
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_ATTRIBUTES)) {
							prElementTypeAttributes = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_ATTRIBUTES);
							if (prElementTypeAttributes === sap.firefly.PrElementType.LIST) {
								iPrListAttributes = iPrStructure
										.getListByName(sap.firefly.InAConstants.QY_ATTRIBUTES);
								for (iAttributes = 0; iAttributes < iPrListAttributes
										.size(); iAttributes++) {
									isFinal = false;
									if (iAttributes === (iPrListAttributes
											.size() - 1)) {
										isFinal = true;
									}
									iPrStructureAttribute = iPrListAttributes
											.getStructureByIndex(iAttributes);
									if (iPrStructureAttribute !== null) {
										name = iPrStructureAttribute
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_NAME,
														null);
										description = iPrStructureAttribute
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_DESCRIPTION,
														null);
										isFilterable = iPrStructureAttribute
												.getBooleanByNameWithDefault(
														sap.firefly.InAConstants.QY_IS_FILTERABLE,
														true);
										dataTypeString = iPrStructureAttribute
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_DATA_TYPE,
														null);
										dataType = sap.firefly.QInAConverter
												.lookupValueType(dataTypeString);
										presentationTypeString = iPrStructureAttribute
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_PRESENTATION_TYPE,
														sap.firefly.PresentationType.KEY
																.getName());
										presentationType = sap.firefly.QInAConverter
												.lookupPresentationType(presentationTypeString);
										fieldName = iPrStructureAttribute
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_FIELD_NAME,
														name);
										length = iPrStructure
												.getIntegerByNameWithDefault(
														sap.firefly.InAConstants.QY_LENGTH,
														0);
										decimals = iPrStructure
												.getIntegerByNameWithDefault(
														sap.firefly.InAConstants.QY_DECIMALS,
														0);
										initialValue = iPrStructure
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_INITIAL_VALUE,
														null);
										lowerCaseEnabled = iPrStructure
												.getBooleanByNameWithDefault(
														sap.firefly.InAConstants.QY_LOWER_CASE_ENABLED,
														false);
										conversionRoutine = iPrStructure
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_CONVERSION_ROUTINE,
														null);
										visibilityType = iPrStructure
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_VISIBILITY_TYPE,
														null);
										if ((this.m_mode !== sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_CHECK)
												&& (this.m_mode !== sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_CHECK)
												&& (this.m_mode !== sap.firefly.InfoObjectMode._HIERARCHY_CHECK)) {
											this.m_manager
													.addRequestedOrderedField(name);
										}
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.InfoObjectMode._METADATA
																.getName(),
														this.m_mode.getName())) {
											iQFieldBaseMetadata = iQAttributeBase
													.addNewField(
															sap.firefly.FieldUsageType.ALL,
															presentationType,
															fieldName,
															description);
											iQFieldBaseMetadata
													.setValueType(dataType);
											iQFieldBaseMetadata
													.setPrecision(length);
											iQFieldBaseMetadata
													.setDecimals(decimals);
											iQFieldBaseMetadata
													.setIsLowerCaseEnabled(lowerCaseEnabled);
											iQFieldBaseMetadata
													.setConversionRoutine(conversionRoutine);
											iQFieldBaseMetadata
													.setIsFilterable(isFilterable);
											iQFieldBaseMetadata
													.setInitialValue(initialValue);
											iQFieldBaseMetadata
													.setVisibilityType(sap.firefly.QInAConverter
															.lookupVisibilityType(visibilityType));
											if (sap.firefly.XString.isEqual(
													this.m_manager
															.getBaseDimension()
															.getName(), name)) {
												iQAttributeBase
														.setFlatKeyField(iQFieldBaseMetadata);
											}
										}
										if ((this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MODIFY)
												|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_COPY)) {
											this
													.parseValues(
															iPrStructureAttribute,
															this
																	.getIQFieldBaseByName(name),
															isFinal);
										} else {
											if ((this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_CHECK)
													|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_CHECK)
													|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_CHECK)) {
												this.parseValuesByName(
														iPrStructureAttribute,
														name, isFinal);
											} else {
												this
														.parseValues(
																iPrStructureAttribute,
																this.m_manager
																		.getBaseDimension()
																		.getFieldByName(
																				name),
																isFinal);
											}
										}
									}
								}
							}
						}
					},
					parseValues : function(iPrStructure, iQFieldBase, isFinal) {
						var prElementTypeValues;
						var iPrListValues;
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_VALUES)) {
							prElementTypeValues = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_VALUES);
							if (prElementTypeValues === sap.firefly.PrElementType.LIST) {
								iPrListValues = iPrStructure
										.getListByName(sap.firefly.InAConstants.QY_VALUES);
								if (this.m_mode.getIsHierarchy()) {
									if ((this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MODIFY)
											|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_COPY)) {
										if ((this.m_manager).getHierarchy()
												.size() > 0) {
											this.addHierarchyValue(iQFieldBase,
													iPrListValues);
										} else {
											this.setHierarchyValue(iQFieldBase,
													iPrListValues);
										}
									} else {
										if ((this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_METADATA)
												|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_GET)
												|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_MODIFY)) {
											if ((this.m_manager)
													.getHierarchyIntervalMember()
													.size() > 0) {
												this
														.addHierarchyIntervalMemberValue(
																iQFieldBase,
																iPrListValues);
											} else {
												this
														.setHierarchyIntervalMemberValue(
																iQFieldBase,
																iPrListValues);
											}
										} else {
											if ((this.m_manager)
													.getHierarchyMember()
													.size() > 0) {
												this.addHierarchyMemberValue(
														iQFieldBase,
														iPrListValues, isFinal);
											} else {
												this.setHierarchyMemberValue(
														iQFieldBase,
														iPrListValues);
											}
										}
									}
								} else {
									if ((this.m_manager).getDimensionMember()
											.size() > 0) {
										this.addDimensionValue(iQFieldBase,
												iPrListValues);
									} else {
										this.setDimensionValue(iQFieldBase,
												iPrListValues);
									}
								}
							}
						}
					},
					parseValuesByName : function(iPrStructure, name, isFinal) {
						var prElementTypeValues;
						var iPrListValues;
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_VALUES)) {
							prElementTypeValues = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_VALUES);
							if (prElementTypeValues === sap.firefly.PrElementType.LIST) {
								iPrListValues = iPrStructure
										.getListByName(sap.firefly.InAConstants.QY_VALUES);
								if (this.m_mode.getIsHierarchy()
										&& ((this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_CHECK)
												|| (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_CHECK) || (this.m_mode === sap.firefly.InfoObjectMode._HIERARCHY_CHECK))) {
									if (this.m_check_refs.size() > 0) {
										this.addCheckValue(iPrListValues, name,
												isFinal);
									} else {
										this.setCheckValue(iPrListValues, name,
												isFinal);
									}
								}
							}
						}
					},
					addFieldToDimensionMember : function(iQDimensionMemberBase,
							iQFieldBase, stringValue) {
						var valueType = iQFieldBase.getValueType();
						var booleanValue;
						var intValue;
						var doubleValue;
						var longValue;
						var dateValue;
						var timeValue;
						if ((sap.firefly.XValueType.STRING === valueType)
								|| (sap.firefly.XValueType.LANGUAGE === valueType)
								|| (sap.firefly.XValueType.NUMC === valueType)) {
							iQDimensionMemberBase
									.createAndAddFieldValueWithString(
											iQFieldBase, stringValue);
						} else {
							if (sap.firefly.XValueType.BOOLEAN === valueType) {
								booleanValue = sap.firefly.XBoolean
										.convertStringToBoolean(stringValue);
								iQDimensionMemberBase
										.createAndAddFieldValueWithBoolean(
												iQFieldBase, booleanValue);
							} else {
								if (sap.firefly.XValueType.INTEGER === valueType) {
									intValue = sap.firefly.XInteger
											.convertStringToInteger(stringValue);
									iQDimensionMemberBase
											.createAndAddFieldValueWithInteger(
													iQFieldBase, intValue);
								} else {
									if (sap.firefly.XValueType.DOUBLE === valueType) {
										doubleValue = sap.firefly.XDouble
												.convertStringToDouble(stringValue);
										iQDimensionMemberBase
												.createAndAddFieldValueWithDouble(
														iQFieldBase,
														doubleValue);
									} else {
										if (sap.firefly.XValueType.LONG === valueType) {
											longValue = sap.firefly.XLong
													.convertStringToLong(stringValue);
											iQDimensionMemberBase
													.createAndAddFieldValueWithLong(
															iQFieldBase,
															longValue);
										} else {
											if (sap.firefly.XValueType.DATE === valueType) {
												dateValue = sap.firefly.XDate
														.createDateFromSAPFormat(stringValue);
												iQDimensionMemberBase
														.createAndAddFieldValueWithDate(
																iQFieldBase,
																dateValue);
											} else {
												if (sap.firefly.XValueType.TIME === valueType) {
													timeValue = sap.firefly.XTime
															.createTimeFromSAPFormat(stringValue);
													iQDimensionMemberBase
															.createAndAddFieldValueWithTime(
																	iQFieldBase,
																	timeValue);
												} else {
													throw sap.firefly.XException
															.createIllegalStateException(sap.firefly.XString
																	.concatenate2(
																			"Value type not supported: ",
																			valueType
																					.getName()));
												}
											}
										}
									}
								}
							}
						}
					},
					setDimensionValue : function(iQFieldBase, iPrListValues) {
						var dimensionManagerSetValue;
						var iValue;
						var iQDimensionMemberBase;
						var stringValue;
						if (iQFieldBase === null) {
							return;
						}
						dimensionManagerSetValue = this.m_manager;
						for (iValue = 0; iValue < iPrListValues.size(); iValue++) {
							iQDimensionMemberBase = sap.firefly.InfoObjectQDimensionMember
									.createQDimensionMember(this.m_manager
											.getBaseDimension());
							stringValue = iPrListValues
									.getStringByIndex(iValue);
							this.addFieldToDimensionMember(
									iQDimensionMemberBase, iQFieldBase,
									stringValue);
							dimensionManagerSetValue
									.addDimensionMember(iQDimensionMemberBase);
						}
					},
					addDimensionValue : function(iQFieldBase, iPrListValues) {
						var dimensionManagerAddValue;
						var i;
						if (iQFieldBase === null) {
							return;
						}
						dimensionManagerAddValue = this.m_manager;
						for (i = 0; i < iPrListValues.size(); i++) {
							this.addFieldToDimensionMember(
									dimensionManagerAddValue
											.getDimensionMember().get(i),
									iQFieldBase, iPrListValues
											.getStringByIndex(i));
						}
					},
					setHierarchyMemberValue : function(iQFieldBase,
							iPrListValues) {
						var hierarchyManager;
						var i;
						var hierarchyMember;
						if (iQFieldBase === null) {
							return;
						}
						hierarchyManager = this.m_manager;
						for (i = 0; i < iPrListValues.size(); i++) {
							hierarchyMember = sap.firefly.InfoObjectHierarchyMember
									.createIInfoObjectHierarchyMember(this.m_manager
											.getBaseDimension());
							this.addFieldToDimensionMember(hierarchyMember,
									iQFieldBase, iPrListValues
											.getStringByIndex(i));
							hierarchyManager
									.addHierarchyListMember(hierarchyMember);
						}
					},
					addHierarchyMemberValue : function(iQFieldBase,
							iPrListValues, isFinal) {
						var hierarchyManagerAddValue;
						var i;
						var hierarchyMember;
						if (iQFieldBase === null) {
							return;
						}
						hierarchyManagerAddValue = this.m_manager;
						for (i = 0; i < iPrListValues.size(); i++) {
							hierarchyMember = hierarchyManagerAddValue
									.getHierarchyMember().get(i);
							this.addFieldToDimensionMember(hierarchyMember,
									iQFieldBase, iPrListValues
											.getStringByIndex(i));
							if (isFinal) {
								hierarchyManagerAddValue
										.buildHierarchyMemberStructure(hierarchyMember);
							}
						}
					},
					setHierarchyIntervalMemberValue : function(iQFieldBase,
							iPrListValues) {
						var hierarchyIntervalManager;
						var i;
						var hierarchyIntervalMember;
						if (iQFieldBase === null) {
							return;
						}
						hierarchyIntervalManager = this.m_manager;
						for (i = 0; i < iPrListValues.size(); i++) {
							hierarchyIntervalMember = sap.firefly.InfoObjectHierarchyIntervalMember
									.createIInfoObjectHierarchyIntervalMember(this.m_manager
											.getBaseDimension());
							this.addFieldToDimensionMember(
									hierarchyIntervalMember, iQFieldBase,
									iPrListValues.getStringByIndex(i));
							hierarchyIntervalManager
									.addHierarchyIntervalListMember(hierarchyIntervalMember);
						}
					},
					addHierarchyIntervalMemberValue : function(iQFieldBase,
							iPrListValues) {
						var hierarchyIntervalManager;
						var i;
						var hierarchyMember;
						if (iQFieldBase === null) {
							return;
						}
						hierarchyIntervalManager = this.m_manager;
						for (i = 0; i < iPrListValues.size(); i++) {
							hierarchyMember = hierarchyIntervalManager
									.getHierarchyIntervalMember().get(i);
							this.addFieldToDimensionMember(hierarchyMember,
									iQFieldBase, iPrListValues
											.getStringByIndex(i));
						}
					},
					setHierarchyValue : function(iQFieldBase, iPrListValues) {
						var valueType;
						var hierarchyManagerSetValue;
						var i;
						if (iQFieldBase === null) {
							return;
						}
						valueType = iQFieldBase.getValueType();
						hierarchyManagerSetValue = this.m_manager;
						for (i = 0; i < iPrListValues.size(); i++) {
							if ((valueType !== sap.firefly.XValueType.STRING)
									|| (sap.firefly.XValueType.LANGUAGE === valueType)
									|| (sap.firefly.XValueType.NUMC === valueType)
									|| (sap.firefly.XValueType.BOOLEAN === valueType)
									|| (sap.firefly.XValueType.INTEGER === valueType)
									|| (sap.firefly.XValueType.DOUBLE === valueType)
									|| (sap.firefly.XValueType.LONG === valueType)
									|| (sap.firefly.XValueType.DATE === valueType)
									|| (sap.firefly.XValueType.TIME === valueType)) {
								throw sap.firefly.XException
										.createIllegalStateException(sap.firefly.XString
												.concatenate2(
														"Value type not supported: ",
														valueType.getName()));
							}
							hierarchyManagerSetValue
									.addHierarchy(hierarchyManagerSetValue
											.getIQHierarchy(
													iQFieldBase
															.getDimensionBase(),
													iPrListValues
															.getStringByIndex(i)));
						}
					},
					addHierarchyValue : function(iQFieldBase, iPrListValues) {
						var hierarchyManagerAddValue;
						var iQHierarchy;
						var iValueString;
						var dateValueTo;
						var dateValueFrom;
						var isRemoteString;
						var iValueDate;
						var dateValue;
						if (iQFieldBase === null) {
							return;
						}
						hierarchyManagerAddValue = this.m_manager;
						iQHierarchy = null;
						if (sap.firefly.XValueType.STRING === iQFieldBase
								.getValueType()) {
							for (iValueString = 0; iValueString < iPrListValues
									.size(); iValueString++) {
								iQHierarchy = hierarchyManagerAddValue
										.getHierarchy().get(iValueString);
								if (sap.firefly.XString
										.isEqual(
												sap.firefly.HierarchyCatalogManager.BW_A_TEXT_SHORT_TEXT,
												iQFieldBase.getName())) {
									hierarchyManagerAddValue
											.setHierarchyDescription(
													iQHierarchy,
													iPrListValues
															.getStringByIndex(iValueString));
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.HierarchyCatalogManager.BW_A_TEXT_MEDIUM_TEXT,
													iQFieldBase.getName())) {
										hierarchyManagerAddValue
												.setHierarchyDescription(
														iQHierarchy,
														iPrListValues
																.getStringByIndex(iValueString));
									} else {
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.HierarchyCatalogManager.BW_A_TEXT_LONG_TEXT,
														iQFieldBase.getName())) {
											hierarchyManagerAddValue
													.setHierarchyDescription(
															iQHierarchy,
															iPrListValues
																	.getStringByIndex(iValueString));
										} else {
											if (sap.firefly.XString
													.isEqual(
															sap.firefly.HierarchyCatalogManager.BW_A_VERSION_KEY,
															iQFieldBase
																	.getName())) {
												hierarchyManagerAddValue
														.setVersion(
																iQHierarchy,
																iPrListValues
																		.getStringByIndex(iValueString));
											} else {
												if (sap.firefly.XString
														.isEqual(
																sap.firefly.HierarchyCatalogManager.BW_A_VERSION_LONG_TEXT,
																iQFieldBase
																		.getName())) {
													hierarchyManagerAddValue
															.setVersionDescription(
																	iQHierarchy,
																	iPrListValues
																			.getStringByIndex(iValueString));
												} else {
													if (sap.firefly.XString
															.isEqual(
																	sap.firefly.HierarchyCatalogManager.BW_A_DATE_TO_KEY,
																	iQFieldBase
																			.getName())) {
														dateValueTo = sap.firefly.XDate
																.createDateFromSAPFormat(iPrListValues
																		.getStringByIndex(iValueString));
														hierarchyManagerAddValue
																.setDateTo(
																		iQHierarchy,
																		dateValueTo);
													} else {
														if (sap.firefly.XString
																.isEqual(
																		sap.firefly.HierarchyCatalogManager.BW_A_DATE_FROM_KEY,
																		iQFieldBase
																				.getName())) {
															dateValueFrom = sap.firefly.XDate
																	.createDateFromSAPFormat(iPrListValues
																			.getStringByIndex(iValueString));
															hierarchyManagerAddValue
																	.setDateFrom(
																			iQHierarchy,
																			dateValueFrom);
														} else {
															if (sap.firefly.XString
																	.isEqual(
																			sap.firefly.HierarchyCatalogManager.BW_A_OWNER_KEY,
																			iQFieldBase
																					.getName())) {
																(iQHierarchy)
																		.setOwner(iPrListValues
																				.getStringByIndex(iValueString));
															} else {
																if (sap.firefly.XString
																		.isEqual(
																				sap.firefly.HierarchyCatalogManager.BW_A_HIEID_KEY,
																				iQFieldBase
																						.getName())) {
																	(iQHierarchy)
																			.setHierId(iPrListValues
																					.getStringByIndex(iValueString));
																} else {
																	if (sap.firefly.XString
																			.isEqual(
																					sap.firefly.HierarchyCatalogManager.BW_A_HIETYPE_KEY,
																					iQFieldBase
																							.getName())) {
																		(iQHierarchy)
																				.setHierType(iPrListValues
																						.getStringByIndex(iValueString));
																	} else {
																		if (sap.firefly.XString
																				.isEqual(
																						sap.firefly.HierarchyCatalogManager.BW_A_IS_REMOTE_KEY,
																						iQFieldBase
																								.getName())) {
																			isRemoteString = iPrListValues
																					.getStringByIndex(iValueString);
																			if ((isRemoteString !== null)
																					&& (sap.firefly.XString
																							.compare(
																									isRemoteString,
																									sap.firefly.InAConstants.VA_ABAP_TRUE) === 0)) {
																				(iQHierarchy)
																						.setIsRemote(true);
																			} else {
																				(iQHierarchy)
																						.setIsRemote(false);
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						} else {
							if (sap.firefly.XValueType.DATE === iQFieldBase
									.getValueType()) {
								for (iValueDate = 0; iValueDate < iPrListValues
										.size(); iValueDate++) {
									iQHierarchy = hierarchyManagerAddValue
											.getHierarchy().get(iValueDate);
									dateValue = sap.firefly.XDate
											.createDateFromSAPFormat(iPrListValues
													.getStringByIndex(iValueDate));
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.HierarchyCatalogManager.BW_A_DATE_TO_KEY,
													iQFieldBase.getName())) {
										hierarchyManagerAddValue.setDateFrom(
												iQHierarchy, dateValue);
									} else {
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.HierarchyCatalogManager.BW_A_DATE_FROM_KEY,
														iQFieldBase.getName())) {
											hierarchyManagerAddValue.setDateTo(
													iQHierarchy, dateValue);
										}
									}
								}
							} else {
								throw sap.firefly.XException
										.createIllegalStateException(sap.firefly.XString
												.concatenate2(
														"Value type not supported: ",
														iQFieldBase
																.getValueType()
																.getName()));
							}
						}
					},
					setCheckValue : function(iPrListValues, name, isFinal) {
						var iValue;
						if (name === null) {
							return;
						}
						if (!sap.firefly.XString
								.isEqual(
										sap.firefly.InfoObjectResult.FIELD_NAME_CHECK_REFID,
										name)) {
							return;
						}
						for (iValue = 0; iValue < iPrListValues.size(); iValue++) {
							this.m_check_refs.add(iPrListValues
									.getStringByIndex(iValue));
							this.m_messages.add(sap.firefly.XMessage
									.createMessage(
											sap.firefly.OriginLayer.DRIVER,
											sap.firefly.Severity.INFO, 0, null,
											null, false, null));
						}
					},
					addCheckValue : function(iPrListValues, name, isFinal) {
						var iValueString;
						var iInfoObjectCheckResult;
						var iXMessage;
						var severityString;
						if (name === null) {
							return;
						}
						for (iValueString = 0; iValueString < iPrListValues
								.size(); iValueString++) {
							iInfoObjectCheckResult = this.m_check_result_manager
									.getCheckResultById(this.m_check_refs
											.get(iValueString));
							iXMessage = this.m_messages.get(iValueString);
							if (iInfoObjectCheckResult !== null) {
								if (iXMessage === null) {
									continue;
								}
								if (sap.firefly.XString
										.isEqual(
												sap.firefly.InfoObjectResult.FIELD_NAME_CHECK_MESSAGE,
												name)) {
									(iXMessage).setText(iPrListValues
											.getStringByIndex(iValueString));
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InfoObjectResult.FIELD_NAME_CHECK_SEVERITY,
													name)) {
										severityString = iPrListValues
												.getStringByIndex(iValueString);
										if (sap.firefly.XString.isEqual(
												severityString,
												sap.firefly.Severity.INFO
														.getName())) {
											this.m_messages
													.removeAt(iValueString);
											this.m_messages
													.insert(
															iValueString,
															sap.firefly.XMessage
																	.createMessage(
																			sap.firefly.OriginLayer.DRIVER,
																			sap.firefly.Severity.INFO,
																			iXMessage
																					.getCode(),
																			iXMessage
																					.getText(),
																			iXMessage
																					.getErrorCause(),
																			iXMessage
																					.hasStackTrace(),
																			iXMessage
																					.getExtendedInfo()));
										} else {
											if (sap.firefly.XString
													.isEqual(
															severityString,
															sap.firefly.Severity.WARNING
																	.getName())) {
												this.m_messages
														.removeAt(iValueString);
												this.m_messages
														.insert(
																iValueString,
																sap.firefly.XMessage
																		.createMessage(
																				sap.firefly.OriginLayer.DRIVER,
																				sap.firefly.Severity.WARNING,
																				iXMessage
																						.getCode(),
																				iXMessage
																						.getText(),
																				iXMessage
																						.getErrorCause(),
																				iXMessage
																						.hasStackTrace(),
																				iXMessage
																						.getExtendedInfo()));
											} else {
												if (sap.firefly.XString
														.isEqual(
																severityString,
																sap.firefly.Severity.SEMANTICAL_ERROR
																		.getName())) {
													this.m_messages
															.removeAt(iValueString);
													this.m_messages
															.insert(
																	iValueString,
																	sap.firefly.XMessage
																			.createMessage(
																					sap.firefly.OriginLayer.DRIVER,
																					sap.firefly.Severity.SEMANTICAL_ERROR,
																					iXMessage
																							.getCode(),
																					iXMessage
																							.getText(),
																					iXMessage
																							.getErrorCause(),
																					iXMessage
																							.hasStackTrace(),
																					iXMessage
																							.getExtendedInfo()));
												} else {
													if (sap.firefly.XString
															.isEqual(
																	severityString,
																	sap.firefly.Severity.ERROR
																			.getName())) {
														this.m_messages
																.removeAt(iValueString);
														this.m_messages
																.insert(
																		iValueString,
																		sap.firefly.XMessage
																				.createMessage(
																						sap.firefly.OriginLayer.DRIVER,
																						sap.firefly.Severity.ERROR,
																						iXMessage
																								.getCode(),
																						iXMessage
																								.getText(),
																						iXMessage
																								.getErrorCause(),
																						iXMessage
																								.hasStackTrace(),
																						iXMessage
																								.getExtendedInfo()));
													}
												}
											}
										}
									}
								}
								if (isFinal) {
									iInfoObjectCheckResult
											.addCheckMessage(iXMessage);
								}
							}
							this.m_check_result_manager
									.addInfoObjectCheckResult(iInfoObjectCheckResult);
						}
					},
					getIQFieldBaseByName : function(name) {
						var iQFieldBase = null;
						var fieldHierarchy = null;
						var dimensionHierarchy = null;
						var iQDimensionHierarchy;
						var iqHierarchyValueHelp;
						var context;
						if (sap.firefly.XString
								.isEqual(
										sap.firefly.HierarchyCatalogManager.BW_A_NAME_KEY,
										name)) {
							fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_NAME_KEY;
							dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_NAME;
						} else {
							if (sap.firefly.XString
									.isEqual(
											sap.firefly.HierarchyCatalogManager.BW_A_TEXT_SHORT_TEXT,
											name)) {
								fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_TEXT_SHORT_TEXT;
								dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_TEXT;
							} else {
								if (sap.firefly.XString
										.isEqual(
												sap.firefly.HierarchyCatalogManager.BW_A_TEXT_MEDIUM_TEXT,
												name)) {
									fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_TEXT_MEDIUM_TEXT;
									dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_TEXT;
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.HierarchyCatalogManager.BW_A_TEXT_LONG_TEXT,
													name)) {
										fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_TEXT_LONG_TEXT;
										dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_TEXT;
									} else {
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.HierarchyCatalogManager.BW_A_VERSION_KEY,
														name)) {
											fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_VERSION_KEY;
											dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_VERSION;
										} else {
											if (sap.firefly.XString
													.isEqual(
															sap.firefly.HierarchyCatalogManager.BW_A_VERSION_LONG_TEXT,
															name)) {
												fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_VERSION_LONG_TEXT;
												dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_VERSION;
											} else {
												if (sap.firefly.XString
														.isEqual(
																sap.firefly.HierarchyCatalogManager.BW_A_DATE_TO_KEY,
																name)) {
													fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_DATE_TO_KEY;
													dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_DATE_TO;
												} else {
													if (sap.firefly.XString
															.isEqual(
																	sap.firefly.HierarchyCatalogManager.BW_A_DATE_FROM_KEY,
																	name)) {
														fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_DATE_FROM_KEY;
														dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_DATE_FROM;
													} else {
														if (sap.firefly.XString
																.isEqual(
																		sap.firefly.HierarchyCatalogManager.BW_A_OWNER_KEY,
																		name)) {
															fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_OWNER_KEY;
															dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_OWNER;
														} else {
															if (sap.firefly.XString
																	.isEqual(
																			sap.firefly.HierarchyCatalogManager.BW_A_HIEID_KEY,
																			name)) {
																fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_HIEID_KEY;
																dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_HIEID;
															} else {
																if (sap.firefly.XString
																		.isEqual(
																				sap.firefly.HierarchyCatalogManager.BW_A_HIETYPE_KEY,
																				name)) {
																	fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_HIETYPE_KEY;
																	dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_HIETYPE;
																} else {
																	if (sap.firefly.XString
																			.isEqual(
																					sap.firefly.HierarchyCatalogManager.BW_A_IS_REMOTE_KEY,
																					name)) {
																		fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_IS_REMOTE_KEY;
																		dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_IS_REMOTE;
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
						if ((dimensionHierarchy !== null)
								&& (fieldHierarchy !== null)) {
							iqHierarchyValueHelp = (this.m_manager)
									.getIQHierarchyValueHelp();
							context = iqHierarchyValueHelp.getContext();
							if (context !== null
									&& context.getQueryModel() !== null) {
								iQDimensionHierarchy = context.getQueryModel()
										.getDimensionByName(dimensionHierarchy);
							} else {
								iQDimensionHierarchy = iqHierarchyValueHelp
										.getQueryModel().getDimensionByName(
												dimensionHierarchy);
							}
							if (iQDimensionHierarchy !== null) {
								iQFieldBase = iQDimensionHierarchy
										.getFieldByName(fieldHierarchy);
							}
						}
						return iQFieldBase;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectSelector",
				sap.firefly.XObject,
				{
					$statics : {
						C_MAX_ROW_COUNT : 200,
						createIInfoObjectSelector : function(iQDimension) {
							var iInfoObjectSelector = new sap.firefly.InfoObjectSelector();
							iInfoObjectSelector.setup(iQDimension);
							return iInfoObjectSelector;
						}
					},
					m_iqdimension : null,
					m_data_selector_entity : null,
					m_row_from : 0,
					m_row_to : 0,
					m_max_tuple_count : false,
					m_section : null,
					m_authorization : null,
					m_selectorRootLevel : 0,
					m_selectorHierarchyNavigations : null,
					m_operator : null,
					setup : function(iQDimension) {
						this.m_iqdimension = iQDimension;
						this.m_row_from = 0;
						this.m_row_to = sap.firefly.InfoObjectSelector.C_MAX_ROW_COUNT;
						this.m_data_selector_entity = sap.firefly.XList
								.create();
						this.m_selectorHierarchyNavigations = sap.firefly.XList
								.create();
						this.m_selectorRootLevel = 0;
						this.m_section = sap.firefly.InfoObjectSection._UNDEFINED;
						this.m_authorization = sap.firefly.InfoObjectAuthorization
								.create(
										sap.firefly.InfoObjectAuthSelObject._UNKNOWN,
										null);
						this.m_operator = sap.firefly.InAConstants.VA_CODE_AND;
					},
					getIQDimension : function() {
						return this.m_iqdimension;
					},
					addIQSelection : function(iQField, firstValue, secondValue,
							comparisonOperator, sign) {
						this.m_data_selector_entity
								.add(sap.firefly.InfoObjectSelectorEntity
										.createInfoObjectSelectorEntity(
												iQField, firstValue,
												secondValue,
												comparisonOperator, sign));
					},
					addIQHierarchySelection : function(iQHierarchyValueHelp,
							iQHierarchy) {
						var aInfoObjectSelectorEntity;
						var itInfoObjectSelectorEntity;
						var nextEntity;
						if ((iQHierarchyValueHelp === null)
								|| (iQHierarchy === null)) {
							return;
						}
						aInfoObjectSelectorEntity = sap.firefly.InfoObjectSelectorEntity
								.createInfoObjectSelectorEntityByIQHierarchy(
										iQHierarchyValueHelp, iQHierarchy);
						itInfoObjectSelectorEntity = aInfoObjectSelectorEntity
								.getIterator();
						while (itInfoObjectSelectorEntity.hasNext()) {
							nextEntity = itInfoObjectSelectorEntity.next();
							if (!this.m_data_selector_entity
									.contains(nextEntity)) {
								this.m_data_selector_entity.add(nextEntity);
							}
						}
					},
					getIQSelections : function() {
						return this.m_data_selector_entity;
					},
					setFromTo : function(rowFrom, rowTo) {
						this.m_row_from = rowFrom;
						this.m_row_to = rowTo;
					},
					getRowFrom : function() {
						return this.m_row_from;
					},
					getRowTo : function() {
						return this.m_row_to;
					},
					requestMaxTupleCount : function(requestMaxTupleCount) {
						this.m_max_tuple_count = requestMaxTupleCount;
					},
					isMaxTupleCountRequested : function() {
						return this.m_max_tuple_count;
					},
					setSection : function(infoObjectSection) {
						this.m_section = infoObjectSection;
					},
					setAuthorization : function(authorization) {
						this.m_authorization = authorization;
					},
					serialize : function(iPrStructure) {
						var prListSubSelections2;
						var xIterator;
						var infoObjectSelectorEntity;
						var iPrStructureElement;
						var operatorInA;
						var prListElements;
						var iPrStructureSetOperand;
						var iPrStructureSubSelection2;
						var iPrStructureElementDrillLevel;
						var prListElementsDrillLevel;
						var iPrStructureSetOperandDrillLevel;
						var iPrStructureSubSelectionDrillLevel;
						var iPrStructureOperator2;
						var iPrStructureSubSelection1;
						var prListSubSelections1;
						var iPrStructureOperator1;
						var iPrStructureSelection;
						var iPrStructureFilter;
						var hierarchyNavigations1;
						var iterator;
						var node;
						var hierarchyNavigation1;
						var drillNode;
						var iPrStructureResultSetFeatureRequest;
						var iPrStructureSubSetDescription;
						if (iPrStructure === null) {
							return iPrStructure;
						}
						if ((this.m_section !== null)
								&& (!sap.firefly.XString
										.isEqual(
												sap.firefly.InfoObjectSection._UNDEFINED
														.getName(),
												this.m_section.getName()))) {
							iPrStructure.setStringByName(
									sap.firefly.InAConstants.QY_SECTION,
									this.m_section.getName());
						}
						if ((this.m_authorization !== null)
								&& (this.m_authorization.getAuthSelObject() !== null)
								&& (!sap.firefly.XString
										.isEqual(
												sap.firefly.InfoObjectAuthSelObject._UNKNOWN
														.getName(),
												this.m_authorization
														.getAuthSelObject()
														.getName()))) {
							iPrStructure.setStringByName(
									sap.firefly.InAConstants.QY_AUTHORIZATION,
									this.m_authorization.getAuthSelObject()
											.getName());
						}
						prListSubSelections2 = sap.firefly.PrList.create();
						xIterator = this.m_data_selector_entity.getIterator();
						while (xIterator.hasNext()) {
							infoObjectSelectorEntity = xIterator.next();
							iPrStructureElement = sap.firefly.PrStructure
									.create();
							operatorInA = sap.firefly.QInAConverter
									.lookupOperatorInA(infoObjectSelectorEntity
											.getComparisonOperator());
							iPrStructureElement.setStringByName(
									sap.firefly.InAConstants.QY_COMPARISON,
									operatorInA);
							this.setValues(iPrStructureElement,
									infoObjectSelectorEntity.getFirstValue(),
									infoObjectSelectorEntity.getSecondValue());
							prListElements = sap.firefly.PrList.create();
							prListElements.add(iPrStructureElement);
							iPrStructureSetOperand = sap.firefly.PrStructure
									.create();
							iPrStructureSetOperand.setElementByName(
									sap.firefly.InAConstants.QY_ELEMENTS,
									prListElements);
							iPrStructureSetOperand.setStringByName(
									sap.firefly.InAConstants.QY_FIELD_NAME,
									infoObjectSelectorEntity.getIQField()
											.getName());
							iPrStructureSubSelection2 = sap.firefly.PrStructure
									.create();
							iPrStructureSubSelection2.setElementByName(
									sap.firefly.InAConstants.QY_SET_OPERAND,
									iPrStructureSetOperand);
							prListSubSelections2.add(iPrStructureSubSelection2);
						}
						if (this.getSelectorRootLevel() !== 0) {
							iPrStructureElementDrillLevel = sap.firefly.PrStructure
									.create();
							iPrStructureElementDrillLevel
									.setStringByName(
											sap.firefly.InAConstants.QY_COMPARISON,
											sap.firefly.InAConstants.VA_COMPARISON_EQUAL);
							this.setValues(iPrStructureElementDrillLevel,
									sap.firefly.XIntegerValue.create(this
											.getSelectorRootLevel()), null);
							prListElementsDrillLevel = sap.firefly.PrList
									.create();
							prListElementsDrillLevel
									.add(iPrStructureElementDrillLevel);
							iPrStructureSetOperandDrillLevel = sap.firefly.PrStructure
									.create();
							iPrStructureSetOperandDrillLevel.setElementByName(
									sap.firefly.InAConstants.QY_ELEMENTS,
									prListElementsDrillLevel);
							iPrStructureSetOperandDrillLevel.setStringByName(
									sap.firefly.InAConstants.QY_FIELD_NAME,
									"InitialDrillLevel.KEY");
							iPrStructureSubSelectionDrillLevel = sap.firefly.PrStructure
									.create();
							iPrStructureSubSelectionDrillLevel
									.setElementByName(
											sap.firefly.InAConstants.QY_SET_OPERAND,
											iPrStructureSetOperandDrillLevel);
							prListSubSelections2
									.add(iPrStructureSubSelectionDrillLevel);
						}
						iPrStructureOperator2 = sap.firefly.PrStructure
								.create();
						iPrStructureOperator2.setStringByName(
								sap.firefly.InAConstants.QY_CODE, this
										.getOperator());
						iPrStructureOperator2.setElementByName(
								sap.firefly.InAConstants.QY_SUB_SELECTIONS,
								prListSubSelections2);
						iPrStructureSubSelection1 = sap.firefly.PrStructure
								.create();
						iPrStructureSubSelection1.setElementByName(
								sap.firefly.InAConstants.QY_OPERATOR,
								iPrStructureOperator2);
						prListSubSelections1 = sap.firefly.PrList.create();
						prListSubSelections1.add(iPrStructureSubSelection1);
						iPrStructureOperator1 = sap.firefly.PrStructure
								.create();
						iPrStructureOperator1.setStringByName(
								sap.firefly.InAConstants.QY_CODE,
								sap.firefly.InAConstants.VA_CODE_AND);
						iPrStructureOperator1.setElementByName(
								sap.firefly.InAConstants.QY_SUB_SELECTIONS,
								prListSubSelections1);
						iPrStructureSelection = sap.firefly.PrStructure
								.create();
						iPrStructureSelection.setElementByName(
								sap.firefly.InAConstants.QY_OPERATOR,
								iPrStructureOperator1);
						iPrStructureFilter = sap.firefly.PrStructure.create();
						iPrStructureFilter.setElementByName(
								sap.firefly.InAConstants.QY_SELECTION,
								iPrStructureSelection);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_FILTER,
								iPrStructureFilter);
						if ((this.getNavigationNodes() !== null)
								&& (this.getNavigationNodes().size() > 0)) {
							hierarchyNavigations1 = iPrStructure
									.setNewListByName(sap.firefly.InAConstants.QY_HIERARCHY_NAVIGATIONS);
							iterator = this.getNavigationNodes().getIterator();
							while (iterator.hasNext()) {
								node = iterator.next();
								hierarchyNavigation1 = hierarchyNavigations1
										.addNewStructure();
								hierarchyNavigation1
										.setStringByName(
												sap.firefly.InAConstants.QY_DRILL_STATE,
												sap.firefly.QInAConverter
														.lookupDrillStateInA(sap.firefly.DrillState.EXPANDED));
								drillNode = hierarchyNavigation1
										.setNewStructureByName(sap.firefly.InAConstants.QY_DRILL_MEMBER);
								drillNode
										.setStringByName(
												sap.firefly.InAConstants.QY_DIMENSION_NAME,
												this.m_iqdimension.getName());
								drillNode
										.setStringByName(
												sap.firefly.InAConstants.QY_MEMBER,
												sap.firefly.XString
														.concatenate2(
																node
																		.getInfoObject(),
																sap.firefly.XString
																		.concatenate2(
																				"!",
																				node
																						.getMemberId())));
							}
						}
						iPrStructureResultSetFeatureRequest = sap.firefly.PrStructure
								.create();
						iPrStructureResultSetFeatureRequest.setStringByName(
								sap.firefly.InAConstants.QY_RESULT_ENCODING,
								sap.firefly.InAConstants.VA_RS_ENCODING_NONE);
						iPrStructureResultSetFeatureRequest.setStringByName(
								sap.firefly.InAConstants.QY_RESULT_FORMAT,
								sap.firefly.InAConstants.VA_RS_FORMAT_V2);
						iPrStructureSubSetDescription = sap.firefly.PrStructure
								.create();
						iPrStructureSubSetDescription
								.setBooleanByName(
										sap.firefly.InAConstants.QY_REQUEST_MAX_TUPLE_COUNT,
										this.m_max_tuple_count);
						iPrStructureSubSetDescription.setIntegerByName(
								sap.firefly.InAConstants.QY_ROW_FROM,
								this.m_row_from);
						iPrStructureSubSetDescription.setIntegerByName(
								sap.firefly.InAConstants.QY_ROW_TO,
								this.m_row_to);
						iPrStructureResultSetFeatureRequest.setElementByName(
								sap.firefly.InAConstants.QY_SUBSET_DESCRIPTION,
								iPrStructureSubSetDescription);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_RS_FEATURE_REQUEST,
								iPrStructureResultSetFeatureRequest);
						return iPrStructure;
					},
					setValues : function(iPrStructure, firstValue, secondValue) {
						var xValueType;
						if (firstValue === null) {
							return;
						}
						xValueType = firstValue.getValueType();
						if (xValueType === sap.firefly.XValueType.STRING) {
							iPrStructure.setStringByName(
									sap.firefly.InAConstants.QY_LOW,
									(firstValue).getStringValue());
							if (secondValue !== null) {
								iPrStructure.setStringByName(
										sap.firefly.InAConstants.QY_HIGH,
										(secondValue).getStringValue());
							}
						} else {
							if (xValueType === sap.firefly.XValueType.NUMC) {
								iPrStructure.setStringByName(
										sap.firefly.InAConstants.QY_LOW,
										(firstValue).getNumcValue());
								if (secondValue !== null) {
									iPrStructure.setStringByName(
											sap.firefly.InAConstants.QY_HIGH,
											(secondValue).getNumcValue());
								}
							} else {
								if (xValueType === sap.firefly.XValueType.LANGUAGE) {
									iPrStructure.setStringByName(
											sap.firefly.InAConstants.QY_LOW,
											(firstValue).getLanguageValue());
									if (secondValue !== null) {
										iPrStructure
												.setStringByName(
														sap.firefly.InAConstants.QY_HIGH,
														(secondValue)
																.getLanguageValue());
									}
								} else {
									if (xValueType === sap.firefly.XValueType.DOUBLE) {
										iPrStructure
												.setDoubleByName(
														sap.firefly.InAConstants.QY_LOW,
														(firstValue)
																.getDoubleValue());
										if (secondValue !== null) {
											iPrStructure
													.setDoubleByName(
															sap.firefly.InAConstants.QY_HIGH,
															(secondValue)
																	.getDoubleValue());
										}
									} else {
										if (xValueType === sap.firefly.XValueType.INTEGER) {
											iPrStructure
													.setIntegerByName(
															sap.firefly.InAConstants.QY_LOW,
															(firstValue)
																	.getIntegerValue());
											if (secondValue !== null) {
												iPrStructure
														.setIntegerByName(
																sap.firefly.InAConstants.QY_HIGH,
																(secondValue)
																		.getIntegerValue());
											}
										} else {
											if (xValueType === sap.firefly.XValueType.BOOLEAN) {
												iPrStructure
														.setBooleanByName(
																sap.firefly.InAConstants.QY_LOW,
																(firstValue)
																		.getBooleanValue());
												if (secondValue !== null) {
													iPrStructure
															.setBooleanByName(
																	sap.firefly.InAConstants.QY_HIGH,
																	(secondValue)
																			.getBooleanValue());
												}
											} else {
												if (xValueType === sap.firefly.XValueType.LONG) {
													iPrStructure
															.setLongByName(
																	sap.firefly.InAConstants.QY_LOW,
																	(firstValue)
																			.getLongValue());
													if (secondValue !== null) {
														iPrStructure
																.setLongByName(
																		sap.firefly.InAConstants.QY_HIGH,
																		(secondValue)
																				.getLongValue());
													}
												} else {
													if (xValueType === sap.firefly.XValueType.DATE) {
														iPrStructure
																.setStringByName(
																		sap.firefly.InAConstants.QY_LOW,
																		(firstValue)
																				.toSAPFormat());
														if (secondValue !== null) {
															iPrStructure
																	.setStringByName(
																			sap.firefly.InAConstants.QY_HIGH,
																			(secondValue)
																					.toSAPFormat());
														}
													} else {
														if (xValueType === sap.firefly.XValueType.TIME) {
															iPrStructure
																	.setStringByName(
																			sap.firefly.InAConstants.QY_LOW,
																			(firstValue)
																					.toSAPFormat());
															if (secondValue !== null) {
																iPrStructure
																		.setStringByName(
																				sap.firefly.InAConstants.QY_HIGH,
																				(secondValue)
																						.toSAPFormat());
															}
														} else {
															throw sap.firefly.XException
																	.createIllegalStateException("Unsupported value type");
														}
													}
												}
											}
										}
									}
								}
							}
						}
					},
					setSelectorRootExpandingLevels : function(
							relativeLevelCount) {
						this.m_selectorRootLevel = relativeLevelCount;
					},
					getSelectorRootLevel : function() {
						return this.m_selectorRootLevel;
					},
					setSelectorHierarchyNode : function(parent) {
						if (parent !== null) {
							this.m_selectorHierarchyNavigations.add(parent);
						} else {
							this.m_selectorHierarchyNavigations.clear();
						}
					},
					getNavigationNodes : function() {
						return this.m_selectorHierarchyNavigations;
					},
					clearSelectorHierarchyNode : function() {
						this.setSelectorHierarchyNode(null);
					},
					setOperator : function(operator) {
						this.m_operator = operator;
					},
					getOperator : function() {
						return this.m_operator;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectSelectorEntity",
				sap.firefly.XObject,
				{
					$statics : {
						createInfoObjectSelectorEntity : function(iQField,
								firstValue, secondValue, comparisonOperator,
								sign) {
							var iInfoObjectSelectorEntity = new sap.firefly.InfoObjectSelectorEntity();
							iInfoObjectSelectorEntity.setup(iQField,
									firstValue, secondValue,
									comparisonOperator, sign);
							return iInfoObjectSelectorEntity;
						},
						createInfoObjectSelectorEntityByIQHierarchy : function(
								iQHierarchyValueHelp, iQHierarchy) {
							var aInfoObjectSelectorEntity = sap.firefly.XList
									.create();
							var iQFieldBase = sap.firefly.InfoObjectSelectorEntity
									.getIQFieldBaseByName(
											iQHierarchyValueHelp,
											sap.firefly.HierarchyCatalogManager.BW_A_NAME_KEY);
							var firstValue = sap.firefly.InfoObjectSelectorEntity
									.getHierarchyValue(iQFieldBase, iQHierarchy);
							var infoObjectSelectorEntityHierarchy = sap.firefly.InfoObjectSelectorEntity
									.createInfoObjectSelectorEntity(
											iQFieldBase,
											firstValue,
											null,
											sap.firefly.ComparisonOperator.EQUAL,
											sap.firefly.SetSign.INCLUDING);
							aInfoObjectSelectorEntity
									.add(infoObjectSelectorEntityHierarchy);
							iQFieldBase = sap.firefly.InfoObjectSelectorEntity
									.getIQFieldBaseByName(
											iQHierarchyValueHelp,
											sap.firefly.HierarchyCatalogManager.BW_A_HIEID_KEY);
							firstValue = sap.firefly.InfoObjectSelectorEntity
									.getHierarchyValue(iQFieldBase, iQHierarchy);
							infoObjectSelectorEntityHierarchy = sap.firefly.InfoObjectSelectorEntity
									.createInfoObjectSelectorEntity(
											iQFieldBase,
											firstValue,
											null,
											sap.firefly.ComparisonOperator.EQUAL,
											sap.firefly.SetSign.INCLUDING);
							aInfoObjectSelectorEntity
									.add(infoObjectSelectorEntityHierarchy);
							iQFieldBase = sap.firefly.InfoObjectSelectorEntity
									.getIQFieldBaseByName(
											iQHierarchyValueHelp,
											sap.firefly.HierarchyCatalogManager.BW_A_HIETYPE_KEY);
							if (iQFieldBase !== null) {
								firstValue = sap.firefly.InfoObjectSelectorEntity
										.getHierarchyValue(iQFieldBase,
												iQHierarchy);
								infoObjectSelectorEntityHierarchy = sap.firefly.InfoObjectSelectorEntity
										.createInfoObjectSelectorEntity(
												iQFieldBase,
												firstValue,
												null,
												sap.firefly.ComparisonOperator.EQUAL,
												sap.firefly.SetSign.INCLUDING);
								aInfoObjectSelectorEntity
										.add(infoObjectSelectorEntityHierarchy);
							}
							iQFieldBase = sap.firefly.InfoObjectSelectorEntity
									.getIQFieldBaseByName(
											iQHierarchyValueHelp,
											sap.firefly.HierarchyCatalogManager.BW_A_VERSION_KEY);
							firstValue = sap.firefly.InfoObjectSelectorEntity
									.getHierarchyValue(iQFieldBase, iQHierarchy);
							infoObjectSelectorEntityHierarchy = sap.firefly.InfoObjectSelectorEntity
									.createInfoObjectSelectorEntity(
											iQFieldBase,
											firstValue,
											null,
											sap.firefly.ComparisonOperator.EQUAL,
											sap.firefly.SetSign.INCLUDING);
							aInfoObjectSelectorEntity
									.add(infoObjectSelectorEntityHierarchy);
							iQFieldBase = sap.firefly.InfoObjectSelectorEntity
									.getIQFieldBaseByName(
											iQHierarchyValueHelp,
											sap.firefly.HierarchyCatalogManager.BW_A_DATE_TO_KEY);
							firstValue = sap.firefly.InfoObjectSelectorEntity
									.getHierarchyValue(iQFieldBase, iQHierarchy);
							infoObjectSelectorEntityHierarchy = sap.firefly.InfoObjectSelectorEntity
									.createInfoObjectSelectorEntity(
											iQFieldBase,
											firstValue,
											null,
											sap.firefly.ComparisonOperator.EQUAL,
											sap.firefly.SetSign.INCLUDING);
							aInfoObjectSelectorEntity
									.add(infoObjectSelectorEntityHierarchy);
							iQFieldBase = sap.firefly.InfoObjectSelectorEntity
									.getIQFieldBaseByName(
											iQHierarchyValueHelp,
											sap.firefly.HierarchyCatalogManager.BW_A_DATE_FROM_KEY);
							firstValue = sap.firefly.InfoObjectSelectorEntity
									.getHierarchyValue(iQFieldBase, iQHierarchy);
							infoObjectSelectorEntityHierarchy = sap.firefly.InfoObjectSelectorEntity
									.createInfoObjectSelectorEntity(
											iQFieldBase,
											firstValue,
											null,
											sap.firefly.ComparisonOperator.EQUAL,
											sap.firefly.SetSign.INCLUDING);
							aInfoObjectSelectorEntity
									.add(infoObjectSelectorEntityHierarchy);
							return aInfoObjectSelectorEntity;
						},
						getIQFieldBaseByName : function(iQHierarchyValueHelp,
								name) {
							var fieldHierarchy;
							var dimensionHierarchy;
							var iQFieldBase;
							var iQDimensionHierarchy;
							if (iQHierarchyValueHelp === null) {
								return null;
							}
							fieldHierarchy = null;
							dimensionHierarchy = null;
							if (sap.firefly.XString
									.isEqual(
											sap.firefly.HierarchyCatalogManager.BW_A_NAME_KEY,
											name)) {
								fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_NAME_KEY;
								dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_NAME;
							} else {
								if (sap.firefly.XString
										.isEqual(
												sap.firefly.HierarchyCatalogManager.BW_A_TEXT_SHORT_TEXT,
												name)) {
									fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_TEXT_SHORT_TEXT;
									dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_TEXT;
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.HierarchyCatalogManager.BW_A_TEXT_MEDIUM_TEXT,
													name)) {
										fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_TEXT_MEDIUM_TEXT;
										dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_TEXT;
									} else {
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.HierarchyCatalogManager.BW_A_TEXT_LONG_TEXT,
														name)) {
											fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_TEXT_LONG_TEXT;
											dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_TEXT;
										} else {
											if (sap.firefly.XString
													.isEqual(
															sap.firefly.HierarchyCatalogManager.BW_A_VERSION_KEY,
															name)) {
												fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_VERSION_KEY;
												dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_VERSION;
											} else {
												if (sap.firefly.XString
														.isEqual(
																sap.firefly.HierarchyCatalogManager.BW_A_VERSION_LONG_TEXT,
																name)) {
													fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_VERSION_LONG_TEXT;
													dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_VERSION;
												} else {
													if (sap.firefly.XString
															.isEqual(
																	sap.firefly.HierarchyCatalogManager.BW_A_DATE_TO_KEY,
																	name)) {
														fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_DATE_TO_KEY;
														dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_DATE_TO;
													} else {
														if (sap.firefly.XString
																.isEqual(
																		sap.firefly.HierarchyCatalogManager.BW_A_DATE_FROM_KEY,
																		name)) {
															fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_DATE_FROM_KEY;
															dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_DATE_FROM;
														} else {
															if (sap.firefly.XString
																	.isEqual(
																			sap.firefly.HierarchyCatalogManager.BW_A_OWNER_KEY,
																			name)) {
																fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_OWNER_KEY;
																dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_OWNER;
															} else {
																if (sap.firefly.XString
																		.isEqual(
																				sap.firefly.HierarchyCatalogManager.BW_A_HIEID_KEY,
																				name)) {
																	fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_HIEID_KEY;
																	dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_HIEID;
																} else {
																	if (sap.firefly.XString
																			.isEqual(
																					sap.firefly.HierarchyCatalogManager.BW_A_HIETYPE_KEY,
																					name)) {
																		fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_HIETYPE_KEY;
																		dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_HIETYPE;
																	} else {
																		if (sap.firefly.XString
																				.isEqual(
																						sap.firefly.HierarchyCatalogManager.BW_A_OBJVERS_KEY,
																						name)) {
																			fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_OBJVERS_KEY;
																			dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_OBJVERS;
																		} else {
																			if (sap.firefly.XString
																					.isEqual(
																							sap.firefly.HierarchyCatalogManager.BW_A_IS_REMOTE_KEY,
																							name)) {
																				fieldHierarchy = sap.firefly.HierarchyCatalogManager.BW_A_IS_REMOTE_KEY;
																				dimensionHierarchy = sap.firefly.HierarchyCatalogManager.BW_D_IS_REMOTE;
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
							iQFieldBase = null;
							if ((dimensionHierarchy !== null)
									&& (fieldHierarchy !== null)) {
								iQDimensionHierarchy = iQHierarchyValueHelp
										.getQueryModel().getDimensionByName(
												dimensionHierarchy);
								if (iQDimensionHierarchy !== null) {
									iQFieldBase = iQDimensionHierarchy
											.getFieldByName(fieldHierarchy);
								}
							}
							return iQFieldBase;
						},
						getHierarchyValue : function(iQFieldBase, iQHierarchy) {
							if ((iQFieldBase === null)
									|| (iQHierarchy === null)) {
								return null;
							}
							if (sap.firefly.XValueType.STRING === iQFieldBase
									.getValueType()) {
								if (sap.firefly.XString
										.isEqual(
												sap.firefly.HierarchyCatalogManager.BW_A_NAME_KEY,
												iQFieldBase.getName())) {
									return sap.firefly.XStringValue
											.create(iQHierarchy
													.getHierarchyName());
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.HierarchyCatalogManager.BW_A_TEXT_SHORT_TEXT,
													iQFieldBase.getName())) {
										return sap.firefly.XStringValue
												.create(iQHierarchy
														.getHierarchyDescription());
									} else {
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.HierarchyCatalogManager.BW_A_TEXT_MEDIUM_TEXT,
														iQFieldBase.getName())) {
											return sap.firefly.XStringValue
													.create(iQHierarchy
															.getHierarchyDescription());
										} else {
											if (sap.firefly.XString
													.isEqual(
															sap.firefly.HierarchyCatalogManager.BW_A_TEXT_LONG_TEXT,
															iQFieldBase
																	.getName())) {
												return sap.firefly.XStringValue
														.create(iQHierarchy
																.getHierarchyDescription());
											} else {
												if (sap.firefly.XString
														.isEqual(
																sap.firefly.HierarchyCatalogManager.BW_A_VERSION_KEY,
																iQFieldBase
																		.getName())) {
													return sap.firefly.XStringValue
															.create(iQHierarchy
																	.getHierarchyVersion());
												} else {
													if (sap.firefly.XString
															.isEqual(
																	sap.firefly.HierarchyCatalogManager.BW_A_VERSION_LONG_TEXT,
																	iQFieldBase
																			.getName())) {
														return sap.firefly.XStringValue
																.create(iQHierarchy
																		.getVersionDescription());
													} else {
														if (sap.firefly.XString
																.isEqual(
																		sap.firefly.HierarchyCatalogManager.BW_A_DATE_TO_KEY,
																		iQFieldBase
																				.getName())) {
															return sap.firefly.XStringValue
																	.create(iQHierarchy
																			.getDateTo()
																			.toSAPFormat());
														} else {
															if (sap.firefly.XString
																	.isEqual(
																			sap.firefly.HierarchyCatalogManager.BW_A_DATE_FROM_KEY,
																			iQFieldBase
																					.getName())) {
																return sap.firefly.XStringValue
																		.create(iQHierarchy
																				.getDateFrom()
																				.toSAPFormat());
															} else {
																if (sap.firefly.XString
																		.isEqual(
																				sap.firefly.HierarchyCatalogManager.BW_A_OWNER_KEY,
																				iQFieldBase
																						.getName())) {
																	return sap.firefly.XStringValue
																			.create(iQHierarchy
																					.getOwner());
																} else {
																	if (sap.firefly.XString
																			.isEqual(
																					sap.firefly.HierarchyCatalogManager.BW_A_HIEID_KEY,
																					iQFieldBase
																							.getName())) {
																		return sap.firefly.XStringValue
																				.create(iQHierarchy
																						.getHierId());
																	} else {
																		if (sap.firefly.XString
																				.isEqual(
																						sap.firefly.HierarchyCatalogManager.BW_A_HIETYPE_KEY,
																						iQFieldBase
																								.getName())) {
																			return sap.firefly.XStringValue
																					.create(iQHierarchy
																							.getHierType());
																		} else {
																			if (sap.firefly.XString
																					.isEqual(
																							sap.firefly.HierarchyCatalogManager.BW_A_IS_REMOTE_KEY,
																							iQFieldBase
																									.getName())) {
																				return sap.firefly.XBooleanValue
																						.create(iQHierarchy
																								.isRemote());
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
							return null;
						}
					},
					m_field : null,
					m_first_value : null,
					m_second_value : null,
					m_comparison_operator : null,
					m_sign : null,
					setup : function(iQField, firstValue, secondValue,
							comparisonOperator, sign) {
						this.m_field = iQField;
						this.m_first_value = firstValue;
						this.m_second_value = secondValue;
						this.m_comparison_operator = comparisonOperator;
						this.m_sign = sign;
						if (iQField === null) {
							throw sap.firefly.XException
									.createIllegalStateException("Unsupported value type");
						}
						if ((firstValue !== null)
								&& (iQField.getValueType() !== firstValue
										.getValueType())) {
							throw sap.firefly.XException
									.createIllegalStateException("Unsupported value type");
						}
						if ((secondValue !== null)
								&& (iQField.getValueType() !== secondValue
										.getValueType())) {
							throw sap.firefly.XException
									.createIllegalStateException("Unsupported value type");
						}
					},
					getValueType : function() {
						return this.m_field.getValueType();
					},
					getIQField : function() {
						return this.m_field;
					},
					getFirstValue : function() {
						return this.m_first_value;
					},
					getSecondValue : function() {
						return this.m_second_value;
					},
					getComparisonOperator : function() {
						return this.m_comparison_operator;
					},
					getSetSign : function() {
						return this.m_sign;
					},
					isEqualTo : function(other) {
						var comparedEntity = other;
						var result;
						result = (this.getFirstValue().isEqualTo(
								comparedEntity.getFirstValue()) && this
								.getSetSign().isEqualTo(
										comparedEntity.getSetSign()));
						return result;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DataDescriptorFactory",
				sap.firefly.XObject,
				{
					$statics : {
						createIDataDescriptor : function(contentType) {
							if (sap.firefly.HttpContentType.TEXT_CSV === contentType) {
								return sap.firefly.CSVDataDescriptor
										.createIDataDescriptor(
												sap.firefly.InAConstants.VA_SEPARATOR_SEMICOLON,
												sap.firefly.InAConstants.VA_FIELD_DELIMITER_QUOTATION_MARK,
												1,
												2,
												sap.firefly.DecimalDelimiterT.COMMA,
												sap.firefly.DateFormatT.DDpMMpYYYY,
												sap.firefly.EncodingT.UTF_8,
												null);
							}
							return null;
						}
					}
				});
$Firefly.createClass("sap.firefly.DataLocationFactory", sap.firefly.XObject, {
	$statics : {
		createIDataLocation : function(locationType, name, aIDataLocationKey) {
			if (locationType === sap.firefly.DataLocationT.DATABASE) {
				return sap.firefly.DatabaseDataLocation.createIDataLocation(
						name, aIDataLocationKey);
			}
			if (locationType === sap.firefly.DataLocationT.BYTE) {
				return sap.firefly.ByteDataLocation.createIDataLocation();
			}
			return null;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.ProviderFactory",
				sap.firefly.XObject,
				{
					$statics : {
						createIProvider : function(providerType, name, prefix,
								description, action, aIAttribute, isWritable,
								audit) {
							if (providerType === sap.firefly.ProviderT.AINX) {
								return sap.firefly.AINXProvider
										.createIProvider(name, prefix,
												description, providerType,
												action, aIAttribute,
												isWritable, audit);
							}
							if (providerType === sap.firefly.ProviderT.LCHA) {
								return sap.firefly.AINXProvider
										.createIProvider(name, prefix,
												description, providerType,
												action, aIAttribute,
												isWritable, audit);
							}
							return null;
						},
						updateIProvider : function(iWorkspace, iProvider,
								iPrStructure) {
							var nameUpdate;
							var iAggregationLevelUpdate;
							var iPrListReferencesUpdate;
							var f;
							var iPrStructureReferenceUpdate;
							var aReferenceNameUpdate;
							var aReferenceDescriptionUpdate;
							var aTlogoUpdate;
							var iReferenceUpdate;
							var iPrStructureDefinitionUpdate;
							var iPrListAttributesUpdate;
							var g;
							var iPrStructureAttributeUpdate;
							var aNameUpdate;
							var aDescriptionUpdate;
							var aReferenceUpdate;
							var checkMasterDataUpdate;
							var useConversionExitUpdate;
							var unitCurrencyUpdate;
							var aUnitReferenceUpdate;
							var aCurrencyReferenceUpdate;
							var isKyfUpdate;
							var dataTypeUpdate;
							var lengthUpdate;
							var decimalsUpdate;
							var conversionUpdate;
							var iAttributeUpdate;
							var aVisibilityTUpdate;
							if (iWorkspace === null) {
								return null;
							}
							if (iProvider === null) {
								return null;
							}
							if (iPrStructure === null) {
								return iProvider;
							}
							nameUpdate = iPrStructure
									.getStringByNameWithDefault(
											sap.firefly.InAConstants.QY_NAME,
											null);
							if ((iProvider.getName() === null)
									|| ((nameUpdate !== null) && (!sap.firefly.XString
											.isEqual(iProvider.getName(),
													nameUpdate)))) {
								return sap.firefly.ProviderFactory
										.instantiateIProvider(null, iWorkspace
												.getPrefix(), iPrStructure);
							}
							(iProvider).setPrefix(iWorkspace.getPrefix());
							if (iPrStructure
									.hasStringByName(sap.firefly.InAConstants.QY_DESCRIPTION)) {
								(iProvider)
										.setDescription(iPrStructure
												.getStringByName(sap.firefly.InAConstants.QY_DESCRIPTION));
							}
							if (iPrStructure
									.hasValueByName(sap.firefly.InAConstants.QY_INPUT_SUPPORTED)) {
								(iProvider)
										.setIsWritable(iPrStructure
												.getBooleanByNameWithDefault(
														sap.firefly.InAConstants.QY_INPUT_SUPPORTED,
														false));
							}
							(iProvider)
									.setDeltaRowCount(iPrStructure
											.getIntegerByNameWithDefault(
													sap.firefly.InAConstants.QY_DELTA_ROW_COUNT,
													0));
							if (iPrStructure
									.hasStringByName(sap.firefly.InAConstants.QY_AUDIT)) {
								(iProvider)
										.setAuditType(sap.firefly.AuditT
												.getAuditT(iPrStructure
														.getStringByName(sap.firefly.InAConstants.QY_AUDIT)));
							}
							if (iPrStructure
									.hasStringByName(sap.firefly.InAConstants.QY_AGGREGATION_LEVEL)) {
								iAggregationLevelUpdate = sap.firefly.AggregationLevelManager
										.createIAggregationLevel(iPrStructure
												.getStringByName(sap.firefly.InAConstants.QY_AGGREGATION_LEVEL));
								iAggregationLevelUpdate
										.addQuery(iAggregationLevelUpdate
												.getPlanQuery());
								iProvider.setPlanQuery(iAggregationLevelUpdate
										.getPlanQuery());
								iProvider
										.addIAggregationLevel(iAggregationLevelUpdate);
								(iProvider).setIsWritable(true);
							}
							(iProvider).setAction(sap.firefly.ActionT.T_GET);
							iPrListReferencesUpdate = iPrStructure
									.getListByName(sap.firefly.InAConstants.QY_REFERENCES);
							if (!sap.firefly.PrUtils
									.isListEmpty(iPrListReferencesUpdate)) {
								for (f = 0; f < iPrListReferencesUpdate.size(); f++) {
									iPrStructureReferenceUpdate = iPrListReferencesUpdate
											.getStructureByIndex(f);
									aReferenceNameUpdate = null;
									if (iPrStructureReferenceUpdate
											.hasStringByName(sap.firefly.InAConstants.QY_NAME)) {
										aReferenceNameUpdate = iPrStructureReferenceUpdate
												.getStringByName(sap.firefly.InAConstants.QY_NAME);
									}
									aReferenceDescriptionUpdate = null;
									if (iPrStructureReferenceUpdate
											.hasStringByName(sap.firefly.InAConstants.QY_DESCRIPTION)) {
										aReferenceDescriptionUpdate = iPrStructureReferenceUpdate
												.getStringByName(sap.firefly.InAConstants.QY_DESCRIPTION);
									}
									aTlogoUpdate = sap.firefly.TlogoT.T_UNKNOWN;
									if (iPrStructureReferenceUpdate
											.hasStringByName(sap.firefly.InAConstants.QY_TLOGO)) {
										aTlogoUpdate = sap.firefly.TlogoT
												.getTlogoT(iPrStructureReferenceUpdate
														.getStringByName(sap.firefly.InAConstants.QY_TLOGO));
										aTlogoUpdate
												.setDescription(iPrStructureReferenceUpdate
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_TLOGO_TXT,
																null));
									}
									iReferenceUpdate = sap.firefly.ReferenceManager
											.createIReference(
													aReferenceNameUpdate,
													aReferenceDescriptionUpdate,
													aTlogoUpdate);
									iProvider.addIReference(iReferenceUpdate);
								}
							}
							iPrStructureDefinitionUpdate = iPrStructure
									.getStructureByName(sap.firefly.InAConstants.QY_DEFINITION);
							if (iPrStructureDefinitionUpdate !== null) {
								iPrListAttributesUpdate = iPrStructureDefinitionUpdate
										.getListByName(sap.firefly.InAConstants.QY_ATTRIBUTES);
								if (!sap.firefly.PrUtils
										.isListEmpty(iPrListAttributesUpdate)) {
									for (g = 0; g < iPrListAttributesUpdate
											.size(); g++) {
										iPrStructureAttributeUpdate = iPrListAttributesUpdate
												.getStructureByIndex(g);
										aNameUpdate = null;
										if (iPrStructureAttributeUpdate
												.hasStringByName(sap.firefly.InAConstants.QY_NAME)) {
											aNameUpdate = iPrStructureAttributeUpdate
													.getStringByName(sap.firefly.InAConstants.QY_NAME);
										}
										aDescriptionUpdate = null;
										if (iPrStructureAttributeUpdate
												.hasStringByName(sap.firefly.InAConstants.QY_DESCRIPTION)) {
											aDescriptionUpdate = iPrStructureAttributeUpdate
													.getStringByName(sap.firefly.InAConstants.QY_DESCRIPTION);
										}
										aReferenceUpdate = null;
										checkMasterDataUpdate = false;
										useConversionExitUpdate = false;
										unitCurrencyUpdate = null;
										aUnitReferenceUpdate = null;
										aCurrencyReferenceUpdate = null;
										if (iPrStructureAttributeUpdate
												.hasStringByName(sap.firefly.InAConstants.QY_IOBJ_NAME)) {
											aReferenceUpdate = iPrStructureAttributeUpdate
													.getStringByName(sap.firefly.InAConstants.QY_IOBJ_NAME);
											checkMasterDataUpdate = iPrStructureAttributeUpdate
													.getBooleanByNameWithDefault(
															sap.firefly.InAConstants.QY_CHECK_MASTER_DATA,
															false);
											useConversionExitUpdate = iPrStructureAttributeUpdate
													.getBooleanByNameWithDefault(
															sap.firefly.InAConstants.QY_USE_CONV_EXIT,
															false);
											unitCurrencyUpdate = iPrStructureAttributeUpdate
													.getStringByNameWithDefault(
															sap.firefly.InAConstants.QY_UNIT_CURRENCY,
															null);
											aUnitReferenceUpdate = iPrStructureAttributeUpdate
													.getStringByNameWithDefault(
															sap.firefly.InAConstants.QY_UNIT_REFERENCE,
															null);
											aCurrencyReferenceUpdate = iPrStructureAttributeUpdate
													.getStringByNameWithDefault(
															sap.firefly.InAConstants.QY_CURRENCY_REFERENCE,
															null);
										}
										isKyfUpdate = iPrStructureAttributeUpdate
												.getBooleanByNameWithDefault(
														sap.firefly.InAConstants.QY_IS_KYF,
														true);
										dataTypeUpdate = null;
										lengthUpdate = 0;
										decimalsUpdate = 0;
										conversionUpdate = false;
										if (iPrStructureAttributeUpdate
												.hasStringByName(sap.firefly.InAConstants.QY_DATA_TYPE)) {
											dataTypeUpdate = sap.firefly.DataT
													.getDataT(iPrStructureAttributeUpdate
															.getStringByName(sap.firefly.InAConstants.QY_DATA_TYPE));
											if (dataTypeUpdate !== null) {
												lengthUpdate = iPrStructureAttributeUpdate
														.getIntegerByNameWithDefault(
																sap.firefly.InAConstants.QY_LENGTH,
																0);
												decimalsUpdate = iPrStructureAttributeUpdate
														.getIntegerByNameWithDefault(
																sap.firefly.InAConstants.QY_DECIMALS,
																0);
												conversionUpdate = iPrStructureAttributeUpdate
														.getBooleanByNameWithDefault(
																sap.firefly.InAConstants.QY_CONVERSION,
																false);
											}
										}
										iAttributeUpdate = iProvider
												.createIAttribute(aNameUpdate,
														aDescriptionUpdate,
														aReferenceUpdate,
														dataTypeUpdate,
														isKyfUpdate);
										iAttributeUpdate.getIDataT().setLength(
												lengthUpdate);
										iAttributeUpdate.getIDataT()
												.setDecimals(decimalsUpdate);
										iAttributeUpdate
												.getIDataT()
												.setConversion(conversionUpdate);
										iAttributeUpdate
												.setCheckMasterData(checkMasterDataUpdate);
										iAttributeUpdate
												.setUseConversionExit(useConversionExitUpdate);
										aVisibilityTUpdate = iPrStructureAttributeUpdate
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_VISIBILITY,
														sap.firefly.VisibilityT.T_NO
																.getName());
										iAttributeUpdate
												.setVisibility(sap.firefly.VisibilityT
														.getVisibilityT(aVisibilityTUpdate));
										iAttributeUpdate
												.setUnitCurrency(unitCurrencyUpdate);
										iAttributeUpdate
												.setUnitReference(aUnitReferenceUpdate);
										iAttributeUpdate
												.setCurrencyReference(aCurrencyReferenceUpdate);
										iProvider
												.addIAttribute(iAttributeUpdate);
									}
								}
							}
							return iProvider;
						},
						instantiateIProvider : function(iWorkspace, provider,
								iPrStructure) {
							var nameInstantiate;
							var descriptionInstantiate;
							var isWritableInstantiate;
							var auditInstantiate;
							var aggregationLevelInstantiate;
							var iProviderInstantiate;
							var iAggregationLevelInstantiate;
							var iPrListReferencesInstantiate;
							var h;
							var iPrStructureReferenceInstantiate;
							var aReferenceNameInstantiate;
							var aReferenceDescriptionInstantiate;
							var aTlogoInstantiate;
							var iReferenceInstantiate;
							var iPrStructureDefinitionInstantiate;
							var iPrListAttributesInstantiate;
							var i;
							var iPrStructureAttributeInstantiate;
							var aNameInstantiate;
							var aDescriptionInstantiate;
							var isKyfInstantiate;
							var dataTypeInstantiate;
							var aReferenceInstantiate;
							var iAttributeInstantiate;
							var aVisibilityTInstantiate;
							if (iWorkspace === null) {
								return null;
							}
							if (iPrStructure === null) {
								return null;
							}
							nameInstantiate = iPrStructure
									.getStringByNameWithDefault(
											sap.firefly.InAConstants.QY_NAME,
											null);
							if (nameInstantiate === null) {
								nameInstantiate = provider;
							}
							descriptionInstantiate = iPrStructure
									.getStringByNameWithDefault(
											sap.firefly.InAConstants.QY_DESCRIPTION,
											null);
							isWritableInstantiate = iPrStructure
									.getBooleanByNameWithDefault(
											sap.firefly.InAConstants.QY_INPUT_SUPPORTED,
											true);
							auditInstantiate = sap.firefly.AuditT
									.getAuditT(iPrStructure
											.getStringByNameWithDefault(
													sap.firefly.InAConstants.QY_AUDIT,
													null));
							aggregationLevelInstantiate = iPrStructure
									.getStringByNameWithDefault(
											sap.firefly.InAConstants.QY_AGGREGATION_LEVEL,
											null);
							iProviderInstantiate = sap.firefly.AINXProvider
									.createIProvider(nameInstantiate,
											iWorkspace.getPrefix(),
											descriptionInstantiate,
											sap.firefly.ProviderT.AINX,
											sap.firefly.ActionT.T_GET, null,
											isWritableInstantiate,
											auditInstantiate);
							(iProviderInstantiate)
									.setDeltaRowCount(iPrStructure
											.getIntegerByNameWithDefault(
													sap.firefly.InAConstants.QY_DELTA_ROW_COUNT,
													0));
							if (aggregationLevelInstantiate !== null) {
								iAggregationLevelInstantiate = sap.firefly.AggregationLevelManager
										.createIAggregationLevel(aggregationLevelInstantiate);
								iAggregationLevelInstantiate
										.addQuery(iAggregationLevelInstantiate
												.getPlanQuery());
								iProviderInstantiate
										.setPlanQuery(iAggregationLevelInstantiate
												.getPlanQuery());
								iProviderInstantiate
										.addIAggregationLevel(iAggregationLevelInstantiate);
							}
							iPrListReferencesInstantiate = iPrStructure
									.getListByName(sap.firefly.InAConstants.QY_REFERENCES);
							if (!sap.firefly.PrUtils
									.isListEmpty(iPrListReferencesInstantiate)) {
								for (h = 0; h < iPrListReferencesInstantiate
										.size(); h++) {
									iPrStructureReferenceInstantiate = iPrListReferencesInstantiate
											.getStructureByIndex(h);
									aReferenceNameInstantiate = null;
									if (iPrStructureReferenceInstantiate
											.hasStringByName(sap.firefly.InAConstants.QY_NAME)) {
										aReferenceNameInstantiate = iPrStructureReferenceInstantiate
												.getStringByName(sap.firefly.InAConstants.QY_NAME);
									}
									aReferenceDescriptionInstantiate = null;
									if (iPrStructureReferenceInstantiate
											.hasStringByName(sap.firefly.InAConstants.QY_DESCRIPTION)) {
										aReferenceDescriptionInstantiate = iPrStructureReferenceInstantiate
												.getStringByName(sap.firefly.InAConstants.QY_DESCRIPTION);
									}
									aTlogoInstantiate = sap.firefly.TlogoT.T_UNKNOWN;
									if (iPrStructureReferenceInstantiate
											.hasStringByName(sap.firefly.InAConstants.QY_TLOGO)) {
										aTlogoInstantiate = sap.firefly.TlogoT
												.getTlogoT(iPrStructureReferenceInstantiate
														.getStringByName(sap.firefly.InAConstants.QY_TLOGO));
										aTlogoInstantiate
												.setDescription(iPrStructureReferenceInstantiate
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_TLOGO_TXT,
																null));
									}
									iReferenceInstantiate = sap.firefly.ReferenceManager
											.createIReference(
													aReferenceNameInstantiate,
													aReferenceDescriptionInstantiate,
													aTlogoInstantiate);
									iProviderInstantiate
											.addIReference(iReferenceInstantiate);
								}
							}
							iPrStructureDefinitionInstantiate = iPrStructure
									.getStructureByName(sap.firefly.InAConstants.QY_DEFINITION);
							if (iPrStructureDefinitionInstantiate !== null) {
								iPrListAttributesInstantiate = iPrStructureDefinitionInstantiate
										.getListByName(sap.firefly.InAConstants.QY_ATTRIBUTES);
								if (!sap.firefly.PrUtils
										.isListEmpty(iPrListAttributesInstantiate)) {
									for (i = 0; i < iPrListAttributesInstantiate
											.size(); i++) {
										iPrStructureAttributeInstantiate = iPrListAttributesInstantiate
												.getStructureByIndex(i);
										aNameInstantiate = iPrStructureAttributeInstantiate
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_NAME,
														null);
										aDescriptionInstantiate = iPrStructureAttributeInstantiate
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_DESCRIPTION,
														null);
										isKyfInstantiate = iPrStructureAttributeInstantiate
												.getBooleanByNameWithDefault(
														sap.firefly.InAConstants.QY_IS_KYF,
														true);
										dataTypeInstantiate = sap.firefly.DataT
												.getDataT(iPrStructureAttributeInstantiate
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_DATA_TYPE,
																null));
										aReferenceInstantiate = iPrStructureAttributeInstantiate
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_IOBJ_NAME,
														null);
										iAttributeInstantiate = iProviderInstantiate
												.createIAttribute(
														aNameInstantiate,
														aDescriptionInstantiate,
														aReferenceInstantiate,
														dataTypeInstantiate,
														isKyfInstantiate);
										aVisibilityTInstantiate = iPrStructureAttributeInstantiate
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_VISIBILITY,
														sap.firefly.VisibilityT.T_NO
																.getName());
										iAttributeInstantiate
												.setVisibility(sap.firefly.VisibilityT
														.getVisibilityT(aVisibilityTInstantiate));
										if (aReferenceInstantiate !== null) {
											iAttributeInstantiate
													.setCheckMasterData(iPrStructureAttributeInstantiate
															.getBooleanByNameWithDefault(
																	sap.firefly.InAConstants.QY_CHECK_MASTER_DATA,
																	false));
											iAttributeInstantiate
													.setUseConversionExit(iPrStructureAttributeInstantiate
															.getBooleanByNameWithDefault(
																	sap.firefly.InAConstants.QY_USE_CONV_EXIT,
																	false));
											iAttributeInstantiate
													.setUnitCurrency(iPrStructureAttributeInstantiate
															.getStringByNameWithDefault(
																	sap.firefly.InAConstants.QY_UNIT_CURRENCY,
																	null));
											iAttributeInstantiate
													.setUnitReference(iPrStructureAttributeInstantiate
															.getStringByNameWithDefault(
																	sap.firefly.InAConstants.QY_UNIT_REFERENCE,
																	null));
											iAttributeInstantiate
													.setCurrencyReference(iPrStructureAttributeInstantiate
															.getStringByNameWithDefault(
																	sap.firefly.InAConstants.QY_CURRENCY_REFERENCE,
																	null));
										}
										if (dataTypeInstantiate !== null) {
											iAttributeInstantiate
													.getIDataT()
													.setLength(
															iPrStructureAttributeInstantiate
																	.getIntegerByNameWithDefault(
																			sap.firefly.InAConstants.QY_LENGTH,
																			0));
											iAttributeInstantiate
													.getIDataT()
													.setDecimals(
															iPrStructureAttributeInstantiate
																	.getIntegerByNameWithDefault(
																			sap.firefly.InAConstants.QY_DECIMALS,
																			0));
											iAttributeInstantiate
													.getIDataT()
													.setConversion(
															iPrStructureAttributeInstantiate
																	.getBooleanByNameWithDefault(
																			sap.firefly.InAConstants.QY_CONVERSION,
																			false));
										}
										iProviderInstantiate
												.addIAttribute(iAttributeInstantiate);
									}
								}
							}
							return iProviderInstantiate;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.AggregationLevelFactory",
				sap.firefly.XObject,
				{
					$statics : {
						CLAZZ : null,
						staticSetup : function() {
							sap.firefly.AggregationLevelFactory.CLAZZ = sap.firefly.XClass
									.create(sap.firefly.AggregationLevelFactory);
						}
					},
					createIAggregationLevel : function(name) {
						return sap.firefly.AggregationLevelManager
								.createIAggregationLevel(name);
					}
				});
$Firefly.createClass("sap.firefly.AttributeValue", sap.firefly.XObject, {
	$statics : {
		createIAttributeValue : function(iAttribute, iXValue) {
			var iAttributeValue = new sap.firefly.AttributeValue();
			iAttributeValue.setup(iAttribute, iXValue);
			return iAttributeValue;
		}
	},
	m_attribute : null,
	m_value : null,
	setup : function(iAttribute, iXValue) {
		this.m_attribute = iAttribute;
		this.m_value = iXValue;
	},
	getIAttribute : function() {
		return this.m_attribute;
	},
	getIXValue : function() {
		return this.m_value;
	}
});
$Firefly.createClass("sap.firefly.CleansingAction", sap.firefly.XObject, {
	$statics : {
		createICleansingAction : function(iCleansingActionType, iAttribute) {
			var cleansingAction = new sap.firefly.CleansingAction();
			cleansingAction.setup(iCleansingActionType, iAttribute);
			return cleansingAction;
		}
	},
	m_cleansing_action_type : null,
	m_attribute : null,
	m_value_to_be_replaced : null,
	m_value : null,
	m_row : 0,
	setup : function(iCleansingActionType, iAttribute) {
		this.m_cleansing_action_type = iCleansingActionType;
		this.m_attribute = iAttribute;
		this.m_row = -1;
	},
	getIAttribute : function() {
		return this.m_attribute;
	},
	getICleansingActionType : function() {
		return this.m_cleansing_action_type;
	},
	getIXValueToBeReplaced : function() {
		return this.m_value_to_be_replaced;
	},
	setIXValueToBeReplaced : function(iXValue) {
		this.m_value_to_be_replaced = iXValue;
	},
	getIXValue : function() {
		return this.m_value;
	},
	setIXValue : function(iXValue) {
		this.m_value = iXValue;
	},
	getRow : function() {
		return this.m_row;
	},
	setRow : function(row) {
		this.m_row = row;
	},
	toString : function() {
		var linebreak = "\r\n";
		var buffer = sap.firefly.XStringBuffer.create();
		if (this.m_cleansing_action_type !== null) {
			buffer.append(linebreak);
			buffer.append(this.m_cleansing_action_type.toString());
		}
		if (this.m_attribute !== null) {
			buffer.append(linebreak);
			buffer.append(this.m_attribute.toString());
		}
		if (this.m_value_to_be_replaced !== null) {
			buffer.append(linebreak);
			buffer.append(this.m_value_to_be_replaced.toString());
		}
		if (this.m_value !== null) {
			buffer.append(linebreak);
			buffer.append(this.m_value.toString());
		}
		return buffer.toString();
	}
});
$Firefly
		.createClass(
				"sap.firefly.CleansingManager",
				sap.firefly.XObject,
				{
					$statics : {
						createICleansing : function(aICleansingActionType) {
							var cleansingManager = new sap.firefly.CleansingManager();
							cleansingManager.setup(aICleansingActionType);
							return cleansingManager;
						},
						serialize : function(contentType, cleansing) {
							var aICleansingAction;
							var prStructureActions;
							var prList;
							var xIterator;
							var iCleansingAction;
							var prStructureAction;
							if (sap.firefly.HttpContentType.APPLICATION_JSON !== contentType) {
								return null;
							}
							if (cleansing === null) {
								return null;
							}
							aICleansingAction = cleansing.getICleansingAction();
							prStructureActions = sap.firefly.PrStructure
									.create();
							prList = sap.firefly.PrList.create();
							xIterator = aICleansingAction.getIterator();
							while (xIterator.hasNext()) {
								iCleansingAction = xIterator.next();
								prStructureAction = sap.firefly.PrStructure
										.create();
								prStructureAction
										.setStringByName(
												sap.firefly.InAConstants.QY_ATTRIBUTE_NAME,
												iCleansingAction
														.getIAttribute()
														.getName());
								prStructureAction
										.setStringByName(
												sap.firefly.InAConstants.QY_CLEANSING_ACTION,
												iCleansingAction
														.getICleansingActionType()
														.getName());
								sap.firefly.CleansingManager
										.setIXValue(
												prStructureAction,
												iCleansingAction
														.getIXValueToBeReplaced(),
												sap.firefly.InAConstants.QY_CLEANSING_VALUE_TO_BE_REPLACED);
								sap.firefly.CleansingManager
										.setIXValue(
												prStructureAction,
												iCleansingAction.getIXValue(),
												sap.firefly.InAConstants.QY_CLEANSING_VALUE);
								prList.add(prStructureAction);
							}
							prStructureActions
									.setElementByName(
											sap.firefly.InAConstants.QY_CLEANSING_ACTIONS,
											prList);
							return prStructureActions;
						},
						setIXValue : function(iPrStructure, iXValue,
								inAAttribute) {
							if (iPrStructure === null) {
								return;
							}
							if (iXValue === null) {
								return;
							}
							if (iXValue.getValueType() === sap.firefly.XValueType.STRING) {
								iPrStructure.setStringByName(inAAttribute,
										(iXValue).getStringValue());
							} else {
								if (iXValue.getValueType() === sap.firefly.XValueType.DOUBLE) {
									iPrStructure.setDoubleByName(inAAttribute,
											(iXValue).getDoubleValue());
								} else {
									if (iXValue.getValueType() === sap.firefly.XValueType.INTEGER) {
										iPrStructure.setIntegerByName(
												inAAttribute, (iXValue)
														.getIntegerValue());
									} else {
										if (iXValue.getValueType() === sap.firefly.XValueType.BOOLEAN) {
											iPrStructure.setBooleanByName(
													inAAttribute, (iXValue)
															.getBooleanValue());
										} else {
											if (iXValue.getValueType() === sap.firefly.XValueType.LONG) {
												iPrStructure
														.setLongByName(
																inAAttribute,
																(iXValue)
																		.getLongValue());
											} else {
												throw sap.firefly.XException
														.createIllegalStateException("Unsupported value type");
											}
										}
									}
								}
							}
						}
					},
					m_cleansing_action_type : null,
					m_cleansing_action : null,
					m_performed_action : null,
					m_statistic_data : null,
					m_instance_id : null,
					setup : function(aICleansingActionType) {
						var iXIterator;
						var iCleansingActionType;
						this.m_cleansing_action_type = sap.firefly.XHashMapByString
								.create();
						if (aICleansingActionType !== null) {
							iXIterator = aICleansingActionType.getIterator();
							while (iXIterator.hasNext()) {
								iCleansingActionType = iXIterator.next();
								this.m_cleansing_action_type.put(
										iCleansingActionType.getName(),
										iCleansingActionType);
							}
						}
						this.m_cleansing_action = sap.firefly.XList.create();
						this.m_performed_action = sap.firefly.XList.create();
						this.m_statistic_data = sap.firefly.XHashMapByString
								.create();
						this.m_instance_id = sap.firefly.XGuid.getGuid();
					},
					getInstanceId : function() {
						return this.m_instance_id;
					},
					getICleansingActionType : function() {
						var aICleansingActionType = sap.firefly.XList.create();
						var iXIterator = this.m_cleansing_action_type
								.getKeysAsIteratorOfString();
						while (iXIterator.hasNext()) {
							aICleansingActionType
									.add(this.m_cleansing_action_type
											.getByKey(iXIterator.next()));
						}
						return aICleansingActionType;
					},
					getICleansingActionTypeByName : function(name) {
						return this.m_cleansing_action_type.getByKey(name);
					},
					createICleansingAction : function(iCleansingActionType,
							iAttribute) {
						if (iCleansingActionType === null) {
							return null;
						}
						if (iAttribute === null) {
							return null;
						}
						return sap.firefly.CleansingAction
								.createICleansingAction(iCleansingActionType,
										iAttribute);
					},
					addICleansingAction : function(iCleansingAction) {
						if (iCleansingAction !== null) {
							this.m_cleansing_action.add(iCleansingAction);
						}
					},
					getICleansingAction : function() {
						return this.m_cleansing_action;
					},
					getICleansingActionCounter : function(iCleansingActionType) {
						if (iCleansingActionType === null) {
							return -1;
						}
						if (!this.m_statistic_data
								.containsKey(iCleansingActionType.getName())) {
							return -1;
						}
						return (this.m_statistic_data
								.getByKey(iCleansingActionType.getName()))
								.getIntegerValue();
					},
					setICleansingActionCounter : function(iCleansingActionType,
							iXValue) {
						if (iCleansingActionType === null) {
							return;
						}
						if (!this.m_statistic_data
								.containsKey(iCleansingActionType.getName())) {
							this.m_statistic_data.put(iCleansingActionType
									.getName(), iXValue);
						} else {
							this.m_statistic_data.remove(iCleansingActionType
									.getName());
							this.m_statistic_data.put(iCleansingActionType
									.getName(), iXValue);
						}
					},
					addPerformedICleansingAction : function(iCleansingAction) {
						if (iCleansingAction !== null) {
							this.m_performed_action.add(iCleansingAction);
						}
					},
					getPerformedICleansingAction : function() {
						return this.m_performed_action;
					},
					clearActions : function() {
						this.m_cleansing_action = sap.firefly.XList.create();
					},
					toString : function() {
						var linebreak = "\r\n";
						var buffer = sap.firefly.XStringBuffer.create();
						if (this.m_cleansing_action_type !== null) {
							buffer.append(linebreak);
							buffer.append(this.m_cleansing_action_type
									.toString());
						}
						if (this.m_cleansing_action !== null) {
							buffer.append(linebreak);
							buffer.append(this.m_cleansing_action.toString());
						}
						return buffer.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DataContainer",
				sap.firefly.XObject,
				{
					$statics : {
						createIDataContainer : function(contentType,
								dataLocationT, dataLocation, data, action) {
							var iDataContainer = new sap.firefly.DataContainer();
							iDataContainer.setup(contentType, dataLocationT,
									dataLocation, data, action);
							return iDataContainer;
						},
						instantiateIDataContainer : function(iPrStructure) {
							var iDataContainerInstantiate;
							var iPrStructureContentDescriptionInstantiate;
							var iCSVDataDescriptorInstantiate;
							if (iPrStructure === null) {
								return null;
							}
							iDataContainerInstantiate = sap.firefly.DataContainer
									.createIDataContainer(
											sap.firefly.HttpContentType.TEXT_CSV,
											null, null, null,
											sap.firefly.ActionT.T_NO);
							iPrStructureContentDescriptionInstantiate = iPrStructure
									.getStructureByName(sap.firefly.InAConstants.QY_CONTENT_DESCRPTION);
							if (iPrStructureContentDescriptionInstantiate !== null) {
								iCSVDataDescriptorInstantiate = iDataContainerInstantiate
										.getIDataDescriptor();
								iCSVDataDescriptorInstantiate
										.setDateFormat(sap.firefly.DateFormatT
												.getDateFormatT(iPrStructureContentDescriptionInstantiate
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_DATE_FORMAT,
																null)));
								iCSVDataDescriptorInstantiate
										.setDecimalDelimiter(sap.firefly.DecimalDelimiterT
												.getDecimalDelimiterT(iPrStructureContentDescriptionInstantiate
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_DECIMAL_DELIMITER,
																null)));
								iCSVDataDescriptorInstantiate
										.setEncoding(sap.firefly.EncodingT
												.getEncodingT(iPrStructureContentDescriptionInstantiate
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_ENCODING,
																null)));
								iCSVDataDescriptorInstantiate
										.setFieldDelimiter(iPrStructureContentDescriptionInstantiate
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_FIELD_DELIMITER,
														null));
								iCSVDataDescriptorInstantiate
										.setFirstDataRow(iPrStructureContentDescriptionInstantiate
												.getIntegerByNameWithDefault(
														sap.firefly.InAConstants.QY_FIRST_DATA_ROW,
														0));
								iCSVDataDescriptorInstantiate
										.setHeaderRow(iPrStructureContentDescriptionInstantiate
												.getIntegerByNameWithDefault(
														sap.firefly.InAConstants.QY_HEADER_ROW,
														0));
								iCSVDataDescriptorInstantiate
										.setSeparator(iPrStructureContentDescriptionInstantiate
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_SEPARATOR,
														null));
								iCSVDataDescriptorInstantiate
										.setFilePath(iPrStructureContentDescriptionInstantiate
												.getStringByNameWithDefault(
														sap.firefly.InAConstants.QY_FILE_PATH,
														null));
							}
							return iDataContainerInstantiate;
						}
					},
					m_dataDescriptor : null,
					m_data : null,
					m_cleansing : null,
					m_action : null,
					m_reference_id : null,
					setup : function(contentType, dataLocationT, dataLocation,
							data, action) {
						this.m_action = action;
						this.m_data = sap.firefly.DataManager.createIData(data,
								sap.firefly.DataLocationFactory
										.createIDataLocation(dataLocationT,
												dataLocation, null));
						if (sap.firefly.HttpContentType.TEXT_CSV === contentType) {
							this.m_dataDescriptor = sap.firefly.DataDescriptorFactory
									.createIDataDescriptor(contentType);
						}
					},
					getAction : function() {
						return this.m_action;
					},
					getReferenceId : function() {
						return this.m_reference_id;
					},
					setReferenceId : function(referenceId) {
						this.m_reference_id = referenceId;
					},
					getIDataDescriptor : function() {
						return this.m_dataDescriptor;
					},
					getIData : function() {
						return this.m_data;
					},
					setICleansing : function(iCleansing) {
						this.m_cleansing = iCleansing;
					},
					getICleansing : function() {
						return this.m_cleansing;
					},
					serialize : function(contentType) {
						var prStructure;
						if (sap.firefly.HttpContentType.APPLICATION_JSON === contentType) {
							prStructure = sap.firefly.PrStructure.create();
							prStructure.setStringByName(
									sap.firefly.InAConstants.QY_ACTION,
									this.m_action.getName());
							prStructure.setStringByName(
									sap.firefly.InAConstants.QY_REFERENCE_ID,
									this.m_reference_id);
							if (this.m_dataDescriptor !== null) {
								prStructure
										.setStringByName(
												sap.firefly.InAConstants.QY_CONTENT_TYPE,
												this.m_dataDescriptor
														.getContentType()
														.getName());
							}
							if (this.m_dataDescriptor !== null) {
								prStructure
										.setElementByName(
												sap.firefly.InAConstants.QY_CONTENT_DESCRPTION,
												sap.firefly.DataDescriptorManager
														.serialize(
																contentType,
																this.m_dataDescriptor));
							}
							if ((this.m_data !== null)
									&& (this.m_data.getDataLocation() !== null)) {
								prStructure
										.setElementByName(
												sap.firefly.InAConstants.QY_CONTENT_LOCATION,
												sap.firefly.DataLocationManager
														.serialize(
																contentType,
																this.m_data
																		.getDataLocation()));
								if (sap.firefly.DataLocationT.BYTE === this.m_data
										.getDataLocation().getDataLocation()) {
									prStructure
											.setStringByName(
													sap.firefly.InAConstants.QY_CONTENT,
													sap.firefly.XByteArray
															.convertXByteArrayToString(this.m_data
																	.getDataBytes()));
								}
							}
							return prStructure;
						}
						return null;
					}
				});
$Firefly.createClass("sap.firefly.DataContainerManager", sap.firefly.XObject, {
	$statics : {
		serialize : function(contentType, dataContainer) {
			if (sap.firefly.HttpContentType.APPLICATION_JSON !== contentType) {
				return null;
			}
			if (dataContainer !== null) {
				return (dataContainer).serialize(contentType);
			}
			return null;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.DataDescriptorManager",
				sap.firefly.XObject,
				{
					$statics : {
						serialize : function(contentType, dataDescriptor) {
							if (sap.firefly.HttpContentType.APPLICATION_JSON !== contentType) {
								return null;
							}
							if ((dataDescriptor !== null)
									&& (sap.firefly.HttpContentType.TEXT_CSV === dataDescriptor
											.getContentType())) {
								return (dataDescriptor).serialize(contentType);
							}
							return null;
						}
					}
				});
$Firefly.createClass("sap.firefly.DataLocationManager", sap.firefly.XObject, {
	$statics : {
		serialize : function(contentType, dataLocation) {
			if (sap.firefly.HttpContentType.APPLICATION_JSON !== contentType) {
				return null;
			}
			if (dataLocation !== null) {
				if (sap.firefly.DataLocationT.DATABASE === dataLocation
						.getDataLocation()) {
					return (dataLocation).serialize(contentType);
				} else {
					if (sap.firefly.DataLocationT.BYTE === dataLocation
							.getDataLocation()) {
						return (dataLocation).serialize(contentType);
					}
				}
			}
			return null;
		}
	}
});
$Firefly.createClass("sap.firefly.DataManager", sap.firefly.XObject, {
	$statics : {
		createIData : function(data, dataLocation) {
			var iData = new sap.firefly.DataManager();
			iData.setup(data, dataLocation);
			return iData;
		}
	},
	m_data : null,
	m_data_location : null,
	setup : function(data, dataLocation) {
		this.m_data = data;
		this.m_data_location = dataLocation;
	},
	getDataBytes : function() {
		return this.m_data;
	},
	getDataLocation : function() {
		return this.m_data_location;
	}
});
$Firefly.createClass("sap.firefly.DataTManager", sap.firefly.XObject, {
	$statics : {
		createIDataT : function(dataT, length, decimals, conversion) {
			var iDataT = new sap.firefly.DataTManager();
			iDataT.setup(dataT, length, decimals, conversion);
			return iDataT;
		}
	},
	m_data_t : null,
	m_length : 0,
	m_decimals : 0,
	m_conversion : false,
	setup : function(dataT, length, decimals, conversion) {
		this.m_data_t = dataT;
		this.m_length = length;
		this.m_decimals = decimals;
		this.m_conversion = conversion;
	},
	setDataType : function(dataT) {
		this.m_data_t = dataT;
	},
	getDataType : function() {
		return this.m_data_t;
	},
	isDataTypeSwitchSupported : function(dataT) {
		if (dataT === null) {
			return false;
		}
		if (this.m_decimals === 3) {
			if (sap.firefly.XString.isEqual(sap.firefly.DataT.NUMBER.getName(),
					dataT.getName())
					|| sap.firefly.XString.isEqual(
							sap.firefly.DataT.INFO_OBJECT.getName(), dataT
									.getName())) {
				return true;
			}
			return false;
		} else {
			if (this.m_decimals > 0) {
				if (sap.firefly.XString.isEqual(
						sap.firefly.DataT.FLOATING_POINT.getName(), dataT
								.getName())
						|| sap.firefly.XString.isEqual(
								sap.firefly.DataT.INFO_OBJECT.getName(), dataT
										.getName())) {
					return true;
				}
				return false;
			}
		}
		return true;
	},
	setLength : function(length) {
		this.m_length = length;
	},
	getLength : function() {
		return this.m_length;
	},
	isLengthSupported : function() {
		if (sap.firefly.XString.isEqual(sap.firefly.DataT.STRING.getName(),
				this.m_data_t.getName())
				&& (this.m_conversion)) {
			return true;
		}
		return false;
	},
	setDecimals : function(decimals) {
		this.m_decimals = decimals;
	},
	getDecimals : function() {
		return this.m_decimals;
	},
	isDecimalsSupported : function() {
		return false;
	},
	setConversion : function(conversion) {
		this.m_conversion = conversion;
	},
	getConversion : function() {
		return this.m_conversion;
	},
	isConversionSupported : function() {
		if (sap.firefly.XString.isEqual(sap.firefly.DataT.STRING.getName(),
				this.m_data_t.getName())) {
			return true;
		}
		return false;
	}
});
$Firefly
		.createClass(
				"sap.firefly.ProviderDataContainerBag",
				sap.firefly.XObject,
				{
					$statics : {
						createIProviderIDataContainerBag : function(orderID,
								provider, dataContainer, cleansing) {
							var iProviderIDataContainerBag = new sap.firefly.ProviderDataContainerBag();
							iProviderIDataContainerBag.setup(orderID, provider,
									dataContainer, cleansing);
							return iProviderIDataContainerBag;
						}
					},
					m_order_id : 0,
					m_iprovider : null,
					m_idata_container : null,
					m_cleansing : null,
					setup : function(orderID, provider, dataContainer,
							cleansing) {
						this.m_order_id = orderID;
						this.m_iprovider = provider;
						this.m_idata_container = dataContainer;
						this.m_cleansing = cleansing;
					},
					getOrderID : function() {
						return this.m_order_id;
					},
					getIDataContainer : function() {
						return this.m_idata_container;
					},
					getIProvider : function() {
						return this.m_iprovider;
					},
					getICleansing : function() {
						return this.m_cleansing;
					}
				});
$Firefly.createClass("sap.firefly.ProviderManager", sap.firefly.XObject, {
	$statics : {
		serialize : function(contentType, provider) {
			if (sap.firefly.HttpContentType.APPLICATION_JSON !== contentType) {
				return null;
			}
			if ((provider !== null)
					&& (sap.firefly.ProviderT.AINX === provider
							.getProviderType())) {
				return (provider).serialize(contentType);
			} else {
				if ((provider !== null)
						&& (sap.firefly.ProviderT.LCHA === provider
								.getProviderType())) {
					return (provider).serialize(contentType);
				}
			}
			return null;
		}
	}
});
$Firefly.createClass("sap.firefly.WorkspaceBagManager", sap.firefly.XObject, {
	$statics : {
		createIWorkspaceBag : function(workspace) {
			var iWorkspaceBag = new sap.firefly.WorkspaceBagManager();
			iWorkspaceBag.setup(workspace);
			return iWorkspaceBag;
		}
	},
	m_workspace : null,
	setup : function(workspace) {
		this.m_workspace = workspace;
	},
	getWorkspace : function() {
		return this.m_workspace;
	}
});
$Firefly.createClass("sap.firefly.WorkstatusMember", sap.firefly.XObject, {
	$statics : {
		createIWorkstatusDimension : function(iQDimension) {
			var iWorkstatusMember = new sap.firefly.WorkstatusMember();
			iWorkstatusMember.setup(iQDimension);
			return iWorkstatusMember;
		}
	},
	m_iqdimension : null,
	m_first_value : null,
	m_second_value : null,
	m_is_filtered : false,
	m_comparison_operator : null,
	setup : function(iQDimension) {
		this.m_iqdimension = iQDimension;
		this.m_is_filtered = false;
	},
	getIQDimension : function() {
		return this.m_iqdimension;
	},
	getIQHierarchyContainer : function() {
		return this.m_iqdimension;
	},
	getValueType : function() {
		return this.m_iqdimension.getKeyField().getValueType();
	},
	setIQSelection : function(firstValue, secondValue, comparisonOperator) {
		this.m_first_value = firstValue;
		this.m_second_value = secondValue;
		this.m_comparison_operator = comparisonOperator;
		this.m_is_filtered = true;
	},
	getFirstValue : function() {
		return this.m_first_value;
	},
	getSecondValue : function() {
		return this.m_second_value;
	},
	getComparisonOperator : function() {
		return this.m_comparison_operator;
	},
	isFiltered : function() {
		return this.m_is_filtered;
	},
	isOwnerDimension : function() {
		return this.m_iqdimension.isOwnerDimension();
	}
});
$Firefly
		.createClass(
				"sap.firefly.WorkstatusMemberManager",
				sap.firefly.XObject,
				{
					$statics : {
						TECHNICAL_DIMENSION_GET : null,
						TECHNICAL_DIMENSION_SET : null,
						createMemberManager : function(iQueryModel,
								workstatusMode) {
							var iWorkstatusMemberManager = new sap.firefly.WorkstatusMemberManager();
							iWorkstatusMemberManager.setup(iQueryModel,
									workstatusMode);
							return iWorkstatusMemberManager;
						}
					},
					m_query_model : null,
					m_mode : null,
					m_members_list : null,
					setup : function(iQueryModel, workstatusMode) {
						this.m_query_model = sap.firefly.XWeakReferenceUtil
								.getWeakRef(iQueryModel);
						this.m_mode = workstatusMode;
						this.m_members_list = sap.firefly.XList.create();
						sap.firefly.WorkstatusMemberManager.TECHNICAL_DIMENSION_GET = sap.firefly.XList
								.create();
						sap.firefly.WorkstatusMemberManager.TECHNICAL_DIMENSION_GET
								.add(sap.firefly.XStringValue
										.create(sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_AVAILABLE_STATUS));
						sap.firefly.WorkstatusMemberManager.TECHNICAL_DIMENSION_GET
								.add(sap.firefly.XStringValue
										.create(sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_STATUS));
						sap.firefly.WorkstatusMemberManager.TECHNICAL_DIMENSION_GET
								.add(sap.firefly.XStringValue
										.create(sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_CANCEL));
						sap.firefly.WorkstatusMemberManager.TECHNICAL_DIMENSION_SET = sap.firefly.XList
								.create();
						sap.firefly.WorkstatusMemberManager.TECHNICAL_DIMENSION_SET
								.add(sap.firefly.XStringValue
										.create(sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_AVAILABLE_STATUS));
						sap.firefly.WorkstatusMemberManager.TECHNICAL_DIMENSION_SET
								.add(sap.firefly.XStringValue
										.create(sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_CANCEL));
					},
					getMode : function() {
						return this.m_mode;
					},
					getQueryModel : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_query_model);
					},
					createMembers : function() {
						var aIWorkstatusMember = sap.firefly.XList.create();
						var iXIteratorIWorkstatusDimensions = this
								.getQueryModel().getDimensions().getIterator();
						var iWorkstatusMember;
						while (iXIteratorIWorkstatusDimensions.hasNext()) {
							iWorkstatusMember = sap.firefly.WorkstatusMember
									.createIWorkstatusDimension(iXIteratorIWorkstatusDimensions
											.next());
							aIWorkstatusMember.add(iWorkstatusMember);
						}
						return aIWorkstatusMember;
					},
					addIQSelection : function(aIWorkstatusMember) {
						this.m_members_list.add(aIWorkstatusMember);
					},
					clearIQSelections : function() {
						this.m_members_list = sap.firefly.XList.create();
					},
					getIQSelectionComponent : function() {
						if (this.m_members_list === null) {
							return null;
						} else {
							if (this.m_members_list.size() === 1) {
								return this
										.getIQSelectionCartesianProduct(this.m_members_list
												.get(0));
							} else {
								return this
										.getComplexSelection(this.m_members_list);
							}
						}
					},
					getIQSelectionCartesianProduct : function(
							aIWorkstatusMember) {
						var iQSelectionCartesianProduct_IQSCP = sap.firefly.QFactory2
								.newFilterCartesianProduct(null);
						var rowsAxis_IQSCP;
						var iXIterator_IQSCP;
						var iWorkstatusMember;
						var iQDimension_IQSCP;
						var field_IQSCP;
						var iQFieldListReadOnly_IQSCP;
						var iXIteratorIQField_IQSCP;
						var iQField_IQSCP;
						var iQFieldList_IQSCP;
						var memberSelection;
						var element;
						if (aIWorkstatusMember === null) {
							return iQSelectionCartesianProduct_IQSCP;
						}
						rowsAxis_IQSCP = this.getQueryModel().getRowsAxis();
						iXIterator_IQSCP = aIWorkstatusMember.getIterator();
						while (iXIterator_IQSCP.hasNext()) {
							iWorkstatusMember = iXIterator_IQSCP.next();
							iQDimension_IQSCP = iWorkstatusMember
									.getIQDimension();
							if (iQDimension_IQSCP.getSupportedAxesTypes()
									.contains(sap.firefly.AxisType.ROWS)) {
								rowsAxis_IQSCP.add(iQDimension_IQSCP);
							}
							field_IQSCP = iQDimension_IQSCP.getKeyField();
							iQFieldListReadOnly_IQSCP = iQDimension_IQSCP
									.getFields();
							iXIteratorIQField_IQSCP = iQFieldListReadOnly_IQSCP
									.getIterator();
							while (iXIteratorIQField_IQSCP.hasNext()) {
								iQField_IQSCP = iXIteratorIQField_IQSCP.next();
								iQFieldList_IQSCP = iQDimension_IQSCP
										.getResultSetFields();
								iQFieldList_IQSCP.add(iQField_IQSCP);
							}
							if (field_IQSCP.isFilterable() === false) {
								continue;
							}
							if (this.isTechnicalDimension(iQDimension_IQSCP)) {
								continue;
							}
							memberSelection = iQSelectionCartesianProduct_IQSCP
									.getCartesianList(field_IQSCP
											.getDimension());
							if (memberSelection === null) {
								memberSelection = iQSelectionCartesianProduct_IQSCP
										.getCartesianListByField(field_IQSCP);
							}
							if (memberSelection.size() === 0) {
								memberSelection.setField(field_IQSCP);
							} else {
								if (memberSelection.getField() !== field_IQSCP) {
									return iQSelectionCartesianProduct_IQSCP;
								}
							}
							if (!iWorkstatusMember.isFiltered()) {
								continue;
							}
							element = memberSelection.addNewCartesianElement();
							if (iWorkstatusMember.getSecondValue() === null) {
								element.configureSingleParameterExpression(
										iWorkstatusMember.getFirstValue(),
										iWorkstatusMember
												.getComparisonOperator());
							} else {
								element.configureDoubleParameterExpression(
										iWorkstatusMember.getFirstValue(),
										iWorkstatusMember.getSecondValue(),
										iWorkstatusMember
												.getComparisonOperator());
							}
						}
						return iQSelectionCartesianProduct_IQSCP;
					},
					isTechnicalDimension : function(iQDimension) {
						var iXIteratorTechnicalDimension = null;
						var iXStringTechnicalDimension;
						if (this.m_mode === sap.firefly.WorkstatusMode.GET) {
							iXIteratorTechnicalDimension = sap.firefly.WorkstatusMemberManager.TECHNICAL_DIMENSION_GET
									.getIterator();
						} else {
							if (this.m_mode === sap.firefly.WorkstatusMode.SET) {
								iXIteratorTechnicalDimension = sap.firefly.WorkstatusMemberManager.TECHNICAL_DIMENSION_SET
										.getIterator();
							} else {
								return false;
							}
						}
						while (iXIteratorTechnicalDimension.hasNext()) {
							iXStringTechnicalDimension = iXIteratorTechnicalDimension
									.next();
							if (sap.firefly.XString
									.isEqual(iXStringTechnicalDimension
											.getStringValue(), iQDimension
											.getName())) {
								return true;
							}
						}
						return false;
					},
					getComplexSelection : function(listOfIWorkstatusMemberList) {
						var iQSelectionContainer_IQSC1;
						var iQSelectionLogicalAnd_IQSC1;
						var rowsAxis_IQSCP1;
						var memberList1;
						var j1;
						var iWorkstatusMember_IQSC1;
						var iQDimension_IQSC1;
						var field_IQSC1;
						var iQFieldListReadOnly_IQSC1;
						var iXIteratorIQField_IQSC1;
						var iQField_IQSC1;
						var iQFieldList_IQSC1;
						var iQSelectionPrimitiveOperation_GE_IQSC1;
						var iQSelectionPrimitiveOperation_LE_IQSC1;
						var iQSelectionPrimitiveOperation_IQSC1;
						var iQSelectionContainer_IQSC;
						var iQSelectionLogicalOr_IQSC;
						var rowsAxis_IQSCP;
						var i;
						var iQSelectionLogicalAnd_IQSC;
						var memberList;
						var j;
						var iWorkstatusMember_IQSC;
						var iQDimension_IQSC;
						var field_IQSC;
						var iQFieldListReadOnly_IQSC;
						var iXIteratorIQField_IQSC;
						var iQField_IQSC;
						var iQFieldList_IQSC;
						var iQSelectionPrimitiveOperation_GE_IQSC;
						var iQSelectionPrimitiveOperation_LE_IQSC;
						var iQSelectionPrimitiveOperation_IQSC;
						if ((listOfIWorkstatusMemberList === null)
								|| (listOfIWorkstatusMemberList.size() === 0)) {
							return null;
						}
						if (listOfIWorkstatusMemberList.size() === 1) {
							iQSelectionContainer_IQSC1 = this.getQueryModel()
									.getSelector().getSelectionStateContainer();
							iQSelectionLogicalAnd_IQSC1 = sap.firefly.QFilterAnd
									._create(this.getQueryModel(),
											iQSelectionContainer_IQSC1);
							iQSelectionContainer_IQSC1
									.setComplexSelection(iQSelectionLogicalAnd_IQSC1);
							rowsAxis_IQSCP1 = this.getQueryModel()
									.getRowsAxis();
							memberList1 = listOfIWorkstatusMemberList.get(0);
							for (j1 = 0; j1 < memberList1.size(); j1++) {
								iWorkstatusMember_IQSC1 = memberList1.get(j1);
								iQDimension_IQSC1 = iWorkstatusMember_IQSC1
										.getIQDimension();
								if (iQDimension_IQSC1.getSupportedAxesTypes()
										.contains(sap.firefly.AxisType.ROWS)) {
									rowsAxis_IQSCP1.add(iQDimension_IQSC1);
								}
								field_IQSC1 = iQDimension_IQSC1.getKeyField();
								iQFieldListReadOnly_IQSC1 = iQDimension_IQSC1
										.getFields();
								iXIteratorIQField_IQSC1 = iQFieldListReadOnly_IQSC1
										.getIterator();
								while (iXIteratorIQField_IQSC1.hasNext()) {
									iQField_IQSC1 = iXIteratorIQField_IQSC1
											.next();
									iQFieldList_IQSC1 = iQDimension_IQSC1
											.getResultSetFields();
									iQFieldList_IQSC1.add(iQField_IQSC1);
								}
								if (field_IQSC1.isFilterable() === false) {
									continue;
								}
								if (this
										.isTechnicalDimension(iQDimension_IQSC1)) {
									continue;
								}
								if (!iWorkstatusMember_IQSC1.isFiltered()) {
									continue;
								}
								if (sap.firefly.ComparisonOperator.BETWEEN === iWorkstatusMember_IQSC1
										.getComparisonOperator()) {
									iQSelectionPrimitiveOperation_GE_IQSC1 = this
											.getIQSelectionPrimitiveOperation(
													iQSelectionContainer_IQSC1,
													iWorkstatusMember_IQSC1
															.getFirstValue(),
													iWorkstatusMember_IQSC1
															.getValueType(),
													sap.firefly.ComparisonOperator.GREATER_EQUAL,
													field_IQSC1);
									iQSelectionLogicalAnd_IQSC1
											.add(iQSelectionPrimitiveOperation_GE_IQSC1);
									iQSelectionPrimitiveOperation_LE_IQSC1 = this
											.getIQSelectionPrimitiveOperation(
													iQSelectionContainer_IQSC1,
													iWorkstatusMember_IQSC1
															.getSecondValue(),
													iWorkstatusMember_IQSC1
															.getValueType(),
													sap.firefly.ComparisonOperator.LESS_EQUAL,
													field_IQSC1);
									iQSelectionLogicalAnd_IQSC1
											.add(iQSelectionPrimitiveOperation_LE_IQSC1);
								} else {
									iQSelectionPrimitiveOperation_IQSC1 = this
											.getIQSelectionPrimitiveOperation(
													iQSelectionContainer_IQSC1,
													iWorkstatusMember_IQSC1
															.getFirstValue(),
													iWorkstatusMember_IQSC1
															.getValueType(),
													iWorkstatusMember_IQSC1
															.getComparisonOperator(),
													field_IQSC1);
									iQSelectionLogicalAnd_IQSC1
											.add(iQSelectionPrimitiveOperation_IQSC1);
								}
							}
							return iQSelectionLogicalAnd_IQSC1;
						}
						iQSelectionContainer_IQSC = this.getQueryModel()
								.getSelector().getSelectionStateContainer();
						iQSelectionLogicalOr_IQSC = sap.firefly.QFilterOr
								._create(this.getQueryModel(),
										iQSelectionContainer_IQSC);
						iQSelectionContainer_IQSC
								.setComplexSelection(iQSelectionLogicalOr_IQSC);
						rowsAxis_IQSCP = this.getQueryModel().getRowsAxis();
						for (i = 0; i < listOfIWorkstatusMemberList.size(); i++) {
							iQSelectionLogicalAnd_IQSC = sap.firefly.QFilterAnd
									._create(this.getQueryModel(),
											iQSelectionContainer_IQSC);
							iQSelectionLogicalOr_IQSC
									.add(iQSelectionLogicalAnd_IQSC);
							memberList = listOfIWorkstatusMemberList.get(i);
							for (j = 0; j < memberList.size(); j++) {
								iWorkstatusMember_IQSC = memberList.get(j);
								iQDimension_IQSC = iWorkstatusMember_IQSC
										.getIQDimension();
								if (iQDimension_IQSC.getSupportedAxesTypes()
										.contains(sap.firefly.AxisType.ROWS)) {
									rowsAxis_IQSCP.add(iQDimension_IQSC);
								}
								field_IQSC = iQDimension_IQSC.getKeyField();
								iQFieldListReadOnly_IQSC = iQDimension_IQSC
										.getFields();
								iXIteratorIQField_IQSC = iQFieldListReadOnly_IQSC
										.getIterator();
								while (iXIteratorIQField_IQSC.hasNext()) {
									iQField_IQSC = iXIteratorIQField_IQSC
											.next();
									iQFieldList_IQSC = iQDimension_IQSC
											.getResultSetFields();
									iQFieldList_IQSC.add(iQField_IQSC);
								}
								if (field_IQSC.isFilterable() === false) {
									continue;
								}
								if (this.isTechnicalDimension(iQDimension_IQSC)) {
									continue;
								}
								if (!iWorkstatusMember_IQSC.isFiltered()) {
									continue;
								}
								if (sap.firefly.ComparisonOperator.BETWEEN === iWorkstatusMember_IQSC
										.getComparisonOperator()) {
									iQSelectionPrimitiveOperation_GE_IQSC = this
											.getIQSelectionPrimitiveOperation(
													iQSelectionContainer_IQSC,
													iWorkstatusMember_IQSC
															.getFirstValue(),
													iWorkstatusMember_IQSC
															.getValueType(),
													sap.firefly.ComparisonOperator.GREATER_EQUAL,
													field_IQSC);
									iQSelectionLogicalAnd_IQSC
											.add(iQSelectionPrimitiveOperation_GE_IQSC);
									iQSelectionPrimitiveOperation_LE_IQSC = this
											.getIQSelectionPrimitiveOperation(
													iQSelectionContainer_IQSC,
													iWorkstatusMember_IQSC
															.getSecondValue(),
													iWorkstatusMember_IQSC
															.getValueType(),
													sap.firefly.ComparisonOperator.LESS_EQUAL,
													field_IQSC);
									iQSelectionLogicalAnd_IQSC
											.add(iQSelectionPrimitiveOperation_LE_IQSC);
								} else {
									iQSelectionPrimitiveOperation_IQSC = this
											.getIQSelectionPrimitiveOperation(
													iQSelectionContainer_IQSC,
													iWorkstatusMember_IQSC
															.getFirstValue(),
													iWorkstatusMember_IQSC
															.getValueType(),
													iWorkstatusMember_IQSC
															.getComparisonOperator(),
													field_IQSC);
									iQSelectionLogicalAnd_IQSC
											.add(iQSelectionPrimitiveOperation_IQSC);
								}
							}
						}
						return iQSelectionLogicalOr_IQSC;
					},
					getIQSelectionPrimitiveOperation : function(
							iQSelectionContainerBase, iXValue, xValueType,
							comparisonOperator, iQField) {
						var iQSelectionPrimitiveOperation = sap.firefly.QFilterOperation
								._create(this.getQueryModel(),
										iQSelectionContainerBase, null);
						var iQSelectionValue_IQSC;
						iQSelectionPrimitiveOperation
								.setComparisonOperator(comparisonOperator);
						iQSelectionPrimitiveOperation.setField(iQField);
						iQSelectionValue_IQSC = iQSelectionPrimitiveOperation
								.getLow();
						if (xValueType === sap.firefly.XValueType.STRING) {
							iQSelectionValue_IQSC.setStringValue((iXValue)
									.getStringValue());
						} else {
							if (xValueType === sap.firefly.XValueType.DOUBLE) {
								iQSelectionValue_IQSC.setDoubleValue((iXValue)
										.getDoubleValue());
							} else {
								if (xValueType === sap.firefly.XValueType.INTEGER) {
									iQSelectionValue_IQSC
											.setIntegerValue((iXValue)
													.getIntegerValue());
								} else {
									if (xValueType === sap.firefly.XValueType.BOOLEAN) {
										iQSelectionValue_IQSC
												.setBooleanValue((iXValue)
														.getBooleanValue());
									} else {
										if (xValueType === sap.firefly.XValueType.LONG) {
											iQSelectionValue_IQSC
													.setLongValue((iXValue)
															.getLongValue());
										} else {
											throw sap.firefly.XException
													.createIllegalStateException("Unsupported value type");
										}
									}
								}
							}
						}
						return iQSelectionPrimitiveOperation;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.WorkstatusResult",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(resultSet) {
							var iWorkstatusResult = new sap.firefly.WorkstatusResult();
							iWorkstatusResult.setup(resultSet);
							return iWorkstatusResult;
						}
					},
					m_result_set : null,
					setup : function(resultSet) {
						this.m_result_set = resultSet;
					},
					getResultSet : function() {
						return this.m_result_set;
					},
					getStatus : function() {
						var aIWorkstatusStatusStatus = sap.firefly.XList
								.create();
						var iRsAxisStatus;
						var iXIteratorStatus;
						var iRsAxisTupleStatus;
						var iXArrayStatus;
						var l;
						var iRsAxisTupleElementStatus;
						var dimensionStatus;
						var dimensionMemberStatus;
						var fieldStatus;
						var iQKeyFieldValueStatus;
						var iQTextFieldValueStatus;
						if (this.getResultSet() !== null) {
							iRsAxisStatus = this.getResultSet().getRowsAxis();
							iXIteratorStatus = iRsAxisStatus
									.getTuplesIterator();
							while (iXIteratorStatus.hasNext()) {
								iRsAxisTupleStatus = iXIteratorStatus.next();
								iXArrayStatus = iRsAxisTupleStatus
										.getElements();
								for (l = 0; l < iXArrayStatus.size(); l++) {
									iRsAxisTupleElementStatus = iXArrayStatus
											.get(l);
									dimensionStatus = iRsAxisTupleElementStatus
											.getDimension();
									if (!sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_STATUS,
													dimensionStatus.getName())) {
										continue;
									}
									dimensionMemberStatus = iRsAxisTupleElementStatus
											.getDimensionMember();
									fieldStatus = dimensionStatus
											.getTextField();
									iQKeyFieldValueStatus = dimensionMemberStatus
											.getKeyFieldValue();
									iQTextFieldValueStatus = null;
									if (fieldStatus !== null) {
										iQTextFieldValueStatus = dimensionMemberStatus
												.getFieldValue(fieldStatus);
									}
									if ((iQKeyFieldValueStatus !== null)
											&& (iQTextFieldValueStatus !== null)
											&& (!sap.firefly.XString.isEqual(
													"", iQKeyFieldValueStatus
															.getStringValue()))
											&& (!sap.firefly.XString.isEqual(
													"", iQTextFieldValueStatus
															.getStringValue()))) {
										aIWorkstatusStatusStatus
												.add(sap.firefly.WorkstatusStatus
														.createIWorkstatusStatus(
																iQKeyFieldValueStatus
																		.getStringValue(),
																iQTextFieldValueStatus
																		.getStringValue()));
										break;
									} else {
										if ((iQKeyFieldValueStatus !== null)
												&& (!sap.firefly.XString
														.isEqual(
																"",
																iQKeyFieldValueStatus
																		.getStringValue()))) {
											aIWorkstatusStatusStatus
													.add(sap.firefly.WorkstatusStatus
															.createIWorkstatusStatus(
																	iQKeyFieldValueStatus
																			.getStringValue(),
																	null));
											break;
										}
									}
								}
							}
						}
						return aIWorkstatusStatusStatus;
					},
					getStatusForMembers : function(aIWorkstatusMember) {
						var aIWorkstatusStatusStatusForMembers = sap.firefly.XList
								.create();
						var iRsAxisStatusForMembers;
						var iXIteratorStatusForMembers;
						var m_equalStatusForMembers;
						var iWorkstatusStatusForMembers;
						var iRsAxisTupleStatusForMembers;
						var iXArrayStatusForMembers;
						var m;
						var iWorkstatusMember;
						var n;
						var iRsAxisTupleElementStatus;
						var dimensionStatusForMembers;
						var dimensionMemberStatusForMembers;
						var iQKeyFieldValueStatusForMembers;
						var fieldStatusForMembers;
						var iQTextFieldValueStatusForMembers;
						if ((this.getResultSet() !== null)
								&& (aIWorkstatusMember !== null)) {
							iRsAxisStatusForMembers = this.getResultSet()
									.getRowsAxis();
							iXIteratorStatusForMembers = iRsAxisStatusForMembers
									.getTuplesIterator();
							while (iXIteratorStatusForMembers.hasNext()) {
								m_equalStatusForMembers = false;
								iWorkstatusStatusForMembers = null;
								iRsAxisTupleStatusForMembers = iXIteratorStatusForMembers
										.next();
								iXArrayStatusForMembers = iRsAxisTupleStatusForMembers
										.getElements();
								for (m = 0; m < aIWorkstatusMember.size(); m++) {
									m_equalStatusForMembers = false;
									iWorkstatusMember = aIWorkstatusMember
											.get(m);
									if (iWorkstatusMember.isFiltered() === false) {
										continue;
									}
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_INCLUDE_AVAILABLE_STATUS,
													iWorkstatusMember
															.getIQDimension()
															.getName())) {
										continue;
									}
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_CANCEL,
													iWorkstatusMember
															.getIQDimension()
															.getName())) {
										continue;
									}
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_EXPAND_TO_BASE,
													iWorkstatusMember
															.getIQDimension()
															.getName())) {
										continue;
									}
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_INCLUDE_CHILDREN,
													iWorkstatusMember
															.getIQDimension()
															.getName())) {
										continue;
									}
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_AVAILABLE_STATUS,
													iWorkstatusMember
															.getIQDimension()
															.getName())) {
										continue;
									}
									for (n = 0; n < iXArrayStatusForMembers
											.size(); n++) {
										iRsAxisTupleElementStatus = iXArrayStatusForMembers
												.get(n);
										dimensionStatusForMembers = iRsAxisTupleElementStatus
												.getDimension();
										if (!iWorkstatusMember
												.getIQDimension()
												.isEqualTo(
														dimensionStatusForMembers)) {
											continue;
										}
										dimensionMemberStatusForMembers = iRsAxisTupleElementStatus
												.getDimensionMember();
										iQKeyFieldValueStatusForMembers = dimensionMemberStatusForMembers
												.getKeyFieldValue();
										m_equalStatusForMembers = true;
										if (!sap.firefly.XString
												.isEqual(
														sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_STATUS,
														dimensionStatusForMembers
																.getName())) {
											if (!sap.firefly.XString.isEqual(
													iWorkstatusMember
															.getFirstValue()
															.toString(),
													iQKeyFieldValueStatusForMembers
															.getStringValue())) {
												m_equalStatusForMembers = false;
											}
											break;
										}
										fieldStatusForMembers = dimensionStatusForMembers
												.getTextField();
										iQTextFieldValueStatusForMembers = null;
										if (fieldStatusForMembers !== null) {
											iQTextFieldValueStatusForMembers = dimensionMemberStatusForMembers
													.getFieldValue(fieldStatusForMembers);
										}
										if ((iQKeyFieldValueStatusForMembers !== null)
												&& (iQTextFieldValueStatusForMembers !== null)
												&& (!sap.firefly.XString
														.isEqual(
																"",
																iQKeyFieldValueStatusForMembers
																		.getStringValue()))
												&& (!sap.firefly.XString
														.isEqual(
																"",
																iQTextFieldValueStatusForMembers
																		.getStringValue()))) {
											iWorkstatusStatusForMembers = sap.firefly.WorkstatusStatus
													.createIWorkstatusStatus(
															iQKeyFieldValueStatusForMembers
																	.getStringValue(),
															iQTextFieldValueStatusForMembers
																	.getStringValue());
											break;
										} else {
											if ((iQKeyFieldValueStatusForMembers !== null)
													&& (!sap.firefly.XString
															.isEqual(
																	"",
																	iQKeyFieldValueStatusForMembers
																			.getStringValue()))) {
												iWorkstatusStatusForMembers = sap.firefly.WorkstatusStatus
														.createIWorkstatusStatus(
																iQKeyFieldValueStatusForMembers
																		.getStringValue(),
																null);
												break;
											}
										}
									}
									if (m_equalStatusForMembers !== true) {
										break;
									}
								}
								if (m_equalStatusForMembers) {
									if (iWorkstatusStatusForMembers !== null) {
										aIWorkstatusStatusStatusForMembers
												.add(iWorkstatusStatusForMembers);
									}
								}
							}
						}
						return aIWorkstatusStatusStatusForMembers;
					},
					getAvailableStatus : function() {
						var aListaIWorkstatusStatusAvailableStatus = sap.firefly.XList
								.create();
						var aIWorkstatusStatusAvailableStatus = sap.firefly.XList
								.create();
						var iRsAxisAvailableStatus;
						var iXIteratorAvailableStatus;
						var iRsAxisTupleAvailableStatus;
						var iXArrayAvailableStatus;
						var o;
						var iRsAxisTupleElementAvailableStatus;
						var dimensionAvailableStatus;
						var dimensionMemberAvailableStatus;
						var fieldAvailableStatus;
						var iQKeyFieldValueAvailableStatus;
						var iQTextFieldValueAvailableStatus;
						var iXListOfKeyFieldValue;
						var iXListOfTextFieldValue;
						var j;
						var k;
						if (this.getResultSet() !== null) {
							iRsAxisAvailableStatus = this.getResultSet()
									.getRowsAxis();
							iXIteratorAvailableStatus = iRsAxisAvailableStatus
									.getTuplesIterator();
							while (iXIteratorAvailableStatus.hasNext()) {
								iRsAxisTupleAvailableStatus = iXIteratorAvailableStatus
										.next();
								iXArrayAvailableStatus = iRsAxisTupleAvailableStatus
										.getElements();
								for (o = 0; o < iXArrayAvailableStatus.size(); o++) {
									iRsAxisTupleElementAvailableStatus = iXArrayAvailableStatus
											.get(o);
									dimensionAvailableStatus = iRsAxisTupleElementAvailableStatus
											.getDimension();
									if (!sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_AVAILABLE_STATUS,
													dimensionAvailableStatus
															.getName())) {
										continue;
									}
									dimensionMemberAvailableStatus = iRsAxisTupleElementAvailableStatus
											.getDimensionMember();
									fieldAvailableStatus = dimensionAvailableStatus
											.getTextField();
									iQKeyFieldValueAvailableStatus = dimensionMemberAvailableStatus
											.getKeyFieldValue();
									iQTextFieldValueAvailableStatus = null;
									if (fieldAvailableStatus !== null) {
										iQTextFieldValueAvailableStatus = dimensionMemberAvailableStatus
												.getFieldValue(fieldAvailableStatus);
									}
									if ((iQKeyFieldValueAvailableStatus !== null)
											&& (iQTextFieldValueAvailableStatus !== null)) {
										iXListOfKeyFieldValue = null;
										if (!sap.firefly.XString.isEqual("",
												iQKeyFieldValueAvailableStatus
														.getStringValue())) {
											iXListOfKeyFieldValue = sap.firefly.XStringTokenizer
													.splitString(
															iQKeyFieldValueAvailableStatus
																	.getStringValue(),
															",");
										}
										iXListOfTextFieldValue = null;
										if (!sap.firefly.XString.isEqual("",
												iQTextFieldValueAvailableStatus
														.getStringValue())) {
											iXListOfTextFieldValue = sap.firefly.XStringTokenizer
													.splitString(
															iQTextFieldValueAvailableStatus
																	.getStringValue(),
															",");
										}
										aIWorkstatusStatusAvailableStatus = sap.firefly.XList
												.create();
										if ((iXListOfKeyFieldValue !== null)
												&& (iXListOfTextFieldValue !== null)
												&& (iXListOfKeyFieldValue
														.size() === iXListOfTextFieldValue
														.size())) {
											for (j = 0; j < iXListOfKeyFieldValue
													.size(); j++) {
												aIWorkstatusStatusAvailableStatus
														.add(sap.firefly.WorkstatusStatus
																.createIWorkstatusStatus(
																		iXListOfKeyFieldValue
																				.getValuesAsReadOnlyListOfString()
																				.get(
																						j),
																		iXListOfTextFieldValue
																				.getValuesAsReadOnlyListOfString()
																				.get(
																						j)));
											}
											aListaIWorkstatusStatusAvailableStatus
													.add(aIWorkstatusStatusAvailableStatus);
											break;
										} else {
											if (iXListOfKeyFieldValue !== null) {
												for (k = 0; k < iXListOfKeyFieldValue
														.size(); k++) {
													aIWorkstatusStatusAvailableStatus
															.add(sap.firefly.WorkstatusStatus
																	.createIWorkstatusStatus(
																			iXListOfKeyFieldValue
																					.getValuesAsReadOnlyListOfString()
																					.get(
																							k),
																			null));
												}
												aListaIWorkstatusStatusAvailableStatus
														.add(aIWorkstatusStatusAvailableStatus);
												break;
											}
										}
									}
								}
							}
						}
						if (aListaIWorkstatusStatusAvailableStatus.isEmpty()) {
							aListaIWorkstatusStatusAvailableStatus
									.add(aIWorkstatusStatusAvailableStatus);
						}
						return aListaIWorkstatusStatusAvailableStatus;
					},
					getAvailableStatusForMembers : function(aIWorkstatusMember) {
						var aListaIWorkstatusStatusAvailableStatusForMembers = sap.firefly.XList
								.create();
						var aIWorkstatusStatusAvailableStatusForMembers = sap.firefly.XList
								.create();
						var iRsAxisAvailableStatusForMembers;
						var iXIteratorAvailableStatusForMembers;
						var m_equalStatusAvailableForMembers;
						var iRsAxisTupleAvailableStatusForMembers;
						var iXArrayAvailableStatusForMembers;
						var p;
						var iWorkstatusMember;
						var q;
						var iRsAxisTupleElementAvailableStatusForMembers;
						var dimensionAvailableStatusForMembers;
						var dimensionMemberAvailableStatusForMembers;
						var iQKeyFieldValueAvailableStatusForMembers;
						var iQTextFieldValueAvailableStatusForMembers;
						var fieldAvailableStatusForMembers;
						var iXListOfKeyFieldValueForMembers;
						var iXListOfTextFieldValueForMembers;
						var j;
						var k;
						if ((this.getResultSet() !== null)
								&& (aIWorkstatusMember !== null)) {
							iRsAxisAvailableStatusForMembers = this
									.getResultSet().getRowsAxis();
							iXIteratorAvailableStatusForMembers = iRsAxisAvailableStatusForMembers
									.getTuplesIterator();
							while (iXIteratorAvailableStatusForMembers
									.hasNext()) {
								m_equalStatusAvailableForMembers = false;
								aIWorkstatusStatusAvailableStatusForMembers = sap.firefly.XList
										.create();
								iRsAxisTupleAvailableStatusForMembers = iXIteratorAvailableStatusForMembers
										.next();
								iXArrayAvailableStatusForMembers = iRsAxisTupleAvailableStatusForMembers
										.getElements();
								for (p = 0; p < aIWorkstatusMember.size(); p++) {
									m_equalStatusAvailableForMembers = false;
									iWorkstatusMember = aIWorkstatusMember
											.get(p);
									if ((iWorkstatusMember.isFiltered() === false)
											&& (!sap.firefly.XString
													.isEqual(
															sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_AVAILABLE_STATUS,
															iWorkstatusMember
																	.getIQDimension()
																	.getName()))) {
										continue;
									}
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_INCLUDE_AVAILABLE_STATUS,
													iWorkstatusMember
															.getIQDimension()
															.getName())) {
										continue;
									}
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_CANCEL,
													iWorkstatusMember
															.getIQDimension()
															.getName())) {
										continue;
									}
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_EXPAND_TO_BASE,
													iWorkstatusMember
															.getIQDimension()
															.getName())) {
										continue;
									}
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_INCLUDE_CHILDREN,
													iWorkstatusMember
															.getIQDimension()
															.getName())) {
										continue;
									}
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_STATUS,
													iWorkstatusMember
															.getIQDimension()
															.getName())) {
										continue;
									}
									for (q = 0; q < iXArrayAvailableStatusForMembers
											.size(); q++) {
										iRsAxisTupleElementAvailableStatusForMembers = iXArrayAvailableStatusForMembers
												.get(q);
										dimensionAvailableStatusForMembers = iRsAxisTupleElementAvailableStatusForMembers
												.getDimension();
										if (!iWorkstatusMember
												.getIQDimension()
												.isEqualTo(
														dimensionAvailableStatusForMembers)) {
											continue;
										}
										dimensionMemberAvailableStatusForMembers = iRsAxisTupleElementAvailableStatusForMembers
												.getDimensionMember();
										iQKeyFieldValueAvailableStatusForMembers = dimensionMemberAvailableStatusForMembers
												.getKeyFieldValue();
										m_equalStatusAvailableForMembers = true;
										if (!sap.firefly.XString
												.isEqual(
														sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_AVAILABLE_STATUS,
														dimensionAvailableStatusForMembers
																.getName())) {
											if (!sap.firefly.XString.isEqual(
													iWorkstatusMember
															.getFirstValue()
															.toString(),
													iQKeyFieldValueAvailableStatusForMembers
															.getStringValue())) {
												m_equalStatusAvailableForMembers = false;
											}
											break;
										}
										iQTextFieldValueAvailableStatusForMembers = null;
										fieldAvailableStatusForMembers = dimensionAvailableStatusForMembers
												.getTextField();
										if (fieldAvailableStatusForMembers !== null) {
											iQTextFieldValueAvailableStatusForMembers = dimensionMemberAvailableStatusForMembers
													.getFieldValue(fieldAvailableStatusForMembers);
										}
										if ((iQKeyFieldValueAvailableStatusForMembers !== null)
												&& (iQTextFieldValueAvailableStatusForMembers !== null)) {
											iXListOfKeyFieldValueForMembers = null;
											if (!sap.firefly.XString.isEqual(
													"",
													iQKeyFieldValueAvailableStatusForMembers
															.getStringValue())) {
												iXListOfKeyFieldValueForMembers = sap.firefly.XStringTokenizer
														.splitString(
																iQKeyFieldValueAvailableStatusForMembers
																		.getStringValue(),
																",");
											}
											iXListOfTextFieldValueForMembers = null;
											if (!sap.firefly.XString.isEqual(
													"",
													iQTextFieldValueAvailableStatusForMembers
															.getStringValue())) {
												iXListOfTextFieldValueForMembers = sap.firefly.XStringTokenizer
														.splitString(
																iQTextFieldValueAvailableStatusForMembers
																		.getStringValue(),
																",");
											}
											if ((iXListOfKeyFieldValueForMembers !== null)
													&& (iXListOfTextFieldValueForMembers !== null)
													&& (iXListOfKeyFieldValueForMembers
															.size() === iXListOfTextFieldValueForMembers
															.size())) {
												for (j = 0; j < iXListOfKeyFieldValueForMembers
														.size(); j++) {
													aIWorkstatusStatusAvailableStatusForMembers
															.add(sap.firefly.WorkstatusStatus
																	.createIWorkstatusStatus(
																			iXListOfKeyFieldValueForMembers
																					.getValuesAsReadOnlyListOfString()
																					.get(
																							j),
																			iXListOfTextFieldValueForMembers
																					.getValuesAsReadOnlyListOfString()
																					.get(
																							j)));
												}
											} else {
												if (iXListOfKeyFieldValueForMembers !== null) {
													for (k = 0; k < iXListOfKeyFieldValueForMembers
															.size(); k++) {
														aIWorkstatusStatusAvailableStatusForMembers
																.add(sap.firefly.WorkstatusStatus
																		.createIWorkstatusStatus(
																				iXListOfKeyFieldValueForMembers
																						.getValuesAsReadOnlyListOfString()
																						.get(
																								k),
																				null));
													}
												}
											}
										}
									}
									if (m_equalStatusAvailableForMembers !== true) {
										break;
									}
								}
								if (m_equalStatusAvailableForMembers) {
									if (!aIWorkstatusStatusAvailableStatusForMembers
											.isEmpty()) {
										aListaIWorkstatusStatusAvailableStatusForMembers
												.add(aIWorkstatusStatusAvailableStatusForMembers);
									}
								}
							}
						}
						if (aListaIWorkstatusStatusAvailableStatusForMembers
								.isEmpty()) {
							aListaIWorkstatusStatusAvailableStatusForMembers
									.add(aIWorkstatusStatusAvailableStatusForMembers);
						}
						return aListaIWorkstatusStatusAvailableStatusForMembers;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectDimensionManager",
				sap.firefly.InfoObjectBaseManager,
				{
					$statics : {
						FIELD_NAME_VISIBILITY_KEY : "_0VIS_KEY",
						createIInfoObjectDimensionManager : function(
								application, config) {
							var iInfoObjectDimensionManager = new sap.firefly.InfoObjectDimensionManager();
							iInfoObjectDimensionManager.setup(application,
									config);
							return iInfoObjectDimensionManager;
						}
					},
					m_hierarchy_manager_factory : null,
					m_hierarchy_value_help : null,
					m_hierarchy_manager : null,
					m_dimension_member : null,
					m_dimension_member_add : null,
					m_dimension_member_update : null,
					m_dimension_member_delete : null,
					m_application : null,
					m_config : null,
					setup : function(application, config) {
						sap.firefly.InfoObjectDimensionManager.$superclass.setupBase
								.call(this);
						this.m_config = config;
						this.m_application = application;
						this.m_dimension_member = sap.firefly.XList.create();
						this.m_dimension_member_add = sap.firefly.XList
								.create();
						this.m_dimension_member_update = sap.firefly.XList
								.create();
						this.m_dimension_member_delete = sap.firefly.XList
								.create();
					},
					getIQHierarchyValueHelp : function() {
						this.m_hierarchy_value_help = sap.firefly.InfoObjectHierarchyValueHelp
								.create(
										this.m_application,
										this.m_config,
										this.getDimension(),
										sap.firefly.InAConstants.VA_OBJVERS_MOST_RECENT,
										null, sap.firefly.SyncType.BLOCKING);
						return this.m_hierarchy_value_help;
					},
					getHierarchyManagerFactory : function() {
						if (this.m_hierarchy_manager_factory === null) {
							this.m_hierarchy_manager_factory = sap.firefly.InfoObjectHierarchyManagerFactory
									.createIInfoObjectHierarchyManagerFactory(
											this, this.m_application,
											this.m_config,
											this.m_hierarchy_value_help);
						}
						return this.m_hierarchy_manager_factory;
					},
					setHierarchyManager : function(iInfoObjectHierarchyManager) {
						this.m_hierarchy_manager = iInfoObjectHierarchyManager;
					},
					getHierarchyManager : function() {
						return this.m_hierarchy_manager;
					},
					getActiveHierarchyManager : function() {
						return this.m_hierarchy_manager;
					},
					getDimension : function() {
						return this.getBaseDimension();
					},
					getFieldByName : function(name) {
						return this.getFieldBaseByName(name);
					},
					createDimensionMember : function() {
						var iQDimensionMemberBase = sap.firefly.InfoObjectQDimensionMember
								.createQDimensionMember(this.m_dimension_base);
						var iXIteratorFieldName = this.m_requested_ordered_fields
								.getIterator();
						var fieldName;
						var iQFieldBase;
						var booleanValue;
						var intValue;
						var doubleValue;
						var longValue;
						var dateValue;
						var timeValue;
						while (iXIteratorFieldName.hasNext()) {
							fieldName = iXIteratorFieldName.next();
							iQFieldBase = this.getFieldBaseByName(fieldName);
							if ((sap.firefly.XValueType.STRING === iQFieldBase
									.getValueType())
									|| (sap.firefly.XValueType.LANGUAGE === iQFieldBase
											.getValueType())
									|| (sap.firefly.XValueType.NUMC === iQFieldBase
											.getValueType())) {
								iQDimensionMemberBase
										.createAndAddFieldValueWithString(
												iQFieldBase, iQFieldBase
														.getInitialValue());
							} else {
								if (sap.firefly.XValueType.BOOLEAN === iQFieldBase
										.getValueType()) {
									booleanValue = sap.firefly.XBoolean
											.convertStringToBoolean(iQFieldBase
													.getInitialValue());
									iQDimensionMemberBase
											.createAndAddFieldValueWithBoolean(
													iQFieldBase, booleanValue);
								} else {
									if (sap.firefly.XValueType.INTEGER === iQFieldBase
											.getValueType()) {
										intValue = sap.firefly.XInteger
												.convertStringToInteger(iQFieldBase
														.getInitialValue());
										iQDimensionMemberBase
												.createAndAddFieldValueWithInteger(
														iQFieldBase, intValue);
									} else {
										if (sap.firefly.XValueType.DOUBLE === iQFieldBase
												.getValueType()) {
											doubleValue = sap.firefly.XDouble
													.convertStringToDouble(iQFieldBase
															.getInitialValue());
											iQDimensionMemberBase
													.createAndAddFieldValueWithDouble(
															iQFieldBase,
															doubleValue);
										} else {
											if (sap.firefly.XValueType.LONG === iQFieldBase
													.getValueType()) {
												longValue = sap.firefly.XLong
														.convertStringToLong(iQFieldBase
																.getInitialValue());
												iQDimensionMemberBase
														.createAndAddFieldValueWithLong(
																iQFieldBase,
																longValue);
											} else {
												if (sap.firefly.XValueType.DATE === iQFieldBase
														.getValueType()) {
													dateValue = sap.firefly.XDate
															.createDateFromSAPFormat(iQFieldBase
																	.getInitialValue());
													iQDimensionMemberBase
															.createAndAddFieldValueWithDate(
																	iQFieldBase,
																	dateValue);
												} else {
													if (sap.firefly.XValueType.TIME === iQFieldBase
															.getValueType()) {
														timeValue = sap.firefly.XTime
																.createTimeFromSAPFormat(iQFieldBase
																		.getInitialValue());
														iQDimensionMemberBase
																.createAndAddFieldValueWithTime(
																		iQFieldBase,
																		timeValue);
													} else {
														throw sap.firefly.XException
																.createIllegalStateException(sap.firefly.XString
																		.concatenate2(
																				"Value type not supported: ",
																				iQFieldBase
																						.getValueType()
																						.getName()));
													}
												}
											}
										}
									}
								}
							}
						}
						return iQDimensionMemberBase;
					},
					deleteDimensionMember : function(iQDimensionMember) {
						var i;
						if (iQDimensionMember !== null) {
							if (this.m_dimension_member_delete
									.contains(iQDimensionMember)) {
								i = this.m_dimension_member_delete
										.getIndex(iQDimensionMember);
								this.m_dimension_member_delete.set(i,
										iQDimensionMember);
							} else {
								this.m_dimension_member_delete
										.add(iQDimensionMember);
							}
						}
					},
					getDimensionMembersToDelete : function() {
						return this.m_dimension_member_delete;
					},
					addDimensionMemberValue : function(iQDimensionMember,
							iQField, iXValue) {
						var iQFieldValue;
						var iQFieldValueBase;
						var i;
						if ((iQDimensionMember === null) || (iQField === null)
								|| (iXValue === null)) {
							return;
						}
						if (iQField.getValueType() !== iXValue.getValueType()) {
							return;
						}
						iQFieldValue = iQDimensionMember.getFieldValue(iQField);
						iQFieldValueBase = null;
						if (iQFieldValue === null) {
							return;
						}
						iQFieldValueBase = (iQFieldValue);
						iQFieldValueBase.setValue(iXValue);
						if (this.m_dimension_member_add
								.contains(iQDimensionMember)) {
							i = this.m_dimension_member_add
									.getIndex(iQDimensionMember);
							this.m_dimension_member_add.set(i,
									iQDimensionMember);
						} else {
							this.m_dimension_member_add.add(iQDimensionMember);
						}
					},
					getDimensionMembersToAdd : function() {
						return this.m_dimension_member_add;
					},
					updateDimensionMemberValue : function(iQDimensionMember,
							iQField, iXValue) {
						var iQFieldValue;
						var iQFieldValueBase;
						var i_update;
						var i_add;
						if ((iQDimensionMember === null) || (iQField === null)
								|| (iXValue === null)) {
							return;
						}
						if (iQField.getValueType() !== iXValue.getValueType()) {
							return;
						}
						iQFieldValue = iQDimensionMember.getFieldValue(iQField);
						if (iQFieldValue === null) {
							return;
						}
						iQFieldValueBase = (iQFieldValue);
						iQFieldValueBase.setValue(iXValue);
						if (this.m_dimension_member_update
								.contains(iQDimensionMember)) {
							i_update = this.m_dimension_member_update
									.getIndex(iQDimensionMember);
							this.m_dimension_member_update.set(i_update,
									iQDimensionMember);
						} else {
							if (this.m_dimension_member_add
									.contains(iQDimensionMember)) {
								i_add = this.m_dimension_member_add
										.getIndex(iQDimensionMember);
								this.m_dimension_member_add.set(i_add,
										iQDimensionMember);
							} else {
								this.m_dimension_member_update
										.add(iQDimensionMember);
							}
						}
					},
					getDimensionMembersToUpdate : function() {
						return this.m_dimension_member_update;
					},
					addAuthorization : function(authorization) {
						if (authorization !== null) {
							this.m_authorizations.add(authorization);
						}
					},
					getAuthorizations : function() {
						return this.m_authorizations;
					},
					addDimensionMember : function(iQDimensionMember) {
						if (iQDimensionMember !== null) {
							this.m_dimension_member.add(iQDimensionMember);
						}
					},
					revertAddedDimensionMember : function(iQDimensionMember) {
						if (iQDimensionMember === null) {
							return;
						}
						if (this.m_dimension_member_add
								.contains(iQDimensionMember)) {
							this.m_dimension_member_add
									.removeElement(iQDimensionMember);
						}
					},
					getDimensionMember : function() {
						return this.m_dimension_member;
					},
					getDimensionMemberVisibilityType : function(
							iQDimensionMember) {
						var iQField;
						var iQFieldValue;
						if (iQDimensionMember === null) {
							return null;
						}
						iQField = this
								.getFieldBaseByName(sap.firefly.InfoObjectDimensionManager.FIELD_NAME_VISIBILITY_KEY);
						if (iQField === null) {
							return null;
						}
						if (sap.firefly.XValueType.STRING !== iQField
								.getValueType()) {
							return null;
						}
						iQFieldValue = iQDimensionMember.getFieldValue(iQField);
						if (iQFieldValue === null) {
							return null;
						}
						return sap.firefly.QInAConverter
								.lookupVisibilityType(iQFieldValue
										.getStringValue());
					},
					clear : function(infoObjectClearOperation) {
						if (sap.firefly.InfoObjectClearOperation._NONE === infoObjectClearOperation) {
							return;
						}
						if ((sap.firefly.InfoObjectClearOperation._CLEAR_ALL === infoObjectClearOperation)
								|| (sap.firefly.InfoObjectClearOperation._CLEAR_OPERATION === infoObjectClearOperation)) {
							if (sap.firefly.InfoObjectClearOperation._CLEAR_OPERATION !== infoObjectClearOperation) {
								this.m_dimension_member = sap.firefly.XList
										.create();
							}
							this.m_dimension_member_add = sap.firefly.XList
									.create();
							this.m_dimension_member_update = sap.firefly.XList
									.create();
							this.m_dimension_member_delete = sap.firefly.XList
									.create();
						}
					},
					setTupleCount : function(tupleCount) {
						this.m_tuple_count = tupleCount;
					},
					getTupleCount : function() {
						return this.m_tuple_count;
					},
					setMaxTupleCount : function(maxTupleCount) {
						this.m_max_tuple_count = maxTupleCount;
					},
					getMaxTupleCount : function() {
						return this.m_max_tuple_count;
					},
					serialize : function(iPrStructure) {
						var iPrStructureDataEntries = sap.firefly.PrStructure
								.create();
						var prListValues;
						if (iPrStructure === null) {
							return iPrStructure;
						}
						this.serialzeDimensionContext(iPrStructureDataEntries);
						prListValues = sap.firefly.PrList.create();
						this.m_line_id = 0;
						this.serialzeValue(prListValues,
								this.m_dimension_member_add,
								sap.firefly.InAConstants.VA_ACTION_NEW_LINE);
						this.serialzeValue(prListValues,
								this.m_dimension_member_update,
								sap.firefly.InAConstants.VA_ACTION_NEW_VALUES);
						this.serialzeValue(prListValues,
								this.m_dimension_member_delete,
								sap.firefly.InAConstants.VA_ACTION_DELETE_LINE);
						iPrStructureDataEntries.setElementByName(
								sap.firefly.InAConstants.QY_VALUES,
								prListValues);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_ENTRIES,
								iPrStructureDataEntries);
						return iPrStructure;
					},
					serialzeDimensionContext : function(iPrStructure) {
						var prListDimensionContext = sap.firefly.PrList
								.create();
						var aIQDimensionMemberDimensionContext;
						var xIteratorDimensionMember;
						var iQDimensionMember;
						var aIQFieldValue;
						var iXIteratorFieldName;
						var fieldName;
						if (iPrStructure === null) {
							return prListDimensionContext;
						}
						aIQDimensionMemberDimensionContext = this.m_dimension_member;
						if ((aIQDimensionMemberDimensionContext === null)
								|| (aIQDimensionMemberDimensionContext
										.isEmpty())) {
							aIQDimensionMemberDimensionContext = sap.firefly.XList
									.create();
							aIQDimensionMemberDimensionContext.add(this
									.createDimensionMember());
						}
						xIteratorDimensionMember = aIQDimensionMemberDimensionContext
								.getIterator();
						while (xIteratorDimensionMember.hasNext()) {
							iQDimensionMember = xIteratorDimensionMember.next();
							aIQFieldValue = iQDimensionMember
									.getAllFieldValues();
							iXIteratorFieldName = aIQFieldValue
									.getKeysAsIteratorOfString();
							while (iXIteratorFieldName.hasNext()) {
								fieldName = iXIteratorFieldName.next();
								prListDimensionContext.addString(fieldName);
							}
							break;
						}
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DIMENSION_CONTEXT,
								prListDimensionContext);
						return prListDimensionContext;
					},
					serialzeValue : function(iPrList, aIQDimensionMember,
							action) {
						var xIteratorDimensionMember;
						var iQDimensionMember;
						var iPrStructureValue;
						if ((iPrList === null) || (aIQDimensionMember === null)) {
							return iPrList;
						}
						if (!sap.firefly.XString.isEqual(action,
								sap.firefly.InAConstants.VA_ACTION_NEW_LINE)
								&& !sap.firefly.XString
										.isEqual(
												action,
												sap.firefly.InAConstants.VA_ACTION_NEW_VALUES)
								&& !sap.firefly.XString
										.isEqual(
												action,
												sap.firefly.InAConstants.VA_ACTION_DELETE_LINE)) {
							return iPrList;
						}
						xIteratorDimensionMember = aIQDimensionMember
								.getIterator();
						while (xIteratorDimensionMember.hasNext()) {
							iQDimensionMember = xIteratorDimensionMember.next();
							iPrStructureValue = sap.firefly.PrStructure
									.create();
							iPrStructureValue.setStringByName(
									sap.firefly.InAConstants.QY_ACTION, action);
							iPrStructureValue.setIntegerByName(
									sap.firefly.InAConstants.QY_LINE_ID,
									this.m_line_id);
							this.serialzeKeys(iPrStructureValue,
									iQDimensionMember);
							iPrList.add(iPrStructureValue);
							this.m_line_id = this.m_line_id + 1;
						}
						return iPrList;
					},
					serialzeKeys : function(iPrStructure, iQDimensionMember) {
						var prListKeys = sap.firefly.PrList.create();
						var aIQFieldValue;
						var iXIteratorFieldValue;
						var xIteratorFieldValue;
						var iQFieldValue;
						if (iPrStructure === null) {
							return prListKeys;
						}
						aIQFieldValue = iQDimensionMember.getAllFieldValues();
						iXIteratorFieldValue = aIQFieldValue
								.getValuesAsReadOnlyList();
						xIteratorFieldValue = iXIteratorFieldValue
								.getIterator();
						while (xIteratorFieldValue.hasNext()) {
							iQFieldValue = xIteratorFieldValue.next();
							if ((sap.firefly.XValueType.STRING === iQFieldValue
									.getValueType())
									|| (sap.firefly.XValueType.LANGUAGE === iQFieldValue
											.getValueType())
									|| (sap.firefly.XValueType.NUMC === iQFieldValue
											.getValueType())) {
								prListKeys.addString(iQFieldValue
										.getStringValue());
							} else {
								if (sap.firefly.XValueType.BOOLEAN === iQFieldValue
										.getValueType()) {
									prListKeys
											.addString(sap.firefly.XBoolean
													.convertBooleanToString(iQFieldValue
															.getBooleanValue()));
								} else {
									if (sap.firefly.XValueType.INTEGER === iQFieldValue
											.getValueType()) {
										prListKeys
												.addString(sap.firefly.XInteger
														.convertIntegerToString(iQFieldValue
																.getIntegerValue()));
									} else {
										if (sap.firefly.XValueType.DOUBLE === iQFieldValue
												.getValueType()) {
											prListKeys
													.addString(sap.firefly.XDouble
															.convertDoubleToString(iQFieldValue
																	.getDoubleValue()));
										} else {
											if (sap.firefly.XValueType.LONG === iQFieldValue
													.getValueType()) {
												prListKeys
														.addString(sap.firefly.XLong
																.convertLongToString(iQFieldValue
																		.getLongValue()));
											} else {
												if (sap.firefly.XValueType.DATE === iQFieldValue
														.getValueType()) {
													prListKeys
															.addString(iQFieldValue
																	.getDateValue()
																	.toSAPFormat());
												} else {
													if (sap.firefly.XValueType.TIME === iQFieldValue
															.getValueType()) {
														prListKeys
																.addString(iQFieldValue
																		.getTimeValue()
																		.toSAPFormat());
													} else {
														throw sap.firefly.XException
																.createIllegalStateException(sap.firefly.XString
																		.concatenate2(
																				"Value type not supported: ",
																				iQFieldValue
																						.getValueType()
																						.getName()));
													}
												}
											}
										}
									}
								}
							}
						}
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_KEYS, prListKeys);
						return prListKeys;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectHierarchyIntervalManager",
				sap.firefly.InfoObjectBaseManager,
				{
					$statics : {
						CMP_SEPARATOR_INFO_OBJECT : ":",
						CMP_SEPARATOR_INFO_OBJECT_VALUE : ".",
						CMP_SEPARATOR_INFO_OBJECT_TO_VALUE : "_",
						CMP_SEPARATOR_VALUE : "/",
						FIELD_NAME_HIERARCHY_ID : "HIEID",
						FIELD_NAME_OBJECT_VERSION : "OBJVERS",
						FIELD_NAME_NODE_ID : "NODEID",
						FIELD_NAME_LEAFTO_NAME : "LEAFTO",
						FIELD_NAME_LEAFFROM_NAME : "LEAFFROM",
						FIELD_NAME_INFO_OBJECT_NAME : "IOBJNM",
						FIELD_NAME_TXT_SH_FROM : "TXTSHFROM",
						FIELD_NAME_TXT_MD_FROM : "TXTMDFROM",
						FIELD_NAME_TXT_LG_FROM : "TXTLGFROM",
						FIELD_NAME_TXT_SH_TO : "TXTSHTO",
						FIELD_NAME_TXT_MD_TO : "TXTMDTO",
						FIELD_NAME_TXT_LG_TO : "TXTLGTO",
						FIELD_NAME_DATE_FROM : "DATEFROM",
						FIELD_NAME_DATE_TO : "DATETO",
						FIELD_NAME_CMP_PATTERN_FROM : "CMPPATTERNFROM",
						FIELD_NAME_CMP_PATTERN_TO : "CMPPATTERNTO",
						createInfoObjectHierarchyIntervalManager : function(
								iInfoObjectHierarchyManager, iQDimensionBase) {
							var iInfoObjectHierarchyIntervalManager = new sap.firefly.InfoObjectHierarchyIntervalManager();
							iInfoObjectHierarchyIntervalManager.setup(
									iInfoObjectHierarchyManager,
									iQDimensionBase);
							return iInfoObjectHierarchyIntervalManager;
						}
					},
					m_hierarchy_manager : null,
					m_hierarchy_interval_check : null,
					m_hierarchy_interval_member_add_as_child : null,
					m_hierarchy_interval_member_add_as_next : null,
					m_hierarchy_interval_member_add_as_child_link_node : null,
					m_hierarchy_interval_member_add_as_next_link_node : null,
					m_hierarchy_interval_member_update : null,
					m_hierarchy_interval_member : null,
					m_hierarchy_interval_member_map : null,
					setup : function(iInfoObjectHierarchyManager,
							iQDimensionBase) {
						sap.firefly.InfoObjectHierarchyIntervalManager.$superclass.setupBase
								.call(this);
						this.m_hierarchy_manager = iInfoObjectHierarchyManager;
						this.m_dimension_base = iQDimensionBase;
						this.m_hierarchy_interval_member = sap.firefly.XList
								.create();
						this.m_hierarchy_interval_member_add_as_child = sap.firefly.XList
								.create();
						this.m_hierarchy_interval_member_add_as_next = sap.firefly.XList
								.create();
						this.m_hierarchy_interval_member_add_as_child_link_node = sap.firefly.XList
								.create();
						this.m_hierarchy_interval_member_add_as_next_link_node = sap.firefly.XList
								.create();
						this.m_hierarchy_interval_member_update = sap.firefly.XList
								.create();
						this.m_hierarchy_interval_check = sap.firefly.XList
								.create();
						this.m_hierarchy_interval_member_map = sap.firefly.XHashMapByString
								.create();
					},
					addHierarchyIntervalListMember : function(
							iInfoObjectHierarchyIntervalMember) {
						if (iInfoObjectHierarchyIntervalMember === null) {
							return;
						}
						this.m_hierarchy_interval_member
								.add(iInfoObjectHierarchyIntervalMember);
					},
					isCompounded : function() {
						var iQFieldIobjnm = this
								.getFieldByName(sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_INFO_OBJECT_NAME);
						if (iQFieldIobjnm === null) {
							return false;
						}
						return !iQFieldIobjnm.getDependencyFields().isEmpty();
					},
					getCompoundedFieldNames : function() {
						var iQFieldIobjnm = this
								.getFieldByName(sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_INFO_OBJECT_NAME);
						if (iQFieldIobjnm === null) {
							return sap.firefly.XListOfString.create();
						}
						return iQFieldIobjnm.getDependencyFields();
					},
					getHierarchyIntervalMember : function() {
						var aIInfoObjectHierarchyIntervalMember = sap.firefly.XList
								.create();
						var itInfoObjectHierarchyIntervalMember = this.m_hierarchy_interval_member
								.getIterator();
						while (itInfoObjectHierarchyIntervalMember.hasNext()) {
							aIInfoObjectHierarchyIntervalMember
									.add(itInfoObjectHierarchyIntervalMember
											.next());
						}
						return aIInfoObjectHierarchyIntervalMember;
					},
					getHierarchyIntervalMemberByHierarchyMember : function(
							iInfoObjectHierarchyMember) {
						var xIteratorHierarchyIntervalMember;
						var iInfoObjectHierarchyIntervalMember;
						if (iInfoObjectHierarchyMember === null) {
							return null;
						}
						if (this.m_hierarchy_interval_member_map.isEmpty()) {
							xIteratorHierarchyIntervalMember = this.m_hierarchy_interval_member
									.getIterator();
							while (xIteratorHierarchyIntervalMember.hasNext()) {
								iInfoObjectHierarchyIntervalMember = xIteratorHierarchyIntervalMember
										.next();
								this.m_hierarchy_interval_member_map.put(
										(iInfoObjectHierarchyIntervalMember)
												.getNodeId(),
										iInfoObjectHierarchyIntervalMember);
							}
						}
						return this.m_hierarchy_interval_member_map
								.getByKey((iInfoObjectHierarchyMember)
										.getNodeId());
					},
					createHierarchyIntervalMember : function() {
						var infoObjectHierarchyIntervalMember = sap.firefly.InfoObjectHierarchyIntervalMember
								.createIInfoObjectHierarchyIntervalMember(this.m_dimension_base);
						var iXIteratorFieldName = this.m_requested_ordered_fields
								.getIterator();
						var fieldName;
						var iQFieldBase;
						var booleanValue;
						var intValue;
						var doubleValue;
						var longValue;
						var dateValue;
						var timeValue;
						while (iXIteratorFieldName.hasNext()) {
							fieldName = iXIteratorFieldName.next();
							iQFieldBase = this.getFieldBaseByName(fieldName);
							if ((sap.firefly.XValueType.STRING === iQFieldBase
									.getValueType())
									|| (sap.firefly.XValueType.LANGUAGE === iQFieldBase
											.getValueType())
									|| (sap.firefly.XValueType.NUMC === iQFieldBase
											.getValueType())) {
								infoObjectHierarchyIntervalMember
										.createAndAddFieldValueWithString(
												iQFieldBase, iQFieldBase
														.getInitialValue());
							} else {
								if (sap.firefly.XValueType.BOOLEAN === iQFieldBase
										.getValueType()) {
									booleanValue = sap.firefly.XBoolean
											.convertStringToBoolean(iQFieldBase
													.getInitialValue());
									infoObjectHierarchyIntervalMember
											.createAndAddFieldValueWithBoolean(
													iQFieldBase, booleanValue);
								} else {
									if (sap.firefly.XValueType.INTEGER === iQFieldBase
											.getValueType()) {
										intValue = sap.firefly.XInteger
												.convertStringToInteger(iQFieldBase
														.getInitialValue());
										infoObjectHierarchyIntervalMember
												.createAndAddFieldValueWithInteger(
														iQFieldBase, intValue);
									} else {
										if (sap.firefly.XValueType.DOUBLE === iQFieldBase
												.getValueType()) {
											doubleValue = sap.firefly.XDouble
													.convertStringToDouble(iQFieldBase
															.getInitialValue());
											infoObjectHierarchyIntervalMember
													.createAndAddFieldValueWithDouble(
															iQFieldBase,
															doubleValue);
										} else {
											if (sap.firefly.XValueType.LONG === iQFieldBase
													.getValueType()) {
												longValue = sap.firefly.XLong
														.convertStringToLong(iQFieldBase
																.getInitialValue());
												infoObjectHierarchyIntervalMember
														.createAndAddFieldValueWithLong(
																iQFieldBase,
																longValue);
											} else {
												if (sap.firefly.XValueType.DATE === iQFieldBase
														.getValueType()) {
													dateValue = sap.firefly.XDate
															.createDateFromSAPFormat(iQFieldBase
																	.getInitialValue());
													infoObjectHierarchyIntervalMember
															.createAndAddFieldValueWithDate(
																	iQFieldBase,
																	dateValue);
												} else {
													if (sap.firefly.XValueType.TIME === iQFieldBase
															.getValueType()) {
														timeValue = sap.firefly.XTime
																.createTimeFromSAPFormat(iQFieldBase
																		.getInitialValue());
														infoObjectHierarchyIntervalMember
																.createAndAddFieldValueWithTime(
																		iQFieldBase,
																		timeValue);
													} else {
														throw sap.firefly.XException
																.createIllegalStateException(sap.firefly.XString
																		.concatenate2(
																				"Value type not supported: ",
																				iQFieldBase
																						.getValueType()
																						.getName()));
													}
												}
											}
										}
									}
								}
							}
						}
						return infoObjectHierarchyIntervalMember;
					},
					addHierarchyIntervalMember : function(
							iInfoObjectHierarchyIntervalMemberSource,
							iInfoObjectHierarchyMemberTarget,
							hierarchyOperation) {
						var iInfoObjectHierarchyIntervalMemberAdd;
						if (iInfoObjectHierarchyIntervalMemberSource === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Hierarchy source member is not set");
						}
						if (iInfoObjectHierarchyMemberTarget === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Hierarchy target member is not set");
						}
						if (hierarchyOperation === null) {
							throw sap.firefly.XException
									.createUnsupportedOperationException();
						}
						iInfoObjectHierarchyIntervalMemberAdd = this
								.cloneHierarchyIntervalMember(iInfoObjectHierarchyIntervalMemberSource);
						this
								.addHierarchyIntervalMemberValueHelper(
										iInfoObjectHierarchyIntervalMemberAdd,
										this
												.getFieldByName(sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_NODE_ID),
										sap.firefly.XNumcValue
												.create((iInfoObjectHierarchyMemberTarget)
														.getNodeId()),
										hierarchyOperation);
					},
					addHierarchyIntervalMemberForCheck : function(
							iInfoObjectHierarchyIntervalMember, checkOperation) {
						var technicalId = null;
						var iteratorCheckResult;
						var iInfoObjectCheckResultNext;
						var iInfoObjectCheckResult;
						if ((iInfoObjectHierarchyIntervalMember === null)
								|| (checkOperation === null)) {
							return technicalId;
						}
						iteratorCheckResult = this.m_hierarchy_interval_check
								.getIterator();
						while (iteratorCheckResult.hasNext()) {
							iInfoObjectCheckResultNext = iteratorCheckResult
									.next();
							if (iInfoObjectHierarchyIntervalMember === iInfoObjectCheckResultNext
									.getCheckReference()) {
								if (checkOperation === iInfoObjectCheckResultNext
										.getCheckOperation()) {
									return technicalId;
								}
							}
						}
						this.m_line_id = this.m_line_id + 1;
						technicalId = sap.firefly.XInteger
								.convertIntegerToString(this.m_line_id);
						iInfoObjectCheckResult = sap.firefly.InfoObjectCheckResult
								.createIInfoObjectCheckResult(
										iInfoObjectHierarchyIntervalMember,
										technicalId, checkOperation, null);
						this.m_hierarchy_interval_check
								.add(iInfoObjectCheckResult);
						return technicalId;
					},
					getHierarchyIntervalMemberForCheck : function() {
						return this.m_hierarchy_interval_check;
					},
					addHierarchyIntervalMemberValueHelper : function(
							iInfoObjectHierarchyIntervalMember, iQField,
							iXValue, hierarchyOperation) {
						var iQFieldValue;
						var iQFieldValueBase;
						var iAddAsChild;
						var iAddAsNext;
						var iAddAsChildLinkNode;
						var iAddAsNextLinkNode;
						if ((iInfoObjectHierarchyIntervalMember === null)
								|| (iQField === null) || (iXValue === null)) {
							return;
						}
						if (iQField.getValueType() !== iXValue.getValueType()) {
							return;
						}
						iQFieldValue = (iInfoObjectHierarchyIntervalMember)
								.getFieldValue(iQField);
						iQFieldValueBase = null;
						if (iQFieldValue === null) {
							return;
						}
						iQFieldValueBase = (iQFieldValue);
						iQFieldValueBase.setValue(iXValue);
						if (sap.firefly.XString
								.isEqual(
										sap.firefly.InfoObjectHierarchyOperation._ADD_AS_CHILD
												.getName(), hierarchyOperation
												.getName())) {
							if (this.m_hierarchy_interval_member_add_as_child
									.contains(iInfoObjectHierarchyIntervalMember)) {
								iAddAsChild = this.m_hierarchy_interval_member_add_as_child
										.getIndex(iInfoObjectHierarchyIntervalMember);
								this.m_hierarchy_interval_member_add_as_child
										.set(iAddAsChild,
												iInfoObjectHierarchyIntervalMember);
							} else {
								this.m_hierarchy_interval_member_add_as_child
										.add(iInfoObjectHierarchyIntervalMember);
							}
						} else {
							if (sap.firefly.XString
									.isEqual(
											sap.firefly.InfoObjectHierarchyOperation._ADD_AS_NEXT
													.getName(),
											hierarchyOperation.getName())) {
								if (this.m_hierarchy_interval_member_add_as_next
										.contains(iInfoObjectHierarchyIntervalMember)) {
									iAddAsNext = this.m_hierarchy_interval_member_add_as_next
											.getIndex(iInfoObjectHierarchyIntervalMember);
									this.m_hierarchy_interval_member_add_as_next
											.set(iAddAsNext,
													iInfoObjectHierarchyIntervalMember);
								} else {
									this.m_hierarchy_interval_member_add_as_next
											.add(iInfoObjectHierarchyIntervalMember);
								}
							} else {
								if (sap.firefly.XString
										.isEqual(
												sap.firefly.InfoObjectHierarchyOperation._ADD_CHILD_AS_LINK_NODE
														.getName(),
												hierarchyOperation.getName())) {
									if (this.m_hierarchy_interval_member_add_as_child_link_node
											.contains(iInfoObjectHierarchyIntervalMember)) {
										iAddAsChildLinkNode = this.m_hierarchy_interval_member_add_as_child_link_node
												.getIndex(iInfoObjectHierarchyIntervalMember);
										this.m_hierarchy_interval_member_add_as_child_link_node
												.set(iAddAsChildLinkNode,
														iInfoObjectHierarchyIntervalMember);
									} else {
										this.m_hierarchy_interval_member_add_as_child_link_node
												.add(iInfoObjectHierarchyIntervalMember);
									}
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InfoObjectHierarchyOperation._ADD_NEXT_AS_LINK_NODE
															.getName(),
													hierarchyOperation
															.getName())) {
										if (this.m_hierarchy_interval_member_add_as_next_link_node
												.contains(iInfoObjectHierarchyIntervalMember)) {
											iAddAsNextLinkNode = this.m_hierarchy_interval_member_add_as_next_link_node
													.getIndex(iInfoObjectHierarchyIntervalMember);
											this.m_hierarchy_interval_member_add_as_next_link_node
													.set(iAddAsNextLinkNode,
															iInfoObjectHierarchyIntervalMember);
										} else {
											this.m_hierarchy_interval_member_add_as_next_link_node
													.add(iInfoObjectHierarchyIntervalMember);
										}
									}
								}
							}
						}
					},
					setHierarchyIntervalMemberValue : function(
							iInfoObjectHierarchyIntervalMember, iQField,
							iQFieldCMP, aIXValue) {
						var iQFieldValue;
						var iXValue;
						var iXListDependentFields;
						var cmpPatternString;
						var dependentFields;
						var value;
						var dependentValues;
						var iQFieldValuePattern;
						var iQFieldValueBasePattern;
						var iQFieldValueBase;
						if (iInfoObjectHierarchyIntervalMember === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Node member is not set");
						}
						if ((iQField === null) || (aIXValue === null)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Field or value is not set");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_LEAFFROM_NAME)
								|| sap.firefly.XString
										.isEqual(
												iQField.getName(),
												sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_LEAFTO_NAME)) {
							if ((iQFieldCMP !== null)
									&& (iQFieldCMP.getDependencyFields().size() > 0)) {
								if (sap.firefly.XString.isEqual(iQFieldCMP
										.getName(), this.m_hierarchy_manager
										.getDimensionManager().getDimension()
										.getName())) {
									if (aIXValue.size() !== (iQFieldCMP
											.getDependencyFields().size() + 1)) {
										throw sap.firefly.XException
												.createIllegalArgumentException("Wrong number of compounded field values are set");
									}
								} else {
									if (aIXValue.size() !== iQFieldCMP
											.getDependencyFields().size()) {
										throw sap.firefly.XException
												.createIllegalArgumentException("Wrong number of compounded field values are set");
									}
								}
							}
						} else {
							if (aIXValue.size() !== 1) {
								throw sap.firefly.XException
										.createIllegalArgumentException("Multiple values are set");
							}
							if (iQField.getValueType() !== aIXValue.get(0)
									.getValueType()) {
								return;
							}
						}
						iQFieldValue = (iInfoObjectHierarchyIntervalMember)
								.getFieldValue(iQField);
						if (iQFieldValue === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_OBJECT_VERSION)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: object version");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_HIERARCHY_ID)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: hierarchy id");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_NODE_ID)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: node id");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_SH_FROM)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: node description short (from)");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_MD_FROM)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: node description medium (from)");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_LG_FROM)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: node description long (from)");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_SH_TO)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: node description short (to)");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_SH_TO)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: node description medium (to)");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_SH_TO)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: node description long (to)");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_CMP_PATTERN_FROM)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: CMP pattern (from)");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_CMP_PATTERN_TO)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: CMP pattern (to)");
						}
						iXValue = null;
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_LEAFFROM_NAME)
								|| sap.firefly.XString
										.isEqual(
												iQField.getName(),
												sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_LEAFTO_NAME)) {
							if ((iQFieldCMP !== null)
									&& (iQFieldCMP.getDependencyFields().size() > 0)) {
								iXListDependentFields = iQFieldCMP
										.getDependencyFields();
								cmpPatternString = sap.firefly.XString
										.concatenate2(
												sap.firefly.XInteger
														.convertIntegerToString(iXListDependentFields
																.size()),
												sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT);
								for (dependentFields = 0; dependentFields < iXListDependentFields
										.size(); dependentFields++) {
									cmpPatternString = sap.firefly.XString
											.concatenate2(
													cmpPatternString,
													iXListDependentFields
															.get(dependentFields));
									cmpPatternString = sap.firefly.XString
											.concatenate2(
													cmpPatternString,
													sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT);
								}
								if (sap.firefly.XString.isEqual(iQFieldCMP
										.getName(), this.m_hierarchy_manager
										.getDimensionManager().getDimension()
										.getName())) {
									cmpPatternString = sap.firefly.XString
											.concatenate2(
													cmpPatternString,
													this.m_hierarchy_manager
															.getDimensionManager()
															.getDimension()
															.getName());
									cmpPatternString = sap.firefly.XString
											.concatenate2(
													cmpPatternString,
													sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT);
								}
								cmpPatternString = sap.firefly.XString
										.concatenate2(
												cmpPatternString,
												sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT_TO_VALUE);
								value = "";
								for (dependentValues = 0; dependentValues < aIXValue
										.size(); dependentValues++) {
									if (sap.firefly.XValueType.STRING !== aIXValue
											.get(dependentValues)
											.getValueType()) {
										throw sap.firefly.XException
												.createIllegalArgumentException(sap.firefly.XString
														.concatenate2(
																"Invalid compounded value type: ",
																aIXValue
																		.get(
																				dependentValues)
																		.getValueType()
																		.getName()));
									}
									cmpPatternString = sap.firefly.XString
											.concatenate2(
													cmpPatternString,
													sap.firefly.XInteger
															.convertIntegerToString(sap.firefly.XString
																	.size((aIXValue
																			.get(dependentValues))
																			.getStringValue())));
									cmpPatternString = sap.firefly.XString
											.concatenate2(
													cmpPatternString,
													sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT_VALUE);
									if (dependentValues === (aIXValue.size() - 1)) {
										cmpPatternString = sap.firefly.XString
												.concatenate2(
														cmpPatternString,
														sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_VALUE);
									}
									value = sap.firefly.XString.concatenate2(
											value, (aIXValue
													.get(dependentValues))
													.getStringValue());
									if (dependentValues < (aIXValue.size() - 1)) {
										value = sap.firefly.XString
												.concatenate2(
														value,
														sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_VALUE);
									}
								}
								iQFieldValuePattern = null;
								if (sap.firefly.XString
										.isEqual(
												iQField.getName(),
												sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_LEAFFROM_NAME)) {
									iQFieldValuePattern = (iInfoObjectHierarchyIntervalMember)
											.getFieldValue(this
													.getFieldByName(sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_CMP_PATTERN_FROM));
								} else {
									iQFieldValuePattern = (iInfoObjectHierarchyIntervalMember)
											.getFieldValue(this
													.getFieldByName(sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_CMP_PATTERN_TO));
								}
								iQFieldValueBasePattern = iQFieldValuePattern;
								iQFieldValueBasePattern
										.setValue(sap.firefly.XStringValue
												.create(cmpPatternString));
								iXValue = sap.firefly.XStringValue
										.create(value);
							} else {
								iXValue = aIXValue.get(0);
							}
						} else {
							iXValue = aIXValue.get(0);
						}
						iQFieldValueBase = iQFieldValue;
						iQFieldValueBase.setValue(iXValue);
					},
					updateHierarchyIntervalMember : function(
							iInfoObjectHierarchyIntervalMember, iQField,
							iXValue) {
						var iQFieldValue;
						var iQFieldValueBase;
						var i_update;
						var i_addAsChild;
						var i_addAsNext;
						var i_addAsChildLinkNode;
						var i_addAsNextLinkNode;
						if ((iInfoObjectHierarchyIntervalMember === null)
								|| (iQField === null) || (iXValue === null)) {
							return;
						}
						if (iQField.getValueType() !== iXValue.getValueType()) {
							return;
						}
						iQFieldValue = (iInfoObjectHierarchyIntervalMember)
								.getFieldValue(iQField);
						if (iQFieldValue === null) {
							return;
						}
						iQFieldValueBase = (iQFieldValue);
						iQFieldValueBase.setValue(iXValue);
						if (this.m_hierarchy_interval_member_update
								.contains(iInfoObjectHierarchyIntervalMember)) {
							i_update = this.m_hierarchy_interval_member_update
									.getIndex(iInfoObjectHierarchyIntervalMember);
							this.m_hierarchy_interval_member_update.set(
									i_update,
									iInfoObjectHierarchyIntervalMember);
						} else {
							if (this.m_hierarchy_interval_member_add_as_child
									.contains(iInfoObjectHierarchyIntervalMember)) {
								i_addAsChild = this.m_hierarchy_interval_member_add_as_child
										.getIndex(iInfoObjectHierarchyIntervalMember);
								this.m_hierarchy_interval_member_add_as_child
										.set(i_addAsChild,
												iInfoObjectHierarchyIntervalMember);
							} else {
								if (this.m_hierarchy_interval_member_add_as_next
										.contains(iInfoObjectHierarchyIntervalMember)) {
									i_addAsNext = this.m_hierarchy_interval_member_add_as_next
											.getIndex(iInfoObjectHierarchyIntervalMember);
									this.m_hierarchy_interval_member_add_as_next
											.set(i_addAsNext,
													iInfoObjectHierarchyIntervalMember);
								} else {
									if (this.m_hierarchy_interval_member_add_as_child_link_node
											.contains(iInfoObjectHierarchyIntervalMember)) {
										i_addAsChildLinkNode = this.m_hierarchy_interval_member_add_as_child_link_node
												.getIndex(iInfoObjectHierarchyIntervalMember);
										this.m_hierarchy_interval_member_add_as_child_link_node
												.set(i_addAsChildLinkNode,
														iInfoObjectHierarchyIntervalMember);
									} else {
										if (this.m_hierarchy_interval_member_add_as_next_link_node
												.contains(iInfoObjectHierarchyIntervalMember)) {
											i_addAsNextLinkNode = this.m_hierarchy_interval_member_add_as_next_link_node
													.getIndex(iInfoObjectHierarchyIntervalMember);
											this.m_hierarchy_interval_member_add_as_next_link_node
													.set(i_addAsNextLinkNode,
															iInfoObjectHierarchyIntervalMember);
										} else {
											this.m_hierarchy_interval_member_update
													.add(iInfoObjectHierarchyIntervalMember);
										}
									}
								}
							}
						}
					},
					cloneHierarchyIntervalMember : function(
							iInfoObjectHierarchyIntervalMember) {
						var infoObjectHierarchyIntervalMember_out = this
								.createHierarchyIntervalMember();
						var iQFieldListReadOnly = this.getFields();
						var iXIteratorField = iQFieldListReadOnly.getIterator();
						var iQField;
						var iQFieldValue_out;
						var iQFieldValueBase_out;
						var iQFieldValueBase_in;
						while (iXIteratorField.hasNext()) {
							iQField = iXIteratorField.next();
							iQFieldValue_out = infoObjectHierarchyIntervalMember_out
									.getFieldValue(iQField);
							iQFieldValueBase_out = iQFieldValue_out;
							iQFieldValueBase_in = (iInfoObjectHierarchyIntervalMember)
									.getFieldValue(iQField);
							iQFieldValueBase_out.setValue(iQFieldValueBase_in
									.getValue());
						}
						return infoObjectHierarchyIntervalMember_out;
					},
					clear : function(infoObjectClearOperation) {
						if (sap.firefly.InfoObjectClearOperation._NONE === infoObjectClearOperation) {
							return;
						}
						if ((sap.firefly.InfoObjectClearOperation._CLEAR_ALL === infoObjectClearOperation)
								|| (sap.firefly.InfoObjectClearOperation._CLEAR_OPERATION === infoObjectClearOperation)) {
							if (sap.firefly.InfoObjectClearOperation._CLEAR_OPERATION !== infoObjectClearOperation) {
								this.m_hierarchy_interval_member = sap.firefly.XList
										.create();
								this.m_hierarchy_interval_member_map = sap.firefly.XHashMapByString
										.create();
							}
							this.m_hierarchy_interval_member_add_as_child = sap.firefly.XList
									.create();
							this.m_hierarchy_interval_member_add_as_next = sap.firefly.XList
									.create();
							this.m_hierarchy_interval_member_add_as_child_link_node = sap.firefly.XList
									.create();
							this.m_hierarchy_interval_member_add_as_next_link_node = sap.firefly.XList
									.create();
							this.m_hierarchy_interval_member_update = sap.firefly.XList
									.create();
							this.m_hierarchy_interval_check = sap.firefly.XList
									.create();
						}
					},
					serializeIntervalMember : function(iPrStructure) {
						var iPrStructureDataEntries = sap.firefly.PrStructure
								.create();
						var prListValues;
						if (iPrStructure === null) {
							return iPrStructure;
						}
						this
								.serialzeIntervalMemberDimensionContext(iPrStructureDataEntries);
						prListValues = sap.firefly.PrList.create();
						this.m_line_id = 0;
						this
								.serialzeIntervalMemberValue(
										prListValues,
										this.m_hierarchy_interval_member_add_as_child,
										sap.firefly.InfoObjectHierarchyOperation._ADD_AS_CHILD
												.getName());
						this
								.serialzeIntervalMemberValue(
										prListValues,
										this.m_hierarchy_interval_member_add_as_next,
										sap.firefly.InfoObjectHierarchyOperation._ADD_AS_NEXT
												.getName());
						this
								.serialzeIntervalMemberValue(
										prListValues,
										this.m_hierarchy_interval_member_add_as_child_link_node,
										sap.firefly.InfoObjectHierarchyOperation._ADD_CHILD_AS_LINK_NODE
												.getName());
						this
								.serialzeIntervalMemberValue(
										prListValues,
										this.m_hierarchy_interval_member_add_as_next_link_node,
										sap.firefly.InfoObjectHierarchyOperation._ADD_NEXT_AS_LINK_NODE
												.getName());
						this.serialzeIntervalMemberValue(prListValues,
								this.m_hierarchy_interval_member_update,
								sap.firefly.InAConstants.VA_ACTION_NEW_VALUES);
						iPrStructureDataEntries.setElementByName(
								sap.firefly.InAConstants.QY_VALUES,
								prListValues);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_ENTRIES,
								iPrStructureDataEntries);
						return iPrStructure;
					},
					serializeIntervalCheck : function(iPrStructure) {
						var iPrStructureDataEntries = sap.firefly.PrStructure
								.create();
						var prListValues;
						if (iPrStructure === null) {
							return iPrStructure;
						}
						this
								.serialzeIntervalMemberDimensionContext(iPrStructureDataEntries);
						prListValues = sap.firefly.PrList.create();
						this
								.serialzeIntervalCheckValue(
										prListValues,
										this.m_hierarchy_interval_check,
										sap.firefly.InAConstants.VA_ACTION_CHECK_DUPLICATES);
						iPrStructureDataEntries.setElementByName(
								sap.firefly.InAConstants.QY_VALUES,
								prListValues);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_ENTRIES,
								iPrStructureDataEntries);
						return iPrStructure;
					},
					serialzeIntervalMemberDimensionContext : function(
							iPrStructure) {
						var prListDimensionContext = sap.firefly.PrList
								.create();
						var aIInfoObjectHierarchyIntervalMember;
						var xIteratorHierarchyIntervalMember;
						var iInfoObjectHierarchyIntervalMember;
						var aIQFieldValue;
						var iXIteratorFieldName;
						var fieldName;
						if (iPrStructure === null) {
							return prListDimensionContext;
						}
						aIInfoObjectHierarchyIntervalMember = this.m_hierarchy_interval_member;
						if ((this.m_hierarchy_interval_member === null)
								|| (this.m_hierarchy_interval_member.isEmpty())) {
							aIInfoObjectHierarchyIntervalMember = sap.firefly.XList
									.create();
							aIInfoObjectHierarchyIntervalMember.add(this
									.createHierarchyIntervalMember());
						}
						xIteratorHierarchyIntervalMember = aIInfoObjectHierarchyIntervalMember
								.getIterator();
						while (xIteratorHierarchyIntervalMember.hasNext()) {
							iInfoObjectHierarchyIntervalMember = xIteratorHierarchyIntervalMember
									.next();
							aIQFieldValue = (iInfoObjectHierarchyIntervalMember)
									.getAllFieldValues();
							iXIteratorFieldName = aIQFieldValue
									.getKeysAsIteratorOfString();
							while (iXIteratorFieldName.hasNext()) {
								fieldName = iXIteratorFieldName.next();
								prListDimensionContext.addString(fieldName);
							}
							break;
						}
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DIMENSION_CONTEXT,
								prListDimensionContext);
						return prListDimensionContext;
					},
					serialzeIntervalCheckValue : function(iPrList,
							aIInfoObjectCheckResult, action) {
						var iXIteratorCheck;
						var iInfoObjectCheckResult;
						var iPrStructureValue;
						if ((iPrList === null)
								|| (aIInfoObjectCheckResult === null)) {
							return iPrList;
						}
						if (!sap.firefly.XString
								.isEqual(
										action,
										sap.firefly.InAConstants.VA_ACTION_CHECK_DUPLICATES)) {
							return iPrList;
						}
						iXIteratorCheck = aIInfoObjectCheckResult.getIterator();
						while (iXIteratorCheck.hasNext()) {
							iInfoObjectCheckResult = iXIteratorCheck.next();
							iPrStructureValue = sap.firefly.PrStructure
									.create();
							iPrStructureValue.setStringByName(
									sap.firefly.InAConstants.QY_ACTION, action);
							iPrStructureValue
									.setIntegerByName(
											sap.firefly.InAConstants.QY_LINE_ID,
											sap.firefly.XInteger
													.convertStringToInteger((iInfoObjectCheckResult)
															.getTechnicalId()));
							this.serialzeIntervalMemberKeys(iPrStructureValue,
									iInfoObjectCheckResult.getCheckReference());
							iPrList.add(iPrStructureValue);
						}
						return iPrList;
					},
					serialzeIntervalMemberValue : function(iPrList,
							aIInfoObjectHierarchyIntervalMember, action) {
						var xIteratorHierarchyIntervalMember;
						var iInfoObjectHierarchyIntervalMember;
						var iPrStructureValue;
						if ((iPrList === null)
								|| (aIInfoObjectHierarchyIntervalMember === null)) {
							return iPrList;
						}
						xIteratorHierarchyIntervalMember = aIInfoObjectHierarchyIntervalMember
								.getIterator();
						while (xIteratorHierarchyIntervalMember.hasNext()) {
							iInfoObjectHierarchyIntervalMember = xIteratorHierarchyIntervalMember
									.next();
							iPrStructureValue = sap.firefly.PrStructure
									.create();
							iPrStructureValue.setStringByName(
									sap.firefly.InAConstants.QY_ACTION, action);
							iPrStructureValue.setIntegerByName(
									sap.firefly.InAConstants.QY_LINE_ID,
									this.m_line_id);
							this.serialzeIntervalMemberKeys(iPrStructureValue,
									iInfoObjectHierarchyIntervalMember);
							iPrList.add(iPrStructureValue);
							this.m_line_id = this.m_line_id + 1;
						}
						return iPrList;
					},
					serialzeIntervalMemberKeys : function(iPrStructure,
							iInfoObjectHierarchyIntervalMember) {
						var prListKeys = sap.firefly.PrList.create();
						var aIQFieldValue;
						var iXIteratorFieldValue;
						var xIteratorFieldValue;
						var iQFieldValue;
						if (iPrStructure === null) {
							return prListKeys;
						}
						aIQFieldValue = (iInfoObjectHierarchyIntervalMember)
								.getAllFieldValues();
						iXIteratorFieldValue = aIQFieldValue
								.getValuesAsReadOnlyList();
						xIteratorFieldValue = iXIteratorFieldValue
								.getIterator();
						while (xIteratorFieldValue.hasNext()) {
							iQFieldValue = xIteratorFieldValue.next();
							if ((sap.firefly.XValueType.STRING === iQFieldValue
									.getValueType())
									|| (sap.firefly.XValueType.LANGUAGE === iQFieldValue
											.getValueType())
									|| (sap.firefly.XValueType.NUMC === iQFieldValue
											.getValueType())) {
								prListKeys.addString(iQFieldValue
										.getStringValue());
							} else {
								if (sap.firefly.XValueType.BOOLEAN === iQFieldValue
										.getValueType()) {
									prListKeys
											.addString(sap.firefly.XBoolean
													.convertBooleanToString(iQFieldValue
															.getBooleanValue()));
								} else {
									if (sap.firefly.XValueType.INTEGER === iQFieldValue
											.getValueType()) {
										prListKeys
												.addString(sap.firefly.XInteger
														.convertIntegerToString(iQFieldValue
																.getIntegerValue()));
									} else {
										if (sap.firefly.XValueType.DOUBLE === iQFieldValue
												.getValueType()) {
											prListKeys
													.addString(sap.firefly.XDouble
															.convertDoubleToString(iQFieldValue
																	.getDoubleValue()));
										} else {
											if (sap.firefly.XValueType.LONG === iQFieldValue
													.getValueType()) {
												prListKeys
														.addString(sap.firefly.XLong
																.convertLongToString(iQFieldValue
																		.getLongValue()));
											} else {
												if (sap.firefly.XValueType.DATE === iQFieldValue
														.getValueType()) {
													prListKeys
															.addString(iQFieldValue
																	.getDateValue()
																	.toSAPFormat());
												} else {
													if (sap.firefly.XValueType.TIME === iQFieldValue
															.getValueType()) {
														prListKeys
																.addString(iQFieldValue
																		.getTimeValue()
																		.toSAPFormat());
													} else {
														throw sap.firefly.XException
																.createIllegalStateException(sap.firefly.XString
																		.concatenate2(
																				"Value type not supported: ",
																				iQFieldValue
																						.getValueType()
																						.getName()));
													}
												}
											}
										}
									}
								}
							}
						}
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_KEYS, prListKeys);
						return prListKeys;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectHierarchyManager",
				sap.firefly.InfoObjectBaseManager,
				{
					$statics : {
						HIERARCHY_ID_VALUE_INITIAL : "",
						CMP_SEPARATOR_INFO_OBJECT : ":",
						CMP_SEPARATOR_INFO_OBJECT_VALUE : ".",
						CMP_SEPARATOR_INFO_OBJECT_TO_VALUE : "_",
						CMP_SEPARATOR_VALUE : "/",
						FIELD_INITIAL_ID : "00000000",
						MIN_DATE : "10000101",
						MAX_DATE : "99991231",
						MAX_NODE_ID : "99999999",
						FIELD_HIER_NODE : "0HIER_NODE",
						FIELD_HIER_VERS : "0HIER_VERS",
						FIELD_NAME_HIERARCHY_ID : "HIEID",
						FIELD_NAME_OBJECT_VERSION : "OBJVERS",
						FIELD_NAME_NODE_ID : "NODEID",
						FIELD_NAME_INFO_OBJECT_NAME : "IOBJNM",
						FIELD_NAME_NODE_NAME : "NODENAME",
						FIELD_NAME_T_LEVEL : "TLEVEL",
						FIELD_NAME_LINK : "LINK",
						FIELD_NAME_PARENT_ID : "PARENTID",
						FIELD_NAME_CHILD_ID : "CHILDID",
						FIELD_NAME_NEXT_ID : "NEXTID",
						FIELD_NAME_DATE_FROM : "DATEFROM",
						FIELD_NAME_DATE_TO : "DATETO",
						FIELD_NAME_SIGN_CH : "SIGNCH",
						FIELD_NAME_INTERVL : "INTERVL",
						FIELD_NAME_TXT_SH : "TXTSH",
						FIELD_NAME_TXT_MD : "TXTMD",
						FIELD_NAME_TXT_LG : "TXTLG",
						FIELD_NAME_CMP_PATTERN : "CMPPATTERN",
						createIInfoObjectHierarchyManager : function(
								iInfoObjectDimensionManager,
								iQHierarchyValueHelp, iQDimensionBase,
								serverMetadata, iQHierarchy) {
							var iInfoObjectHierarchyManager = new sap.firefly.InfoObjectHierarchyManager();
							iInfoObjectHierarchyManager.setup(
									iInfoObjectDimensionManager,
									iQHierarchyValueHelp, iQDimensionBase,
									serverMetadata, iQHierarchy);
							return iInfoObjectHierarchyManager;
						}
					},
					m_dimension_manager : null,
					m_hierarchy_interval_manager : null,
					m_dimension_member_value_help : null,
					m_hierarchy_value_help : null,
					m_base_hierarchy : null,
					m_hierarchy : null,
					m_hierarchy_load : null,
					m_hierarchy_add : null,
					m_hierarchy_update : null,
					m_hierarchy_delete : null,
					m_hierarchy_check : null,
					m_hierarchy_member : null,
					m_hierarchy_member_add_as_child : null,
					m_hierarchy_member_add_as_next : null,
					m_hierarchy_member_add_as_child_link_node : null,
					m_hierarchy_member_add_as_next_link_node : null,
					m_hierarchy_member_update : null,
					m_hierarchy_member_delete : null,
					m_hierarchy_member_move_as_child : null,
					m_hierarchy_member_move_as_next : null,
					m_hierarchy_member_check : null,
					m_root_hierarchy_member_level : null,
					m_root_hierarchy_member : null,
					m_node_aIInfoObjectHierarchyMember : null,
					m_parent_aIInfoObjectHierarchyMember : null,
					m_level_aIInfoObjectHierarchyMember : null,
					m_server_metadata : null,
					setup : function(iInfoObjectDimensionManager,
							iQHierarchyValueHelp, iQDimensionBase,
							serverMetadata, iQHierarchy) {
						sap.firefly.InfoObjectHierarchyManager.$superclass.setupBase
								.call(this);
						this.m_dimension_manager = iInfoObjectDimensionManager;
						this.m_hierarchy_value_help = iQHierarchyValueHelp;
						this.m_dimension_base = iQDimensionBase;
						this.m_hierarchy = sap.firefly.XList.create();
						this.m_hierarchy_add = sap.firefly.XList.create();
						this.m_hierarchy_update = sap.firefly.XList.create();
						this.m_hierarchy_delete = sap.firefly.XList.create();
						this.m_hierarchy_check = sap.firefly.XList.create();
						this.m_dimension_member_value_help = sap.firefly.XList
								.create();
						this.m_hierarchy_load = sap.firefly.XHashMapByString
								.create();
						this.m_hierarchy_member = sap.firefly.XList.create();
						this.m_hierarchy_member_add_as_child = sap.firefly.XList
								.create();
						this.m_hierarchy_member_add_as_next = sap.firefly.XList
								.create();
						this.m_hierarchy_member_add_as_child_link_node = sap.firefly.XList
								.create();
						this.m_hierarchy_member_add_as_next_link_node = sap.firefly.XList
								.create();
						this.m_hierarchy_member_update = sap.firefly.XList
								.create();
						this.m_hierarchy_member_delete = sap.firefly.XList
								.create();
						this.m_hierarchy_member_check = sap.firefly.XList
								.create();
						this.m_hierarchy_member_move_as_child = sap.firefly.XList
								.create();
						this.m_hierarchy_member_move_as_next = sap.firefly.XList
								.create();
						this.m_node_aIInfoObjectHierarchyMember = sap.firefly.XHashMapByString
								.create();
						this.m_parent_aIInfoObjectHierarchyMember = sap.firefly.XHashMapByString
								.create();
						this.m_level_aIInfoObjectHierarchyMember = sap.firefly.XHashMapByString
								.create();
						this.m_server_metadata = serverMetadata;
						this.m_base_hierarchy = iQHierarchy;
					},
					getDimensionManager : function() {
						return this.m_dimension_manager;
					},
					getBaseHierarchy : function() {
						return this.m_base_hierarchy;
					},
					getIQSelectorHierarchy : function() {
						return sap.firefly.InfoObjectSelector
								.createIInfoObjectSelector(this.getDimension());
					},
					isCompounded : function() {
						var iQFieldIobjnm = this
								.getFieldByName(sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_INFO_OBJECT_NAME);
						if (iQFieldIobjnm === null) {
							return false;
						}
						return !iQFieldIobjnm.getDependencyFields().isEmpty();
					},
					getCompoundedFieldNames : function() {
						var iQFieldIobjnm = this
								.getFieldByName(sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_INFO_OBJECT_NAME);
						if (iQFieldIobjnm === null) {
							return sap.firefly.XListOfString.create();
						}
						return iQFieldIobjnm.getDependencyFields();
					},
					getHierarchyIntervalManager : function() {
						return this.m_hierarchy_interval_manager;
					},
					setHierarchyIntervalManager : function(
							iInfoObjectHierarchyIntervalManager) {
						this.m_hierarchy_interval_manager = iInfoObjectHierarchyIntervalManager;
					},
					getIQHierarchyValueHelp : function() {
						return this.m_hierarchy_value_help;
					},
					supportHierarchyMemberPaging : function() {
						var capabilities;
						var capabilityPaging;
						if (this.m_server_metadata === null) {
							return false;
						}
						capabilities = this.m_server_metadata
								.getMetadataForService(sap.firefly.ServerService.HIERARCHY_MEMBER);
						if (capabilities === null) {
							return false;
						}
						capabilityPaging = capabilities
								.getByKey(sap.firefly.InACapabilities.AV_CAPABILITY_PAGING);
						if (capabilityPaging === null) {
							return false;
						}
						if (!sap.firefly.XString.isEqual(capabilityPaging
								.getValue(), "N")) {
							return true;
						}
						return false;
					},
					getIQHierarchy : function(dimension, name) {
						return dimension.newHierarchy(name);
					},
					setHierarchyDescription : function(iQHierarchy,
							hierarchyDescription) {
						(iQHierarchy)
								.setHierarchyDescription(hierarchyDescription);
					},
					setHierarchyType : function(iQHierarchy, hierarchyType) {
						(iQHierarchy).setHierType(hierarchyType);
					},
					setVersionDescription : function(iQHierarchy,
							versionDescription) {
						(iQHierarchy).setVersionDescription(versionDescription);
					},
					setVersion : function(iQHierarchy, version) {
						(iQHierarchy).setHierarchyVersion(version);
					},
					setOwner : function(iQHierarchy, owner) {
						(iQHierarchy).setOwner(owner);
					},
					setDateTo : function(iQHierarchy, dateTo) {
						(iQHierarchy).setDateTo(dateTo);
					},
					setDateFrom : function(iQHierarchy, dateFrom) {
						(iQHierarchy).setDateFrom(dateFrom);
					},
					revertAddedIQHierarchy : function(iQHierarchy) {
						if (iQHierarchy === null) {
							return;
						}
						if (this.m_hierarchy_add.contains(iQHierarchy)) {
							this.m_hierarchy_add.removeElement(iQHierarchy);
							if (this.m_hierarchy_load.containsKey(iQHierarchy
									.getHierarchyName())) {
								this.m_hierarchy_load.remove(iQHierarchy
										.getHierarchyName());
							}
						}
					},
					createIQHierarchy : function(iQHierarchy) {
						var i;
						if (iQHierarchy === null) {
							return;
						}
						if (this.m_hierarchy_add.contains(iQHierarchy)) {
							i = this.m_hierarchy_add.getIndex(iQHierarchy);
							this.m_hierarchy_add.set(i, iQHierarchy);
						} else {
							this.m_hierarchy_add.add(iQHierarchy);
						}
					},
					createIQHierarchyByReference : function(iQHierarchy,
							iQHierarchyReference) {
						var i;
						if (iQHierarchy === null) {
							return;
						}
						if (iQHierarchyReference === null) {
							this.createIQHierarchy(iQHierarchy);
							return;
						}
						this.setOwner(iQHierarchy, iQHierarchyReference
								.getHierId());
						if (this.m_hierarchy_add.contains(iQHierarchy)) {
							i = this.m_hierarchy_add.getIndex(iQHierarchy);
							this.m_hierarchy_add.set(i, iQHierarchy);
						} else {
							this.m_hierarchy_add.add(iQHierarchy);
						}
					},
					createIQHierarchyByIDataContainer : function(iQHierarchy,
							iDataContainer) {
						var i;
						if (iQHierarchy === null) {
							return;
						}
						if (this.m_hierarchy_add.contains(iQHierarchy)) {
							i = this.m_hierarchy_add.getIndex(iQHierarchy);
							this.m_hierarchy_add.set(i, iQHierarchy);
						} else {
							this.m_hierarchy_add.add(iQHierarchy);
						}
						if (this.m_hierarchy_load.containsKey(iQHierarchy
								.getHierarchyName())) {
							this.m_hierarchy_load.remove(iQHierarchy
									.getHierarchyName());
							this.m_hierarchy_load.put(iQHierarchy
									.getHierarchyName(), iDataContainer);
						} else {
							this.m_hierarchy_load.put(iQHierarchy
									.getHierarchyName(), iDataContainer);
						}
					},
					addIQHierarchyForCheck : function(iQHierarchy,
							checkOperation) {
						var technicalId = null;
						var iteratorCheckResult;
						var iInfoObjectCheckResultNext;
						var iInfoObjectCheckResult;
						if ((iQHierarchy === null) || (checkOperation === null)) {
							return technicalId;
						}
						iteratorCheckResult = this.m_hierarchy_check
								.getIterator();
						while (iteratorCheckResult.hasNext()) {
							iInfoObjectCheckResultNext = iteratorCheckResult
									.next();
							if (iQHierarchy === iInfoObjectCheckResultNext
									.getCheckReference()) {
								if (checkOperation === iInfoObjectCheckResultNext
										.getCheckOperation()) {
									return technicalId;
								}
							}
						}
						this.m_line_id = this.m_line_id + 1;
						technicalId = sap.firefly.XInteger
								.convertIntegerToString(this.m_line_id);
						iInfoObjectCheckResult = sap.firefly.InfoObjectCheckResult
								.createIInfoObjectCheckResult(iQHierarchy,
										technicalId, checkOperation, null);
						this.m_hierarchy_check.add(iInfoObjectCheckResult);
						return technicalId;
					},
					getIQHierarchyForCheck : function() {
						return this.m_hierarchy_check;
					},
					updateIQHierarchy : function(iQHierarchy) {
						var i;
						var j;
						if (iQHierarchy === null) {
							return;
						}
						if (this.m_hierarchy_delete.contains(iQHierarchy)) {
							return;
						} else {
							if (this.m_hierarchy_add.contains(iQHierarchy)) {
								i = this.m_hierarchy_add.getIndex(iQHierarchy);
								this.m_hierarchy_add.set(i, iQHierarchy);
							} else {
								if (this.m_hierarchy_update
										.contains(iQHierarchy)) {
									j = this.m_hierarchy_update
											.getIndex(iQHierarchy);
									this.m_hierarchy_update.set(j, iQHierarchy);
								} else {
									this.m_hierarchy_update.add(iQHierarchy);
								}
							}
						}
					},
					copyIQHierarchy : function(iQHierarchyFrom, iQHierarchyTo) {
						var i;
						if ((iQHierarchyFrom === null)
								|| (iQHierarchyTo === null)) {
							return;
						}
						this.setOwner(iQHierarchyTo, iQHierarchyFrom
								.getHierId());
						this.setHierarchyType(iQHierarchyTo, iQHierarchyFrom
								.getHierType());
						if (this.m_hierarchy_add.contains(iQHierarchyTo)) {
							i = this.m_hierarchy_add.getIndex(iQHierarchyTo);
							this.m_hierarchy_add.set(i, iQHierarchyTo);
						} else {
							this.m_hierarchy_add.add(iQHierarchyTo);
						}
					},
					deleteIQHierarchy : function(iQHierarchy) {
						var i;
						if (iQHierarchy === null) {
							return;
						}
						if (this.m_hierarchy_update.contains(iQHierarchy)) {
							this.m_hierarchy_update.removeElement(iQHierarchy);
							this.m_hierarchy_delete.add(iQHierarchy);
						} else {
							if (this.m_hierarchy_add.contains(iQHierarchy)) {
								this.m_hierarchy_add.removeElement(iQHierarchy);
								this.m_hierarchy_delete.add(iQHierarchy);
							} else {
								if (this.m_hierarchy_delete
										.contains(iQHierarchy)) {
									i = this.m_hierarchy_delete
											.getIndex(iQHierarchy);
									this.m_hierarchy_delete.set(i, iQHierarchy);
								} else {
									this.m_hierarchy_delete.add(iQHierarchy);
								}
							}
						}
					},
					addHierarchy : function(iQHierarchy) {
						if (iQHierarchy === null) {
							return;
						}
						this.m_hierarchy.add(iQHierarchy);
					},
					getHierarchy : function() {
						return this.m_hierarchy;
					},
					addHierarchyListMember : function(
							iInfoObjectHierarchyMember) {
						if (iInfoObjectHierarchyMember === null) {
							return;
						}
						this.m_hierarchy_member.add(iInfoObjectHierarchyMember);
					},
					buildHierarchyMemberStructure : function(
							iInfoObjectHierarchyMember) {
						var compareResult;
						var aIInfoObjectHierarchyMemberChildNew;
						var aIInfoObjectHierarchyMemberChildLevelNew;
						if (iInfoObjectHierarchyMember === null) {
							return;
						}
						if (sap.firefly.XString.isEqual(
								(iInfoObjectHierarchyMember).getNodeId(),
								this.m_root_tuple)) {
							this.m_root_hierarchy_member = iInfoObjectHierarchyMember;
						}
						if (this.m_root_hierarchy_member_level === null) {
							this.m_root_hierarchy_member_level = iInfoObjectHierarchyMember
									.getLevel();
						} else {
							compareResult = sap.firefly.XString.compare(
									this.m_root_hierarchy_member_level,
									iInfoObjectHierarchyMember.getLevel());
							if (compareResult > 0) {
								this.m_root_hierarchy_member_level = iInfoObjectHierarchyMember
										.getLevel();
							}
						}
						this.m_node_aIInfoObjectHierarchyMember.put(
								(iInfoObjectHierarchyMember).getNodeId(),
								iInfoObjectHierarchyMember);
						if (!sap.firefly.XString
								.isEqual(
										(iInfoObjectHierarchyMember)
												.getParentId(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_INITIAL_ID)) {
							if (this.m_parent_aIInfoObjectHierarchyMember
									.containsKey((iInfoObjectHierarchyMember)
											.getParentId())) {
								this.m_parent_aIInfoObjectHierarchyMember
										.getByKey(
												(iInfoObjectHierarchyMember)
														.getParentId()).add(
												iInfoObjectHierarchyMember);
							} else {
								aIInfoObjectHierarchyMemberChildNew = sap.firefly.XList
										.create();
								aIInfoObjectHierarchyMemberChildNew
										.add(iInfoObjectHierarchyMember);
								this.m_parent_aIInfoObjectHierarchyMember.put(
										(iInfoObjectHierarchyMember)
												.getParentId(),
										aIInfoObjectHierarchyMemberChildNew);
							}
						}
						if (this.m_level_aIInfoObjectHierarchyMember
								.containsKey(iInfoObjectHierarchyMember
										.getLevel())) {
							this.m_level_aIInfoObjectHierarchyMember.getByKey(
									iInfoObjectHierarchyMember.getLevel()).add(
									iInfoObjectHierarchyMember);
						} else {
							aIInfoObjectHierarchyMemberChildLevelNew = sap.firefly.XList
									.create();
							aIInfoObjectHierarchyMemberChildLevelNew
									.add(iInfoObjectHierarchyMember);
							this.m_level_aIInfoObjectHierarchyMember.put(
									iInfoObjectHierarchyMember.getLevel(),
									aIInfoObjectHierarchyMemberChildLevelNew);
						}
					},
					sortParentHierarchyMember : function() {
						var aParentIInfoObjectHierarchyMember = sap.firefly.XHashMapByString
								.create();
						var iXIteratorKeyParent = this.m_parent_aIInfoObjectHierarchyMember
								.getKeysAsIteratorOfString();
						var aIInfoObjectHierarchyMemberSorted;
						var iInfoObjectHierarchyMemberParent;
						var iInfoObjectHierarchyMember;
						var iInfoObjectHierarchyMemberNext;
						while (iXIteratorKeyParent.hasNext()) {
							aIInfoObjectHierarchyMemberSorted = sap.firefly.XList
									.create();
							iInfoObjectHierarchyMemberParent = this.m_node_aIInfoObjectHierarchyMember
									.getByKey(iXIteratorKeyParent.next());
							if (iInfoObjectHierarchyMemberParent === null) {
								continue;
							}
							if (!this
									.hasChildHierarchyMember(iInfoObjectHierarchyMemberParent)) {
								aParentIInfoObjectHierarchyMember.put(
										(iInfoObjectHierarchyMemberParent)
												.getNodeId(),
										aIInfoObjectHierarchyMemberSorted);
								continue;
							}
							if (this.m_node_aIInfoObjectHierarchyMember
									.containsKey((iInfoObjectHierarchyMemberParent)
											.getChildId())) {
								iInfoObjectHierarchyMember = this.m_node_aIInfoObjectHierarchyMember
										.getByKey((iInfoObjectHierarchyMemberParent)
												.getChildId());
								aIInfoObjectHierarchyMemberSorted
										.add(iInfoObjectHierarchyMember);
								while (this
										.hasNextHierarchyMember(iInfoObjectHierarchyMember)) {
									iInfoObjectHierarchyMemberNext = this.m_node_aIInfoObjectHierarchyMember
											.getByKey((iInfoObjectHierarchyMember)
													.getNextId());
									aIInfoObjectHierarchyMemberSorted
											.add(iInfoObjectHierarchyMemberNext);
									iInfoObjectHierarchyMember = iInfoObjectHierarchyMemberNext;
								}
							}
							aParentIInfoObjectHierarchyMember.put(
									(iInfoObjectHierarchyMemberParent)
											.getNodeId(),
									aIInfoObjectHierarchyMemberSorted);
						}
						this.m_parent_aIInfoObjectHierarchyMember = aParentIInfoObjectHierarchyMember;
					},
					getPreviousHierarchyMember : function(
							iInfoObjectHierarchyMember) {
						return null;
					},
					getHierarchyMember : function() {
						return this.m_hierarchy_member;
					},
					getRootHierarchyMemberLevel : function() {
						return this.m_root_hierarchy_member_level;
					},
					getRootHierarchyMember : function() {
						return this.m_root_hierarchy_member;
					},
					getParentHierarchyMember : function(
							iInfoObjectHierarchyMember) {
						if (iInfoObjectHierarchyMember === null) {
							return null;
						}
						return this.m_node_aIInfoObjectHierarchyMember
								.getByKey((iInfoObjectHierarchyMember)
										.getParentId());
					},
					hasChildHierarchyMember : function(
							iInfoObjectHierarchyMember) {
						if (this
								.getNumberOfChildHierarchyMember(iInfoObjectHierarchyMember) > 0) {
							return true;
						}
						return false;
					},
					getChildHierarchyMember : function(
							iInfoObjectHierarchyMember) {
						if (iInfoObjectHierarchyMember === null) {
							return sap.firefly.XList.create();
						}
						return this.m_parent_aIInfoObjectHierarchyMember
								.getByKey((iInfoObjectHierarchyMember)
										.getNodeId());
					},
					getNumberOfChildHierarchyMember : function(
							iInfoObjectHierarchyMember) {
						if (iInfoObjectHierarchyMember === null) {
							return 0;
						}
						if (!this.m_parent_aIInfoObjectHierarchyMember
								.containsKey((iInfoObjectHierarchyMember)
										.getNodeId())) {
							return 0;
						}
						if (!this.supportHierarchyMemberPaging()
								|| (iInfoObjectHierarchyMember.getChildCount() === 0)) {
							return this.m_parent_aIInfoObjectHierarchyMember
									.getByKey(
											(iInfoObjectHierarchyMember)
													.getNodeId()).size();
						}
						return iInfoObjectHierarchyMember.getChildCount();
					},
					hasNextHierarchyMember : function(
							iInfoObjectHierarchyMember) {
						if (iInfoObjectHierarchyMember === null) {
							return false;
						}
						if (sap.firefly.XString
								.isEqual(
										(iInfoObjectHierarchyMember)
												.getNextId(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_INITIAL_ID)) {
							return false;
						}
						return true;
					},
					getNextHierarchyMember : function(
							iInfoObjectHierarchyMember) {
						if (iInfoObjectHierarchyMember === null) {
							return null;
						}
						return this.m_node_aIInfoObjectHierarchyMember
								.getByKey((iInfoObjectHierarchyMember)
										.getNextId());
					},
					getHierarchyMemberByLevel : function(tLevel) {
						if (tLevel === null) {
							return sap.firefly.XList.create();
						}
						return this.m_level_aIInfoObjectHierarchyMember
								.getByKey(tLevel);
					},
					getNumberOfHierarchyMemberByLevel : function(tLevel) {
						if (!this.m_level_aIInfoObjectHierarchyMember
								.containsKey(tLevel)) {
							return 0;
						}
						return this.m_level_aIInfoObjectHierarchyMember
								.getByKey(tLevel).size();
					},
					createHierarchyMember : function() {
						var infoObjectHierarchyMember = sap.firefly.InfoObjectHierarchyMember
								.createIInfoObjectHierarchyMember(this.m_dimension_base);
						var iXIteratorFieldName = this.m_requested_ordered_fields
								.getIterator();
						var fieldName;
						var iQFieldBase;
						var booleanValue;
						var intValue;
						var doubleValue;
						var longValue;
						var dateValue;
						var timeValue;
						while (iXIteratorFieldName.hasNext()) {
							fieldName = iXIteratorFieldName.next();
							iQFieldBase = this.getFieldBaseByName(fieldName);
							if ((sap.firefly.XValueType.STRING === iQFieldBase
									.getValueType())
									|| (sap.firefly.XValueType.LANGUAGE === iQFieldBase
											.getValueType())
									|| (sap.firefly.XValueType.NUMC === iQFieldBase
											.getValueType())) {
								infoObjectHierarchyMember
										.createAndAddFieldValueWithString(
												iQFieldBase, iQFieldBase
														.getInitialValue());
							} else {
								if (sap.firefly.XValueType.BOOLEAN === iQFieldBase
										.getValueType()) {
									booleanValue = sap.firefly.XBoolean
											.convertStringToBoolean(iQFieldBase
													.getInitialValue());
									infoObjectHierarchyMember
											.createAndAddFieldValueWithBoolean(
													iQFieldBase, booleanValue);
								} else {
									if (sap.firefly.XValueType.INTEGER === iQFieldBase
											.getValueType()) {
										intValue = sap.firefly.XInteger
												.convertStringToInteger(iQFieldBase
														.getInitialValue());
										infoObjectHierarchyMember
												.createAndAddFieldValueWithInteger(
														iQFieldBase, intValue);
									} else {
										if (sap.firefly.XValueType.DOUBLE === iQFieldBase
												.getValueType()) {
											doubleValue = sap.firefly.XDouble
													.convertStringToDouble(iQFieldBase
															.getInitialValue());
											infoObjectHierarchyMember
													.createAndAddFieldValueWithDouble(
															iQFieldBase,
															doubleValue);
										} else {
											if (sap.firefly.XValueType.LONG === iQFieldBase
													.getValueType()) {
												longValue = sap.firefly.XLong
														.convertStringToLong(iQFieldBase
																.getInitialValue());
												infoObjectHierarchyMember
														.createAndAddFieldValueWithLong(
																iQFieldBase,
																longValue);
											} else {
												if (sap.firefly.XValueType.DATE === iQFieldBase
														.getValueType()) {
													dateValue = sap.firefly.XDate
															.createDateFromSAPFormat(iQFieldBase
																	.getInitialValue());
													infoObjectHierarchyMember
															.createAndAddFieldValueWithDate(
																	iQFieldBase,
																	dateValue);
												} else {
													if (sap.firefly.XValueType.TIME === iQFieldBase
															.getValueType()) {
														timeValue = sap.firefly.XTime
																.createTimeFromSAPFormat(iQFieldBase
																		.getInitialValue());
														infoObjectHierarchyMember
																.createAndAddFieldValueWithTime(
																		iQFieldBase,
																		timeValue);
													} else {
														throw sap.firefly.XException
																.createIllegalStateException(sap.firefly.XString
																		.concatenate2(
																				"Value type not supported: ",
																				iQFieldBase
																						.getValueType()
																						.getName()));
													}
												}
											}
										}
									}
								}
							}
						}
						return infoObjectHierarchyMember;
					},
					addHierarchyMemberForCheck : function(
							iInfoObjectHierarchyMember, checkOperation) {
						var technicalId = null;
						var iteratorCheckResult;
						var iInfoObjectCheckResultNext;
						var iInfoObjectCheckResult;
						if ((iInfoObjectHierarchyMember === null)
								|| (checkOperation === null)) {
							return technicalId;
						}
						iteratorCheckResult = this.m_hierarchy_member_check
								.getIterator();
						while (iteratorCheckResult.hasNext()) {
							iInfoObjectCheckResultNext = iteratorCheckResult
									.next();
							if (iInfoObjectHierarchyMember === iInfoObjectCheckResultNext
									.getCheckReference()) {
								if (checkOperation === iInfoObjectCheckResultNext
										.getCheckOperation()) {
									return technicalId;
								}
							}
						}
						this.m_line_id = this.m_line_id + 1;
						technicalId = sap.firefly.XInteger
								.convertIntegerToString(this.m_line_id);
						iInfoObjectCheckResult = sap.firefly.InfoObjectCheckResult
								.createIInfoObjectCheckResult(
										iInfoObjectHierarchyMember,
										technicalId, checkOperation, null);
						this.m_hierarchy_member_check
								.add(iInfoObjectCheckResult);
						return technicalId;
					},
					getHierarchyMemberForCheck : function() {
						return this.m_hierarchy_member_check;
					},
					setHierarchyMemberValue : function(
							iInfoObjectHierarchyMember, iQField, iQFieldCMP,
							aIXValue) {
						var iQFieldValue;
						var iXValue;
						var iXListDependentFields;
						var cmpPatternString;
						var dependentFields;
						var value;
						var dependentValues;
						var iQFieldValuePattern;
						var iQFieldValueBasePattern;
						var iQFieldValueBase;
						if (iInfoObjectHierarchyMember === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Node member is not set");
						}
						if ((iQField === null) || (aIXValue === null)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Field or value is not set");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NODE_NAME)) {
							if ((iQFieldCMP !== null)
									&& (iQFieldCMP.getDependencyFields().size() > 0)) {
								if (sap.firefly.XString.isEqual(iQFieldCMP
										.getName(), this.m_dimension_manager
										.getDimension().getName())) {
									if (aIXValue.size() !== (iQFieldCMP
											.getDependencyFields().size() + 1)) {
										throw sap.firefly.XException
												.createIllegalArgumentException("Wrong number of compounded field values are set");
									}
								} else {
									if (aIXValue.size() !== iQFieldCMP
											.getDependencyFields().size()) {
										throw sap.firefly.XException
												.createIllegalArgumentException("Wrong number of compounded field values are set");
									}
								}
							}
						} else {
							if (aIXValue.size() !== 1) {
								throw sap.firefly.XException
										.createIllegalArgumentException("Multiple values are set");
							}
							if (iQField.getValueType() !== aIXValue.get(0)
									.getValueType()) {
								return;
							}
						}
						iQFieldValue = (iInfoObjectHierarchyMember)
								.getFieldValue(iQField);
						if (iQFieldValue === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_OBJECT_VERSION)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: object version");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_HIERARCHY_ID)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: hierarchy id");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NODE_ID)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: node id");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NEXT_ID)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: next id");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_PARENT_ID)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: parent id");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_CHILD_ID)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: child id");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_T_LEVEL)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: level");
						}
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_CMP_PATTERN)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Invalid Field: CMP pattern");
						}
						iXValue = null;
						if (sap.firefly.XString
								.isEqual(
										iQField.getName(),
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NODE_NAME)) {
							if ((iQFieldCMP !== null)
									&& (iQFieldCMP.getDependencyFields().size() > 0)) {
								iXListDependentFields = iQFieldCMP
										.getDependencyFields();
								cmpPatternString = sap.firefly.XString
										.concatenate2(
												sap.firefly.XInteger
														.convertIntegerToString(iXListDependentFields
																.size()),
												sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT);
								for (dependentFields = 0; dependentFields < iXListDependentFields
										.size(); dependentFields++) {
									cmpPatternString = sap.firefly.XString
											.concatenate2(
													cmpPatternString,
													iXListDependentFields
															.get(dependentFields));
									cmpPatternString = sap.firefly.XString
											.concatenate2(
													cmpPatternString,
													sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT);
								}
								if (sap.firefly.XString.isEqual(iQFieldCMP
										.getName(), this.m_dimension_manager
										.getDimension().getName())) {
									cmpPatternString = sap.firefly.XString
											.concatenate2(cmpPatternString,
													this.m_dimension_manager
															.getDimension()
															.getName());
									cmpPatternString = sap.firefly.XString
											.concatenate2(
													cmpPatternString,
													sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT);
								}
								cmpPatternString = sap.firefly.XString
										.concatenate2(
												cmpPatternString,
												sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT_TO_VALUE);
								value = "";
								for (dependentValues = 0; dependentValues < aIXValue
										.size(); dependentValues++) {
									if (sap.firefly.XValueType.STRING !== aIXValue
											.get(dependentValues)
											.getValueType()) {
										throw sap.firefly.XException
												.createIllegalArgumentException(sap.firefly.XString
														.concatenate2(
																"Invalid compounded value type: ",
																aIXValue
																		.get(
																				dependentValues)
																		.getValueType()
																		.getName()));
									}
									cmpPatternString = sap.firefly.XString
											.concatenate2(
													cmpPatternString,
													sap.firefly.XInteger
															.convertIntegerToString(sap.firefly.XString
																	.size((aIXValue
																			.get(dependentValues))
																			.getStringValue())));
									cmpPatternString = sap.firefly.XString
											.concatenate2(
													cmpPatternString,
													sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT_VALUE);
									if (dependentValues === (aIXValue.size() - 1)) {
										cmpPatternString = sap.firefly.XString
												.concatenate2(
														cmpPatternString,
														sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_VALUE);
									}
									value = sap.firefly.XString.concatenate2(
											value, (aIXValue
													.get(dependentValues))
													.getStringValue());
									if (dependentValues < (aIXValue.size() - 1)) {
										value = sap.firefly.XString
												.concatenate2(
														value,
														sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_VALUE);
									}
								}
								iQFieldValuePattern = (iInfoObjectHierarchyMember)
										.getFieldValue(this
												.getFieldByName(sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_CMP_PATTERN));
								iQFieldValueBasePattern = iQFieldValuePattern;
								iQFieldValueBasePattern
										.setValue(sap.firefly.XStringValue
												.create(cmpPatternString));
								iXValue = sap.firefly.XStringValue
										.create(value);
							} else {
								iXValue = aIXValue.get(0);
							}
						} else {
							iXValue = aIXValue.get(0);
						}
						iQFieldValueBase = iQFieldValue;
						iQFieldValueBase.setValue(iXValue);
					},
					addHierarchyMember : function(
							iInfoObjectHierarchyMemberSource,
							iInfoObjectHierarchyMemberTarget,
							hierarchyOperation) {
						var iInfoObjectHierarchyMemberAdd;
						if (iInfoObjectHierarchyMemberSource === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Hierarchy source member is not set");
						}
						if (iInfoObjectHierarchyMemberTarget === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Hierarchy target member is not set");
						}
						if (hierarchyOperation === null) {
							throw sap.firefly.XException
									.createUnsupportedOperationException();
						}
						iInfoObjectHierarchyMemberAdd = this
								.cloneHierarchyMember(iInfoObjectHierarchyMemberSource);
						this
								.addHierarchyMemberValueHelper(
										iInfoObjectHierarchyMemberAdd,
										this
												.getFieldByName(sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NODE_ID),
										sap.firefly.XNumcValue
												.create((iInfoObjectHierarchyMemberTarget)
														.getNodeId()),
										hierarchyOperation);
						this
								.addHierarchyMemberValueHelper(
										iInfoObjectHierarchyMemberAdd,
										this
												.getFieldByName(sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NODE_NAME),
										sap.firefly.XStringValue
												.create(iInfoObjectHierarchyMemberSource
														.getNodeName()),
										hierarchyOperation);
						this
								.addHierarchyMemberValueHelper(
										iInfoObjectHierarchyMemberAdd,
										this
												.getFieldByName(sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_INFO_OBJECT_NAME),
										sap.firefly.XStringValue
												.create(iInfoObjectHierarchyMemberSource
														.getInfoObject()),
										hierarchyOperation);
					},
					addHierarchyMemberValueHelper : function(
							iInfoObjectHierarchyMember, iQField, iXValue,
							hierarchyOperation) {
						var iQFieldValue;
						var iQFieldValueBase;
						var iAddAsChild;
						var iAddAsNext;
						var iAddAsChildLinkNode;
						var iAddAsNextLinkNode;
						if ((iInfoObjectHierarchyMember === null)
								|| (iQField === null) || (iXValue === null)) {
							return;
						}
						if (iQField.getValueType() !== iXValue.getValueType()) {
							return;
						}
						iQFieldValue = (iInfoObjectHierarchyMember)
								.getFieldValue(iQField);
						iQFieldValueBase = null;
						if (iQFieldValue === null) {
							return;
						}
						iQFieldValueBase = (iQFieldValue);
						iQFieldValueBase.setValue(iXValue);
						if (this.m_hierarchy_member_delete
								.contains(iInfoObjectHierarchyMember)) {
							return;
						}
						if (sap.firefly.XString
								.isEqual(
										sap.firefly.InfoObjectHierarchyOperation._ADD_AS_CHILD
												.getName(), hierarchyOperation
												.getName())) {
							if (this.m_hierarchy_member_add_as_child
									.contains(iInfoObjectHierarchyMember)) {
								iAddAsChild = this.m_hierarchy_member_add_as_child
										.getIndex(iInfoObjectHierarchyMember);
								this.m_hierarchy_member_add_as_child
										.set(iAddAsChild,
												iInfoObjectHierarchyMember);
							} else {
								this.m_hierarchy_member_add_as_child
										.add(iInfoObjectHierarchyMember);
							}
						} else {
							if (sap.firefly.XString
									.isEqual(
											sap.firefly.InfoObjectHierarchyOperation._ADD_AS_NEXT
													.getName(),
											hierarchyOperation.getName())) {
								if (this.m_hierarchy_member_add_as_next
										.contains(iInfoObjectHierarchyMember)) {
									iAddAsNext = this.m_hierarchy_member_add_as_next
											.getIndex(iInfoObjectHierarchyMember);
									this.m_hierarchy_member_add_as_next.set(
											iAddAsNext,
											iInfoObjectHierarchyMember);
								} else {
									this.m_hierarchy_member_add_as_next
											.add(iInfoObjectHierarchyMember);
								}
							} else {
								if (sap.firefly.XString
										.isEqual(
												sap.firefly.InfoObjectHierarchyOperation._ADD_CHILD_AS_LINK_NODE
														.getName(),
												hierarchyOperation.getName())) {
									if (this.m_hierarchy_member_add_as_child_link_node
											.contains(iInfoObjectHierarchyMember)) {
										iAddAsChildLinkNode = this.m_hierarchy_member_add_as_child_link_node
												.getIndex(iInfoObjectHierarchyMember);
										this.m_hierarchy_member_add_as_child_link_node
												.set(iAddAsChildLinkNode,
														iInfoObjectHierarchyMember);
									} else {
										this.m_hierarchy_member_add_as_child_link_node
												.add(iInfoObjectHierarchyMember);
									}
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InfoObjectHierarchyOperation._ADD_NEXT_AS_LINK_NODE
															.getName(),
													hierarchyOperation
															.getName())) {
										if (this.m_hierarchy_member_add_as_next_link_node
												.contains(iInfoObjectHierarchyMember)) {
											iAddAsNextLinkNode = this.m_hierarchy_member_add_as_next_link_node
													.getIndex(iInfoObjectHierarchyMember);
											this.m_hierarchy_member_add_as_next_link_node
													.set(iAddAsNextLinkNode,
															iInfoObjectHierarchyMember);
										} else {
											this.m_hierarchy_member_add_as_next_link_node
													.add(iInfoObjectHierarchyMember);
										}
									}
								}
							}
						}
					},
					modifyHierarchyMember : function(
							iInfoObjectHierarchyMemberSource,
							iInfoObjectHierarchyMemberTarget,
							hierarchyOperation) {
						var iInfoObjectHierarchyMember_out;
						var iQFieldAsChild_NodeId;
						var iQFieldValueBaseAsChild_in;
						var iQFieldAsNext_ParentId;
						var iQFieldValueAsChild_out;
						var iQFieldValueBaseAsChild_out;
						var iAddAsChild;
						var iQFieldAsNext_NodeId;
						var iQFieldValueBaseAsNext_in;
						var iQFieldAsNext_NextId;
						var iQFieldValueAsNext_out;
						var iQFieldValueBaseAsNext_out;
						var iAddAsNext;
						if ((iInfoObjectHierarchyMemberSource === null)
								|| (iInfoObjectHierarchyMemberTarget === null)
								|| (hierarchyOperation === null)) {
							return;
						}
						if (this.m_hierarchy_member_delete
								.contains(iInfoObjectHierarchyMemberSource)) {
							return;
						}
						if (this.m_hierarchy_member_add_as_child
								.contains(iInfoObjectHierarchyMemberSource)) {
							return;
						} else {
							if (this.m_hierarchy_member_add_as_next
									.contains(iInfoObjectHierarchyMemberSource)) {
								return;
							} else {
								if (this.m_hierarchy_member_add_as_child_link_node
										.contains(iInfoObjectHierarchyMemberSource)) {
									return;
								} else {
									if (this.m_hierarchy_member_add_as_next_link_node
											.contains(iInfoObjectHierarchyMemberSource)) {
										return;
									} else {
										if (this.m_hierarchy_member_update
												.contains(iInfoObjectHierarchyMemberSource)) {
											return;
										} else {
											if (this.m_hierarchy_member_delete
													.contains(iInfoObjectHierarchyMemberSource)) {
												return;
											}
										}
									}
								}
							}
						}
						iInfoObjectHierarchyMember_out = this
								.cloneHierarchyMember(iInfoObjectHierarchyMemberSource);
						if (sap.firefly.XString
								.isEqual(
										sap.firefly.InfoObjectHierarchyOperation._INSERT_AS_CHILD
												.getName(), hierarchyOperation
												.getName())) {
							iQFieldAsChild_NodeId = this
									.getFieldByName(sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NODE_ID);
							iQFieldValueBaseAsChild_in = (iInfoObjectHierarchyMemberTarget)
									.getFieldValue(iQFieldAsChild_NodeId);
							iQFieldAsNext_ParentId = this
									.getFieldByName(sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_PARENT_ID);
							iQFieldValueAsChild_out = (iInfoObjectHierarchyMember_out)
									.getFieldValue(iQFieldAsNext_ParentId);
							iQFieldValueBaseAsChild_out = iQFieldValueAsChild_out;
							iQFieldValueBaseAsChild_out
									.setValue(sap.firefly.XNumcValue
											.create(iQFieldValueBaseAsChild_in
													.getStringValue()));
							if (this.m_hierarchy_member_move_as_child
									.contains(iInfoObjectHierarchyMemberSource)) {
								iAddAsChild = this.m_hierarchy_member_move_as_child
										.getIndex(iInfoObjectHierarchyMemberSource);
								this.m_hierarchy_member_move_as_child.set(
										iAddAsChild,
										iInfoObjectHierarchyMember_out);
							} else {
								this.m_hierarchy_member_move_as_child
										.add(iInfoObjectHierarchyMember_out);
							}
						} else {
							if (sap.firefly.XString
									.isEqual(
											sap.firefly.InfoObjectHierarchyOperation._INSERT_AS_NEXT
													.getName(),
											hierarchyOperation.getName())) {
								iQFieldAsNext_NodeId = this
										.getFieldByName(sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NODE_ID);
								iQFieldValueBaseAsNext_in = (iInfoObjectHierarchyMemberTarget)
										.getFieldValue(iQFieldAsNext_NodeId);
								iQFieldAsNext_NextId = this
										.getFieldByName(sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NEXT_ID);
								iQFieldValueAsNext_out = (iInfoObjectHierarchyMember_out)
										.getFieldValue(iQFieldAsNext_NextId);
								iQFieldValueBaseAsNext_out = iQFieldValueAsNext_out;
								iQFieldValueBaseAsNext_out
										.setValue(sap.firefly.XNumcValue
												.create(iQFieldValueBaseAsNext_in
														.getStringValue()));
								if (this.m_hierarchy_member_move_as_next
										.contains(iInfoObjectHierarchyMemberSource)) {
									iAddAsNext = this.m_hierarchy_member_move_as_next
											.getIndex(iInfoObjectHierarchyMemberSource);
									this.m_hierarchy_member_move_as_next.set(
											iAddAsNext,
											iInfoObjectHierarchyMember_out);
								} else {
									this.m_hierarchy_member_move_as_next
											.add(iInfoObjectHierarchyMember_out);
								}
							}
						}
					},
					updateHierarchyMember : function(
							iInfoObjectHierarchyMember, iQField, iXValue) {
						var iQFieldValue;
						var iQFieldValueBase;
						var i_update;
						var i_addAsChild;
						var i_addAsNext;
						var i_addAsChildLinkNode;
						var i_addAsNextLinkNode;
						var i_moveAsChild;
						var i_moveAsNext;
						if ((iInfoObjectHierarchyMember === null)
								|| (iQField === null) || (iXValue === null)) {
							return;
						}
						if (iQField.getValueType() !== iXValue.getValueType()) {
							return;
						}
						iQFieldValue = (iInfoObjectHierarchyMember)
								.getFieldValue(iQField);
						if (iQFieldValue === null) {
							return;
						}
						iQFieldValueBase = (iQFieldValue);
						iQFieldValueBase.setValue(iXValue);
						if (this.m_hierarchy_member_delete
								.contains(iInfoObjectHierarchyMember)) {
							return;
						}
						if (this.m_hierarchy_member_update
								.contains(iInfoObjectHierarchyMember)) {
							i_update = this.m_hierarchy_member_update
									.getIndex(iInfoObjectHierarchyMember);
							this.m_hierarchy_member_update.set(i_update,
									iInfoObjectHierarchyMember);
						} else {
							if (this.m_hierarchy_member_add_as_child
									.contains(iInfoObjectHierarchyMember)) {
								i_addAsChild = this.m_hierarchy_member_add_as_child
										.getIndex(iInfoObjectHierarchyMember);
								this.m_hierarchy_member_add_as_child.set(
										i_addAsChild,
										iInfoObjectHierarchyMember);
							} else {
								if (this.m_hierarchy_member_add_as_next
										.contains(iInfoObjectHierarchyMember)) {
									i_addAsNext = this.m_hierarchy_member_add_as_next
											.getIndex(iInfoObjectHierarchyMember);
									this.m_hierarchy_member_add_as_next.set(
											i_addAsNext,
											iInfoObjectHierarchyMember);
								} else {
									if (this.m_hierarchy_member_add_as_child_link_node
											.contains(iInfoObjectHierarchyMember)) {
										i_addAsChildLinkNode = this.m_hierarchy_member_add_as_child_link_node
												.getIndex(iInfoObjectHierarchyMember);
										this.m_hierarchy_member_add_as_child_link_node
												.set(i_addAsChildLinkNode,
														iInfoObjectHierarchyMember);
									} else {
										if (this.m_hierarchy_member_add_as_next_link_node
												.contains(iInfoObjectHierarchyMember)) {
											i_addAsNextLinkNode = this.m_hierarchy_member_add_as_next_link_node
													.getIndex(iInfoObjectHierarchyMember);
											this.m_hierarchy_member_add_as_next_link_node
													.set(i_addAsNextLinkNode,
															iInfoObjectHierarchyMember);
										} else {
											if (this.m_hierarchy_member_move_as_child
													.contains(iInfoObjectHierarchyMember)) {
												i_moveAsChild = this.m_hierarchy_member_move_as_child
														.getIndex(iInfoObjectHierarchyMember);
												this.m_hierarchy_member_move_as_child
														.set(i_moveAsChild,
																iInfoObjectHierarchyMember);
											} else {
												if (this.m_hierarchy_member_move_as_next
														.contains(iInfoObjectHierarchyMember)) {
													i_moveAsNext = this.m_hierarchy_member_move_as_next
															.getIndex(iInfoObjectHierarchyMember);
													this.m_hierarchy_member_move_as_next
															.set(i_moveAsNext,
																	iInfoObjectHierarchyMember);
												} else {
													this.m_hierarchy_member_update
															.add(iInfoObjectHierarchyMember);
												}
											}
										}
									}
								}
							}
						}
					},
					deleteHierarchyMember : function(iInfoObjectHierarchyMember) {
						var i;
						if (iInfoObjectHierarchyMember !== null) {
							if (this.m_hierarchy_member_update
									.contains(iInfoObjectHierarchyMember)) {
								this.m_hierarchy_member_update
										.removeElement(iInfoObjectHierarchyMember);
							} else {
								if (this.m_hierarchy_member_add_as_child
										.contains(iInfoObjectHierarchyMember)) {
									this.m_hierarchy_member_add_as_child
											.removeElement(iInfoObjectHierarchyMember);
								} else {
									if (this.m_hierarchy_member_add_as_next
											.contains(iInfoObjectHierarchyMember)) {
										this.m_hierarchy_member_add_as_next
												.removeElement(iInfoObjectHierarchyMember);
									} else {
										if (this.m_hierarchy_member_add_as_child_link_node
												.contains(iInfoObjectHierarchyMember)) {
											this.m_hierarchy_member_add_as_child_link_node
													.removeElement(iInfoObjectHierarchyMember);
										} else {
											if (this.m_hierarchy_member_add_as_next_link_node
													.contains(iInfoObjectHierarchyMember)) {
												this.m_hierarchy_member_add_as_next_link_node
														.removeElement(iInfoObjectHierarchyMember);
											} else {
												if (this.m_hierarchy_member_move_as_child
														.contains(iInfoObjectHierarchyMember)) {
													this.m_hierarchy_member_move_as_child
															.removeElement(iInfoObjectHierarchyMember);
												} else {
													if (this.m_hierarchy_member_move_as_next
															.contains(iInfoObjectHierarchyMember)) {
														this.m_hierarchy_member_move_as_next
																.removeElement(iInfoObjectHierarchyMember);
													}
												}
											}
										}
									}
								}
							}
							if (this.m_hierarchy_member_delete
									.contains(iInfoObjectHierarchyMember)) {
								i = this.m_hierarchy_member_delete
										.getIndex(iInfoObjectHierarchyMember);
								this.m_hierarchy_member_delete.set(i,
										iInfoObjectHierarchyMember);
							} else {
								this.m_hierarchy_member_delete
										.add(iInfoObjectHierarchyMember);
							}
						}
					},
					cloneHierarchyMember : function(iInfoObjectHierarchyMember) {
						var infoObjectHierarchyMember_out = this
								.createHierarchyMember();
						var iQFieldListReadOnly = this.getFields();
						var iXIteratorField = iQFieldListReadOnly.getIterator();
						var iQField;
						var iQFieldValue_out;
						var iQFieldValueBase_out;
						var iQFieldValueBase_in;
						while (iXIteratorField.hasNext()) {
							iQField = iXIteratorField.next();
							iQFieldValue_out = infoObjectHierarchyMember_out
									.getFieldValue(iQField);
							iQFieldValueBase_out = iQFieldValue_out;
							iQFieldValueBase_in = (iInfoObjectHierarchyMember)
									.getFieldValue(iQField);
							iQFieldValueBase_out.setValue(iQFieldValueBase_in
									.getValue());
						}
						return infoObjectHierarchyMember_out;
					},
					clear : function(infoObjectClearOperation) {
						if (sap.firefly.InfoObjectClearOperation._NONE === infoObjectClearOperation) {
							return;
						}
						if ((sap.firefly.InfoObjectClearOperation._CLEAR_ALL === infoObjectClearOperation)
								|| (sap.firefly.InfoObjectClearOperation._CLEAR_HIERARCHY === infoObjectClearOperation)
								|| (sap.firefly.InfoObjectClearOperation._CLEAR_OPERATION === infoObjectClearOperation)) {
							if (sap.firefly.InfoObjectClearOperation._CLEAR_OPERATION !== infoObjectClearOperation) {
								this.m_hierarchy = sap.firefly.XList.create();
							}
							this.m_hierarchy_add = sap.firefly.XList.create();
							this.m_hierarchy_update = sap.firefly.XList
									.create();
							this.m_hierarchy_delete = sap.firefly.XList
									.create();
							this.m_hierarchy_check = sap.firefly.XList.create();
						}
						if ((sap.firefly.InfoObjectClearOperation._CLEAR_ALL === infoObjectClearOperation)
								|| (sap.firefly.InfoObjectClearOperation._CLEAR_HIERARCHY_MEMBER === infoObjectClearOperation)
								|| (sap.firefly.InfoObjectClearOperation._CLEAR_OPERATION === infoObjectClearOperation)) {
							if (sap.firefly.InfoObjectClearOperation._CLEAR_OPERATION !== infoObjectClearOperation) {
								this.m_root_hierarchy_member = null;
								this.m_root_hierarchy_member_level = null;
								this.m_hierarchy_member = sap.firefly.XList
										.create();
								this.m_node_aIInfoObjectHierarchyMember = sap.firefly.XHashMapByString
										.create();
								this.m_parent_aIInfoObjectHierarchyMember = sap.firefly.XHashMapByString
										.create();
								this.m_level_aIInfoObjectHierarchyMember = sap.firefly.XHashMapByString
										.create();
							}
							this.m_hierarchy_member_add_as_child = sap.firefly.XList
									.create();
							this.m_hierarchy_member_add_as_next = sap.firefly.XList
									.create();
							this.m_hierarchy_member_add_as_child_link_node = sap.firefly.XList
									.create();
							this.m_hierarchy_member_add_as_next_link_node = sap.firefly.XList
									.create();
							this.m_hierarchy_member_update = sap.firefly.XList
									.create();
							this.m_hierarchy_member_delete = sap.firefly.XList
									.create();
							this.m_hierarchy_member_check = sap.firefly.XList
									.create();
							this.m_hierarchy_member_move_as_child = sap.firefly.XList
									.create();
							this.m_hierarchy_member_move_as_next = sap.firefly.XList
									.create();
						}
					},
					serializeToSave : function(iPrStructure, aHierarchy,
							activate) {
						var iPrStructureDataEntries = sap.firefly.PrStructure
								.create();
						var prListValues;
						if (iPrStructure === null) {
							return iPrStructure;
						}
						this.serialzeDimensionContext(iPrStructureDataEntries);
						prListValues = sap.firefly.PrList.create();
						this.m_line_id = 0;
						if (activate) {
							this
									.serialzeValue(
											prListValues,
											aHierarchy,
											sap.firefly.InAConstants.VA_ACTION_ACTIVATE_LINE);
						} else {
							this
									.serialzeValue(
											prListValues,
											aHierarchy,
											sap.firefly.InAConstants.VA_ACTION_SAVE_LINE);
						}
						iPrStructureDataEntries.setElementByName(
								sap.firefly.InAConstants.QY_VALUES,
								prListValues);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_ENTRIES,
								iPrStructureDataEntries);
						return iPrStructure;
					},
					serialize : function(iPrStructure) {
						var iPrStructureDataEntries;
						var prListValues;
						this.serializeDataProvider(iPrStructure);
						iPrStructureDataEntries = sap.firefly.PrStructure
								.create();
						if (iPrStructure === null) {
							return iPrStructure;
						}
						this.serialzeDimensionContext(iPrStructureDataEntries);
						prListValues = sap.firefly.PrList.create();
						this.m_line_id = 0;
						this.serialzeValue(prListValues, this.m_hierarchy_add,
								sap.firefly.InAConstants.VA_ACTION_NEW_LINE);
						this.serialzeValue(prListValues,
								this.m_hierarchy_update,
								sap.firefly.InAConstants.VA_ACTION_NEW_VALUES);
						this.serialzeValue(prListValues,
								this.m_hierarchy_delete,
								sap.firefly.InAConstants.VA_ACTION_DELETE_LINE);
						iPrStructureDataEntries.setElementByName(
								sap.firefly.InAConstants.QY_VALUES,
								prListValues);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_ENTRIES,
								iPrStructureDataEntries);
						return iPrStructure;
					},
					serializeDataProvider : function(iPrStructure) {
						var prListDataProvider = sap.firefly.PrList.create();
						var xIteratorKey = this.m_hierarchy_load
								.getKeysAsIteratorOfString();
						var iPrStructureProvider;
						var hierarchyName;
						var iDataContainer;
						var iPrStructureData;
						while (xIteratorKey.hasNext()) {
							iPrStructureProvider = sap.firefly.PrStructure
									.create();
							hierarchyName = xIteratorKey.next();
							iDataContainer = this.m_hierarchy_load
									.getByKey(hierarchyName);
							(iDataContainer).setReferenceId(hierarchyName);
							iPrStructureData = sap.firefly.DataContainerManager
									.serialize(
											sap.firefly.HttpContentType.APPLICATION_JSON,
											iDataContainer);
							iPrStructureProvider.setElementByName(
									sap.firefly.InAConstants.QY_DATA,
									iPrStructureData);
							prListDataProvider.add(iPrStructureProvider);
						}
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_PROVIDER,
								prListDataProvider);
						return iPrStructure;
					},
					serializeMember : function(iPrStructure) {
						var iPrStructureDataEntries = sap.firefly.PrStructure
								.create();
						var prListValues;
						if (iPrStructure === null) {
							return iPrStructure;
						}
						this
								.serialzeMemberDimensionContext(iPrStructureDataEntries);
						prListValues = sap.firefly.PrList.create();
						this.m_line_id = 0;
						this
								.serialzeMemberValue(
										prListValues,
										this.m_hierarchy_member_add_as_child,
										sap.firefly.InfoObjectHierarchyOperation._ADD_AS_CHILD
												.getName());
						this
								.serialzeMemberValue(
										prListValues,
										this.m_hierarchy_member_add_as_next,
										sap.firefly.InfoObjectHierarchyOperation._ADD_AS_NEXT
												.getName());
						this
								.serialzeMemberValue(
										prListValues,
										this.m_hierarchy_member_add_as_child_link_node,
										sap.firefly.InfoObjectHierarchyOperation._ADD_CHILD_AS_LINK_NODE
												.getName());
						this
								.serialzeMemberValue(
										prListValues,
										this.m_hierarchy_member_add_as_next_link_node,
										sap.firefly.InfoObjectHierarchyOperation._ADD_NEXT_AS_LINK_NODE
												.getName());
						this.serialzeMemberValue(prListValues,
								this.m_hierarchy_member_update,
								sap.firefly.InAConstants.VA_ACTION_NEW_VALUES);
						this.serialzeMemberValue(prListValues,
								this.m_hierarchy_member_delete,
								sap.firefly.InAConstants.VA_ACTION_DELETE_LINE);
						this
								.serialzeMemberValue(
										prListValues,
										this.m_hierarchy_member_move_as_child,
										sap.firefly.InfoObjectHierarchyOperation._INSERT_AS_CHILD
												.getName());
						this
								.serialzeMemberValue(
										prListValues,
										this.m_hierarchy_member_move_as_next,
										sap.firefly.InfoObjectHierarchyOperation._INSERT_AS_NEXT
												.getName());
						iPrStructureDataEntries.setElementByName(
								sap.firefly.InAConstants.QY_VALUES,
								prListValues);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_ENTRIES,
								iPrStructureDataEntries);
						return iPrStructure;
					},
					serializeMemberCheck : function(iPrStructure) {
						var iPrStructureDataEntries = sap.firefly.PrStructure
								.create();
						var prListValues;
						if (iPrStructure === null) {
							return iPrStructure;
						}
						this
								.serialzeMemberDimensionContext(iPrStructureDataEntries);
						prListValues = sap.firefly.PrList.create();
						this
								.serialzeMemberCheckValue(
										prListValues,
										this.m_hierarchy_member_check,
										sap.firefly.InAConstants.VA_ACTION_CHECK_DUPLICATES);
						iPrStructureDataEntries.setElementByName(
								sap.firefly.InAConstants.QY_VALUES,
								prListValues);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_ENTRIES,
								iPrStructureDataEntries);
						return iPrStructure;
					},
					serializeCheck : function(iPrStructure) {
						var iPrStructureDataEntries = sap.firefly.PrStructure
								.create();
						var prListValues;
						if (iPrStructure === null) {
							return iPrStructure;
						}
						this.serialzeDimensionContext(iPrStructureDataEntries);
						prListValues = sap.firefly.PrList.create();
						this.serialzeCheckValue(prListValues,
								this.m_hierarchy_check);
						iPrStructureDataEntries.setElementByName(
								sap.firefly.InAConstants.QY_VALUES,
								prListValues);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_ENTRIES,
								iPrStructureDataEntries);
						return iPrStructure;
					},
					createDimension : function() {
						var iQDimensionMemberBase = null;
						var iQDimensionListReadOnly;
						var context = this.m_hierarchy_value_help.getContext();
						var aIQDimension;
						var iQDimension;
						var iQFieldListReadOnly;
						var iXIteratorField;
						var iQFieldBase;
						var booleanValue;
						var intValue;
						var doubleValue;
						var longValue;
						var dateValue;
						var timeValue;
						if ((context !== null)
								&& (context.getQueryModel() !== null)) {
							iQDimensionListReadOnly = context.getQueryModel()
									.getDimensions();
						} else {
							iQDimensionListReadOnly = this.m_hierarchy_value_help
									.getQueryModel().getDimensions();
						}
						aIQDimension = iQDimensionListReadOnly.getIterator();
						while (aIQDimension.hasNext()) {
							iQDimension = aIQDimension.next();
							iQDimensionMemberBase = sap.firefly.InfoObjectQDimensionMember
									.createQDimensionMember(iQDimension);
							iQFieldListReadOnly = iQDimension
									.getFieldContainer().getFields();
							iXIteratorField = iQFieldListReadOnly.getIterator();
							while (iXIteratorField.hasNext()) {
								iQFieldBase = iXIteratorField.next();
								if ((sap.firefly.XValueType.STRING === iQFieldBase
										.getValueType())
										|| (sap.firefly.XValueType.LANGUAGE === iQFieldBase
												.getValueType())
										|| (sap.firefly.XValueType.NUMC === iQFieldBase
												.getValueType())) {
									iQDimensionMemberBase
											.createAndAddFieldValueWithString(
													iQFieldBase, iQFieldBase
															.getInitialValue());
								} else {
									if (sap.firefly.XValueType.BOOLEAN === iQFieldBase
											.getValueType()) {
										booleanValue = sap.firefly.XBoolean
												.convertStringToBoolean(iQFieldBase
														.getInitialValue());
										iQDimensionMemberBase
												.createAndAddFieldValueWithBoolean(
														iQFieldBase,
														booleanValue);
									} else {
										if (sap.firefly.XValueType.INTEGER === iQFieldBase
												.getValueType()) {
											intValue = sap.firefly.XInteger
													.convertStringToInteger(iQFieldBase
															.getInitialValue());
											iQDimensionMemberBase
													.createAndAddFieldValueWithInteger(
															iQFieldBase,
															intValue);
										} else {
											if (sap.firefly.XValueType.DOUBLE === iQFieldBase
													.getValueType()) {
												doubleValue = sap.firefly.XDouble
														.convertStringToDouble(iQFieldBase
																.getInitialValue());
												iQDimensionMemberBase
														.createAndAddFieldValueWithDouble(
																iQFieldBase,
																doubleValue);
											} else {
												if (sap.firefly.XValueType.LONG === iQFieldBase
														.getValueType()) {
													longValue = sap.firefly.XLong
															.convertStringToLong(iQFieldBase
																	.getInitialValue());
													iQDimensionMemberBase
															.createAndAddFieldValueWithLong(
																	iQFieldBase,
																	longValue);
												} else {
													if (sap.firefly.XValueType.DATE === iQFieldBase
															.getValueType()) {
														dateValue = sap.firefly.XDate
																.createDateFromSAPFormat(iQFieldBase
																		.getInitialValue());
														iQDimensionMemberBase
																.createAndAddFieldValueWithDate(
																		iQFieldBase,
																		dateValue);
													} else {
														if (sap.firefly.XValueType.TIME === iQFieldBase
																.getValueType()) {
															timeValue = sap.firefly.XTime
																	.createTimeFromSAPFormat(iQFieldBase
																			.getInitialValue());
															iQDimensionMemberBase
																	.createAndAddFieldValueWithTime(
																			iQFieldBase,
																			timeValue);
														} else {
															throw sap.firefly.XException
																	.createIllegalStateException(sap.firefly.XString
																			.concatenate2(
																					"Value type not supported: ",
																					iQFieldBase
																							.getValueType()
																							.getName()));
														}
													}
												}
											}
										}
									}
								}
								this.addRequestedOrderedField(iQFieldBase
										.getName());
							}
							this.m_dimension_member_value_help
									.add(iQDimensionMemberBase);
						}
						return this.m_dimension_member_value_help;
					},
					serialzeDimensionContext : function(iPrStructure) {
						var prListDimensionContext = sap.firefly.PrList
								.create();
						var aIQDimensionMemberDimensionContext;
						var aIQDimensionMember;
						var xIteratorDimensionMemberContext;
						var xIteratorDimensionMember;
						var iQDimensionMember;
						var aIQFieldValue;
						var iXIteratorFieldName;
						var fieldName;
						if (iPrStructure === null) {
							return prListDimensionContext;
						}
						aIQDimensionMemberDimensionContext = this.m_dimension_member_value_help;
						if ((aIQDimensionMemberDimensionContext === null)
								|| (aIQDimensionMemberDimensionContext
										.isEmpty())) {
							aIQDimensionMemberDimensionContext = sap.firefly.XList
									.create();
							aIQDimensionMember = this.createDimension();
							xIteratorDimensionMemberContext = aIQDimensionMember
									.getIterator();
							while (xIteratorDimensionMemberContext.hasNext()) {
								aIQDimensionMemberDimensionContext
										.add(xIteratorDimensionMemberContext
												.next());
							}
						}
						xIteratorDimensionMember = aIQDimensionMemberDimensionContext
								.getIterator();
						while (xIteratorDimensionMember.hasNext()) {
							iQDimensionMember = xIteratorDimensionMember.next();
							aIQFieldValue = iQDimensionMember
									.getAllFieldValues();
							iXIteratorFieldName = aIQFieldValue
									.getKeysAsIteratorOfString();
							while (iXIteratorFieldName.hasNext()) {
								fieldName = iXIteratorFieldName.next();
								prListDimensionContext.addString(fieldName);
							}
						}
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DIMENSION_CONTEXT,
								prListDimensionContext);
						return prListDimensionContext;
					},
					serialzeCheckValue : function(iPrList,
							aIInfoObjectCheckResult) {
						var iXIteratorCheck;
						var iInfoObjectCheckResult;
						var iPrStructureValue;
						if ((iPrList === null)
								|| (aIInfoObjectCheckResult === null)) {
							return iPrList;
						}
						iXIteratorCheck = aIInfoObjectCheckResult.getIterator();
						while (iXIteratorCheck.hasNext()) {
							iInfoObjectCheckResult = iXIteratorCheck.next();
							if ((iInfoObjectCheckResult.getCheckOperation() !== sap.firefly.InfoObjectCheckOperation._CHECK_ALL)
									&& (iInfoObjectCheckResult
											.getCheckOperation() !== sap.firefly.InfoObjectCheckOperation._CHECK_HIERARCHY)) {
								return iPrList;
							}
							iPrStructureValue = sap.firefly.PrStructure
									.create();
							iPrStructureValue.setStringByName(
									sap.firefly.InAConstants.QY_ACTION,
									iInfoObjectCheckResult.getCheckOperation()
											.getName());
							iPrStructureValue
									.setIntegerByName(
											sap.firefly.InAConstants.QY_LINE_ID,
											sap.firefly.XInteger
													.convertStringToInteger((iInfoObjectCheckResult)
															.getTechnicalId()));
							this.serialzeKeys(iPrStructureValue,
									iInfoObjectCheckResult.getCheckReference());
							iPrList.add(iPrStructureValue);
						}
						return iPrList;
					},
					serialzeValue : function(iPrList, aIQHierarchy, action) {
						var xIteratorHierarchy;
						var iQHierarchy;
						var iPrStructureValue;
						if ((iPrList === null) || (aIQHierarchy === null)) {
							return iPrList;
						}
						if (!sap.firefly.XString.isEqual(action,
								sap.firefly.InAConstants.VA_ACTION_NEW_LINE)
								&& !sap.firefly.XString
										.isEqual(
												action,
												sap.firefly.InAConstants.VA_ACTION_NEW_VALUES)
								&& !sap.firefly.XString
										.isEqual(
												action,
												sap.firefly.InAConstants.VA_ACTION_DELETE_LINE)
								&& !sap.firefly.XString
										.isEqual(
												action,
												sap.firefly.InAConstants.VA_ACTION_SAVE_LINE)
								&& !sap.firefly.XString
										.isEqual(
												action,
												sap.firefly.InAConstants.VA_ACTION_ACTIVATE_LINE)) {
							return iPrList;
						}
						xIteratorHierarchy = aIQHierarchy.getIterator();
						while (xIteratorHierarchy.hasNext()) {
							iQHierarchy = xIteratorHierarchy.next();
							iPrStructureValue = sap.firefly.PrStructure
									.create();
							iPrStructureValue.setStringByName(
									sap.firefly.InAConstants.QY_ACTION, action);
							iPrStructureValue.setIntegerByName(
									sap.firefly.InAConstants.QY_LINE_ID,
									this.m_line_id);
							this.serialzeKeys(iPrStructureValue, iQHierarchy);
							iPrList.add(iPrStructureValue);
							this.m_line_id = this.m_line_id + 1;
						}
						return iPrList;
					},
					serialzeKeys : function(iPrStructure, iQHierarchy) {
						var prListKeys = sap.firefly.PrList.create();
						var xIteratorDimensionMemberKey;
						var iQDimensionMember;
						var aIQFieldValueKey;
						var xIteratorIQFieldValueKey;
						var iQFieldValueKey;
						var iQFieldValueNameKey;
						if (iPrStructure === null) {
							return prListKeys;
						}
						xIteratorDimensionMemberKey = this.m_dimension_member_value_help
								.getIterator();
						while (xIteratorDimensionMemberKey.hasNext()) {
							iQDimensionMember = xIteratorDimensionMemberKey
									.next();
							aIQFieldValueKey = iQDimensionMember
									.getAllFieldValues();
							xIteratorIQFieldValueKey = aIQFieldValueKey
									.getIterator();
							while (xIteratorIQFieldValueKey.hasNext()) {
								iQFieldValueKey = xIteratorIQFieldValueKey
										.next();
								iQFieldValueNameKey = iQFieldValueKey
										.getField().getName();
								if (sap.firefly.XString
										.isEqual(
												sap.firefly.HierarchyCatalogManager.BW_A_NAME_KEY,
												iQFieldValueNameKey)) {
									prListKeys.addString(iQHierarchy
											.getHierarchyName());
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.HierarchyCatalogManager.BW_A_OWNER_KEY,
													iQFieldValueNameKey)) {
										prListKeys.addString(iQHierarchy
												.getOwner());
									} else {
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.HierarchyCatalogManager.BW_A_TEXT_SHORT_TEXT,
														iQFieldValueNameKey)) {
											prListKeys.addString(iQHierarchy
													.getHierarchyDescription());
										} else {
											if (sap.firefly.XString
													.isEqual(
															sap.firefly.HierarchyCatalogManager.BW_A_TEXT_MEDIUM_TEXT,
															iQFieldValueNameKey)) {
												prListKeys
														.addString(iQHierarchy
																.getHierarchyDescription());
											} else {
												if (sap.firefly.XString
														.isEqual(
																sap.firefly.HierarchyCatalogManager.BW_A_TEXT_LONG_TEXT,
																iQFieldValueNameKey)) {
													prListKeys
															.addString(iQHierarchy
																	.getHierarchyDescription());
												} else {
													if (sap.firefly.XString
															.isEqual(
																	sap.firefly.HierarchyCatalogManager.BW_A_DATE_TO_KEY,
																	iQFieldValueNameKey)) {
														prListKeys
																.addString(iQHierarchy
																		.getDateTo()
																		.toSAPFormat());
													} else {
														if (sap.firefly.XString
																.isEqual(
																		sap.firefly.HierarchyCatalogManager.BW_A_DATE_FROM_KEY,
																		iQFieldValueNameKey)) {
															prListKeys
																	.addString(iQHierarchy
																			.getDateFrom()
																			.toSAPFormat());
														} else {
															if (sap.firefly.XString
																	.isEqual(
																			sap.firefly.HierarchyCatalogManager.BW_A_HIEID_KEY,
																			iQFieldValueNameKey)) {
																prListKeys
																		.addString(iQHierarchy
																				.getHierId());
															} else {
																if (sap.firefly.XString
																		.isEqual(
																				sap.firefly.HierarchyCatalogManager.BW_A_HIETYPE_KEY,
																				iQFieldValueNameKey)) {
																	prListKeys
																			.addString(iQHierarchy
																					.getHierType());
																} else {
																	if (sap.firefly.XString
																			.isEqual(
																					sap.firefly.HierarchyCatalogManager.BW_A_OBJVERS_KEY,
																					iQFieldValueNameKey)) {
																		prListKeys
																				.addString(iQHierarchy
																						.getObjectVersion());
																	} else {
																		if (sap.firefly.XString
																				.isEqual(
																						sap.firefly.HierarchyCatalogManager.BW_A_VERSION_KEY,
																						iQFieldValueNameKey)) {
																			prListKeys
																					.addString(iQHierarchy
																							.getHierarchyVersion());
																		} else {
																			if (sap.firefly.XString
																					.isEqual(
																							sap.firefly.HierarchyCatalogManager.BW_A_VERSION_LONG_TEXT,
																							iQFieldValueNameKey)) {
																				prListKeys
																						.addString(iQHierarchy
																								.getVersionDescription());
																			} else {
																				if (sap.firefly.XString
																						.isEqual(
																								sap.firefly.HierarchyCatalogManager.BW_A_IS_REMOTE_KEY,
																								iQFieldValueNameKey)) {
																					if (iQHierarchy
																							.isRemote()) {
																						prListKeys
																								.addString(sap.firefly.InAConstants.VA_ABAP_TRUE);
																					} else {
																						prListKeys
																								.addString(sap.firefly.InAConstants.VA_ABAP_FALSE);
																					}
																				} else {
																					prListKeys
																							.addString("");
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_KEYS, prListKeys);
						return prListKeys;
					},
					serialzeMemberDimensionContext : function(iPrStructure) {
						var prListDimensionContext = sap.firefly.PrList
								.create();
						var aIInfoObjectHierarchyMember;
						var xIteratorHierarchyMember;
						var iInfoObjectHierarchyMember;
						var aIQFieldValue;
						var iXIteratorFieldName;
						var fieldName;
						if (iPrStructure === null) {
							return prListDimensionContext;
						}
						aIInfoObjectHierarchyMember = this.m_hierarchy_member;
						if ((aIInfoObjectHierarchyMember === null)
								|| (aIInfoObjectHierarchyMember.isEmpty())) {
							aIInfoObjectHierarchyMember = sap.firefly.XList
									.create();
							aIInfoObjectHierarchyMember.add(this
									.createHierarchyMember());
						}
						xIteratorHierarchyMember = aIInfoObjectHierarchyMember
								.getIterator();
						while (xIteratorHierarchyMember.hasNext()) {
							iInfoObjectHierarchyMember = xIteratorHierarchyMember
									.next();
							aIQFieldValue = (iInfoObjectHierarchyMember)
									.getAllFieldValues();
							iXIteratorFieldName = aIQFieldValue
									.getKeysAsIteratorOfString();
							while (iXIteratorFieldName.hasNext()) {
								fieldName = iXIteratorFieldName.next();
								prListDimensionContext.addString(fieldName);
							}
							break;
						}
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DIMENSION_CONTEXT,
								prListDimensionContext);
						return prListDimensionContext;
					},
					serialzeMemberCheckValue : function(iPrList,
							aIInfoObjectCheckResult, action) {
						var iXIteratorCheck;
						var iInfoObjectCheckResult;
						var iPrStructureValue;
						if ((iPrList === null)
								|| (aIInfoObjectCheckResult === null)) {
							return iPrList;
						}
						if (!sap.firefly.XString
								.isEqual(
										action,
										sap.firefly.InAConstants.VA_ACTION_CHECK_DUPLICATES)) {
							return iPrList;
						}
						iXIteratorCheck = aIInfoObjectCheckResult.getIterator();
						while (iXIteratorCheck.hasNext()) {
							iInfoObjectCheckResult = iXIteratorCheck.next();
							iPrStructureValue = sap.firefly.PrStructure
									.create();
							iPrStructureValue.setStringByName(
									sap.firefly.InAConstants.QY_ACTION, action);
							iPrStructureValue
									.setIntegerByName(
											sap.firefly.InAConstants.QY_LINE_ID,
											sap.firefly.XInteger
													.convertStringToInteger((iInfoObjectCheckResult)
															.getTechnicalId()));
							this.serialzeMemberKeys(iPrStructureValue,
									iInfoObjectCheckResult.getCheckReference());
							iPrList.add(iPrStructureValue);
						}
						return iPrList;
					},
					serialzeMemberValue : function(iPrList,
							aIInfoObjectHierarchyMember, action) {
						var xIteratorHierarchyMember;
						var iInfoObjectHierarchyMember;
						var iPrStructureValue;
						if ((iPrList === null)
								|| (aIInfoObjectHierarchyMember === null)) {
							return iPrList;
						}
						xIteratorHierarchyMember = aIInfoObjectHierarchyMember
								.getIterator();
						while (xIteratorHierarchyMember.hasNext()) {
							iInfoObjectHierarchyMember = xIteratorHierarchyMember
									.next();
							iPrStructureValue = sap.firefly.PrStructure
									.create();
							iPrStructureValue.setStringByName(
									sap.firefly.InAConstants.QY_ACTION, action);
							iPrStructureValue.setIntegerByName(
									sap.firefly.InAConstants.QY_LINE_ID,
									this.m_line_id);
							this.serialzeMemberKeys(iPrStructureValue,
									iInfoObjectHierarchyMember);
							iPrList.add(iPrStructureValue);
							this.m_line_id = this.m_line_id + 1;
						}
						return iPrList;
					},
					serialzeMemberKeys : function(iPrStructure,
							iInfoObjectHierarchyMember) {
						var prListKeys = sap.firefly.PrList.create();
						var aIQFieldValue;
						var iXIteratorFieldValue;
						var xIteratorFieldValue;
						var iQFieldValue;
						if (iPrStructure === null) {
							return prListKeys;
						}
						aIQFieldValue = (iInfoObjectHierarchyMember)
								.getAllFieldValues();
						iXIteratorFieldValue = aIQFieldValue
								.getValuesAsReadOnlyList();
						xIteratorFieldValue = iXIteratorFieldValue
								.getIterator();
						while (xIteratorFieldValue.hasNext()) {
							iQFieldValue = xIteratorFieldValue.next();
							if ((sap.firefly.XValueType.STRING === iQFieldValue
									.getValueType())
									|| (sap.firefly.XValueType.LANGUAGE === iQFieldValue
											.getValueType())
									|| (sap.firefly.XValueType.NUMC === iQFieldValue
											.getValueType())) {
								prListKeys.addString(iQFieldValue
										.getStringValue());
							} else {
								if (sap.firefly.XValueType.BOOLEAN === iQFieldValue
										.getValueType()) {
									prListKeys
											.addString(sap.firefly.XBoolean
													.convertBooleanToString(iQFieldValue
															.getBooleanValue()));
								} else {
									if (sap.firefly.XValueType.INTEGER === iQFieldValue
											.getValueType()) {
										prListKeys
												.addString(sap.firefly.XInteger
														.convertIntegerToString(iQFieldValue
																.getIntegerValue()));
									} else {
										if (sap.firefly.XValueType.DOUBLE === iQFieldValue
												.getValueType()) {
											prListKeys
													.addString(sap.firefly.XDouble
															.convertDoubleToString(iQFieldValue
																	.getDoubleValue()));
										} else {
											if (sap.firefly.XValueType.LONG === iQFieldValue
													.getValueType()) {
												prListKeys
														.addString(sap.firefly.XLong
																.convertLongToString(iQFieldValue
																		.getLongValue()));
											} else {
												if (sap.firefly.XValueType.DATE === iQFieldValue
														.getValueType()) {
													prListKeys
															.addString(iQFieldValue
																	.getDateValue()
																	.toSAPFormat());
												} else {
													if (sap.firefly.XValueType.TIME === iQFieldValue
															.getValueType()) {
														prListKeys
																.addString(iQFieldValue
																		.getTimeValue()
																		.toSAPFormat());
													} else {
														throw sap.firefly.XException
																.createIllegalStateException(sap.firefly.XString
																		.concatenate2(
																				"Value type not supported: ",
																				iQFieldValue
																						.getValueType()
																						.getName()));
													}
												}
											}
										}
									}
								}
							}
						}
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_KEYS, prListKeys);
						return prListKeys;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectCapabilities",
				sap.firefly.InACapabilitiesProvider,
				{
					$statics : {
						CLIENT_QUERY_PERSISTENCY_CAPABILITIES : null,
						CLIENT_PLANNING_COMMAND_MAIN_CAPABILITIES : null,
						create : function(serverMetadata, providerType) {
							var inaCapabilities = new sap.firefly.QInfoObjectCapabilities();
							var serverMainCapabilitiesForProviderType;
							var betaMetadataForAnalytic;
							var metadataForService;
							if (providerType === sap.firefly.ProviderType.PLANNING_COMMAND) {
								inaCapabilities.m_clientMainCapabilities = sap.firefly.QInfoObjectCapabilities.CLIENT_PLANNING_COMMAND_MAIN_CAPABILITIES;
							} else {
								inaCapabilities.m_clientMainCapabilities = sap.firefly.InACapabilitiesProvider
										.createMainCapabilities(serverMetadata
												.getSession().getVersion());
							}
							if ((serverMetadata !== null)
									&& (providerType !== null)) {
								serverMainCapabilitiesForProviderType = sap.firefly.QInfoObjectCapabilities
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
						}
					},
					m_serverPersistencyCapabilities : null,
					m_activePersistencyCapabilities : null,
					getClientPersistencyCapabilities : function() {
						return sap.firefly.QInfoObjectCapabilities.CLIENT_QUERY_PERSISTENCY_CAPABILITIES;
					},
					getServerPersistencyCapabilities : function() {
						return this.m_serverPersistencyCapabilities;
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
					}
				});
$Firefly
		.createClass(
				"sap.firefly.AINXProvider",
				sap.firefly.XObject,
				{
					$statics : {
						createIProvider : function(name, prefix, description,
								providerType, action, aIAttribute, isWritable,
								audit) {
							var iProvider = new sap.firefly.AINXProvider();
							iProvider.setup(name, prefix, description,
									providerType, action, aIAttribute,
									isWritable, audit);
							return iProvider;
						}
					},
					m_name : null,
					m_prefix : null,
					m_description : null,
					m_provider_type : null,
					m_action : null,
					m_action_prefix : null,
					m_aIAttribute : null,
					m_aIAggregationLevel : null,
					m_aIReference : null,
					m_plan_query : null,
					m_isWritable : false,
					m_audit : null,
					m_count : 0,
					setup : function(name, prefix, description, providerType,
							action, aIAttribute, isWritable, audit) {
						var iXIteratorIAttributeSetup;
						var iAttributeSetup;
						var isEqualSetup;
						var iSetup;
						var iAttributeSetupInstance;
						this.m_name = name;
						this.m_prefix = prefix;
						this.m_description = description;
						this.m_provider_type = providerType;
						this.m_action = action;
						this.m_action_prefix = null;
						this.m_aIAttribute = sap.firefly.XList.create();
						if (aIAttribute !== null) {
							iXIteratorIAttributeSetup = aIAttribute
									.getIterator();
							while (iXIteratorIAttributeSetup.hasNext()) {
								iAttributeSetup = iXIteratorIAttributeSetup
										.next();
								isEqualSetup = false;
								for (iSetup = 0; iSetup < this.m_aIAttribute
										.size(); iSetup++) {
									iAttributeSetupInstance = this.m_aIAttribute
											.get(iSetup);
									if (iAttributeSetupInstance
											.compareTo(iAttributeSetup) === 0) {
										isEqualSetup = true;
										break;
									}
								}
								if (isEqualSetup === false) {
									this.m_aIAttribute.add(iAttributeSetup);
								}
							}
						}
						this.m_isWritable = isWritable;
						this.m_audit = audit;
						this.m_aIAggregationLevel = sap.firefly.XHashMapByString
								.create();
						this.m_aIReference = sap.firefly.XHashMapByString
								.create();
					},
					getName : function() {
						return this.m_name;
					},
					setPrefix : function(prefix) {
						if (prefix !== null) {
							this.m_prefix = prefix;
						}
					},
					getID : function() {
						var iXStringBufferID = sap.firefly.XStringBuffer
								.create();
						iXStringBufferID
								.append(sap.firefly.InAConstants.QY_LOCAL_PROVIDER_PREFIX);
						if (this.m_prefix !== null) {
							iXStringBufferID.append(this.m_prefix);
						}
						iXStringBufferID.append(this.m_name);
						return iXStringBufferID.toString();
					},
					getDescription : function() {
						return this.m_description;
					},
					setDescription : function(description) {
						this.m_description = description;
					},
					getProviderType : function() {
						return this.m_provider_type;
					},
					getAction : function() {
						return this.m_action;
					},
					setAction : function(action) {
						this.m_action = action;
					},
					setActionPrefix : function(prefix) {
						this.m_action_prefix = prefix;
					},
					createIAttribute : function(name, description, reference,
							dataT, isKeyFigure) {
						return sap.firefly.AttributeManager.createIAttribute(
								name, description, reference,
								sap.firefly.DataTManager.createIDataT(dataT, 0,
										0, false), isKeyFigure);
					},
					addIAttribute : function(iAttribute) {
						var isEqualAdd;
						var indexAddIAttribute;
						var iXIteratorAddIAttribute;
						var iAttributeAddIAttribute;
						var compareResult;
						if (iAttribute !== null) {
							isEqualAdd = false;
							indexAddIAttribute = 0;
							iXIteratorAddIAttribute = this.m_aIAttribute
									.getIterator();
							while (iXIteratorAddIAttribute.hasNext()) {
								iAttributeAddIAttribute = iXIteratorAddIAttribute
										.next();
								compareResult = sap.firefly.XString.compare(
										iAttributeAddIAttribute.getName(),
										iAttribute.getName());
								if (compareResult !== 0) {
									indexAddIAttribute = indexAddIAttribute + 1;
								}
								if (compareResult === 0) {
									isEqualAdd = true;
									break;
								}
							}
							if (isEqualAdd) {
								this.m_aIAttribute.set(indexAddIAttribute,
										iAttribute);
							} else {
								this.m_aIAttribute.insert(this.m_aIAttribute
										.size(), iAttribute);
							}
						}
					},
					getIAttributes : function() {
						var aIAttribute = sap.firefly.XList.create();
						var iXIteratorIAttribute = this.m_aIAttribute
								.getIterator();
						while (iXIteratorIAttribute.hasNext()) {
							aIAttribute.add(iXIteratorIAttribute.next());
						}
						return aIAttribute;
					},
					getIAttributeByName : function(name) {
						var iXIterator = this.m_aIAttribute.getIterator();
						var iAttribute;
						while (iXIterator.hasNext()) {
							iAttribute = iXIterator.next();
							if (sap.firefly.XString.isEqual(iAttribute
									.getName(), name)) {
								return iAttribute;
							}
						}
						return null;
					},
					addIAggregationLevel : function(iAggregationLevel) {
						if (iAggregationLevel !== null) {
							if (!this.m_aIAggregationLevel
									.containsKey(iAggregationLevel.getName())) {
								this.m_aIAggregationLevel.put(iAggregationLevel
										.getName(), iAggregationLevel);
							}
						}
					},
					clearIAttributes : function() {
						this.m_aIAttribute = sap.firefly.XList.create();
					},
					getAggregationLevel : function(aggregationLevel) {
						if (aggregationLevel === null) {
							return null;
						}
						if (this.m_aIAggregationLevel
								.containsKey(aggregationLevel)) {
							return this.m_aIAggregationLevel
									.getByKey(aggregationLevel);
						}
						return null;
					},
					getAggregationLevels : function() {
						var aIAggregationLevel = sap.firefly.XList.create();
						var iXIteratorAggregationLevel = this.m_aIAggregationLevel
								.getIterator();
						while (iXIteratorAggregationLevel.hasNext()) {
							aIAggregationLevel.add(iXIteratorAggregationLevel
									.next());
						}
						return aIAggregationLevel;
					},
					setPlanQuery : function(query) {
						this.m_plan_query = query;
					},
					getPlanQuery : function() {
						return this.m_plan_query;
					},
					getIsWritable : function() {
						return this.m_isWritable;
					},
					setIsWritable : function(isWritable) {
						this.m_isWritable = isWritable;
					},
					getAuditType : function() {
						return this.m_audit;
					},
					setAuditType : function(audit) {
						this.m_audit = audit;
					},
					getDeltaRowCount : function() {
						return this.m_count;
					},
					setDeltaRowCount : function(count) {
						this.m_count = count;
					},
					addIReference : function(iReference) {
						if (iReference !== null) {
							if (!this.m_aIReference.containsKey(iReference
									.getName())) {
								this.m_aIReference.put(iReference.getName(),
										iReference);
							}
						}
					},
					getIReferences : function(tlogo) {
						var aIReference = sap.firefly.XList.create();
						var iXIteratorReference = this.m_aIReference
								.getIterator();
						var iReferenceGet;
						while (iXIteratorReference.hasNext()) {
							iReferenceGet = iXIteratorReference.next();
							if (tlogo === null) {
								aIReference.add(iReferenceGet);
							} else {
								if (sap.firefly.XString.isEqual(
										tlogo.getName(), iReferenceGet
												.getTlogoType().getName())) {
									aIReference.add(iReferenceGet);
								}
							}
						}
						return aIReference;
					},
					serialize : function(contentType) {
						var prStructure;
						var prList;
						var xIterator;
						var iAttribute;
						var prStructureAttribute;
						var prStructureDefinition;
						if (sap.firefly.HttpContentType.APPLICATION_JSON === contentType) {
							prStructure = sap.firefly.PrStructure.create();
							prStructure.setStringByName(
									sap.firefly.InAConstants.QY_NAME,
									this.m_name);
							prStructure.setStringByName(
									sap.firefly.InAConstants.QY_DESCRIPTION,
									this.m_description);
							prStructure.setStringByName(
									sap.firefly.InAConstants.QY_ACTION,
									sap.firefly.ActionT
											.getActionWithPrefix(
													this.m_action_prefix,
													this.m_action));
							prStructure
									.setBooleanByName(
											sap.firefly.InAConstants.QY_INPUT_SUPPORTED,
											this.m_isWritable);
							prStructure.setStringByName(
									sap.firefly.InAConstants.QY_AUDIT,
									this.m_audit.getName());
							if ((this.m_aIAttribute !== null)
									&& (this.m_aIAttribute.size() > 0)) {
								prList = sap.firefly.PrList.create();
								xIterator = this.m_aIAttribute.getIterator();
								while (xIterator.hasNext()) {
									iAttribute = xIterator.next();
									prStructureAttribute = sap.firefly.PrStructure
											.create();
									prStructureAttribute.setStringByName(
											sap.firefly.InAConstants.QY_NAME,
											iAttribute.getName());
									prStructureAttribute
											.setStringByName(
													sap.firefly.InAConstants.QY_DESCRIPTION,
													iAttribute.getDescription());
									prStructureAttribute.setStringByName(
											sap.firefly.InAConstants.QY_ACTION,
											iAttribute.getActionT().getName());
									prStructureAttribute.setBooleanByName(
											sap.firefly.InAConstants.QY_IS_KYF,
											iAttribute.getIsKeyFigure());
									prStructureAttribute
											.setStringByName(
													sap.firefly.InAConstants.QY_DATA_TYPE,
													iAttribute.getIDataT()
															.getDataType()
															.getName());
									prStructureAttribute.setBooleanByName(
											"IsModifiable", iAttribute
													.isModifiable());
									if (!sap.firefly.VisibilityT.T_NO
											.isEqualTo(iAttribute
													.getVisibility())) {
										prStructureAttribute
												.setStringByName(
														sap.firefly.InAConstants.QY_VISIBILITY,
														iAttribute
																.getVisibility()
																.getName());
									}
									if (sap.firefly.DataT.STRING
											.isEqualTo(iAttribute.getIDataT()
													.getDataType())) {
										prStructureAttribute
												.setBooleanByName(
														sap.firefly.InAConstants.QY_CONVERSION,
														iAttribute
																.getIDataT()
																.getConversion());
										if (iAttribute.getIDataT()
												.getConversion()) {
											prStructureAttribute
													.setIntegerByName(
															sap.firefly.InAConstants.QY_LENGTH,
															iAttribute
																	.getIDataT()
																	.getLength());
										}
									} else {
										if (sap.firefly.DataT.INFO_OBJECT
												.isEqualTo(iAttribute
														.getIDataT()
														.getDataType())) {
											prStructureAttribute
													.setStringByName(
															sap.firefly.InAConstants.QY_IOBJ_NAME,
															iAttribute
																	.getReference());
											prStructureAttribute
													.setBooleanByName(
															sap.firefly.InAConstants.QY_CHECK_MASTER_DATA,
															iAttribute
																	.getCheckMasterData());
											prStructureAttribute
													.setBooleanByName(
															sap.firefly.InAConstants.QY_USE_CONV_EXIT,
															iAttribute
																	.getUseConversionExit());
											if (iAttribute.getUnitReference() !== null) {
												prStructureAttribute
														.setStringByName(
																sap.firefly.InAConstants.QY_UNIT_REFERENCE,
																iAttribute
																		.getUnitReference());
												prStructureAttribute
														.setStringByName(
																sap.firefly.InAConstants.QY_UNIT_CURRENCY,
																sap.firefly.InAConstants.VA_UNIT_CURRENCY_U);
											} else {
												if (iAttribute
														.getCurrencyReference() !== null) {
													prStructureAttribute
															.setStringByName(
																	sap.firefly.InAConstants.QY_CURRENCY_REFERENCE,
																	iAttribute
																			.getCurrencyReference());
													prStructureAttribute
															.setStringByName(
																	sap.firefly.InAConstants.QY_UNIT_CURRENCY,
																	sap.firefly.InAConstants.VA_UNIT_CURRENCY_C);
												}
											}
										}
									}
									prList.add(prStructureAttribute);
								}
								prStructureDefinition = sap.firefly.PrStructure
										.create();
								prStructureDefinition.setElementByName(
										sap.firefly.InAConstants.QY_ATTRIBUTES,
										prList);
								prStructure.setElementByName(
										sap.firefly.InAConstants.QY_DEFINITION,
										prStructureDefinition);
							}
							return prStructure;
						}
						return null;
					},
					toString : function() {
						return this.m_name;
					}
				});
$Firefly.createClass("sap.firefly.ByteDataLocation", sap.firefly.XObject, {
	$statics : {
		createIDataLocation : function() {
			var iDataLocation = new sap.firefly.ByteDataLocation();
			iDataLocation.setup();
			return iDataLocation;
		}
	},
	setup : function() {
	},
	getDataLocation : function() {
		return sap.firefly.DataLocationT.BYTE;
	},
	serialize : function(contentType) {
		var prStructure;
		if (sap.firefly.HttpContentType.APPLICATION_JSON === contentType) {
			prStructure = sap.firefly.PrStructure.create();
			prStructure.setStringByName(sap.firefly.InAConstants.QY_LOCATION,
					this.getDataLocation().getName());
			return prStructure;
		}
		return null;
	}
});
$Firefly
		.createClass(
				"sap.firefly.CSVDataDescriptor",
				sap.firefly.XObject,
				{
					$statics : {
						createIDataDescriptor : function(separator,
								fieldDelimiter, headerRow, firstDataRow,
								decimalDelimiter, dateFormat, encoding,
								filePath) {
							var iDataDescriptor = new sap.firefly.CSVDataDescriptor();
							iDataDescriptor.setup(separator, fieldDelimiter,
									headerRow, firstDataRow, decimalDelimiter,
									dateFormat, encoding, filePath);
							return iDataDescriptor;
						}
					},
					m_separator : null,
					m_fieldDelimiter : null,
					m_headerRow : 0,
					m_firstDataRow : 0,
					m_decimalDelimiter : null,
					m_dateFormat : null,
					m_encoding : null,
					m_filePath : null,
					setup : function(separator, fieldDelimiter, headerRow,
							firstDataRow, decimalDelimiter, dateFormat,
							encoding, filePath) {
						this.m_separator = separator;
						this.m_fieldDelimiter = fieldDelimiter;
						this.m_headerRow = headerRow;
						this.m_firstDataRow = firstDataRow;
						this.m_decimalDelimiter = decimalDelimiter;
						this.m_dateFormat = dateFormat;
						this.m_encoding = encoding;
						this.m_filePath = filePath;
					},
					getContentType : function() {
						return sap.firefly.HttpContentType.TEXT_CSV;
					},
					setSeparator : function(separator) {
						this.m_separator = separator;
					},
					getSeparator : function() {
						return this.m_separator;
					},
					setFieldDelimiter : function(fieldDelimiter) {
						this.m_fieldDelimiter = fieldDelimiter;
					},
					getFieldDelimiter : function() {
						return this.m_fieldDelimiter;
					},
					setHeaderRow : function(headerRow) {
						this.m_headerRow = headerRow;
					},
					getHeaderRow : function() {
						return this.m_headerRow;
					},
					setFirstDataRow : function(firstDataRow) {
						this.m_firstDataRow = firstDataRow;
					},
					getFirstDataRow : function() {
						return this.m_firstDataRow;
					},
					setDecimalDelimiter : function(decimalDelimiter) {
						this.m_decimalDelimiter = decimalDelimiter;
					},
					getDecimalDelimiter : function() {
						return this.m_decimalDelimiter;
					},
					setDateFormat : function(dateFormat) {
						this.m_dateFormat = dateFormat;
					},
					getDateFormat : function() {
						return this.m_dateFormat;
					},
					setEncoding : function(encoding) {
						this.m_encoding = encoding;
					},
					getEncoding : function() {
						return this.m_encoding;
					},
					serialize : function(contentType) {
						var prStructure;
						if (sap.firefly.HttpContentType.APPLICATION_JSON === contentType) {
							prStructure = sap.firefly.PrStructure.create();
							prStructure.setStringByName(
									sap.firefly.InAConstants.QY_SEPARATOR,
									this.m_separator);
							prStructure
									.setStringByName(
											sap.firefly.InAConstants.QY_FIELD_DELIMITER,
											this.m_fieldDelimiter);
							prStructure.setIntegerByName(
									sap.firefly.InAConstants.QY_HEADER_ROW,
									this.m_headerRow);
							prStructure.setIntegerByName(
									sap.firefly.InAConstants.QY_FIRST_DATA_ROW,
									this.m_firstDataRow);
							prStructure
									.setStringByName(
											sap.firefly.InAConstants.QY_DECIMAL_DELIMITER,
											this.m_decimalDelimiter.getName());
							prStructure.setStringByName(
									sap.firefly.InAConstants.QY_DATE_FORMAT,
									this.m_dateFormat.getName());
							prStructure.setStringByName(
									sap.firefly.InAConstants.QY_ENCODING,
									this.m_encoding.getName());
							prStructure.setStringByName(
									sap.firefly.InAConstants.QY_FILE_PATH,
									this.m_filePath);
							return prStructure;
						}
						return null;
					},
					setFilePath : function(filePath) {
						this.m_filePath = filePath;
					},
					getFilePath : function() {
						return this.m_filePath;
					}
				});
$Firefly.createClass("sap.firefly.DatabaseDataLocation", sap.firefly.XObject, {
	$statics : {
		createIDataLocation : function(name, aIDataLocationKey) {
			var iDataLocation = new sap.firefly.DatabaseDataLocation();
			iDataLocation.setup(name, aIDataLocationKey);
			return iDataLocation;
		}
	},
	m_name : null,
	m_aIDataLocationKey : null,
	setup : function(name, aIDataLocationKey) {
		this.m_name = name;
		this.m_aIDataLocationKey = aIDataLocationKey;
	},
	getDataLocation : function() {
		return sap.firefly.DataLocationT.DATABASE;
	},
	getName : function() {
		return this.m_name;
	},
	addIDataLocationKey : function(name, value) {
		if (this.m_aIDataLocationKey === null) {
			this.m_aIDataLocationKey = sap.firefly.XList.create();
		}
		this.m_aIDataLocationKey.add(sap.firefly.DataLocationKeyManager
				.createIDataLocationKey(name, value));
	},
	getDataLocationKeys : function() {
		return this.m_aIDataLocationKey;
	},
	serialize : function(contentType) {
		var prStructure;
		var prList;
		var xIterator;
		var iDataLocationKey;
		var prStructureADataLocationKey;
		if (sap.firefly.HttpContentType.APPLICATION_JSON === contentType) {
			prStructure = sap.firefly.PrStructure.create();
			prStructure.setStringByName(sap.firefly.InAConstants.QY_LOCATION,
					this.getDataLocation().getName());
			if ((this.m_aIDataLocationKey !== null)
					&& (this.m_aIDataLocationKey.size() > 0)) {
				prList = sap.firefly.PrList.create();
				xIterator = this.m_aIDataLocationKey.getIterator();
				while (xIterator.hasNext()) {
					iDataLocationKey = xIterator.next();
					prStructureADataLocationKey = sap.firefly.PrStructure
							.create();
					prStructureADataLocationKey.setStringByName(
							sap.firefly.InAConstants.QY_NAME, iDataLocationKey
									.getName());
					prStructureADataLocationKey.setStringByName(
							sap.firefly.InAConstants.QY_VALUE, iDataLocationKey
									.getValue());
					prList.add(prStructureADataLocationKey);
				}
				prStructure.setElementByName(sap.firefly.InAConstants.QY_KEYS,
						prList);
			}
			return prStructure;
		}
		return null;
	}
});
$Firefly
		.createClass(
				"sap.firefly.AggregationLevelManager",
				sap.firefly.XObject,
				{
					$statics : {
						createIAggregationLevel : function(name) {
							var iAggregationLevel = new sap.firefly.AggregationLevelManager();
							iAggregationLevel.setup(name);
							return iAggregationLevel;
						}
					},
					m_name : null,
					m_aQuery : null,
					setup : function(name) {
						this.m_name = name;
						this.m_aQuery = sap.firefly.XList.create();
					},
					getName : function() {
						return this.m_name;
					},
					addQuery : function(query) {
						if (query !== null) {
							if (!this.m_aQuery
									.contains(sap.firefly.XStringValue
											.create(query))) {
								this.m_aQuery.add(sap.firefly.XStringValue
										.create(query));
							}
						}
					},
					getQueries : function() {
						return this.m_aQuery;
					},
					getPlanQuery : function() {
						var iXStringBuffer;
						if (this.m_name === null) {
							return null;
						}
						iXStringBuffer = sap.firefly.XStringBuffer.create();
						iXStringBuffer.append("!!I");
						iXStringBuffer.append(this.m_name);
						return iXStringBuffer.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.AttributeManager",
				sap.firefly.XObject,
				{
					$statics : {
						createIAttribute : function(name, description,
								reference, iDataT, isKeyFigure) {
							var iAttribute = new sap.firefly.AttributeManager();
							iAttribute.setup(name, description, reference,
									iDataT, isKeyFigure);
							return iAttribute;
						}
					},
					m_name : null,
					m_description : null,
					m_action_t : null,
					m_reference : null,
					m_unit_reference : null,
					m_currency_reference : null,
					m_unit_currency : null,
					m_idata_t : null,
					m_isKeyFigure : false,
					m_check_master_data : false,
					m_conversion_exit : false,
					m_visibility : null,
					m_modifiable : false,
					setup : function(name, description, reference, iDataT,
							isKeyFigure) {
						this.m_name = name;
						this.m_description = description;
						this.m_reference = reference;
						this.m_idata_t = iDataT;
						this.m_isKeyFigure = isKeyFigure;
						this.m_visibility = sap.firefly.VisibilityT.T_NO;
						this.m_action_t = sap.firefly.ActionT.T_NO;
					},
					getName : function() {
						return this.m_name;
					},
					getDescription : function() {
						return this.m_description;
					},
					setAction : function(action) {
						this.m_action_t = action;
					},
					getActionT : function() {
						return this.m_action_t;
					},
					getIDataT : function() {
						return this.m_idata_t;
					},
					getIsKeyFigure : function() {
						return this.m_isKeyFigure;
					},
					isKeyFigureSupported : function() {
						if (sap.firefly.XString.isEqual(
								sap.firefly.DataT.INTEGER.getName(),
								this.m_idata_t.getDataType().getName())) {
							return true;
						} else {
							if (sap.firefly.XString.isEqual(
									sap.firefly.DataT.NUMBER.getName(),
									this.m_idata_t.getDataType().getName())) {
								return true;
							} else {
								if (sap.firefly.XString.isEqual(
										sap.firefly.DataT.FLOATING_POINT
												.getName(), this.m_idata_t
												.getDataType().getName())) {
									return true;
								} else {
									if (sap.firefly.XString.isEqual(
											sap.firefly.DataT.INFO_OBJECT
													.getName(), this.m_idata_t
													.getDataType().getName())) {
										return true;
									}
								}
							}
						}
						return false;
					},
					setReference : function(reference) {
						this.m_reference = reference;
					},
					getReference : function() {
						return this.m_reference;
					},
					isReferenceSupported : function() {
						if (sap.firefly.XString.isEqual(
								sap.firefly.DataT.INFO_OBJECT.getName(),
								this.m_idata_t.getDataType().getName())) {
							return true;
						}
						return false;
					},
					getVisibility : function() {
						return this.m_visibility;
					},
					setVisibility : function(visibility) {
						this.m_visibility = visibility;
					},
					setUseConversionExit : function(conversionExit) {
						this.m_conversion_exit = conversionExit;
					},
					getUseConversionExit : function() {
						return this.m_conversion_exit;
					},
					isConversionExitSupported : function() {
						if (sap.firefly.XString.isEqual(
								sap.firefly.DataT.INFO_OBJECT.getName(),
								this.m_idata_t.getDataType().getName())) {
							return true;
						}
						return false;
					},
					setCheckMasterData : function(checkMasterData) {
						this.m_check_master_data = checkMasterData;
					},
					getCheckMasterData : function() {
						return this.m_check_master_data;
					},
					isMasterDataCheckSupported : function() {
						if (sap.firefly.XString.isEqual(
								sap.firefly.DataT.INFO_OBJECT.getName(),
								this.m_idata_t.getDataType().getName())) {
							return true;
						}
						return false;
					},
					setUnitCurrency : function(unitCurrency) {
						if (sap.firefly.XString.isEqual(
								sap.firefly.InAConstants.VA_UNIT_CURRENCY_C,
								unitCurrency)
								|| sap.firefly.XString
										.isEqual(
												sap.firefly.InAConstants.VA_UNIT_CURRENCY_U,
												unitCurrency)) {
							this.m_unit_currency = unitCurrency;
						}
					},
					getUnitCurrency : function() {
						return this.m_unit_currency;
					},
					setUnitReference : function(unitReference) {
						this.m_unit_reference = unitReference;
					},
					getUnitReference : function() {
						return this.m_unit_reference;
					},
					isUnitReferenceSupported : function() {
						if (sap.firefly.XString.isEqual(
								sap.firefly.DataT.INFO_OBJECT.getName(),
								this.m_idata_t.getDataType().getName())
								&& (this.m_isKeyFigure)) {
							return true;
						}
						return false;
					},
					setCurrencyReference : function(currencyReference) {
						this.m_currency_reference = currencyReference;
					},
					getCurrencyReference : function() {
						return this.m_currency_reference;
					},
					isCurrencyReferenceSupported : function() {
						if (sap.firefly.XString.isEqual(
								sap.firefly.DataT.INFO_OBJECT.getName(),
								this.m_idata_t.getDataType().getName())
								&& (this.m_isKeyFigure)) {
							return true;
						}
						return false;
					},
					setIsModifiable : function(modifiable) {
						this.m_modifiable = modifiable;
					},
					isModifiable : function() {
						return this.m_modifiable;
					},
					toString : function() {
						return this.m_name;
					}
				});
$Firefly.createClass("sap.firefly.CleansingActionType", sap.firefly.XObject, {
	$statics : {
		createICleansingActionType : function(name, description) {
			var cleansingActionType = new sap.firefly.CleansingActionType();
			cleansingActionType.setup(name, description);
			return cleansingActionType;
		}
	},
	m_name : null,
	m_description : null,
	setup : function(name, description) {
		this.m_name = name;
		this.m_description = description;
	},
	getName : function() {
		return this.m_name;
	},
	getDescription : function() {
		return this.m_description;
	},
	toString : function() {
		var linebreak = "\r\n";
		var buffer = sap.firefly.XStringBuffer.create();
		buffer.append(linebreak);
		buffer.append(this.m_name);
		buffer.append(linebreak);
		buffer.append(this.m_description);
		return buffer.toString();
	}
});
$Firefly
		.createClass(
				"sap.firefly.DataLocationKeyManager",
				sap.firefly.XObject,
				{
					$statics : {
						createIDataLocationKey : function(name, value) {
							var iDataLocationKey = new sap.firefly.DataLocationKeyManager();
							iDataLocationKey.setup(name, value);
							return iDataLocationKey;
						}
					},
					m_name : null,
					m_value : null,
					setup : function(name, value) {
						this.m_name = name;
						this.m_value = value;
					},
					getName : function() {
						return this.m_name;
					},
					getValue : function() {
						return this.m_value;
					}
				});
$Firefly.createClass("sap.firefly.ReferenceManager", sap.firefly.XObject, {
	$statics : {
		createIReference : function(name, description, tlogo) {
			var iReference = new sap.firefly.ReferenceManager();
			iReference.setup(name, description, tlogo);
			return iReference;
		}
	},
	m_name : null,
	m_description : null,
	m_tlogo : null,
	setup : function(name, description, tlogo) {
		this.m_name = name;
		this.m_description = description;
		this.m_tlogo = tlogo;
	},
	getName : function() {
		return this.m_name;
	},
	getDescription : function() {
		return this.m_description;
	},
	getTlogoType : function() {
		return this.m_tlogo;
	},
	toString : function() {
		return this.m_name;
	}
});
$Firefly
		.createClass(
				"sap.firefly.Workspace",
				sap.firefly.XObject,
				{
					$statics : {
						PREFIX_HIERARCHY : "3H",
						PREFIX_DIMENSION : "3L",
						createIWorkspace : function(name, prefix, wspnamespace) {
							var iWorkspace = new sap.firefly.Workspace();
							iWorkspace.setup(name, prefix, wspnamespace);
							return iWorkspace;
						}
					},
					m_action : null,
					m_name : null,
					m_prefix : null,
					m_wspnamespace : null,
					m_created_by : null,
					m_changed_by : null,
					m_creation_time : null,
					m_changed_time : null,
					m_max_memory : 0,
					m_max_number_of_providers : 0,
					m_expiration_date : null,
					m_sid_generation_allowed : false,
					m_cleansing_action_type : null,
					m_aIProviderIDataContainerBag : null,
					setup : function(name, prefix, wspnamespace) {
						this.m_name = name;
						this.m_prefix = prefix;
						this.m_wspnamespace = wspnamespace;
						this.m_cleansing_action_type = sap.firefly.XList
								.create();
						this.m_aIProviderIDataContainerBag = sap.firefly.XHashMapByString
								.create();
					},
					getAction : function() {
						return this.m_action;
					},
					setAction : function(action) {
						this.m_action = action;
					},
					getName : function() {
						return this.m_name;
					},
					setPrefix : function(prefix) {
						if (prefix !== null) {
							this.m_prefix = prefix;
						}
					},
					getPrefix : function() {
						return this.m_prefix;
					},
					getHierarchyPrefix : function() {
						return sap.firefly.XString.concatenate2(
								sap.firefly.Workspace.PREFIX_HIERARCHY,
								this.m_prefix);
					},
					getDimensionPrefix : function() {
						return sap.firefly.XString.concatenate2(
								sap.firefly.Workspace.PREFIX_DIMENSION,
								this.m_prefix);
					},
					setNamespace : function(wspnamespace) {
						if (wspnamespace !== null) {
							this.m_wspnamespace = wspnamespace;
						}
					},
					getNamespace : function() {
						return this.m_wspnamespace;
					},
					setCreatedBy : function(createdBy) {
						this.m_created_by = createdBy;
					},
					getCreatedBy : function() {
						return this.m_created_by;
					},
					setChangedBy : function(changedBy) {
						this.m_changed_by = changedBy;
					},
					getChangedBy : function() {
						return this.m_changed_by;
					},
					setCreationTime : function(creationTime) {
						this.m_creation_time = creationTime;
					},
					getCreationTime : function() {
						return this.m_creation_time;
					},
					setChangedTime : function(changedTime) {
						this.m_changed_time = changedTime;
					},
					getChangedTime : function() {
						return this.m_changed_time;
					},
					setMaxMemory : function(maxMemory) {
						this.m_max_memory = maxMemory;
					},
					getMaxMemory : function() {
						return this.m_max_memory;
					},
					setMaxNumberOfProviders : function(maxNumberOfProviders) {
						this.m_max_number_of_providers = maxNumberOfProviders;
					},
					getMaxNumberOfProviders : function() {
						return this.m_max_number_of_providers;
					},
					setExpirationDate : function(expirationDate) {
						this.m_expiration_date = expirationDate;
					},
					getExpirationDate : function() {
						return this.m_expiration_date;
					},
					setIsGenerationOfSIDsAllowed : function(
							isGenerationOfSIDsAllowed) {
						this.m_sid_generation_allowed = isGenerationOfSIDsAllowed;
					},
					getIsGenerationOfSIDsAllowed : function() {
						return this.m_sid_generation_allowed;
					},
					getICleansingActionType : function() {
						return this.m_cleansing_action_type;
					},
					parseICleansingActionType : function(iPrStructure) {
						var prElementTypeCleansing;
						var iPrStructureCleansing;
						var prElementTypeCleansingParts;
						var iPrListCleansingParts;
						var iCleansingParts;
						var iPrStructureCleansingPart;
						var name;
						var description;
						if (iPrStructure === null) {
							return;
						}
						if (!this.m_cleansing_action_type.isEmpty()) {
							return;
						}
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_CLEANSING)) {
							prElementTypeCleansing = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_CLEANSING);
							if (prElementTypeCleansing === sap.firefly.PrElementType.STRUCTURE) {
								iPrStructureCleansing = iPrStructure
										.getStructureByName(sap.firefly.InAConstants.QY_CLEANSING);
								if (iPrStructureCleansing
										.hasValueByName(sap.firefly.InAConstants.QY_CLEANSING_ACTIONS)) {
									prElementTypeCleansingParts = iPrStructureCleansing
											.getElementTypeByName(sap.firefly.InAConstants.QY_CLEANSING_ACTIONS);
									if (prElementTypeCleansingParts === sap.firefly.PrElementType.LIST) {
										iPrListCleansingParts = iPrStructureCleansing
												.getListByName(sap.firefly.InAConstants.QY_CLEANSING_ACTIONS);
										for (iCleansingParts = 0; iCleansingParts < iPrListCleansingParts
												.size(); iCleansingParts++) {
											iPrStructureCleansingPart = iPrListCleansingParts
													.getStructureByIndex(iCleansingParts);
											if (iPrStructureCleansingPart !== null) {
												name = iPrStructureCleansingPart
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_NAME,
																null);
												description = iPrStructureCleansingPart
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_DESCRIPTION,
																null);
												this.m_cleansing_action_type
														.add(sap.firefly.CleansingActionType
																.createICleansingActionType(
																		name,
																		description));
											}
										}
									}
								}
							}
						}
					},
					exists : function() {
						if (this.m_prefix !== null) {
							return true;
						}
						return false;
					},
					getCleansingManagerByName : function(referenceId) {
						if (referenceId === null) {
							return null;
						}
						if (this.m_aIProviderIDataContainerBag
								.containsKey(referenceId)) {
							return this.m_aIProviderIDataContainerBag.getByKey(
									referenceId).getICleansing();
						}
						return null;
					},
					getProvider : function() {
						var aIProvider = sap.firefly.XList.create();
						var iXIteratorKey = this.m_aIProviderIDataContainerBag
								.getKeysAsIteratorOfString();
						var keyIProvider;
						var indexGetProvider;
						var iXIteratorGetProvider;
						var compareResult;
						while (iXIteratorKey.hasNext()) {
							keyIProvider = iXIteratorKey.next();
							indexGetProvider = 0;
							iXIteratorGetProvider = aIProvider.getIterator();
							while (iXIteratorGetProvider.hasNext()) {
								compareResult = sap.firefly.XString.compare(
										iXIteratorGetProvider.next().getName(),
										keyIProvider);
								if (compareResult < 0) {
									indexGetProvider = indexGetProvider + 1;
								}
							}
							aIProvider.insert(indexGetProvider,
									this.m_aIProviderIDataContainerBag
											.getByKey(keyIProvider)
											.getIProvider());
						}
						return aIProvider;
					},
					getProviderByName : function(referenceId) {
						if (referenceId === null) {
							return null;
						}
						if (this.m_aIProviderIDataContainerBag
								.containsKey(referenceId)) {
							return this.m_aIProviderIDataContainerBag.getByKey(
									referenceId).getIProvider();
						}
						return null;
					},
					setIProvider : function(iProvider, iDataContainer,
							iCleansingManager, referenceId) {
						if (iProvider !== null) {
							if (this.m_aIProviderIDataContainerBag
									.containsKey(referenceId)) {
								this.m_aIProviderIDataContainerBag
										.remove(referenceId);
								this.m_aIProviderIDataContainerBag
										.put(
												referenceId,
												sap.firefly.ProviderDataContainerBag
														.createIProviderIDataContainerBag(
																0, iProvider,
																iDataContainer,
																iCleansingManager));
							} else {
								this.m_aIProviderIDataContainerBag
										.put(
												referenceId,
												sap.firefly.ProviderDataContainerBag
														.createIProviderIDataContainerBag(
																0, iProvider,
																iDataContainer,
																iCleansingManager));
							}
						}
					},
					deleteProviderByName : function(referenceId) {
						if (referenceId === null) {
							return;
						}
						if (this.m_aIProviderIDataContainerBag
								.containsKey(referenceId)) {
							this.m_aIProviderIDataContainerBag
									.remove(referenceId);
						}
					},
					clearProvider : function() {
						this.m_aIProviderIDataContainerBag = sap.firefly.XHashMapByString
								.create();
					},
					getIDataDescriptorByName : function(referenceId) {
						if (referenceId === null) {
							return null;
						}
						if (this.m_aIProviderIDataContainerBag
								.containsKey(referenceId)) {
							if (this.m_aIProviderIDataContainerBag.getByKey(
									referenceId).getIDataContainer() === null) {
								return null;
							}
							return this.m_aIProviderIDataContainerBag.getByKey(
									referenceId).getIDataContainer()
									.getIDataDescriptor();
						}
						return null;
					}
				});
$Firefly.createClass("sap.firefly.WorkstatusStatus", sap.firefly.XObject, {
	$statics : {
		createIWorkstatusStatus : function(technicalId, name) {
			var iWorkstatusStatus = new sap.firefly.WorkstatusStatus();
			iWorkstatusStatus.setup(technicalId, name);
			return iWorkstatusStatus;
		}
	},
	m_name : null,
	m_technical_id : null,
	setup : function(technicalId, name) {
		this.m_technical_id = technicalId;
		this.m_name = name;
	},
	getTechnicalId : function() {
		return this.m_technical_id;
	},
	getName : function() {
		return this.m_name;
	}
});
$Firefly
		.createClass(
				"sap.firefly.XCmdSetQueryManagerAtLayer",
				sap.firefly.XCommand,
				{
					$statics : {
						CLAZZ : null,
						staticSetup : function() {
							sap.firefly.XCmdSetQueryManagerAtLayer.CLAZZ = sap.firefly.XClass
									.create(sap.firefly.XCmdSetQueryManagerAtLayer);
						}
					},
					getCommandResultClass : function() {
						return sap.firefly.XCmdSetQueryManagerAtLayerResult.CLAZZ;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XCmdSetQueryManagerAtLayerResult",
				sap.firefly.XCommandResult,
				{
					$statics : {
						CLAZZ : null,
						staticSetup : function() {
							sap.firefly.XCmdSetQueryManagerAtLayerResult.CLAZZ = sap.firefly.XClass
									.create(sap.firefly.XCmdSetQueryManagerAtLayerResult);
						}
					},
					process : function() {
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectManager",
				sap.firefly.DfApplicationContext,
				{
					$statics : {
						staticSetup : function() {
						},
						create : function(application, config, queryManager) {
							var object = new sap.firefly.InfoObjectManager();
							object.setupInfoObjectManager(application, config,
									queryManager);
							return object;
						}
					},
					m_trace_level : null,
					m_query_manager : null,
					m_config : null,
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					setupInfoObjectManager : function(application, config,
							queryManager) {
						var iQDimensionBase;
						this.setupApplicationContext(application);
						this.m_trace_level = sap.firefly.InfoObjectTraceLevel.T_ERROR;
						this.m_query_manager = sap.firefly.XWeakReferenceUtil
								.getWeakRef(queryManager);
						this.m_config = config;
						if (this.m_query_manager !== null) {
							iQDimensionBase = this
									.getIQueryManager()
									.getQueryModel()
									.getDimensionByType(
											sap.firefly.DimensionType.DIMENSION);
							this.m_infoobject_dimension_manager = sap.firefly.InfoObjectDimensionManager
									.createIInfoObjectDimensionManager(
											application, this.m_config);
							this.m_infoobject_dimension_manager
									.setIQDimension(iQDimensionBase);
						}
					},
					setTraceLevel : function(traceLevel) {
						if (traceLevel !== null) {
							this.m_trace_level = traceLevel;
						}
					},
					getIQueryManager : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_query_manager);
					},
					getIQSelector : function() {
						return sap.firefly.InfoObjectSelector
								.createIInfoObjectSelector(this.m_infoobject_dimension_manager
										.getDimension());
					},
					getDimensionManager : function() {
						return this.m_infoobject_dimension_manager;
					},
					processInfoObjectGet : function(syncType, listener,
							customIdentifier, iInfoObjectDimensionManager,
							iInfoObjectSelector) {
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(this.m_infoobject_dimension_manager
											.getDimension());
						} else {
							this.m_infoobject_selector = iInfoObjectSelector;
						}
						(this.m_infoobject_selector)
								.setAuthorization(sap.firefly.InfoObjectAuthorization
										.create(this.m_config
												.getAuthorizationSelObject(),
												null));
						return sap.firefly.QInfoObjectGetAction.createAndRun(
								syncType, listener, customIdentifier, this,
								iInfoObjectDimensionManager,
								this.m_infoobject_selector);
					},
					createIDataContainerBag : function(contentType,
							dataLocationT, dataLocation, data, action) {
						return sap.firefly.DataContainer.createIDataContainer(
								contentType, dataLocationT, dataLocation, data,
								action);
					},
					processInfoObjectModify : function(syncType, listener,
							customIdentifier, iInfoObjectDimensionManager,
							iInfoObjectSelector) {
						return sap.firefly.QInfoObjectModifyAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										iInfoObjectDimensionManager,
										iInfoObjectSelector);
					},
					processInfoObjectSave : function(syncType, listener,
							customIdentifier, iInfoObjectDimensionManager,
							iInfoObjectSelector, activate) {
						return sap.firefly.QInfoObjectSaveAction.createAndRun(
								syncType, listener, customIdentifier, this,
								iInfoObjectDimensionManager,
								iInfoObjectSelector, activate);
					},
					processInfoObjectHierarchyMemberGet : function(syncType,
							listener, customIdentifier,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(this.m_infoobject_dimension_manager
											.getDimension());
						} else {
							this.m_infoobject_selector = iInfoObjectSelector;
						}
						return sap.firefly.QInfoObjectHierarchyMemberGetAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										iInfoObjectDimensionManager,
										this.m_infoobject_selector);
					},
					processInfoObjectHierarchyMemberCheck : function(syncType,
							listener, customIdentifier,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_selector = iInfoObjectSelector;
						return sap.firefly.QInfoObjectHierarchyMemberCheckAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										iInfoObjectDimensionManager,
										this.m_infoobject_selector);
					},
					processInfoObjectHierarchyMemberModify : function(syncType,
							listener, customIdentifier,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_selector = iInfoObjectSelector;
						return sap.firefly.QInfoObjectHierarchyMemberModifyAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										iInfoObjectDimensionManager,
										this.m_infoobject_selector);
					},
					processInfoObjectHierarchySave : function(syncType,
							listener, customIdentifier,
							iInfoObjectDimensionManager, aHierarchy,
							iInfoObjectSelector, activate) {
						this.m_infoobject_selector = iInfoObjectSelector;
						return sap.firefly.QInfoObjectHierarchySaveAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										iInfoObjectDimensionManager,
										aHierarchy, this.m_infoobject_selector,
										activate);
					},
					processInfoObjectHierarchyIntervalGet : function(syncType,
							listener, customIdentifier,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(this.m_infoobject_dimension_manager
											.getDimension());
						} else {
							this.m_infoobject_selector = iInfoObjectSelector;
						}
						return sap.firefly.QInfoObjectHierarchyIntervalGetAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										iInfoObjectDimensionManager,
										this.m_infoobject_selector);
					},
					processInfoObjectHierarchyIntervalCheck : function(
							syncType, listener, customIdentifier,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_selector = iInfoObjectSelector;
						return sap.firefly.QInfoObjectHierarchyIntervalCheckAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										iInfoObjectDimensionManager,
										this.m_infoobject_selector);
					},
					processInfoObjectHierarchyIntervalModify : function(
							syncType, listener, customIdentifier,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_selector = iInfoObjectSelector;
						return sap.firefly.QInfoObjectHierarchyIntervalModifyAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										iInfoObjectDimensionManager,
										this.m_infoobject_selector);
					},
					processInfoObjectHierarchyModify : function(syncType,
							listener, customIdentifier,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_selector = iInfoObjectSelector;
						return sap.firefly.QInfoObjectHierarchyModifyAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										iInfoObjectDimensionManager,
										this.m_infoobject_selector);
					},
					processInfoObjectHierarchyCopy : function(syncType,
							listener, customIdentifier,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_selector = iInfoObjectSelector;
						return sap.firefly.QInfoObjectHierarchyCopyAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										iInfoObjectDimensionManager,
										this.m_infoobject_selector);
					},
					processInfoObjectHierarchyCheck : function(syncType,
							listener, customIdentifier,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_selector = iInfoObjectSelector;
						return sap.firefly.QInfoObjectHierarchyCheckAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										iInfoObjectDimensionManager,
										this.m_infoobject_selector);
					},
					getSystemName : function() {
						if (this.m_config === null) {
							return null;
						}
						return this.m_config.getSystemName();
					},
					getIInfoObjectSelector : function() {
						return this.m_infoobject_selector;
					},
					getConfig : function() {
						return this.m_config;
					},
					getTraceLevel : function() {
						return this.m_trace_level;
					},
					getOlapEnv : function() {
						return this.getApplication().getOlapEnvironment();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.WorkspaceManager",
				sap.firefly.DfApplicationContext,
				{
					$statics : {
						staticSetup : function() {
						},
						create : function(application, config) {
							var object = new sap.firefly.WorkspaceManager();
							object.setupWorkspaceManager(application, config);
							return object;
						}
					},
					m_trace_level : null,
					m_queue_status : null,
					m_queue_type : null,
					m_iworkspace_bag : null,
					m_aIProviderIDataContainerBag : null,
					m_config : null,
					setupWorkspaceManager : function(application, config) {
						this.setupApplicationContext(application);
						this.m_trace_level = sap.firefly.TraceLevelT.T_ERROR;
						this.m_queue_type = sap.firefly.QueueT.T_NAMED_ORDERED;
						this.m_queue_status = sap.firefly.QueueStatusT.T_OFF;
						this.m_config = config;
						this.m_iworkspace_bag = sap.firefly.WorkspaceBagManager
								.createIWorkspaceBag(sap.firefly.Workspace
										.createIWorkspace(config
												.getDataSource()
												.getEnvironmentName(), null,
												null));
						this.m_aIProviderIDataContainerBag = sap.firefly.XHashMapByString
								.create();
					},
					setTraceLevel : function(traceLevel) {
						if (traceLevel !== null) {
							this.m_trace_level = traceLevel;
						}
					},
					getTraceLevel : function() {
						return this.m_trace_level;
					},
					getConfig : function() {
						return this.m_config;
					},
					getIWorkspaceBag : function() {
						return this.m_iworkspace_bag;
					},
					getIProviderIDataContainerBagMap : function() {
						return this.m_aIProviderIDataContainerBag;
					},
					openQueue : function(queueT) {
						if ((queueT === null)
								|| !sap.firefly.XString.isEqual(
										sap.firefly.QueueT.T_NAMED_ORDERED
												.getName(), this.m_queue_type
												.getName())) {
							throw sap.firefly.XException
									.createIllegalArgumentException("");
						}
						this.doInitialize(true);
						this.m_queue_type = queueT;
						this.m_queue_status = sap.firefly.QueueStatusT.T_OPEN;
					},
					getQueue : function() {
						return this.m_queue_type;
					},
					resetQueue : function() {
						this.doInitialize(true);
						this.m_queue_status = sap.firefly.QueueStatusT.T_OPEN;
					},
					flushQueue : function() {
						this.m_queue_status = sap.firefly.QueueStatusT.T_FLUSHED;
					},
					closeQueue : function() {
						this.doInitialize(true);
						this.m_queue_status = sap.firefly.QueueStatusT.T_OFF;
					},
					assertQueue : function() {
						this.doInitialize(true);
						if (!(sap.firefly.XString.isEqual(
								sap.firefly.QueueStatusT.T_OFF.getName(),
								this.m_queue_status.getName()))) {
							throw sap.firefly.XException
									.createIllegalStateException("");
						}
					},
					assertQueueAndProvider : function(providerName) {
						this.doInitialize(false);
						if (!(sap.firefly.XString.isEqual(
								sap.firefly.QueueStatusT.T_OFF.getName(),
								this.m_queue_status.getName()))
								&& (this.m_aIProviderIDataContainerBag
										.containsKey(providerName))) {
							throw sap.firefly.XException
									.createIllegalArgumentException("");
						}
					},
					createWorkspace : function() {
						this.assertQueue();
						(this.m_iworkspace_bag.getWorkspace())
								.setAction(sap.firefly.ActionT.T_CREATE);
						return this.m_iworkspace_bag.getWorkspace().getName();
					},
					getWorkspace : function() {
						this.assertQueue();
						(this.m_iworkspace_bag.getWorkspace())
								.setAction(sap.firefly.ActionT.T_GET);
						return this.m_iworkspace_bag.getWorkspace().getName();
					},
					deleteWorkspace : function() {
						this.assertQueue();
						(this.m_iworkspace_bag.getWorkspace())
								.setAction(sap.firefly.ActionT.T_DELETE);
						return this.m_iworkspace_bag.getWorkspace().getName();
					},
					getProvider : function() {
						this.assertQueue();
						(this.m_iworkspace_bag.getWorkspace())
								.setAction(sap.firefly.ActionT.T_GET_PROVIDER);
						this.m_iworkspace_bag.getWorkspace().clearProvider();
						return this.m_iworkspace_bag.getWorkspace().getName();
					},
					getIQDimension : function(name) {
						var identifier;
						var serviceConfig;
						var serviceExtResult;
						var iQueryManager;
						this.assertQueue();
						identifier = this.m_config.getDataSource();
						identifier
								.setType(sap.firefly.MetaObjectType.MASTERDATA);
						identifier.setObjectName(name);
						serviceConfig = sap.firefly.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER
								.createServiceConfig(this.getApplication());
						serviceConfig
								.setProviderType(sap.firefly.ProviderType.ANALYTICS);
						serviceConfig.setSystemName(this.m_config
								.getSystemName());
						serviceConfig.setDataSource(identifier);
						serviceExtResult = serviceConfig
								.processQueryManagerCreation(
										sap.firefly.SyncType.BLOCKING, null,
										null);
						if (serviceExtResult === null) {
							throw sap.firefly.XException
									.createRuntimeException("IQueryConsumerService is NULL");
						}
						if (serviceExtResult.hasErrors()
								|| (serviceExtResult.getData() === null)) {
							throw sap.firefly.XException
									.createRuntimeException(serviceExtResult
											.getSummary());
						}
						iQueryManager = serviceExtResult.getData();
						if (iQueryManager !== null) {
							return iQueryManager
									.getQueryModel()
									.getDimensionByType(
											sap.firefly.DimensionType.DIMENSION);
						}
						return null;
					},
					createIQField : function(iQDimension, name, description) {
						var iQFieldBase;
						if (iQDimension === null) {
							return null;
						}
						if (name === null) {
							return null;
						}
						iQFieldBase = sap.firefly.QField._createField(
								iQDimension.getContext(), iQDimension,
								sap.firefly.PresentationType.UNDEFINED);
						iQFieldBase.setName(name);
						if (description === null) {
							iQFieldBase.setText(name);
						} else {
							iQFieldBase.setText(description);
						}
						iQFieldBase
								.setUsageType(sap.firefly.FieldUsageType.ALL);
						return iQFieldBase;
					},
					addIQField : function(iQDimension, iQField) {
						var iQDimensionBase;
						var iQAttributeBase;
						if (iQDimension === null) {
							return iQDimension;
						}
						if (iQField === null) {
							return iQDimension;
						}
						if (iQDimension.getAttributeContainer().getAttributes()
								.containsKey(iQField.getName())) {
							return iQDimension;
						}
						iQDimensionBase = iQDimension;
						if (iQDimensionBase.getFieldContainer().getFieldByName(
								iQField.getName()) !== null) {
							return iQDimension;
						}
						iQDimensionBase.addNewField(iQField.getUsageType(),
								iQField.getPresentationType(), iQField
										.getName(), iQField.getText());
						(iQDimensionBase.getFieldContainer())
								.getResultSetFields().add(iQField);
						iQDimensionBase
								.addSupportedFieldLayoutType(sap.firefly.FieldLayoutType.ATTRIBUTE_BASED);
						iQAttributeBase = sap.firefly.QAttribute
								.createAttribute(iQDimensionBase.getContext(),
										iQDimensionBase);
						iQAttributeBase.setName(iQField.getName());
						iQAttributeBase.setText(iQField.getText());
						iQAttributeBase.addField(iQField);
						iQDimensionBase.getAttributeContainerBase()
								.addAttribute(iQAttributeBase);
						iQDimensionBase
								.setFieldLayoutType(sap.firefly.FieldLayoutType.FIELD_BASED);
						return iQDimensionBase;
					},
					deleteIQFieldByName : function(iQDimension, name) {
						var iQDimensionBase;
						var iQDimensionBaseNew;
						var bAxisType;
						var iteratorAxisType;
						var iteratorField;
						var iQFieldBase;
						var attributeList;
						var iteratorAttribute;
						var iQAttribute;
						var iQAttributeBase;
						if (iQDimension === null) {
							return iQDimension;
						}
						if (name === null) {
							return iQDimension;
						}
						if (iQDimension.getFieldContainer()
								.getFieldByName(name) === null) {
							return iQDimension;
						}
						iQDimensionBase = iQDimension;
						iQDimensionBaseNew = sap.firefly.QDimension._create(
								iQDimensionBase.getContext(), iQDimensionBase
										.getParentComponent(), iQDimensionBase
										.getDimensionType());
						iQDimensionBaseNew.setName(iQDimension.getName());
						iQDimensionBaseNew.setText(iQDimension.getText());
						iQDimensionBaseNew.setAxis(iQDimensionBase
								.getAxisBase());
						iQDimensionBaseNew
								.addSupportedFieldLayoutType(sap.firefly.FieldLayoutType.ATTRIBUTE_BASED);
						bAxisType = iQDimensionBase.getSupportedAxesTypes();
						iteratorAxisType = bAxisType.getIterator();
						while (iteratorAxisType.hasNext()) {
							iQDimensionBaseNew
									.addSupportedAxis(iteratorAxisType.next());
						}
						iteratorField = iQDimensionBase.getFieldContainer()
								.getFieldIterator();
						while (iteratorField.hasNext()) {
							iQFieldBase = iteratorField.next();
							if (sap.firefly.XString.isEqual(iQFieldBase
									.getName(), name)) {
								continue;
							}
							iQDimensionBaseNew.addNewField(iQFieldBase
									.getUsageType(), iQFieldBase
									.getPresentationType(), iQFieldBase
									.getName(), iQFieldBase.getText());
							(iQDimensionBaseNew.getFieldContainer())
									.getResultSetFields().add(iQFieldBase);
						}
						attributeList = iQDimensionBase.getAttributeContainer()
								.getAttributes();
						iteratorAttribute = attributeList.getIterator();
						while (iteratorAttribute.hasNext()) {
							iQAttribute = iteratorAttribute.next();
							if (sap.firefly.XString.isEqual(iQAttribute
									.getName(), name)) {
								continue;
							}
							iQAttributeBase = sap.firefly.QAttribute
									.createAttribute(iQDimensionBaseNew
											.getContext(), iQDimensionBaseNew);
							iQAttributeBase.setName(iQAttribute.getName());
							iQAttributeBase.setText(iQAttribute.getText());
							iQAttributeBase.addField(iQDimensionBase
									.getFieldByName(iQAttributeBase.getName()));
							iQDimensionBaseNew.getAttributeContainerBase()
									.addAttribute(iQAttributeBase);
							if (sap.firefly.XString.isEqual(iQAttribute
									.getName(), iQDimensionBaseNew.getName())) {
								iQDimensionBaseNew.getAttributeContainerBase()
										.setMainAttribute(iQAttributeBase);
							}
						}
						iQDimensionBaseNew
								.setFieldLayoutType(sap.firefly.FieldLayoutType.FIELD_BASED);
						return iQDimensionBaseNew;
					},
					createProvider : function(provider) {
						if (provider === null) {
							return null;
						}
						this.assertQueueAndProvider(provider.getName());
						this.m_aIProviderIDataContainerBag
								.put(
										sap.firefly.XInteger
												.convertIntegerToString(this.m_aIProviderIDataContainerBag
														.size()),
										sap.firefly.ProviderDataContainerBag
												.createIProviderIDataContainerBag(
														this.m_aIProviderIDataContainerBag
																.size(),
														provider, null, null));
						return provider.getName();
					},
					cleanData : function(provider, dataContainer) {
						if (provider === null) {
							return null;
						}
						this.assertQueueAndProvider(provider.getName());
						this.m_aIProviderIDataContainerBag
								.put(
										sap.firefly.XInteger
												.convertIntegerToString(this.m_aIProviderIDataContainerBag
														.size()),
										sap.firefly.ProviderDataContainerBag
												.createIProviderIDataContainerBag(
														this.m_aIProviderIDataContainerBag
																.size(),
														provider,
														dataContainer,
														dataContainer
																.getICleansing()));
						return provider.getName();
					},
					validateProvider : function(provider) {
						if (provider === null) {
							return null;
						}
						this.assertQueueAndProvider(provider.getName());
						this.m_aIProviderIDataContainerBag
								.put(
										sap.firefly.XInteger
												.convertIntegerToString(this.m_aIProviderIDataContainerBag
														.size()),
										sap.firefly.ProviderDataContainerBag
												.createIProviderIDataContainerBag(
														this.m_aIProviderIDataContainerBag
																.size(),
														provider, null, null));
						return provider.getName();
					},
					getProviderDetails : function(provider) {
						var iProvider;
						if (provider === null) {
							return null;
						}
						this.assertQueueAndProvider(provider);
						iProvider = sap.firefly.ProviderFactory
								.createIProvider(sap.firefly.ProviderT.AINX,
										provider, null, null,
										sap.firefly.ActionT.T_GET, null, true,
										sap.firefly.AuditT.T_NO);
						(iProvider)
								.setActionPrefix(sap.firefly.InAConstants.QY_DETAILS);
						this.m_aIProviderIDataContainerBag
								.put(
										sap.firefly.XInteger
												.convertIntegerToString(this.m_aIProviderIDataContainerBag
														.size()),
										sap.firefly.ProviderDataContainerBag
												.createIProviderIDataContainerBag(
														this.m_aIProviderIDataContainerBag
																.size(),
														iProvider, null, null));
						return provider;
					},
					changeAuditState : function(provider, audit) {
						var iProvider;
						if (provider === null) {
							return null;
						}
						this.assertQueueAndProvider(provider);
						iProvider = sap.firefly.ProviderFactory
								.createIProvider(sap.firefly.ProviderT.AINX,
										provider, null, null,
										sap.firefly.ActionT.T_MODIFY, null,
										true, audit);
						(iProvider)
								.setActionPrefix(sap.firefly.InAConstants.QY_AUDIT);
						this.m_aIProviderIDataContainerBag
								.put(
										sap.firefly.XInteger
												.convertIntegerToString(this.m_aIProviderIDataContainerBag
														.size()),
										sap.firefly.ProviderDataContainerBag
												.createIProviderIDataContainerBag(
														this.m_aIProviderIDataContainerBag
																.size(),
														iProvider, null, null));
						return provider;
					},
					deleteProvider : function(aIProvider) {
						var iDDeleteList;
						var iXIteratorProviderDelete;
						var providerDelete;
						var iProvider;
						if (aIProvider === null) {
							return null;
						}
						this.doInitialize(false);
						iDDeleteList = sap.firefly.XList.create();
						iXIteratorProviderDelete = aIProvider.getIterator();
						while (iXIteratorProviderDelete.hasNext()) {
							providerDelete = iXIteratorProviderDelete.next()
									.getStringValue();
							if (!(sap.firefly.XString.isEqual(
									sap.firefly.QueueStatusT.T_OFF.getName(),
									this.m_queue_status.getName()))
									&& (this.m_aIProviderIDataContainerBag
											.containsKey(providerDelete))) {
								throw sap.firefly.XException
										.createIllegalArgumentException("");
							}
							iProvider = sap.firefly.ProviderFactory
									.createIProvider(
											sap.firefly.ProviderT.AINX,
											providerDelete, null, null,
											sap.firefly.ActionT.T_DELETE, null,
											true, sap.firefly.AuditT.T_NO);
							iDDeleteList
									.add(sap.firefly.XStringValue
											.create(sap.firefly.XInteger
													.convertIntegerToString(this.m_aIProviderIDataContainerBag
															.size())));
							this.m_aIProviderIDataContainerBag
									.put(
											sap.firefly.XInteger
													.convertIntegerToString(this.m_aIProviderIDataContainerBag
															.size()),
											sap.firefly.ProviderDataContainerBag
													.createIProviderIDataContainerBag(
															this.m_aIProviderIDataContainerBag
																	.size(),
															iProvider, null,
															null));
						}
						return iDDeleteList;
					},
					deleteProviderByType : function(aIProvider, providerT) {
						var iDDeleteList;
						var iXIteratorProviderDelete;
						var providerDelete;
						var iProvider;
						if (aIProvider === null) {
							return null;
						}
						this.doInitialize(false);
						iDDeleteList = sap.firefly.XList.create();
						iXIteratorProviderDelete = aIProvider.getIterator();
						while (iXIteratorProviderDelete.hasNext()) {
							providerDelete = iXIteratorProviderDelete.next()
									.getStringValue();
							if (!(sap.firefly.XString.isEqual(
									sap.firefly.QueueStatusT.T_OFF.getName(),
									this.m_queue_status.getName()))
									&& (this.m_aIProviderIDataContainerBag
											.containsKey(providerDelete))) {
								throw sap.firefly.XException
										.createIllegalArgumentException("");
							}
							iProvider = sap.firefly.ProviderFactory
									.createIProvider(providerT, providerDelete,
											null, null,
											sap.firefly.ActionT.T_DELETE, null,
											true, sap.firefly.AuditT.T_NO);
							iDDeleteList
									.add(sap.firefly.XStringValue
											.create(sap.firefly.XInteger
													.convertIntegerToString(this.m_aIProviderIDataContainerBag
															.size())));
							this.m_aIProviderIDataContainerBag
									.put(
											sap.firefly.XInteger
													.convertIntegerToString(this.m_aIProviderIDataContainerBag
															.size()),
											sap.firefly.ProviderDataContainerBag
													.createIProviderIDataContainerBag(
															this.m_aIProviderIDataContainerBag
																	.size(),
															iProvider, null,
															null));
						}
						return iDDeleteList;
					},
					getProviderReferences : function(provider) {
						var iProvider;
						if (provider === null) {
							return null;
						}
						this.assertQueueAndProvider(provider);
						iProvider = sap.firefly.ProviderFactory
								.createIProvider(sap.firefly.ProviderT.AINX,
										provider, null, null,
										sap.firefly.ActionT.T_GET, null, true,
										sap.firefly.AuditT.T_NO);
						(iProvider)
								.setActionPrefix(sap.firefly.InAConstants.QY_REFERENCES);
						this.m_aIProviderIDataContainerBag
								.put(
										sap.firefly.XInteger
												.convertIntegerToString(this.m_aIProviderIDataContainerBag
														.size()),
										sap.firefly.ProviderDataContainerBag
												.createIProviderIDataContainerBag(
														this.m_aIProviderIDataContainerBag
																.size(),
														iProvider, null, null));
						return provider;
					},
					getProviderProposal : function(provider, dataContainer) {
						var iProvider;
						if (provider === null) {
							return null;
						}
						this.assertQueueAndProvider(provider);
						iProvider = sap.firefly.ProviderFactory
								.createIProvider(sap.firefly.ProviderT.AINX,
										provider, null, null,
										sap.firefly.ActionT.T_NO, null, true,
										sap.firefly.AuditT.T_NO);
						this.m_aIProviderIDataContainerBag
								.put(
										sap.firefly.XInteger
												.convertIntegerToString(this.m_aIProviderIDataContainerBag
														.size()),
										sap.firefly.ProviderDataContainerBag
												.createIProviderIDataContainerBag(
														this.m_aIProviderIDataContainerBag
																.size(),
														iProvider,
														dataContainer, null));
						return provider;
					},
					loadData : function(provider, dataContainer) {
						var iProvider;
						if (provider === null) {
							return null;
						}
						this.assertQueueAndProvider(provider);
						iProvider = sap.firefly.ProviderFactory
								.createIProvider(sap.firefly.ProviderT.AINX,
										provider, null, null,
										sap.firefly.ActionT.T_NO, null, true,
										sap.firefly.AuditT.T_NO);
						this.m_aIProviderIDataContainerBag
								.put(
										sap.firefly.XInteger
												.convertIntegerToString(this.m_aIProviderIDataContainerBag
														.size()),
										sap.firefly.ProviderDataContainerBag
												.createIProviderIDataContainerBag(
														this.m_aIProviderIDataContainerBag
																.size(),
														iProvider,
														dataContainer,
														dataContainer
																.getICleansing()));
						return provider;
					},
					createProviderAndLoadData : function(provider,
							dataContainer) {
						if (provider === null) {
							return null;
						}
						this.assertQueueAndProvider(provider.getName());
						this.m_aIProviderIDataContainerBag
								.put(
										sap.firefly.XInteger
												.convertIntegerToString(this.m_aIProviderIDataContainerBag
														.size()),
										sap.firefly.ProviderDataContainerBag
												.createIProviderIDataContainerBag(
														this.m_aIProviderIDataContainerBag
																.size(),
														provider,
														dataContainer,
														dataContainer
																.getICleansing()));
						return provider.getName();
					},
					createIDataContainerBag : function(contentType,
							dataLocationT, dataLocation, data, action) {
						return sap.firefly.DataContainer.createIDataContainer(
								contentType, dataLocationT, dataLocation, data,
								action);
					},
					createIProviderBag : function(providerType, name,
							description, action, aIAttribute, isWritable, audit) {
						return sap.firefly.ProviderFactory.createIProvider(
								providerType, name, null, description, action,
								aIAttribute, isWritable, audit);
					},
					createICleansingBag : function() {
						if (this.m_iworkspace_bag === null) {
							return null;
						}
						if (this.m_iworkspace_bag.getWorkspace() === null) {
							return null;
						}
						return sap.firefly.CleansingManager
								.createICleansing(this.m_iworkspace_bag
										.getWorkspace()
										.getICleansingActionType());
					},
					doInitialize : function(force) {
						(this.m_iworkspace_bag.getWorkspace())
								.setAction(sap.firefly.ActionT.T_NO);
						if ((sap.firefly.XString.isEqual(
								sap.firefly.QueueStatusT.T_OFF.getName(),
								this.m_queue_status.getName()))
								|| (sap.firefly.XString.isEqual(
										sap.firefly.QueueStatusT.T_FLUSHED
												.getName(), this.m_queue_status
												.getName())) || (force)) {
							this.m_aIProviderIDataContainerBag = sap.firefly.XHashMapByString
									.create();
						}
					},
					getQueryManager : function(provider, dataContainer) {
						var iQDataSourceBase;
						var iXStringBuffer;
						var serviceConfig;
						var serviceExtResult;
						var iQueryManager;
						var iQDataSourceBaseQuery;
						if (dataContainer === null) {
							return null;
						}
						if (dataContainer.getICleansing() === null) {
							return null;
						}
						iQDataSourceBase = this.m_config.getDataSource();
						iQDataSourceBase
								.setType(sap.firefly.MetaObjectType.AINX_PROVIDER);
						iQDataSourceBase.setInstanceId(dataContainer
								.getICleansing().getInstanceId());
						iQDataSourceBase
								.setEnvironmentName(this.m_iworkspace_bag
										.getWorkspace().getName());
						iQDataSourceBase.setName(provider.getName());
						iQDataSourceBase.setObjectName(provider.getName());
						iXStringBuffer = sap.firefly.XStringBuffer.create();
						iXStringBuffer
								.append(sap.firefly.InAConstants.QY_DATA_AREA);
						iXStringBuffer.append(":");
						iXStringBuffer.append(this.m_iworkspace_bag
								.getWorkspace().getName());
						iQDataSourceBase.setDataArea(iXStringBuffer.toString());
						serviceConfig = sap.firefly.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER
								.createServiceConfig(this.getApplication());
						serviceConfig
								.setProviderType(sap.firefly.ProviderType.ANALYTICS);
						serviceConfig.setSystemName(this.m_config
								.getSystemName());
						serviceConfig.setDataSource(iQDataSourceBase);
						serviceExtResult = serviceConfig
								.processQueryManagerCreation(
										sap.firefly.SyncType.BLOCKING, null,
										null);
						if (serviceExtResult === null) {
							throw sap.firefly.XException
									.createRuntimeException("IQueryConsumerService is NULL");
						}
						if (serviceExtResult.hasErrors()
								|| (serviceExtResult.getData() === null)) {
							throw sap.firefly.XException
									.createRuntimeException(serviceExtResult
											.getSummary());
						}
						iQueryManager = serviceExtResult.getData();
						if (iQueryManager !== null) {
							iQDataSourceBaseQuery = iQueryManager
									.getQueryModel().getDataSource();
							iQDataSourceBaseQuery.setType(iQDataSourceBase
									.getType());
							iQDataSourceBaseQuery
									.setInstanceId(iQDataSourceBase
											.getInstanceId());
							iQDataSourceBaseQuery
									.setEnvironmentName(iQDataSourceBase
											.getEnvironmentName());
							iQDataSourceBaseQuery.setName(iQDataSourceBase
									.getName());
							iQDataSourceBaseQuery
									.setObjectName(iQDataSourceBase
											.getObjectName());
							iQDataSourceBaseQuery.setDataArea(iQDataSourceBase
									.getDataArea());
							return iQueryManager;
						}
						return null;
					},
					processWorkspaceSync : function(syncType, listener,
							customIdentifier) {
						if (this.m_iworkspace_bag.getWorkspace().getAction() === sap.firefly.ActionT.T_NO) {
							return sap.firefly.QWorkspaceProviderDataContainerBagAction
									.createAndRun(syncType, listener,
											customIdentifier, this);
						}
						return sap.firefly.QWorkspaceAction.createAndRun(
								syncType, listener, customIdentifier, this);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.WorkstatusManager",
				sap.firefly.DfApplicationContext,
				{
					$statics : {
						staticSetup : function() {
						},
						create : function(application, config, queryManager) {
							var object = new sap.firefly.WorkstatusManager();
							object.setupWorkstatusManager(application, config,
									queryManager);
							return object;
						}
					},
					m_query_manager : null,
					m_workstatus_member_manager : null,
					m_iq_selection_component : null,
					setupWorkstatusManager : function(application, config,
							queryManager) {
						this.setupApplicationContext(application);
						this.m_query_manager = queryManager;
					},
					getQueryManager : function() {
						return this.m_query_manager;
					},
					getQueryModel : function() {
						return this.m_query_manager.getQueryModel();
					},
					createCartesianProduct : function() {
						return sap.firefly.QFactory2
								.newFilterCartesianProduct(null);
					},
					getMemberManager : function(workstatusMode) {
						this.m_workstatus_member_manager = sap.firefly.WorkstatusMemberManager
								.createMemberManager(this.getQueryModel(),
										workstatusMode);
						return this.m_workstatus_member_manager;
					},
					processWorkstatusGet : function(syncType, listener,
							customIdentifier, iQSelectionCartesianProduct) {
						this.m_iq_selection_component = iQSelectionCartesianProduct;
						return sap.firefly.QWorkstatusGetAction.createAndRun(
								syncType, listener, customIdentifier, this,
								this.m_iq_selection_component);
					},
					processWorkstatusGets : function(syncType, listener,
							customIdentifier, iWorkstatusMemberManager) {
						if (iWorkstatusMemberManager === null) {
							return null;
						}
						this.m_iq_selection_component = this.m_workstatus_member_manager
								.getIQSelectionComponent();
						return sap.firefly.QWorkstatusGetAction.createAndRun(
								syncType, listener, customIdentifier, this,
								this.m_iq_selection_component);
					},
					processWorkstatusSet : function(syncType, listener,
							customIdentifier, iQSelectionCartesianProduct) {
						this.m_iq_selection_component = iQSelectionCartesianProduct;
						return sap.firefly.QWorkstatusSetAction.createAndRun(
								syncType, listener, customIdentifier, this,
								this.m_iq_selection_component);
					},
					processWorkstatusSets : function(syncType, listener,
							customIdentifier, iWorkstatusMemberManager) {
						if (iWorkstatusMemberManager === null) {
							return null;
						}
						this.m_iq_selection_component = this.m_workstatus_member_manager
								.getIQSelectionComponent();
						return sap.firefly.QWorkstatusSetAction.createAndRun(
								syncType, listener, customIdentifier, this,
								this.m_iq_selection_component);
					},
					processWorkstatusCancel : function(syncType, listener,
							customIdentifier) {
						var iQDimensionsCANCEL = this.getQueryModel()
								.getDimensions();
						var rowsAxisCANCEL;
						var iXIteratorCANCEL;
						var iQDimensionCANCEL;
						var fieldCANCEL;
						var iQFieldListReadOnlyCANCEL;
						var iXIteratorIQFieldCANCEL;
						var iQFieldCANCEL;
						var iQFieldListCANCEL;
						var memberSelection;
						var element;
						this.m_iq_selection_component = this
								.createCartesianProduct();
						rowsAxisCANCEL = this.getQueryModel().getRowsAxis();
						iXIteratorCANCEL = iQDimensionsCANCEL.getIterator();
						while (iXIteratorCANCEL.hasNext()) {
							iQDimensionCANCEL = iXIteratorCANCEL.next();
							if (iQDimensionCANCEL.getSupportedAxesTypes()
									.contains(sap.firefly.AxisType.ROWS)) {
								rowsAxisCANCEL.add(iQDimensionCANCEL);
							}
							fieldCANCEL = iQDimensionCANCEL.getKeyField();
							iQFieldListReadOnlyCANCEL = iQDimensionCANCEL
									.getFields();
							iXIteratorIQFieldCANCEL = iQFieldListReadOnlyCANCEL
									.getIterator();
							while (iXIteratorIQFieldCANCEL.hasNext()) {
								iQFieldCANCEL = iXIteratorIQFieldCANCEL.next();
								iQFieldListCANCEL = iQDimensionCANCEL
										.getResultSetFields();
								iQFieldListCANCEL.add(iQFieldCANCEL);
							}
							if (fieldCANCEL.isFilterable() === false) {
								continue;
							}
							if (!sap.firefly.XString
									.isEqual(
											sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_CANCEL,
											iQDimensionCANCEL.getName())) {
								continue;
							}
							memberSelection = (this.m_iq_selection_component)
									.getCartesianList(fieldCANCEL
											.getDimension());
							if (memberSelection === null) {
								memberSelection = (this.m_iq_selection_component)
										.getCartesianListByField(fieldCANCEL);
							}
							if (memberSelection.size() === 0) {
								memberSelection.setField(fieldCANCEL);
							}
							element = memberSelection.addNewCartesianElement();
							if (sap.firefly.XValueType.BOOLEAN === fieldCANCEL
									.getValueType()) {
								if (sap.firefly.XString
										.isEqual(
												sap.firefly.InAConstants.QY_WORKSTATUS_TATTRIBUTE_CANCEL,
												iQDimensionCANCEL.getName())) {
									element
											.configureSingleParameterExpression(
													sap.firefly.XBooleanValue
															.create(true),
													sap.firefly.ComparisonOperator.EQUAL);
								}
							}
						}
						return sap.firefly.QWorkstatusCancelAction
								.createAndRun(syncType, listener,
										customIdentifier, this,
										this.m_iq_selection_component);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectGetAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector) {
							var qInfoObjectGetAction = new sap.firefly.QInfoObjectGetAction();
							qInfoObjectGetAction.setupInfoObjectActionAndRun(
									syncType, listener, customIdentifier,
									infoObjectManager,
									iInfoObjectDimensionManager,
									iInfoObjectSelector);
							return qInfoObjectGetAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = iInfoObjectSelector;
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(infoObjectManager
											.getDimensionManager()
											.getDimension());
						}
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectGetAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var rpcFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request = rpcFunction.getRequest();
						request.setRequestStructure(this.serialize());
						rpcFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									masterdataResult.parse(result.getData(),
											sap.firefly.InfoObjectMode._GET);
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectGet(extResult, data,
								customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructure = sap.firefly.PrStructure.create();
						var iPrStructureAnalytics = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var prListSorting;
						var iQSortingManager;
						var xIterator;
						var iPrStructureElement;
						var iQGenericSorting;
						var iQFieldSorting;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructureAnalytics);
						this
								.serializeDataSourceStructure(iPrStructureAnalytics);
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_MASTERDATA);
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_ACTION,
								sap.firefly.InfoObjectMode._GET.getName());
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						(this.m_infoobject_selector)
								.serialize(iPrStructureDefinition);
						prListSorting = sap.firefly.PrList.create();
						iQSortingManager = infoObjectManager.getIQueryManager()
								.getQueryModel().getSortingManager();
						if (iQSortingManager !== null) {
							xIterator = iQSortingManager.getSortingOperations()
									.getIterator();
							while (xIterator.hasNext()) {
								iPrStructureElement = sap.firefly.PrStructure
										.create();
								iQGenericSorting = xIterator.next();
								if (sap.firefly.XString.isEqual(
										sap.firefly.SortType.FIELD.getName(),
										iQGenericSorting.getSortingType()
												.getName())) {
									iQFieldSorting = (iQGenericSorting);
									iPrStructureElement
											.setStringByName(
													sap.firefly.InAConstants.QY_DIMENSION,
													iQFieldSorting.getField()
															.getDimension()
															.getName());
									iPrStructureElement
											.setStringByName(
													sap.firefly.InAConstants.QY_FIELD_NAME,
													iQFieldSorting.getField()
															.getName());
									iPrStructureElement
											.setStringByName(
													sap.firefly.InAConstants.QY_SORT_TYPE,
													iQFieldSorting
															.getSortingType()
															.getName());
									iPrStructureElement
											.setStringByName(
													sap.firefly.InAConstants.QY_DIRECTION,
													iQFieldSorting
															.getDirection()
															.getName());
								}
								prListSorting.add(iPrStructureElement);
							}
						}
						iPrStructureDefinition
								.setElementByName(
										sap.firefly.InAConstants.QY_SORT,
										prListSorting);
						iPrStructureAnalytics.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_ANALYTICS,
								iPrStructureAnalytics);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_INSTANCE_ID,
								(this.m_infoobject_dimension_manager)
										.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_MASTERDATA);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectHierarchyCheckAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector) {
							var qInfoObjectHierarchyCheckAction = new sap.firefly.QInfoObjectHierarchyCheckAction();
							qInfoObjectHierarchyCheckAction
									.setupInfoObjectActionAndRun(syncType,
											listener, customIdentifier,
											infoObjectManager,
											iInfoObjectDimensionManager,
											iInfoObjectSelector);
							return qInfoObjectHierarchyCheckAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					m_capabilites : null,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = iInfoObjectSelector;
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(infoObjectManager
											.getDimensionManager()
											.getDimension());
						}
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectHierarchyCheckAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var rpcFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request;
						this.m_capabilites = sap.firefly.QInfoObjectCapabilities
								.create(connection.getServerMetadata(),
										sap.firefly.ProviderType.ANALYTICS);
						request = rpcFunction.getRequest();
						request.setRequestStructure(this.serialize());
						rpcFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									masterdataResult
											.parse(
													result.getData(),
													sap.firefly.InfoObjectMode._HIERARCHY_CHECK);
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectHierarchyCheck(extResult, data,
								customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructureAnalytics = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var iPrStructure;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructureAnalytics);
						this
								.serializeDataSourceStructure(iPrStructureAnalytics);
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_HIERARCHY_LIST);
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_ACTION,
								sap.firefly.InfoObjectMode._HIERARCHY_CHECK
										.getName());
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						if (this.m_infoobject_selector === null) {
							this.m_infoobject_selector = ((this.m_infoobject_dimension_manager)
									.getHierarchyManager())
									.getIQSelectorHierarchy();
						}
						(this.m_infoobject_selector).addIQHierarchySelection(
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getIQHierarchyValueHelp(),
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getBaseHierarchy());
						(this.m_infoobject_selector)
								.serialize(iPrStructureDefinition);
						((this.m_infoobject_dimension_manager)
								.getHierarchyManager())
								.serializeCheck(iPrStructureDefinition);
						iPrStructureAnalytics.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure = sap.firefly.PrStructure.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_PLANNING,
								iPrStructureAnalytics);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS
								.setStringByName(
										sap.firefly.InAConstants.QY_INSTANCE_ID,
										((this.m_infoobject_dimension_manager)
												.getHierarchyManager())
												.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_HIERARCHY_LIST);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						prListC.addAll(this.m_capabilites
								.exportActiveMainCapabilitiesAsList());
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectHierarchyCopyAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector) {
							var qInfoObjectHierarchyCopyAction = new sap.firefly.QInfoObjectHierarchyCopyAction();
							qInfoObjectHierarchyCopyAction
									.setupInfoObjectActionAndRun(syncType,
											listener, customIdentifier,
											infoObjectManager,
											iInfoObjectDimensionManager,
											iInfoObjectSelector);
							return qInfoObjectHierarchyCopyAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = iInfoObjectSelector;
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(infoObjectManager
											.getDimensionManager()
											.getDimension());
						}
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectHierarchyCopyAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var rpcFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request = rpcFunction.getRequest();
						request.setRequestStructure(this.serialize());
						rpcFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									masterdataResult
											.parse(
													result.getData(),
													sap.firefly.InfoObjectMode._HIERARCHY_COPY);
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectHierarchyModify(extResult, data,
								customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructurePlanning = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var iPrStructure;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructurePlanning);
						this.serializeDataSourceStructure(iPrStructurePlanning);
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_HIERARCHY_LIST);
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_ACTION,
								sap.firefly.InfoObjectMode._HIERARCHY_COPY
										.getName());
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						if (this.m_infoobject_selector === null) {
							this.m_infoobject_selector = ((this.m_infoobject_dimension_manager)
									.getHierarchyManager())
									.getIQSelectorHierarchy();
						}
						(this.m_infoobject_selector).addIQHierarchySelection(
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getIQHierarchyValueHelp(),
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getBaseHierarchy());
						(this.m_infoobject_selector)
								.serialize(iPrStructureDefinition);
						((this.m_infoobject_dimension_manager)
								.getHierarchyManager())
								.serialize(iPrStructureDefinition);
						iPrStructurePlanning.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure = sap.firefly.PrStructure.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_PLANNING,
								iPrStructurePlanning);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS
								.setStringByName(
										sap.firefly.InAConstants.QY_INSTANCE_ID,
										((this.m_infoobject_dimension_manager)
												.getHierarchyManager())
												.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_HIERARCHY_LIST);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectHierarchyIntervalCheckAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector) {
							var qInfoObjectHierarchyIntervalCheckAction = new sap.firefly.QInfoObjectHierarchyIntervalCheckAction();
							qInfoObjectHierarchyIntervalCheckAction
									.setupInfoObjectActionAndRun(syncType,
											listener, customIdentifier,
											infoObjectManager,
											iInfoObjectDimensionManager,
											iInfoObjectSelector);
							return qInfoObjectHierarchyIntervalCheckAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					m_capabilites : null,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = iInfoObjectSelector;
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(infoObjectManager
											.getDimensionManager()
											.getDimension());
						}
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectHierarchyIntervalCheckAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var rpcFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request;
						this.m_capabilites = sap.firefly.QInfoObjectCapabilities
								.create(connection.getServerMetadata(),
										sap.firefly.ProviderType.ANALYTICS);
						request = rpcFunction.getRequest();
						request.setRequestStructure(this.serialize());
						rpcFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									masterdataResult
											.parse(
													result.getData(),
													sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_CHECK);
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectHierarchyIntervalCheck(extResult,
								data, customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructureAnalytics = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var iPrStructure;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructureAnalytics);
						this
								.serializeDataSourceStructure(iPrStructureAnalytics);
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_HIERARCHY_INTERVAL);
						iPrStructureAnalytics
								.setStringByName(
										sap.firefly.InAConstants.QY_ACTION,
										sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_CHECK
												.getName());
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						if (this.m_infoobject_selector === null) {
							this.m_infoobject_selector = ((this.m_infoobject_dimension_manager)
									.getHierarchyManager())
									.getIQSelectorHierarchy();
						}
						(this.m_infoobject_selector).addIQHierarchySelection(
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getIQHierarchyValueHelp(),
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getBaseHierarchy());
						(this.m_infoobject_selector)
								.serialize(iPrStructureDefinition);
						((this.m_infoobject_dimension_manager)
								.getHierarchyManager()
								.getHierarchyIntervalManager())
								.serializeIntervalCheck(iPrStructureDefinition);
						iPrStructureAnalytics.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure = sap.firefly.PrStructure.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_PLANNING,
								iPrStructureAnalytics);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS
								.setStringByName(
										sap.firefly.InAConstants.QY_INSTANCE_ID,
										((this.m_infoobject_dimension_manager)
												.getHierarchyManager())
												.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_HIERARCHY_INTERVAL);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						prListC.addAll(this.m_capabilites
								.exportActiveMainCapabilitiesAsList());
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectHierarchyIntervalGetAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector) {
							var gInfoObjectHierarchyIntervalGetAction = new sap.firefly.QInfoObjectHierarchyIntervalGetAction();
							gInfoObjectHierarchyIntervalGetAction
									.setupInfoObjectActionAndRun(syncType,
											listener, customIdentifier,
											infoObjectManager,
											iInfoObjectDimensionManager,
											iInfoObjectSelector);
							return gInfoObjectHierarchyIntervalGetAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					m_capabilites : null,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = iInfoObjectSelector;
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(infoObjectManager
											.getDimensionManager()
											.getDimension());
						}
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectHierarchyIntervalGetAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var rpcFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request;
						this.m_capabilites = sap.firefly.QInfoObjectCapabilities
								.create(connection.getServerMetadata(),
										sap.firefly.ProviderType.ANALYTICS);
						request = rpcFunction.getRequest();
						request.setRequestStructure(this.serialize());
						rpcFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									masterdataResult
											.parse(
													result.getData(),
													sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_GET);
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectHierarchyIntervalGet(extResult,
								data, customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructureAnalytics = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var iPrStructure;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructureAnalytics);
						this
								.serializeDataSourceStructure(iPrStructureAnalytics);
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_HIERARCHY_INTERVAL);
						iPrStructureAnalytics
								.setStringByName(
										sap.firefly.InAConstants.QY_ACTION,
										sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_GET
												.getName());
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						if (this.m_infoobject_selector === null) {
							this.m_infoobject_selector = ((this.m_infoobject_dimension_manager)
									.getHierarchyManager())
									.getIQSelectorHierarchy();
						}
						(this.m_infoobject_selector).addIQHierarchySelection(
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getIQHierarchyValueHelp(),
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getBaseHierarchy());
						(this.m_infoobject_selector)
								.serialize(iPrStructureDefinition);
						iPrStructureAnalytics.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure = sap.firefly.PrStructure.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_ANALYTICS,
								iPrStructureAnalytics);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS
								.setStringByName(
										sap.firefly.InAConstants.QY_INSTANCE_ID,
										((this.m_infoobject_dimension_manager)
												.getHierarchyManager())
												.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_HIERARCHY_INTERVAL);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						prListC.addAll(this.m_capabilites
								.exportActiveMainCapabilitiesAsList());
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectHierarchyIntervalModifyAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector) {
							var qInfoObjectHierarchyIntervalModifyAction = new sap.firefly.QInfoObjectHierarchyIntervalModifyAction();
							qInfoObjectHierarchyIntervalModifyAction
									.setupInfoObjectActionAndRun(syncType,
											listener, customIdentifier,
											infoObjectManager,
											iInfoObjectDimensionManager,
											iInfoObjectSelector);
							return qInfoObjectHierarchyIntervalModifyAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = iInfoObjectSelector;
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(infoObjectManager
											.getDimensionManager()
											.getDimension());
						}
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectHierarchyIntervalModifyAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var rpcFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request = rpcFunction.getRequest();
						request.setRequestStructure(this.serialize());
						rpcFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									masterdataResult
											.parse(
													result.getData(),
													sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_MODIFY);
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectHierarchyIntervalModify(extResult,
								data, customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructure = sap.firefly.PrStructure.create();
						var iPrStructurePlanning = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructurePlanning);
						this.serializeDataSourceStructure(iPrStructurePlanning);
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_HIERARCHY_INTERVAL);
						iPrStructurePlanning
								.setStringByName(
										sap.firefly.InAConstants.QY_ACTION,
										sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_MODIFY
												.getName());
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						if (this.m_infoobject_selector === null) {
							this.m_infoobject_selector = ((this.m_infoobject_dimension_manager)
									.getHierarchyManager())
									.getIQSelectorHierarchy();
						}
						(this.m_infoobject_selector).addIQHierarchySelection(
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getIQHierarchyValueHelp(),
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getBaseHierarchy());
						(this.m_infoobject_selector)
								.serialize(iPrStructureDefinition);
						((this.m_infoobject_dimension_manager)
								.getHierarchyManager()
								.getHierarchyIntervalManager())
								.serializeIntervalMember(iPrStructureDefinition);
						iPrStructurePlanning.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_PLANNING,
								iPrStructurePlanning);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS
								.setStringByName(
										sap.firefly.InAConstants.QY_INSTANCE_ID,
										((this.m_infoobject_dimension_manager)
												.getHierarchyManager())
												.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_HIERARCHY_INTERVAL);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectHierarchyMemberCheckAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector) {
							var qInfoObjectHierarchyMemberCheckAction = new sap.firefly.QInfoObjectHierarchyMemberCheckAction();
							qInfoObjectHierarchyMemberCheckAction
									.setupInfoObjectActionAndRun(syncType,
											listener, customIdentifier,
											infoObjectManager,
											iInfoObjectDimensionManager,
											iInfoObjectSelector);
							return qInfoObjectHierarchyMemberCheckAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					m_capabilites : null,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = iInfoObjectSelector;
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(infoObjectManager
											.getDimensionManager()
											.getDimension());
						}
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectHierarchyMemberCheckAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var ocpFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request;
						this.m_capabilites = sap.firefly.QInfoObjectCapabilities
								.create(connection.getServerMetadata(),
										sap.firefly.ProviderType.ANALYTICS);
						request = ocpFunction.getRequest();
						request.setRequestStructure(this.serialize());
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									masterdataResult
											.parse(
													result.getData(),
													sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_CHECK);
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectHierarchyMemberCheck(extResult,
								data, customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructure = sap.firefly.PrStructure.create();
						var iPrStructurePlanning = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructurePlanning);
						this.serializeDataSourceStructure(iPrStructurePlanning);
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_HIERARCHY_MEMBER);
						iPrStructurePlanning
								.setStringByName(
										sap.firefly.InAConstants.QY_ACTION,
										sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_CHECK
												.getName());
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						if (this.m_infoobject_selector === null) {
							this.m_infoobject_selector = ((this.m_infoobject_dimension_manager)
									.getHierarchyManager())
									.getIQSelectorHierarchy();
						}
						(this.m_infoobject_selector).addIQHierarchySelection(
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getIQHierarchyValueHelp(),
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getBaseHierarchy());
						(this.m_infoobject_selector)
								.serialize(iPrStructureDefinition);
						((this.m_infoobject_dimension_manager)
								.getHierarchyManager())
								.serializeMemberCheck(iPrStructureDefinition);
						iPrStructurePlanning.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_PLANNING,
								iPrStructurePlanning);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS
								.setStringByName(
										sap.firefly.InAConstants.QY_INSTANCE_ID,
										((this.m_infoobject_dimension_manager)
												.getHierarchyManager())
												.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_HIERARCHY_MEMBER);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						prListC.addAll(this.m_capabilites
								.exportActiveMainCapabilitiesAsList());
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectHierarchyMemberGetAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector) {
							var qInfoObjectHierarchyMemberGetAction = new sap.firefly.QInfoObjectHierarchyMemberGetAction();
							qInfoObjectHierarchyMemberGetAction
									.setupInfoObjectActionAndRun(syncType,
											listener, customIdentifier,
											infoObjectManager,
											iInfoObjectDimensionManager,
											iInfoObjectSelector);
							return qInfoObjectHierarchyMemberGetAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					m_capabilites : null,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = iInfoObjectSelector;
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(infoObjectManager
											.getDimensionManager()
											.getDimension());
						}
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectHierarchyMemberGetAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var ocpFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request;
						this.m_capabilites = sap.firefly.QInfoObjectCapabilities
								.create(connection.getServerMetadata(),
										sap.firefly.ProviderType.ANALYTICS);
						request = ocpFunction.getRequest();
						request.setRequestStructure(this.serialize());
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									masterdataResult
											.parse(
													result.getData(),
													sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_GET);
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectHierarchyMemberGet(extResult,
								data, customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructure = sap.firefly.PrStructure.create();
						var iPrStructureAnalytics = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructureAnalytics);
						this
								.serializeDataSourceStructure(iPrStructureAnalytics);
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructureAnalytics.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_HIERARCHY_MEMBER);
						iPrStructureAnalytics
								.setStringByName(
										sap.firefly.InAConstants.QY_ACTION,
										sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_GET
												.getName());
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						if (this.m_infoobject_selector === null) {
							this.m_infoobject_selector = ((this.m_infoobject_dimension_manager)
									.getHierarchyManager())
									.getIQSelectorHierarchy();
						}
						(this.m_infoobject_selector).addIQHierarchySelection(
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getIQHierarchyValueHelp(),
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getBaseHierarchy());
						(this.m_infoobject_selector)
								.serialize(iPrStructureDefinition);
						iPrStructureAnalytics.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_ANALYTICS,
								iPrStructureAnalytics);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS
								.setStringByName(
										sap.firefly.InAConstants.QY_INSTANCE_ID,
										((this.m_infoobject_dimension_manager)
												.getHierarchyManager())
												.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_HIERARCHY_MEMBER);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						prListC.addAll(this.m_capabilites
								.exportActiveMainCapabilitiesAsList());
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectHierarchyMemberModifyAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector) {
							var qInfoObjectHierarchyMemberModifyAction = new sap.firefly.QInfoObjectHierarchyMemberModifyAction();
							qInfoObjectHierarchyMemberModifyAction
									.setupInfoObjectActionAndRun(syncType,
											listener, customIdentifier,
											infoObjectManager,
											iInfoObjectDimensionManager,
											iInfoObjectSelector);
							return qInfoObjectHierarchyMemberModifyAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					m_capabilites : null,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = iInfoObjectSelector;
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(infoObjectManager
											.getDimensionManager()
											.getDimension());
						}
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectHierarchyMemberModifyAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var ocpFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request;
						this.m_capabilites = sap.firefly.QInfoObjectCapabilities
								.create(connection.getServerMetadata(),
										sap.firefly.ProviderType.ANALYTICS);
						request = ocpFunction.getRequest();
						request.setRequestStructure(this.serialize());
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									masterdataResult
											.parse(
													result.getData(),
													sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_MODIFY);
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectHierarchyMemberModify(extResult,
								data, customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructure = sap.firefly.PrStructure.create();
						var iPrStructurePlanning = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructurePlanning);
						this.serializeDataSourceStructure(iPrStructurePlanning);
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_HIERARCHY_MEMBER);
						iPrStructurePlanning
								.setStringByName(
										sap.firefly.InAConstants.QY_ACTION,
										sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_MODIFY
												.getName());
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						if (this.m_infoobject_selector === null) {
							this.m_infoobject_selector = ((this.m_infoobject_dimension_manager)
									.getHierarchyManager())
									.getIQSelectorHierarchy();
						}
						(this.m_infoobject_selector).addIQHierarchySelection(
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getIQHierarchyValueHelp(),
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getBaseHierarchy());
						(this.m_infoobject_selector)
								.serialize(iPrStructureDefinition);
						((this.m_infoobject_dimension_manager)
								.getHierarchyManager())
								.serializeMember(iPrStructureDefinition);
						iPrStructurePlanning.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_PLANNING,
								iPrStructurePlanning);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS
								.setStringByName(
										sap.firefly.InAConstants.QY_INSTANCE_ID,
										((this.m_infoobject_dimension_manager)
												.getHierarchyManager())
												.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_HIERARCHY_MEMBER);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						prListC.addAll(this.m_capabilites
								.exportActiveMainCapabilitiesAsList());
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectHierarchyModifyAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector) {
							var qInfoObjectHierarchyModifyAction = new sap.firefly.QInfoObjectHierarchyModifyAction();
							qInfoObjectHierarchyModifyAction
									.setupInfoObjectActionAndRun(syncType,
											listener, customIdentifier,
											infoObjectManager,
											iInfoObjectDimensionManager,
											iInfoObjectSelector);
							return qInfoObjectHierarchyModifyAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					m_capabilites : null,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = iInfoObjectSelector;
						if (iInfoObjectSelector === null) {
							this.m_infoobject_selector = sap.firefly.InfoObjectSelector
									.createIInfoObjectSelector(infoObjectManager
											.getDimensionManager()
											.getDimension());
						}
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectHierarchyModifyAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var ocpFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request;
						this.m_capabilites = sap.firefly.QInfoObjectCapabilities
								.create(connection.getServerMetadata(),
										sap.firefly.ProviderType.ANALYTICS);
						request = ocpFunction.getRequest();
						request.setRequestStructure(this.serialize());
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									masterdataResult
											.parse(
													result.getData(),
													sap.firefly.InfoObjectMode._HIERARCHY_MODIFY);
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectHierarchyModify(extResult, data,
								customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructure = sap.firefly.PrStructure.create();
						var iPrStructurePlanning = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructurePlanning);
						this.serializeDataSourceStructure(iPrStructurePlanning);
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_HIERARCHY_LIST);
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_ACTION,
								sap.firefly.InfoObjectMode._HIERARCHY_MODIFY
										.getName());
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						if (this.m_infoobject_selector === null) {
							this.m_infoobject_selector = ((this.m_infoobject_dimension_manager)
									.getHierarchyManager())
									.getIQSelectorHierarchy();
						}
						(this.m_infoobject_selector).addIQHierarchySelection(
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getIQHierarchyValueHelp(),
								((this.m_infoobject_dimension_manager)
										.getHierarchyManager())
										.getBaseHierarchy());
						(this.m_infoobject_selector)
								.serialize(iPrStructureDefinition);
						((this.m_infoobject_dimension_manager)
								.getHierarchyManager())
								.serialize(iPrStructureDefinition);
						iPrStructurePlanning.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_PLANNING,
								iPrStructurePlanning);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS
								.setStringByName(
										sap.firefly.InAConstants.QY_INSTANCE_ID,
										((this.m_infoobject_dimension_manager)
												.getHierarchyManager())
												.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_HIERARCHY_LIST);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						prListC.addAll(this.m_capabilites
								.exportActiveMainCapabilitiesAsList());
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectHierarchySaveAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager, aHierarchy,
								iInfoObjectSelector, activate) {
							var qInfoObjectHierarchySaveAction = new sap.firefly.QInfoObjectHierarchySaveAction();
							qInfoObjectHierarchySaveAction
									.setupInfoObjectActionAndRun(syncType,
											listener, customIdentifier,
											infoObjectManager,
											iInfoObjectDimensionManager,
											aHierarchy, iInfoObjectSelector,
											activate);
							return qInfoObjectHierarchySaveAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_hierarchy_to_save : null,
					m_capabilites : null,
					m_activate : false,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, aHierarchy,
							iInfoObjectSelector, activate) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_hierarchy_to_save = aHierarchy;
						this.m_activate = activate;
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectHierarchySaveAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var ocpFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request;
						this.m_capabilites = sap.firefly.QInfoObjectCapabilities
								.create(connection.getServerMetadata(),
										sap.firefly.ProviderType.ANALYTICS);
						request = ocpFunction.getRequest();
						request.setRequestStructure(this.serialize());
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						var iXIteratorHierarchy;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									if (this.m_activate) {
										masterdataResult
												.parse(
														result.getData(),
														sap.firefly.InfoObjectMode._HIERARCHY_SAVE_AND_ACTIVATE);
									} else {
										masterdataResult
												.parse(
														result.getData(),
														sap.firefly.InfoObjectMode._HIERARCHY_SAVE);
									}
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							} else {
								if (this.m_hierarchy_to_save !== null) {
									iXIteratorHierarchy = this.m_hierarchy_to_save
											.getIterator();
									while (iXIteratorHierarchy.hasNext()) {
										infoObjectManager.getDimensionManager()
												.getHierarchyManagerFactory()
												.clearHierarchyManager(
														iXIteratorHierarchy
																.next());
									}
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectHierarchySave(extResult, data,
								customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructure = sap.firefly.PrStructure.create();
						var iPrStructurePlanning = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructurePlanning);
						this.serializeDataSourceStructure(iPrStructurePlanning);
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_HIERARCHY_LIST);
						if (this.m_activate) {
							iPrStructurePlanning
									.setStringByName(
											sap.firefly.InAConstants.QY_ACTION,
											sap.firefly.InfoObjectMode._HIERARCHY_SAVE_AND_ACTIVATE
													.getName());
						} else {
							iPrStructurePlanning.setStringByName(
									sap.firefly.InAConstants.QY_ACTION,
									sap.firefly.InfoObjectMode._HIERARCHY_SAVE
											.getName());
						}
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						if (this.m_activate) {
							((this.m_infoobject_dimension_manager)
									.getHierarchyManager()).serializeToSave(
									iPrStructureDefinition,
									this.m_hierarchy_to_save, true);
						} else {
							((this.m_infoobject_dimension_manager)
									.getHierarchyManager()).serializeToSave(
									iPrStructureDefinition,
									this.m_hierarchy_to_save, false);
						}
						iPrStructurePlanning.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_PLANNING,
								iPrStructurePlanning);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS
								.setStringByName(
										sap.firefly.InAConstants.QY_INSTANCE_ID,
										((this.m_infoobject_dimension_manager)
												.getHierarchyManager())
												.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_HIERARCHY_LIST);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						prListC.addAll(this.m_capabilites
								.exportActiveMainCapabilitiesAsList());
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectModifyAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector) {
							var qInfoObjectModifyAction = new sap.firefly.QInfoObjectModifyAction();
							qInfoObjectModifyAction
									.setupInfoObjectActionAndRun(syncType,
											listener, customIdentifier,
											infoObjectManager,
											iInfoObjectDimensionManager,
											iInfoObjectSelector);
							return qInfoObjectModifyAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = infoObjectManager
								.getIInfoObjectSelector();
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectModifyAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var ocpFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request = ocpFunction.getRequest();
						request.setRequestStructure(this.serialize());
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									masterdataResult.parse(result.getData(),
											sap.firefly.InfoObjectMode._MODIFY);
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectModify(extResult, data,
								customIdentifier);
					},
					serialize : function() {
						var infoObjectManager = this.getActionContext();
						var iPrStructure = sap.firefly.PrStructure.create();
						var iPrStructurePlanning = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var prListSorting;
						var iQSortingManager;
						var xIterator;
						var iPrStructureElement;
						var iQGenericSorting;
						var iQFieldSorting;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructurePlanning);
						this.serializeDataSourceStructure(iPrStructurePlanning);
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_MASTERDATA);
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_ACTION,
								sap.firefly.InfoObjectMode._MODIFY.getName());
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						(this.m_infoobject_selector)
								.serialize(iPrStructureDefinition);
						(this.m_infoobject_dimension_manager)
								.serialize(iPrStructureDefinition);
						prListSorting = sap.firefly.PrList.create();
						iQSortingManager = infoObjectManager.getIQueryManager()
								.getQueryModel().getSortingManager();
						if (iQSortingManager !== null) {
							xIterator = iQSortingManager.getSortingOperations()
									.getIterator();
							while (xIterator.hasNext()) {
								iPrStructureElement = sap.firefly.PrStructure
										.create();
								iQGenericSorting = xIterator.next();
								if (sap.firefly.XString.isEqual(
										sap.firefly.SortType.FIELD.getName(),
										iQGenericSorting.getSortingType()
												.getName())) {
									iQFieldSorting = (iQGenericSorting);
									iPrStructureElement
											.setStringByName(
													sap.firefly.InAConstants.QY_DIMENSION,
													iQFieldSorting.getField()
															.getDimension()
															.getName());
									iPrStructureElement
											.setStringByName(
													sap.firefly.InAConstants.QY_FIELD_NAME,
													iQFieldSorting.getField()
															.getName());
									iPrStructureElement
											.setStringByName(
													sap.firefly.InAConstants.QY_SORT_TYPE,
													iQFieldSorting
															.getSortingType()
															.getName());
									iPrStructureElement
											.setStringByName(
													sap.firefly.InAConstants.QY_DIRECTION,
													iQFieldSorting
															.getDirection()
															.getName());
								}
								prListSorting.add(iPrStructureElement);
							}
						}
						iPrStructureDefinition
								.setElementByName(
										sap.firefly.InAConstants.QY_SORT,
										prListSorting);
						iPrStructurePlanning.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_PLANNING,
								iPrStructurePlanning);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_INSTANCE_ID,
								(this.m_infoobject_dimension_manager)
										.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_MASTERDATA);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QInfoObjectSaveAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, infoObjectManager,
								iInfoObjectDimensionManager,
								iInfoObjectSelector, activate) {
							var qInfoObjectSaveAction = new sap.firefly.QInfoObjectSaveAction();
							qInfoObjectSaveAction.setupInfoObjectActionAndRun(
									syncType, listener, customIdentifier,
									infoObjectManager,
									iInfoObjectDimensionManager,
									iInfoObjectSelector, activate);
							return qInfoObjectSaveAction;
						}
					},
					m_infoobject_dimension_manager : null,
					m_infoobject_selector : null,
					m_activate : false,
					setupInfoObjectActionAndRun : function(syncType, listener,
							customIdentifier, infoObjectManager,
							iInfoObjectDimensionManager, iInfoObjectSelector,
							activate) {
						this.m_infoobject_dimension_manager = iInfoObjectDimensionManager;
						this.m_infoobject_selector = infoObjectManager
								.getIInfoObjectSelector();
						this.m_activate = activate;
						this.setupActionAndRun(syncType, infoObjectManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QInfoObjectSaveAction";
					},
					processSynchronization : function(syncType) {
						var infoObjectManager = this.getActionContext();
						var systemName = infoObjectManager.getConfig()
								.getSystemName();
						var connectionPool = infoObjectManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var ocpFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request = ocpFunction.getRequest();
						request.setRequestStructure(this
								.serialize(this.m_activate));
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var infoObjectManager;
						var dimensionManager;
						var masterdataResult;
						var root;
						var result;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							infoObjectManager = this.getActionContext();
							dimensionManager = infoObjectManager
									.getDimensionManager();
							masterdataResult = sap.firefly.InfoObjectResult
									.create(infoObjectManager.getOlapEnv(),
											infoObjectManager.getConfig(),
											dimensionManager);
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										infoObjectManager.getApplication(),
										infoObjectManager.getSystemName(),
										root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									if (this.m_activate) {
										masterdataResult
												.parse(
														result.getData(),
														sap.firefly.InfoObjectMode._SAVE_AND_ACTIVATE);
									} else {
										masterdataResult
												.parse(
														result.getData(),
														sap.firefly.InfoObjectMode._SAVE);
									}
								} else {
									sap.firefly.XLogger.println(this
											.getMessages().toString());
								}
							}
							this.setData(masterdataResult);
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectSave(extResult, data,
								customIdentifier);
					},
					serialize : function(activate) {
						var infoObjectManager = this.getActionContext();
						var iPrStructure = sap.firefly.PrStructure.create();
						var iPrStructurePlanning = sap.firefly.PrStructure
								.create();
						var iPrStructureDefinition;
						var prListOp;
						this
								.serializeCapabilitiesStructure(iPrStructurePlanning);
						this.serializeDataSourceStructure(iPrStructurePlanning);
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								infoObjectManager.getTraceLevel().getName());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_LANGUAGE,
								infoObjectManager.getConfig()
										.getSystemDescription().getLanguage());
						iPrStructurePlanning.setStringByName(
								sap.firefly.InAConstants.QY_CONTEXT,
								sap.firefly.InAConstants.QY_MASTERDATA);
						if (activate) {
							iPrStructurePlanning
									.setStringByName(
											sap.firefly.InAConstants.QY_ACTION,
											sap.firefly.InfoObjectMode._SAVE_AND_ACTIVATE
													.getName());
						} else {
							iPrStructurePlanning.setStringByName(
									sap.firefly.InAConstants.QY_ACTION,
									sap.firefly.InfoObjectMode._SAVE.getName());
						}
						iPrStructureDefinition = sap.firefly.PrStructure
								.create();
						if (this.m_infoobject_selector !== null) {
							(this.m_infoobject_selector)
									.serialize(iPrStructureDefinition);
						}
						iPrStructurePlanning.setElementByName(
								sap.firefly.InAConstants.QY_DEFINITION,
								iPrStructureDefinition);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_PLANNING,
								iPrStructurePlanning);
						prListOp = sap.firefly.PrList.create();
						prListOp
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prListOp);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var infoObjectManager = this.getActionContext();
						var iPrStructureDS = sap.firefly.PrStructure.create();
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_INSTANCE_ID,
								(this.m_infoobject_dimension_manager)
										.getInstanceId());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_OBJECT_NAME,
								infoObjectManager.getConfig().getDataSource()
										.getObjectName());
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_MASTERDATA);
						iPrStructureDS.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								infoObjectManager.getConfig().getDataSource()
										.getEnvironmentName());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDS);
						return iPrStructureDS;
					},
					serializeCapabilitiesStructure : function(iPrStructure) {
						var prListC = sap.firefly.PrList.create();
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_CAPABILITIES,
								prListC);
						return prListC;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QWorkspaceAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, workspaceManager) {
							var qWorkspaceGetAction = new sap.firefly.QWorkspaceAction();
							qWorkspaceGetAction.setupWorkspaceActionAndRun(
									syncType, listener, customIdentifier,
									workspaceManager);
							return qWorkspaceGetAction;
						}
					},
					setupWorkspaceActionAndRun : function(syncType, listener,
							customIdentifier, workspaceManager) {
						this.setupActionAndRun(syncType, workspaceManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QWorkspaceAction";
					},
					processSynchronization : function(syncType) {
						var workspaceManager = this.getActionContext();
						var systemName = workspaceManager.getConfig()
								.getSystemName();
						var connectionPool = workspaceManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var ocpFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request = ocpFunction.getRequest();
						request.setRequestStructure(this.serialize());
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var workspaceManager;
						var workspace;
						var root;
						var result;
						var iPrStructureResultWorkspace;
						var iPrListProviders;
						var aIPrStructureOrdered;
						var i;
						var iPrStructureProviderExecuted;
						var order_id_m;
						var indexIPrStructure;
						var iXIteratorIPrStructure;
						var iPrStructure_m;
						var order_id_iPrStructure_m;
						var j;
						var reference_id_m;
						var iPrStructureProviderOrdered;
						var access_key_m;
						var iProvider_m_aIP;
						var iDataContainer;
						var iCleansing;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							workspaceManager = this.getActionContext();
							workspace = workspaceManager.getIWorkspaceBag()
									.getWorkspace();
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										workspaceManager.getApplication(),
										workspaceManager.getConfig()
												.getSystemName(), root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									iPrStructureResultWorkspace = result
											.getData()
											.getStructureByName(
													sap.firefly.InAConstants.QY_WORKSPACE);
									if (iPrStructureResultWorkspace !== null) {
										workspace
												.setNamespace(iPrStructureResultWorkspace
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_NAMESPACE,
																null));
										workspace
												.setPrefix(iPrStructureResultWorkspace
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_PREFIX,
																null));
										workspace
												.setIsGenerationOfSIDsAllowed(iPrStructureResultWorkspace
														.getBooleanByNameWithDefault(
																sap.firefly.InAConstants.QY_GENERATION_OF_SID_ALLOWED,
																false));
										workspace
												.parseICleansingActionType(iPrStructureResultWorkspace);
										iPrListProviders = iPrStructureResultWorkspace
												.getListByName(sap.firefly.InAConstants.QY_PROVIDERS);
										if (!sap.firefly.PrUtils
												.isListEmpty(iPrListProviders)) {
											aIPrStructureOrdered = sap.firefly.XList
													.create();
											for (i = 0; i < iPrListProviders
													.size(); i++) {
												iPrStructureProviderExecuted = iPrListProviders
														.getStructureByIndex(i);
												order_id_m = iPrStructureProviderExecuted
														.getIntegerByNameWithDefault(
																sap.firefly.InAConstants.QY_ORDER_ID,
																0);
												indexIPrStructure = 0;
												iXIteratorIPrStructure = aIPrStructureOrdered
														.getIterator();
												while (iXIteratorIPrStructure
														.hasNext()) {
													iPrStructure_m = iXIteratorIPrStructure
															.next();
													order_id_iPrStructure_m = iPrStructure_m
															.getIntegerByNameWithDefault(
																	sap.firefly.InAConstants.QY_ORDER_ID,
																	0);
													if (order_id_iPrStructure_m < order_id_m) {
														indexIPrStructure = indexIPrStructure + 1;
													}
												}
												aIPrStructureOrdered
														.insert(
																indexIPrStructure,
																iPrStructureProviderExecuted);
											}
											for (j = 0; j < aIPrStructureOrdered
													.size(); j++) {
												reference_id_m = null;
												iPrStructureProviderOrdered = aIPrStructureOrdered
														.get(j);
												access_key_m = reference_id_m = sap.firefly.XInteger
														.convertIntegerToString(iPrStructureProviderOrdered
																.getIntegerByNameWithDefault(
																		sap.firefly.InAConstants.QY_ORDER_ID,
																		-1));
												if (sap.firefly.XString
														.isEqual(
																sap.firefly.QueueT.T_NAMED_ORDERED
																		.getName(),
																workspaceManager
																		.getQueue()
																		.getName())) {
													reference_id_m = iPrStructureProviderOrdered
															.getStringByNameWithDefault(
																	sap.firefly.InAConstants.QY_NAME,
																	null);
												}
												iProvider_m_aIP = workspace
														.getProviderByName(reference_id_m);
												if ((workspaceManager
														.getIProviderIDataContainerBagMap() !== null)
														&& (workspaceManager
																.getIProviderIDataContainerBagMap()
																.containsKey(access_key_m))
														&& (workspaceManager
																.getIProviderIDataContainerBagMap()
																.getByKey(
																		access_key_m)
																.getIProvider() !== null)) {
													if (iProvider_m_aIP !== null) {
														iProvider_m_aIP = sap.firefly.ProviderFactory
																.updateIProvider(
																		workspace,
																		iProvider_m_aIP,
																		iPrStructureProviderOrdered);
													} else {
														iProvider_m_aIP = sap.firefly.ProviderFactory
																.updateIProvider(
																		workspace,
																		workspaceManager
																				.getIProviderIDataContainerBagMap()
																				.getByKey(
																						access_key_m)
																				.getIProvider(),
																		iPrStructureProviderOrdered);
													}
												} else {
													iProvider_m_aIP = sap.firefly.ProviderFactory
															.instantiateIProvider(
																	workspace,
																	iPrStructureProviderOrdered
																			.getStringByNameWithDefault(
																					sap.firefly.InAConstants.QY_NAME,
																					null),
																	iPrStructureProviderOrdered);
												}
												iDataContainer = null;
												if ((workspaceManager
														.getIProviderIDataContainerBagMap() !== null)
														&& (workspaceManager
																.getIProviderIDataContainerBagMap()
																.containsKey(access_key_m))
														&& (workspaceManager
																.getIProviderIDataContainerBagMap()
																.getByKey(
																		access_key_m)
																.getIDataContainer() !== null)) {
													iDataContainer = workspaceManager
															.getIProviderIDataContainerBagMap()
															.getByKey(
																	access_key_m)
															.getIDataContainer();
												} else {
													iDataContainer = sap.firefly.DataContainer
															.instantiateIDataContainer(iPrStructureProviderOrdered
																	.getStructureByName(sap.firefly.InAConstants.QY_DATA));
												}
												iCleansing = sap.firefly.CleansingManager
														.createICleansing(workspace
																.getICleansingActionType());
												this
														.parseCleansing(
																iProvider_m_aIP,
																iCleansing,
																iPrStructureProviderOrdered);
												workspace.setIProvider(
														iProvider_m_aIP,
														iDataContainer,
														iCleansing,
														reference_id_m);
												this
														.parseStatistics(
																workspace,
																reference_id_m,
																iPrStructureProviderOrdered);
											}
										}
									}
								}
							}
							this.setData(sap.firefly.WorkspaceBagManager
									.createIWorkspaceBag(workspace));
						}
						this.endSync();
					},
					parseCleansing : function(iProvider, iCleansing,
							iPrStructure) {
						var prElementTypeCleansing;
						var iPrStructureCleansing;
						if (iProvider === null) {
							return;
						}
						if (iCleansing === null) {
							return;
						}
						if (iPrStructure === null) {
							return;
						}
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_CLEANSING)) {
							prElementTypeCleansing = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_CLEANSING);
							if (prElementTypeCleansing === sap.firefly.PrElementType.STRUCTURE) {
								iPrStructureCleansing = iPrStructure
										.getStructureByName(sap.firefly.InAConstants.QY_CLEANSING);
								if (iPrStructureCleansing !== null) {
									this.parsePerformedActions(iProvider,
											iCleansing, iPrStructureCleansing);
								}
							}
						}
					},
					parsePerformedActions : function(iProvider, iCleansing,
							iPrStructure) {
						var prElementTypePerformedActions;
						var iPrListPerformedActions;
						var iPerformedActions;
						var iPrStructurePerformedAction;
						var iAttribute;
						var iCleansingActionType;
						var iCleansingAction;
						if (iProvider === null) {
							return;
						}
						if (iCleansing === null) {
							return;
						}
						if (iPrStructure === null) {
							return;
						}
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_CLEANSING_PERFORMED_ACTIONS)) {
							prElementTypePerformedActions = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_CLEANSING_PERFORMED_ACTIONS);
							if (prElementTypePerformedActions === sap.firefly.PrElementType.LIST) {
								iPrListPerformedActions = iPrStructure
										.getListByName(sap.firefly.InAConstants.QY_CLEANSING_PERFORMED_ACTIONS);
								for (iPerformedActions = 0; iPerformedActions < iPrListPerformedActions
										.size(); iPerformedActions++) {
									iPrStructurePerformedAction = iPrListPerformedActions
											.getStructureByIndex(iPerformedActions);
									if (iPrStructurePerformedAction !== null) {
										iAttribute = iProvider
												.getIAttributeByName(iPrStructurePerformedAction
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_ATTRIBUTE,
																null));
										iCleansingActionType = iCleansing
												.getICleansingActionTypeByName(iPrStructurePerformedAction
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_CLEANSING_ACTION,
																null));
										iCleansingAction = sap.firefly.CleansingAction
												.createICleansingAction(
														iCleansingActionType,
														iAttribute);
										iCleansingAction
												.setIXValueToBeReplaced(sap.firefly.XStringValue
														.create(iPrStructurePerformedAction
																.getStringByNameWithDefault(
																		sap.firefly.InAConstants.QY_CLEANSING_VALUE_TO_BE_REPLACED,
																		null)));
										iCleansingAction
												.setIXValue(sap.firefly.XStringValue
														.create(iPrStructurePerformedAction
																.getStringByNameWithDefault(
																		sap.firefly.InAConstants.QY_CLEANSING_VALUE,
																		null)));
										(iCleansingAction)
												.setRow(iPrStructurePerformedAction
														.getIntegerByNameWithDefault(
																sap.firefly.InAConstants.QY_ROW,
																-1));
										(iCleansing)
												.addPerformedICleansingAction(iCleansingAction);
									}
								}
							}
						}
					},
					parseStatistics : function(iWorkspace, referenceId,
							iPrStructure) {
						var iCleansing;
						var aICleansingActionType;
						var prElementTypeStatistics;
						var iPrStructureStatistics;
						var iXIterator;
						var iCleansingActionType;
						var counter;
						if (iWorkspace === null) {
							return;
						}
						if (iPrStructure === null) {
							return;
						}
						iCleansing = iWorkspace
								.getCleansingManagerByName(referenceId);
						if (iCleansing === null) {
							return;
						}
						aICleansingActionType = iWorkspace
								.getICleansingActionType();
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_STATISTICS)) {
							prElementTypeStatistics = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_STATISTICS);
							if (prElementTypeStatistics === sap.firefly.PrElementType.STRUCTURE) {
								iPrStructureStatistics = iPrStructure
										.getStructureByName(sap.firefly.InAConstants.QY_STATISTICS);
								if (iPrStructureStatistics !== null) {
									iXIterator = aICleansingActionType
											.getIterator();
									while (iXIterator.hasNext()) {
										iCleansingActionType = iXIterator
												.next();
										counter = iPrStructureStatistics
												.getIntegerByNameWithDefault(
														iCleansingActionType
																.getName(), 0);
										(iCleansing)
												.setICleansingActionCounter(
														iCleansingActionType,
														sap.firefly.XIntegerValue
																.create(counter));
									}
								}
							}
						}
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onWorkspaceSynchronized(extResult, data,
								customIdentifier);
					},
					serialize : function() {
						var workspaceManager = this.getActionContext();
						var workspace = workspaceManager.getIWorkspaceBag()
								.getWorkspace();
						var iPrStructure = sap.firefly.PrStructure.create();
						var iPrStructureAnalytics = sap.firefly.PrStructure
								.create();
						var iPrStructureWorkspace = sap.firefly.PrStructure
								.create();
						var iXStringBuffer = sap.firefly.XStringBuffer.create();
						var iPrStructureDataArea;
						var prListDataArea;
						var prList;
						iXStringBuffer
								.append(sap.firefly.InAConstants.QY_DATA_AREA);
						iXStringBuffer.append(":");
						iXStringBuffer.append(workspace.getName());
						iPrStructureDataArea = sap.firefly.PrStructure.create();
						iPrStructureDataArea.setStringByName(
								sap.firefly.InAConstants.QY_NAME,
								iXStringBuffer.toString());
						iPrStructureDataArea.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								workspace.getName());
						prListDataArea = sap.firefly.PrList.create();
						prListDataArea.add(iPrStructureDataArea);
						this.serializeDataAreaStructure(iPrStructureAnalytics,
								workspace);
						iPrStructureWorkspace.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								workspaceManager.getTraceLevel().getName());
						iPrStructureWorkspace.setStringByName(
								sap.firefly.InAConstants.QY_ACTION, workspace
										.getAction().getName());
						this
								.serializeDataSourceStructure(iPrStructureWorkspace);
						iPrStructureAnalytics.setElementByName(
								sap.firefly.InAConstants.QY_WORKSPACE,
								iPrStructureWorkspace);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_ANALYTICS,
								iPrStructureAnalytics);
						prList = sap.firefly.PrList.create();
						prList
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prList);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure) {
						var workspaceManager = this.getActionContext();
						var workspace = workspaceManager.getIWorkspaceBag()
								.getWorkspace();
						var iXStringBuffer = sap.firefly.XStringBuffer.create();
						var iPrStructureDataSource;
						iXStringBuffer
								.append(sap.firefly.InAConstants.QY_DATA_AREA);
						iXStringBuffer.append(":");
						iXStringBuffer.append(workspace.getName());
						iPrStructureDataSource = sap.firefly.PrStructure
								.create();
						iPrStructureDataSource.setStringByName(
								sap.firefly.InAConstants.QY_TYPE,
								sap.firefly.InAConstants.QY_ANALYTICAL_INDEX);
						iPrStructureDataSource.setStringByName(
								sap.firefly.InAConstants.QY_DATA_AREA,
								iXStringBuffer.toString());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDataSource);
					},
					serializeDataAreaStructure : function(iPrStructure,
							iWorkspace) {
						var workspaceManager = this.getActionContext();
						var workspace = workspaceManager.getIWorkspaceBag()
								.getWorkspace();
						var iXStringBuffer = sap.firefly.XStringBuffer.create();
						var iPrStructureDataArea;
						var prListDataArea;
						iXStringBuffer
								.append(sap.firefly.InAConstants.QY_DATA_AREA);
						iXStringBuffer.append(":");
						iXStringBuffer.append(workspace.getName());
						iPrStructureDataArea = sap.firefly.PrStructure.create();
						iPrStructureDataArea.setStringByName(
								sap.firefly.InAConstants.QY_NAME,
								iXStringBuffer.toString());
						iPrStructureDataArea.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								iWorkspace.getName());
						prListDataArea = sap.firefly.PrList.create();
						prListDataArea.add(iPrStructureDataArea);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_AREAS,
								prListDataArea);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QWorkspaceProviderDataContainerBagAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, workspaceManager) {
							var qWorkspaceGetAction = new sap.firefly.QWorkspaceProviderDataContainerBagAction();
							qWorkspaceGetAction.setupWorkspaceActionAndRun(
									syncType, listener, customIdentifier,
									workspaceManager);
							return qWorkspaceGetAction;
						}
					},
					setupWorkspaceActionAndRun : function(syncType, listener,
							customIdentifier, workspaceManager) {
						this.setupActionAndRun(syncType, workspaceManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QWorkspaceProviderDataContainerBagAction";
					},
					processSynchronization : function(syncType) {
						var workspaceManager = this.getActionContext();
						var systemName = workspaceManager.getConfig()
								.getSystemName();
						var connectionPool = workspaceManager.getApplication()
								.getConnectionPool();
						var connection = connectionPool
								.getConnection(systemName);
						var ocpFunction = connection
								.newRpcFunctionByService(sap.firefly.ServerService.MASTERDATA);
						var request = ocpFunction.getRequest();
						request.setRequestStructure(this.serialize());
						ocpFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var workspaceManager;
						var workspace;
						var root;
						var result;
						var iPrStructureResultWorkspace;
						var iPrListProviders;
						var aIPrStructureOrdered;
						var i;
						var iPrStructureProviderExecuted;
						var order_id_m;
						var indexIPrStructure;
						var iXIteratorIPrStructure;
						var iPrStructure_m;
						var order_id_iPrStructure_m;
						var j;
						var reference_id_m;
						var iPrStructureProviderOrdered;
						var access_key_m;
						var iProvider_m_aIP;
						var iDataContainer;
						var iCleansing;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							workspaceManager = this.getActionContext();
							workspace = workspaceManager.getIWorkspaceBag()
									.getWorkspace();
							if ((response !== null)
									&& (response.getRootElement() !== null)) {
								root = sap.firefly.PrStructure
										.createDeepCopy(response
												.getRootElement());
								sap.firefly.PlanningState.update(
										workspaceManager.getApplication(),
										workspaceManager.getConfig()
												.getSystemName(), root, this);
								sap.firefly.InAHelper
										.importMessages(root, this);
								if (this.isValid()) {
									result = sap.firefly.ExtResult.create(root,
											this);
									iPrStructureResultWorkspace = result
											.getData()
											.getStructureByName(
													sap.firefly.InAConstants.QY_WORKSPACE);
									if (iPrStructureResultWorkspace !== null) {
										workspace
												.setNamespace(iPrStructureResultWorkspace
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_NAMESPACE,
																null));
										workspace
												.setPrefix(iPrStructureResultWorkspace
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_PREFIX,
																null));
										workspace
												.setIsGenerationOfSIDsAllowed(iPrStructureResultWorkspace
														.getBooleanByNameWithDefault(
																sap.firefly.InAConstants.QY_GENERATION_OF_SID_ALLOWED,
																false));
										workspace
												.parseICleansingActionType(iPrStructureResultWorkspace);
										iPrListProviders = iPrStructureResultWorkspace
												.getListByName(sap.firefly.InAConstants.QY_PROVIDERS);
										if (!sap.firefly.PrUtils
												.isListEmpty(iPrListProviders)) {
											aIPrStructureOrdered = sap.firefly.XList
													.create();
											for (i = 0; i < iPrListProviders
													.size(); i++) {
												iPrStructureProviderExecuted = iPrListProviders
														.getStructureByIndex(i);
												order_id_m = iPrStructureProviderExecuted
														.getIntegerByNameWithDefault(
																sap.firefly.InAConstants.QY_ORDER_ID,
																0);
												indexIPrStructure = 0;
												iXIteratorIPrStructure = aIPrStructureOrdered
														.getIterator();
												while (iXIteratorIPrStructure
														.hasNext()) {
													iPrStructure_m = iXIteratorIPrStructure
															.next();
													order_id_iPrStructure_m = iPrStructure_m
															.getIntegerByNameWithDefault(
																	sap.firefly.InAConstants.QY_ORDER_ID,
																	0);
													if (order_id_iPrStructure_m < order_id_m) {
														indexIPrStructure = indexIPrStructure + 1;
													}
												}
												aIPrStructureOrdered
														.insert(
																indexIPrStructure,
																iPrStructureProviderExecuted);
											}
											for (j = 0; j < aIPrStructureOrdered
													.size(); j++) {
												reference_id_m = null;
												iPrStructureProviderOrdered = aIPrStructureOrdered
														.get(j);
												access_key_m = reference_id_m = sap.firefly.XInteger
														.convertIntegerToString(iPrStructureProviderOrdered
																.getIntegerByNameWithDefault(
																		sap.firefly.InAConstants.QY_ORDER_ID,
																		-1));
												if (sap.firefly.XString
														.isEqual(
																sap.firefly.QueueT.T_NAMED_ORDERED
																		.getName(),
																workspaceManager
																		.getQueue()
																		.getName())) {
													reference_id_m = iPrStructureProviderOrdered
															.getStringByNameWithDefault(
																	sap.firefly.InAConstants.QY_NAME,
																	null);
												}
												iProvider_m_aIP = workspace
														.getProviderByName(reference_id_m);
												if ((workspaceManager
														.getIProviderIDataContainerBagMap() !== null)
														&& (workspaceManager
																.getIProviderIDataContainerBagMap()
																.containsKey(access_key_m))
														&& (workspaceManager
																.getIProviderIDataContainerBagMap()
																.getByKey(
																		access_key_m)
																.getIProvider() !== null)) {
													if (iProvider_m_aIP !== null) {
														iProvider_m_aIP = sap.firefly.ProviderFactory
																.updateIProvider(
																		workspace,
																		iProvider_m_aIP,
																		iPrStructureProviderOrdered);
													} else {
														iProvider_m_aIP = sap.firefly.ProviderFactory
																.updateIProvider(
																		workspace,
																		workspaceManager
																				.getIProviderIDataContainerBagMap()
																				.getByKey(
																						access_key_m)
																				.getIProvider(),
																		iPrStructureProviderOrdered);
													}
												} else {
													iProvider_m_aIP = sap.firefly.ProviderFactory
															.instantiateIProvider(
																	workspace,
																	iPrStructureProviderOrdered
																			.getStringByNameWithDefault(
																					sap.firefly.InAConstants.QY_NAME,
																					null),
																	iPrStructureProviderOrdered);
												}
												iDataContainer = null;
												if ((workspaceManager
														.getIProviderIDataContainerBagMap() !== null)
														&& (workspaceManager
																.getIProviderIDataContainerBagMap()
																.containsKey(access_key_m))
														&& (workspaceManager
																.getIProviderIDataContainerBagMap()
																.getByKey(
																		access_key_m)
																.getIDataContainer() !== null)) {
													iDataContainer = workspaceManager
															.getIProviderIDataContainerBagMap()
															.getByKey(
																	access_key_m)
															.getIDataContainer();
												} else {
													iDataContainer = sap.firefly.DataContainer
															.instantiateIDataContainer(iPrStructureProviderOrdered
																	.getStructureByName(sap.firefly.InAConstants.QY_DATA));
												}
												iCleansing = sap.firefly.CleansingManager
														.createICleansing(workspace
																.getICleansingActionType());
												this
														.parseCleansing(
																iProvider_m_aIP,
																iCleansing,
																iPrStructureProviderOrdered);
												workspace.setIProvider(
														iProvider_m_aIP,
														iDataContainer,
														iCleansing,
														reference_id_m);
												this
														.parseStatistics(
																workspace,
																reference_id_m,
																iPrStructureProviderOrdered);
											}
										}
									}
								}
							}
							this.setData(sap.firefly.WorkspaceBagManager
									.createIWorkspaceBag(workspace));
						}
						this.endSync();
					},
					parseCleansing : function(iProvider, iCleansing,
							iPrStructure) {
						var prElementTypeCleansing;
						var iPrStructureCleansing;
						if (iProvider === null) {
							return;
						}
						if (iCleansing === null) {
							return;
						}
						if (iPrStructure === null) {
							return;
						}
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_CLEANSING)) {
							prElementTypeCleansing = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_CLEANSING);
							if (prElementTypeCleansing === sap.firefly.PrElementType.STRUCTURE) {
								iPrStructureCleansing = iPrStructure
										.getStructureByName(sap.firefly.InAConstants.QY_CLEANSING);
								if (iPrStructureCleansing !== null) {
									this.parsePerformedActions(iProvider,
											iCleansing, iPrStructureCleansing);
								}
							}
						}
					},
					parsePerformedActions : function(iProvider, iCleansing,
							iPrStructure) {
						var prElementTypePerformedActions;
						var iPrListPerformedActions;
						var iPerformedActions;
						var iPrStructurePerformedAction;
						var iAttribute;
						var iCleansingActionType;
						var iCleansingAction;
						if (iProvider === null) {
							return;
						}
						if (iCleansing === null) {
							return;
						}
						if (iPrStructure === null) {
							return;
						}
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_CLEANSING_PERFORMED_ACTIONS)) {
							prElementTypePerformedActions = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_CLEANSING_PERFORMED_ACTIONS);
							if (prElementTypePerformedActions === sap.firefly.PrElementType.LIST) {
								iPrListPerformedActions = iPrStructure
										.getListByName(sap.firefly.InAConstants.QY_CLEANSING_PERFORMED_ACTIONS);
								for (iPerformedActions = 0; iPerformedActions < iPrListPerformedActions
										.size(); iPerformedActions++) {
									iPrStructurePerformedAction = iPrListPerformedActions
											.getStructureByIndex(iPerformedActions);
									if (iPrStructurePerformedAction !== null) {
										iAttribute = iProvider
												.getIAttributeByName(iPrStructurePerformedAction
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_ATTRIBUTE,
																null));
										iCleansingActionType = iCleansing
												.getICleansingActionTypeByName(iPrStructurePerformedAction
														.getStringByNameWithDefault(
																sap.firefly.InAConstants.QY_CLEANSING_ACTION,
																null));
										iCleansingAction = sap.firefly.CleansingAction
												.createICleansingAction(
														iCleansingActionType,
														iAttribute);
										iCleansingAction
												.setIXValueToBeReplaced(sap.firefly.XStringValue
														.create(iPrStructurePerformedAction
																.getStringByNameWithDefault(
																		sap.firefly.InAConstants.QY_CLEANSING_VALUE_TO_BE_REPLACED,
																		null)));
										iCleansingAction
												.setIXValue(sap.firefly.XStringValue
														.create(iPrStructurePerformedAction
																.getStringByNameWithDefault(
																		sap.firefly.InAConstants.QY_CLEANSING_VALUE,
																		null)));
										(iCleansingAction)
												.setRow(iPrStructurePerformedAction
														.getIntegerByNameWithDefault(
																sap.firefly.InAConstants.QY_ROW,
																-1));
										(iCleansing)
												.addPerformedICleansingAction(iCleansingAction);
									}
								}
							}
						}
					},
					parseStatistics : function(iWorkspace, referenceId,
							iPrStructure) {
						var iCleansing;
						var aICleansingActionType;
						var prElementTypeStatistics;
						var iPrStructureStatistics;
						var iXIterator;
						var iCleansingActionType;
						var counter;
						if (iWorkspace === null) {
							return;
						}
						if (iPrStructure === null) {
							return;
						}
						iCleansing = iWorkspace
								.getCleansingManagerByName(referenceId);
						if (iCleansing === null) {
							return;
						}
						aICleansingActionType = iWorkspace
								.getICleansingActionType();
						if (iPrStructure
								.hasValueByName(sap.firefly.InAConstants.QY_STATISTICS)) {
							prElementTypeStatistics = iPrStructure
									.getElementTypeByName(sap.firefly.InAConstants.QY_STATISTICS);
							if (prElementTypeStatistics === sap.firefly.PrElementType.STRUCTURE) {
								iPrStructureStatistics = iPrStructure
										.getStructureByName(sap.firefly.InAConstants.QY_STATISTICS);
								if (iPrStructureStatistics !== null) {
									iXIterator = aICleansingActionType
											.getIterator();
									while (iXIterator.hasNext()) {
										iCleansingActionType = iXIterator
												.next();
										counter = iPrStructureStatistics
												.getIntegerByNameWithDefault(
														iCleansingActionType
																.getName(), 0);
										(iCleansing)
												.setICleansingActionCounter(
														iCleansingActionType,
														sap.firefly.XIntegerValue
																.create(counter));
									}
								}
							}
						}
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onWorkspaceSynchronized(extResult, data,
								customIdentifier);
					},
					serialize : function() {
						var workspaceManager = this.getActionContext();
						var workspace = workspaceManager.getIWorkspaceBag()
								.getWorkspace();
						var iPrStructure = sap.firefly.PrStructure.create();
						var iPrStructureAnalytics = sap.firefly.PrStructure
								.create();
						var iPrStructureWorkspace = sap.firefly.PrStructure
								.create();
						var iXStringBuffer = sap.firefly.XStringBuffer.create();
						var iPrStructureDataArea;
						var prListDataArea;
						var prListProviderData;
						var iXIteratorIProviderIDataContainerBag;
						var iProviderIDataContainerBag;
						var iPrStructureProvider;
						var iPrStructureData;
						var iPrStructureCleansing;
						var prList;
						iXStringBuffer
								.append(sap.firefly.InAConstants.QY_DATA_AREA);
						iXStringBuffer.append(":");
						iXStringBuffer.append(workspace.getName());
						iPrStructureDataArea = sap.firefly.PrStructure.create();
						iPrStructureDataArea.setStringByName(
								sap.firefly.InAConstants.QY_NAME,
								iXStringBuffer.toString());
						iPrStructureDataArea.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								workspace.getName());
						prListDataArea = sap.firefly.PrList.create();
						prListDataArea.add(iPrStructureDataArea);
						this.serializeDataAreaStructure(iPrStructureAnalytics,
								workspace);
						iPrStructureWorkspace.setStringByName(
								sap.firefly.InAConstants.QY_TRACE_LEVEL,
								workspaceManager.getTraceLevel().getName());
						prListProviderData = sap.firefly.PrList.create();
						iXIteratorIProviderIDataContainerBag = workspaceManager
								.getIProviderIDataContainerBagMap()
								.getIterator();
						while (iXIteratorIProviderIDataContainerBag.hasNext()) {
							iProviderIDataContainerBag = iXIteratorIProviderIDataContainerBag
									.next();
							iPrStructureProvider = null;
							if (iProviderIDataContainerBag.getIProvider() !== null) {
								iPrStructureProvider = sap.firefly.ProviderManager
										.serialize(
												sap.firefly.HttpContentType.APPLICATION_JSON,
												iProviderIDataContainerBag
														.getIProvider());
							} else {
								iPrStructureProvider = sap.firefly.PrStructure
										.create();
							}
							this.serializeDataSourceStructure(
									iPrStructureProvider,
									iProviderIDataContainerBag);
							iPrStructureData = null;
							if (iProviderIDataContainerBag.getIDataContainer() !== null) {
								iPrStructureData = sap.firefly.DataContainerManager
										.serialize(
												sap.firefly.HttpContentType.APPLICATION_JSON,
												iProviderIDataContainerBag
														.getIDataContainer());
							} else {
								iPrStructureData = sap.firefly.PrStructure
										.create();
							}
							iPrStructureProvider.setElementByName(
									sap.firefly.InAConstants.QY_DATA,
									iPrStructureData);
							iPrStructureCleansing = null;
							if (iProviderIDataContainerBag.getICleansing() !== null) {
								iPrStructureCleansing = sap.firefly.CleansingManager
										.serialize(
												sap.firefly.HttpContentType.APPLICATION_JSON,
												iProviderIDataContainerBag
														.getICleansing());
							} else {
								iPrStructureCleansing = sap.firefly.PrStructure
										.create();
							}
							iPrStructureProvider.setElementByName(
									sap.firefly.InAConstants.QY_CLEANSING,
									iPrStructureCleansing);
							iPrStructureProvider.setIntegerByName(
									sap.firefly.InAConstants.QY_ORDER_ID,
									iProviderIDataContainerBag.getOrderID());
							prListProviderData.add(iPrStructureProvider);
						}
						iPrStructureWorkspace.setElementByName(
								sap.firefly.InAConstants.QY_PROVIDERS,
								prListProviderData);
						iPrStructureWorkspace.setStringByName(
								sap.firefly.InAConstants.QY_QUEUE_TYPE,
								workspaceManager.getQueue().getName());
						iPrStructureAnalytics.setElementByName(
								sap.firefly.InAConstants.QY_WORKSPACE,
								iPrStructureWorkspace);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_ANALYTICS,
								iPrStructureAnalytics);
						prList = sap.firefly.PrList.create();
						prList
								.addString(sap.firefly.InAConstants.VA_OPTIONS_SYNCHRONOUS_RUN);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_OPTIONS, prList);
						return iPrStructure;
					},
					serializeDataSourceStructure : function(iPrStructure,
							iProviderIDataContainerBag) {
						var workspaceManager = this.getActionContext();
						var workspace = workspaceManager.getIWorkspaceBag()
								.getWorkspace();
						var iXStringBuffer = sap.firefly.XStringBuffer.create();
						var iPrStructureDataSource;
						iXStringBuffer
								.append(sap.firefly.InAConstants.QY_DATA_AREA);
						iXStringBuffer.append(":");
						iXStringBuffer.append(workspace.getName());
						iPrStructureDataSource = sap.firefly.PrStructure
								.create();
						if (iProviderIDataContainerBag.getIProvider() !== null) {
							iPrStructureDataSource.setStringByName(
									sap.firefly.InAConstants.QY_NAME,
									iProviderIDataContainerBag.getIProvider()
											.getName());
							iPrStructureDataSource.setStringByName(
									sap.firefly.InAConstants.QY_DESCRIPTION,
									iProviderIDataContainerBag.getIProvider()
											.getDescription());
							if (iProviderIDataContainerBag.getIProvider()
									.getProviderType() === sap.firefly.ProviderT.LCHA) {
								iPrStructureDataSource
										.setStringByName(
												sap.firefly.InAConstants.QY_TYPE,
												sap.firefly.InAConstants.QY_LOCAL_DIMENSION_PROVIDER);
							} else {
								if (iProviderIDataContainerBag.getIProvider()
										.getProviderType() === sap.firefly.ProviderT.LHIE) {
									iPrStructureDataSource
											.setStringByName(
													sap.firefly.InAConstants.QY_TYPE,
													sap.firefly.InAConstants.QY_LOCAL_HIERARCHY_PROVIDER);
								} else {
									iPrStructureDataSource
											.setStringByName(
													sap.firefly.InAConstants.QY_TYPE,
													sap.firefly.InAConstants.QY_ANALYTICAL_INDEX);
								}
							}
						} else {
							iPrStructureDataSource
									.setStringByName(
											sap.firefly.InAConstants.QY_TYPE,
											sap.firefly.InAConstants.QY_ANALYTICAL_INDEX);
						}
						if (iProviderIDataContainerBag.getICleansing() !== null) {
							iPrStructureDataSource.setStringByName(
									sap.firefly.InAConstants.QY_INSTANCE_ID,
									iProviderIDataContainerBag.getICleansing()
											.getInstanceId());
						}
						iPrStructureDataSource.setStringByName(
								sap.firefly.InAConstants.QY_DATA_AREA,
								iXStringBuffer.toString());
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_SOURCE,
								iPrStructureDataSource);
					},
					serializeDataAreaStructure : function(iPrStructure,
							iWorkspace) {
						var workspaceManager = this.getActionContext();
						var workspace = workspaceManager.getIWorkspaceBag()
								.getWorkspace();
						var iXStringBuffer = sap.firefly.XStringBuffer.create();
						var iPrStructureDataArea;
						var prListDataArea;
						iXStringBuffer
								.append(sap.firefly.InAConstants.QY_DATA_AREA);
						iXStringBuffer.append(":");
						iXStringBuffer.append(workspace.getName());
						iPrStructureDataArea = sap.firefly.PrStructure.create();
						iPrStructureDataArea.setStringByName(
								sap.firefly.InAConstants.QY_NAME,
								iXStringBuffer.toString());
						iPrStructureDataArea.setStringByName(
								sap.firefly.InAConstants.QY_ENVIRONMENT,
								iWorkspace.getName());
						prListDataArea = sap.firefly.PrList.create();
						prListDataArea.add(iPrStructureDataArea);
						iPrStructure.setElementByName(
								sap.firefly.InAConstants.QY_DATA_AREAS,
								prListDataArea);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QWorkstatusCancelAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, workstatusManager,
								iQFilterElement) {
							var qWorkstatusCancelAction = new sap.firefly.QWorkstatusCancelAction();
							qWorkstatusCancelAction
									.setupWorkstatusActionAndRun(syncType,
											listener, customIdentifier,
											workstatusManager, iQFilterElement);
							return qWorkstatusCancelAction;
						}
					},
					m_iq_filter_element : null,
					setupWorkstatusActionAndRun : function(syncType, listener,
							customIdentifier, workstatusManager,
							iQFilterElement) {
						this.m_iq_filter_element = iQFilterElement;
						this.setupActionAndRun(syncType, workstatusManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QWorkstatusCancelAction";
					},
					processSynchronization : function(syncType) {
						var workstatusManager = this.getActionContext();
						var selectionStateContainerCANCEL = workstatusManager
								.getQueryModel().getSelector()
								.getSelectionStateContainer();
						selectionStateContainerCANCEL
								.setCartesianProduct(this.m_iq_filter_element);
						this.m_iq_filter_element = null;
						workstatusManager.getQueryManager()
								.processQueryExecution(
										this.getActiveSyncType(), this, null);
						return true;
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onWorkstatusCancel(extResult, data,
								customIdentifier);
					},
					onQueryExecuted : function(extResult, resultSetContainer,
							customIdentifier) {
						var classicResultSet;
						var workstatusResult;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							classicResultSet = resultSetContainer
									.getClassicResultSet();
							workstatusResult = sap.firefly.WorkstatusResult
									.create(classicResultSet);
							this.setData(workstatusResult);
						}
						this.endSync();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QWorkstatusGetAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, workstatusManager,
								iQFilterElement) {
							var qWorkstatusGetAction = new sap.firefly.QWorkstatusGetAction();
							qWorkstatusGetAction.setupWorkstatusActionAndRun(
									syncType, listener, customIdentifier,
									workstatusManager, iQFilterElement);
							return qWorkstatusGetAction;
						}
					},
					m_iq_filter_element : null,
					setupWorkstatusActionAndRun : function(syncType, listener,
							customIdentifier, workstatusManager,
							iQFilterElement) {
						this.m_iq_filter_element = iQFilterElement;
						this.setupActionAndRun(syncType, workstatusManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QWorkstatusGetAction";
					},
					processSynchronization : function(syncType) {
						var workstatusManager = this.getActionContext();
						var selectionStateContainerGET = workstatusManager
								.getQueryModel().getSelector()
								.getSelectionStateContainer();
						var cartesianProductGET;
						if (this.m_iq_filter_element.getComponentType() === sap.firefly.FilterComponentType.CARTESIAN_PRODUCT) {
							selectionStateContainerGET
									.setCartesianProduct(this.m_iq_filter_element);
						} else {
							cartesianProductGET = sap.firefly.QFilterUtil
									.convertComplexFilterToCartesian(this.m_iq_filter_element);
							if (cartesianProductGET !== null) {
								selectionStateContainerGET
										.setCartesianProduct(cartesianProductGET);
							} else {
								selectionStateContainerGET
										.setComplexSelection(this.m_iq_filter_element);
							}
						}
						this.m_iq_filter_element = null;
						workstatusManager.getQueryManager()
								.processQueryExecution(
										this.getActiveSyncType(), this, null);
						return true;
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onWorkstatusGet(extResult, data,
								customIdentifier);
					},
					onQueryExecuted : function(extResult, resultSetContainer,
							customIdentifier) {
						var classicResultSet;
						var workstatusResult;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							classicResultSet = resultSetContainer
									.getClassicResultSet();
							workstatusResult = sap.firefly.WorkstatusResult
									.create(classicResultSet);
							this.setData(workstatusResult);
						}
						this.endSync();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QWorkstatusSetAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, workstatusManager,
								iQFilterElement) {
							var qWorkstatusSetAction = new sap.firefly.QWorkstatusSetAction();
							qWorkstatusSetAction.setupWorkstatusActionAndRun(
									syncType, listener, customIdentifier,
									workstatusManager, iQFilterElement);
							return qWorkstatusSetAction;
						}
					},
					m_iq_filter_element : null,
					setupWorkstatusActionAndRun : function(syncType, listener,
							customIdentifier, workstatusManager,
							iQFilterElement) {
						this.m_iq_filter_element = iQFilterElement;
						this.setupActionAndRun(syncType, workstatusManager,
								listener, customIdentifier);
					},
					getComponentName : function() {
						return "QWorkstatusSetAction";
					},
					processSynchronization : function(syncType) {
						var workstatusManager = this.getActionContext();
						var selectionStateContainerSET = workstatusManager
								.getQueryModel().getSelector()
								.getSelectionStateContainer();
						if (this.m_iq_filter_element.getComponentType() === sap.firefly.FilterComponentType.CARTESIAN_PRODUCT) {
							selectionStateContainerSET
									.setCartesianProduct(this.m_iq_filter_element);
						} else {
							selectionStateContainerSET
									.setComplexSelection(this.m_iq_filter_element);
						}
						this.m_iq_filter_element = null;
						workstatusManager.getQueryManager()
								.processQueryExecution(
										this.getActiveSyncType(), this, null);
						return true;
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onWorkstatusSet(extResult, data,
								customIdentifier);
					},
					onQueryExecuted : function(extResult, resultSetContainer,
							customIdentifier) {
						var classicResultSet;
						var workstatusResult;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							classicResultSet = resultSetContainer
									.getClassicResultSet();
							workstatusResult = sap.firefly.WorkstatusResult
									.create(classicResultSet);
							this.setData(workstatusResult);
						}
						this.endSync();
					}
				});
$Firefly.createClass("sap.firefly.InfoObjectService", sap.firefly.DfService,
		{
			$statics : {
				CLAZZ : null,
				staticSetup : function() {
					sap.firefly.InfoObjectService.CLAZZ = sap.firefly.XClass
							.create(sap.firefly.InfoObjectService);
				}
			},
			m_manager : null,
			releaseObject : function() {
				if (this.m_manager !== null) {
					this.m_manager.releaseObject();
					this.m_manager = null;
				}
				sap.firefly.InfoObjectService.$superclass.releaseObject
						.call(this);
			},
			getManager : function() {
				var config;
				if (this.m_manager === null) {
					config = this.getServiceConfig();
					this.m_manager = sap.firefly.InfoObjectManager.create(this
							.getOlapEnv(), config, null);
				}
				return this.m_manager;
			},
			processSynchronization : function(syncType) {
				var config = this.getServiceConfig();
				var queryServiceConfig = sap.firefly.QueryServiceConfig
						.createWithDataSource(this.getApplication(), config
								.getSystemName(), config.getDataSource());
				queryServiceConfig.processQueryManagerCreation(syncType, this,
						null);
				return true;
			},
			onQueryManagerCreated : function(extResult, queryManager,
					customIdentifier) {
				var config;
				this.addAllMessages(extResult);
				if (extResult.isValid()) {
					config = this.getServiceConfig();
					this.m_manager = sap.firefly.InfoObjectManager.create(this
							.getOlapEnv(), config, queryManager);
				}
				this.endSync();
			},
			getOlapEnv : function() {
				return this.getApplication().getOlapEnvironment();
			}
		});
$Firefly.createClass("sap.firefly.WorkspaceService", sap.firefly.DfService, {
	$statics : {
		CLAZZ : null,
		staticSetup : function() {
			sap.firefly.WorkspaceService.CLAZZ = sap.firefly.XClass
					.create(sap.firefly.WorkspaceService);
		}
	},
	m_manager : null,
	getManager : function() {
		var config;
		if (this.m_manager === null) {
			config = this.getServiceConfig();
			this.m_manager = sap.firefly.WorkspaceManager.create(this
					.getApplication(), config);
		}
		return this.m_manager;
	}
});
$Firefly.createClass("sap.firefly.WorkstatusService", sap.firefly.DfService,
		{
			$statics : {
				CLAZZ : null,
				staticSetup : function() {
					sap.firefly.WorkstatusService.CLAZZ = sap.firefly.XClass
							.create(sap.firefly.WorkstatusService);
				}
			},
			m_manager : null,
			getManager : function() {
				var config;
				if (this.m_manager === null) {
					config = this.getServiceConfig();
					this.m_manager = sap.firefly.WorkstatusManager.create(this
							.getApplication(), config, null);
				}
				return this.m_manager;
			},
			processSynchronization : function(syncType) {
				var config = this.getServiceConfig();
				var queryServiceConfig = sap.firefly.QueryServiceConfig
						.createWithDataSourceName(this.getApplication(), config
								.getSystemName(), config.getDataSource()
								.getFullQualifiedName());
				queryServiceConfig.setDataSource(config.getDataSource());
				queryServiceConfig.processQueryManagerCreation(syncType, this,
						null);
				return true;
			},
			onQueryManagerCreated : function(extResult, queryManager,
					customIdentifier) {
				var config;
				this.addAllMessages(extResult);
				if (extResult.isValid()) {
					config = this.getServiceConfig();
					this.m_manager = sap.firefly.WorkstatusManager.create(this
							.getApplication(), config, queryManager);
				}
				this.endSync();
			}
		});
$Firefly.createClass("sap.firefly.LayerService", sap.firefly.DfService, {
	$statics : {
		CLAZZ : null
	},
	m_layerModel : null,
	getLayerServiceConfig : function() {
		return this.getServiceConfig();
	},
	getLayerModel : function() {
		if (this.m_layerModel === null) {
			this.m_layerModel = sap.firefly.LayerModel.create(this);
		}
		return this.m_layerModel;
	},
	releaseObject : function() {
		this.m_layerModel = sap.firefly.XObject
				.releaseIfNotNull(this.m_layerModel);
		sap.firefly.LayerService.$superclass.releaseObject.call(this);
	},
	getContext : function() {
		var application = this.getApplication().getOlapEnvironment();
		return application.getContext();
	},
	getOlapEnv : function() {
		return this.getApplication().getOlapEnvironment();
	}
});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectHierarchyIntervalMember",
				sap.firefly.QModelComponent,
				{
					$statics : {
						createIInfoObjectHierarchyIntervalMember : function(
								iQDimensionBase) {
							var iInfoObjectHierarchyIntervalMember = new sap.firefly.InfoObjectHierarchyIntervalMember();
							iInfoObjectHierarchyIntervalMember.setupMember(
									iQDimensionBase, null);
							return iInfoObjectHierarchyIntervalMember;
						}
					},
					m_dimension : null,
					m_attributeMemberMap : null,
					m_memberType : null,
					m_info_object_node_name_value_from : null,
					m_info_object_node_name_value_to : null,
					setupMember : function(dimension, origin) {
						var attributeMembers;
						var iterator;
						var originAttributeMember;
						var cloneAttribute;
						var newFieldValue;
						var cloneAttributeMember;
						this.setupModelComponent(dimension, null);
						this.setName(dimension.getName());
						this.setText(dimension.getText());
						this.m_info_object_node_name_value_from = sap.firefly.XHashMapOfStringByString
								.create();
						this.m_info_object_node_name_value_to = sap.firefly.XHashMapOfStringByString
								.create();
						this.m_attributeMemberMap = sap.firefly.XHashMapByString
								.create();
						if (origin !== null) {
							attributeMembers = origin.getAllFieldValues();
							iterator = attributeMembers.getIterator();
							while (iterator.hasNext()) {
								originAttributeMember = iterator.next();
								cloneAttribute = originAttributeMember
										.getField();
								newFieldValue = sap.firefly.QFieldValue.create(
										this.getContext(), dimension
												.getFieldByName(cloneAttribute
														.getName()), null);
								(newFieldValue)
										.copyFieldValue(originAttributeMember);
								cloneAttributeMember = newFieldValue;
								this.m_attributeMemberMap.put(cloneAttribute
										.getName(), cloneAttributeMember);
							}
							this.setDimension(origin.getDimension());
							this.setType(origin.getMemberType());
						} else {
							this.setDimension(dimension);
						}
					},
					getHieId : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_HIERARCHY_ID);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getObjectVerion : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_OBJECT_VERSION);
						var iQFieldValueNodeId;
						if (iQFieldNodeId === null) {
							return null;
						}
						iQFieldValueNodeId = this.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getNodeNameFrom : function() {
						var iQFieldTxtShFrom = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_SH_FROM);
						var iQFieldValueTxtShFrom = this
								.getFieldValue(iQFieldTxtShFrom);
						return iQFieldValueTxtShFrom.getStringValue();
					},
					getLeafNameFrom : function() {
						var iQFieldLeafFrom = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_LEAFFROM_NAME);
						var iQFieldValueLeafFrom = this
								.getFieldValue(iQFieldLeafFrom);
						return iQFieldValueLeafFrom.getStringValue();
					},
					getCMPPatternFrom : function() {
						var iQFieldNodeCMPPatternFrom = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_CMP_PATTERN_FROM);
						var iQFieldValueCMPPatternFrom;
						if (iQFieldNodeCMPPatternFrom === null) {
							return null;
						}
						iQFieldValueCMPPatternFrom = this
								.getFieldValue(iQFieldNodeCMPPatternFrom);
						return iQFieldValueCMPPatternFrom.getStringValue();
					},
					getNodeNameFromByInfoObject : function(infoObject) {
						var patternByInfoObject;
						var nodeNameByInfoObject;
						var indexBy;
						var patternByInfoObjectLength;
						var numberOfInfoObjects;
						var separator;
						var iSeparator;
						var cmpInfoObject;
						var cmpInfoObjectLength;
						if (!this.m_info_object_node_name_value_from.isEmpty()) {
							return this.m_info_object_node_name_value_from
									.getByKey(infoObject);
						}
						patternByInfoObject = this.getCMPPatternFrom();
						nodeNameByInfoObject = this.getNodeNameFrom();
						if ((nodeNameByInfoObject === null)
								|| (sap.firefly.XString
										.size(nodeNameByInfoObject) === 0)) {
							return null;
						}
						if ((patternByInfoObject === null)
								|| (sap.firefly.XString
										.size(patternByInfoObject) === 0)) {
							if (sap.firefly.XString.isEqual(infoObject, this
									.getInfoObject())) {
								return nodeNameByInfoObject;
							}
							return null;
						}
						indexBy = sap.firefly.XString
								.indexOf(
										patternByInfoObject,
										sap.firefly.XString
												.concatenate2(
														sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT,
														sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT_TO_VALUE));
						patternByInfoObjectLength = sap.firefly.XString
								.substring(patternByInfoObject, (indexBy + 2),
										-1);
						patternByInfoObject = sap.firefly.XString.substring(
								patternByInfoObject, 0, indexBy);
						indexBy = sap.firefly.XString
								.indexOf(
										patternByInfoObject,
										sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT);
						if (indexBy === -1) {
							if (sap.firefly.XString.isEqual(infoObject, this
									.getInfoObject())) {
								return nodeNameByInfoObject;
							}
							return null;
						}
						numberOfInfoObjects = sap.firefly.XInteger
								.convertStringToInteger(sap.firefly.XString
										.substring(patternByInfoObject, 0,
												indexBy));
						separator = patternByInfoObjectLength;
						for (iSeparator = 0; iSeparator < numberOfInfoObjects; iSeparator++) {
							indexBy = sap.firefly.XString
									.indexOf(
											separator,
											sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT_VALUE);
							if (indexBy > -1) {
								separator = sap.firefly.XString.substring(
										separator, (indexBy + 1), -1);
							}
						}
						if (sap.firefly.XString.size(separator) > 0) {
							patternByInfoObjectLength = sap.firefly.XString
									.substring(
											patternByInfoObjectLength,
											0,
											(sap.firefly.XString
													.size(patternByInfoObjectLength)
													- sap.firefly.XString
															.size(separator) - 1));
						}
						patternByInfoObject = sap.firefly.XString.substring(
								patternByInfoObject, (indexBy + 1), -1);
						indexBy = sap.firefly.XString
								.indexOf(
										patternByInfoObject,
										sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT);
						while (indexBy > -1) {
							cmpInfoObject = sap.firefly.XString.substring(
									patternByInfoObject, 0, indexBy);
							patternByInfoObject = sap.firefly.XString
									.substring(patternByInfoObject,
											(indexBy + 1), -1);
							indexBy = sap.firefly.XString
									.indexOf(
											patternByInfoObjectLength,
											sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT_VALUE);
							cmpInfoObjectLength = sap.firefly.XString
									.substring(patternByInfoObjectLength, 0,
											indexBy);
							this.m_info_object_node_name_value_from
									.put(
											cmpInfoObject,
											sap.firefly.XString
													.substring(
															nodeNameByInfoObject,
															0,
															sap.firefly.XInteger
																	.convertStringToInteger(cmpInfoObjectLength)));
							patternByInfoObjectLength = sap.firefly.XString
									.substring(patternByInfoObjectLength,
											(indexBy + 1), -1);
							nodeNameByInfoObject = sap.firefly.XString
									.substring(
											nodeNameByInfoObject,
											sap.firefly.XInteger
													.convertStringToInteger(cmpInfoObjectLength),
											-1);
							indexBy = sap.firefly.XString
									.indexOf(
											patternByInfoObject,
											sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT);
							if ((indexBy === -1)
									&& (sap.firefly.XString
											.size(patternByInfoObject) > 0)) {
								if (sap.firefly.XString.size(separator) > 0) {
									indexBy = sap.firefly.XString.indexOf(
											nodeNameByInfoObject, separator);
									nodeNameByInfoObject = sap.firefly.XString
											.substring(nodeNameByInfoObject,
													(indexBy + 1), -1);
								} else {
									nodeNameByInfoObject = sap.firefly.XString
											.substring(
													nodeNameByInfoObject,
													0,
													sap.firefly.XInteger
															.convertStringToInteger(cmpInfoObjectLength));
								}
								this.m_info_object_node_name_value_from.put(
										patternByInfoObject,
										nodeNameByInfoObject);
								break;
							}
							if (sap.firefly.XString.size(separator) > 0) {
								indexBy = sap.firefly.XString.indexOf(
										nodeNameByInfoObject, separator);
								nodeNameByInfoObject = sap.firefly.XString
										.substring(nodeNameByInfoObject,
												(indexBy + 1), -1);
							} else {
								nodeNameByInfoObject = sap.firefly.XString
										.substring(
												nodeNameByInfoObject,
												0,
												sap.firefly.XInteger
														.convertStringToInteger(cmpInfoObjectLength));
							}
						}
						return this.m_info_object_node_name_value_from
								.getByKey(infoObject);
					},
					getLeafNameTo : function() {
						var iQFieldLeafTo = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_LEAFTO_NAME);
						var iQFieldValueLeafTo = this
								.getFieldValue(iQFieldLeafTo);
						return iQFieldValueLeafTo.getStringValue();
					},
					getNodeNameTo : function() {
						var iQFieldTxtShTo = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_SH_TO);
						var iQFieldValueTxtShTo = this
								.getFieldValue(iQFieldTxtShTo);
						return iQFieldValueTxtShTo.getStringValue();
					},
					getCMPPatternTo : function() {
						var iQFieldNodeCMPPatternTo = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_CMP_PATTERN_TO);
						var iQFieldValueCMPPatternTo;
						if (iQFieldNodeCMPPatternTo === null) {
							return null;
						}
						iQFieldValueCMPPatternTo = this
								.getFieldValue(iQFieldNodeCMPPatternTo);
						return iQFieldValueCMPPatternTo.getStringValue();
					},
					getNodeNameToByInfoObject : function(infoObject) {
						var patternByInfoObject;
						var nodeNameByInfoObject;
						var indexBy;
						var patternByInfoObjectLength;
						var numberOfInfoObjects;
						var separator;
						var iSeparator;
						var cmpInfoObject;
						var cmpInfoObjectLength;
						if (!this.m_info_object_node_name_value_to.isEmpty()) {
							return this.m_info_object_node_name_value_to
									.getByKey(infoObject);
						}
						patternByInfoObject = this.getCMPPatternTo();
						nodeNameByInfoObject = this.getNodeNameTo();
						if ((nodeNameByInfoObject === null)
								|| (sap.firefly.XString
										.size(nodeNameByInfoObject) === 0)) {
							return null;
						}
						if ((patternByInfoObject === null)
								|| (sap.firefly.XString
										.size(patternByInfoObject) === 0)) {
							if (sap.firefly.XString.isEqual(infoObject, this
									.getInfoObject())) {
								return nodeNameByInfoObject;
							}
							return null;
						}
						indexBy = sap.firefly.XString
								.indexOf(
										patternByInfoObject,
										sap.firefly.XString
												.concatenate2(
														sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT,
														sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT_TO_VALUE));
						patternByInfoObjectLength = sap.firefly.XString
								.substring(patternByInfoObject, (indexBy + 2),
										-1);
						patternByInfoObject = sap.firefly.XString.substring(
								patternByInfoObject, 0, indexBy);
						indexBy = sap.firefly.XString
								.indexOf(
										patternByInfoObject,
										sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT);
						if (indexBy === -1) {
							if (sap.firefly.XString.isEqual(infoObject, this
									.getInfoObject())) {
								return nodeNameByInfoObject;
							}
							return null;
						}
						numberOfInfoObjects = sap.firefly.XInteger
								.convertStringToInteger(sap.firefly.XString
										.substring(patternByInfoObject, 0,
												indexBy));
						separator = patternByInfoObjectLength;
						for (iSeparator = 0; iSeparator < numberOfInfoObjects; iSeparator++) {
							indexBy = sap.firefly.XString
									.indexOf(
											separator,
											sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT_VALUE);
							if (indexBy > -1) {
								separator = sap.firefly.XString.substring(
										separator, (indexBy + 1), -1);
							}
						}
						if (sap.firefly.XString.size(separator) > 0) {
							patternByInfoObjectLength = sap.firefly.XString
									.substring(
											patternByInfoObjectLength,
											0,
											(sap.firefly.XString
													.size(patternByInfoObjectLength)
													- sap.firefly.XString
															.size(separator) - 1));
						}
						patternByInfoObject = sap.firefly.XString.substring(
								patternByInfoObject, (indexBy + 1), -1);
						indexBy = sap.firefly.XString
								.indexOf(
										patternByInfoObject,
										sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT);
						while (indexBy > -1) {
							cmpInfoObject = sap.firefly.XString.substring(
									patternByInfoObject, 0, indexBy);
							patternByInfoObject = sap.firefly.XString
									.substring(patternByInfoObject,
											(indexBy + 1), -1);
							indexBy = sap.firefly.XString
									.indexOf(
											patternByInfoObjectLength,
											sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT_VALUE);
							cmpInfoObjectLength = sap.firefly.XString
									.substring(patternByInfoObjectLength, 0,
											indexBy);
							this.m_info_object_node_name_value_to
									.put(
											cmpInfoObject,
											sap.firefly.XString
													.substring(
															nodeNameByInfoObject,
															0,
															sap.firefly.XInteger
																	.convertStringToInteger(cmpInfoObjectLength)));
							patternByInfoObjectLength = sap.firefly.XString
									.substring(patternByInfoObjectLength,
											(indexBy + 1), -1);
							nodeNameByInfoObject = sap.firefly.XString
									.substring(
											nodeNameByInfoObject,
											sap.firefly.XInteger
													.convertStringToInteger(cmpInfoObjectLength),
											-1);
							indexBy = sap.firefly.XString
									.indexOf(
											patternByInfoObject,
											sap.firefly.InfoObjectHierarchyIntervalManager.CMP_SEPARATOR_INFO_OBJECT);
							if ((indexBy === -1)
									&& (sap.firefly.XString
											.size(patternByInfoObject) > 0)) {
								if (sap.firefly.XString.size(separator) > 0) {
									indexBy = sap.firefly.XString.indexOf(
											nodeNameByInfoObject, separator);
									nodeNameByInfoObject = sap.firefly.XString
											.substring(nodeNameByInfoObject,
													(indexBy + 1), -1);
								} else {
									nodeNameByInfoObject = sap.firefly.XString
											.substring(
													nodeNameByInfoObject,
													0,
													sap.firefly.XInteger
															.convertStringToInteger(cmpInfoObjectLength));
								}
								this.m_info_object_node_name_value_to.put(
										patternByInfoObject,
										nodeNameByInfoObject);
								break;
							}
							if (sap.firefly.XString.size(separator) > 0) {
								indexBy = sap.firefly.XString.indexOf(
										nodeNameByInfoObject, separator);
								nodeNameByInfoObject = sap.firefly.XString
										.substring(nodeNameByInfoObject,
												(indexBy + 1), -1);
							} else {
								nodeNameByInfoObject = sap.firefly.XString
										.substring(
												nodeNameByInfoObject,
												0,
												sap.firefly.XInteger
														.convertStringToInteger(cmpInfoObjectLength));
							}
						}
						return this.m_info_object_node_name_value_to
								.getByKey(infoObject);
					},
					getNodeDescriptionFromShort : function() {
						var iQFieldNodeDescrptionShortFrom = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_SH_FROM);
						var iQFieldValueNodeDescrptionShortFrom;
						if (iQFieldNodeDescrptionShortFrom === null) {
							return null;
						}
						iQFieldValueNodeDescrptionShortFrom = this
								.getFieldValue(iQFieldNodeDescrptionShortFrom);
						return iQFieldValueNodeDescrptionShortFrom
								.getStringValue();
					},
					getNodeDescriptionFromMedium : function() {
						var iQFieldNodeDescrptionMediumFrom = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_MD_FROM);
						var iQFieldValueNodeDescrptionMediumFrom;
						if (iQFieldNodeDescrptionMediumFrom === null) {
							return null;
						}
						iQFieldValueNodeDescrptionMediumFrom = this
								.getFieldValue(iQFieldNodeDescrptionMediumFrom);
						return iQFieldValueNodeDescrptionMediumFrom
								.getStringValue();
					},
					getNodeDescriptionFromLong : function() {
						var iQFieldNodeDescrptionLongFrom = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_LG_FROM);
						var iQFieldValueNodeDescrptionLongFrom;
						if (iQFieldNodeDescrptionLongFrom === null) {
							return null;
						}
						iQFieldValueNodeDescrptionLongFrom = this
								.getFieldValue(iQFieldNodeDescrptionLongFrom);
						return iQFieldValueNodeDescrptionLongFrom
								.getStringValue();
					},
					getNodeDescriptionToShort : function() {
						var iQFieldNodeDescrptionShortTo = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_SH_TO);
						var iQFieldValueNodeDescrptionShortTo;
						if (iQFieldNodeDescrptionShortTo === null) {
							return null;
						}
						iQFieldValueNodeDescrptionShortTo = this
								.getFieldValue(iQFieldNodeDescrptionShortTo);
						return iQFieldValueNodeDescrptionShortTo
								.getStringValue();
					},
					getNodeDescriptionToMedium : function() {
						var iQFieldNodeDescrptionMediumTo = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_MD_TO);
						var iQFieldValueNodeDescrptionMediumTo;
						if (iQFieldNodeDescrptionMediumTo === null) {
							return null;
						}
						iQFieldValueNodeDescrptionMediumTo = this
								.getFieldValue(iQFieldNodeDescrptionMediumTo);
						return iQFieldValueNodeDescrptionMediumTo
								.getStringValue();
					},
					getNodeDescriptionToLong : function() {
						var iQFieldNodeDescrptionLongTo = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_TXT_LG_TO);
						var iQFieldValueNodeDescrptionLongTo;
						if (iQFieldNodeDescrptionLongTo === null) {
							return null;
						}
						iQFieldValueNodeDescrptionLongTo = this
								.getFieldValue(iQFieldNodeDescrptionLongTo);
						return iQFieldValueNodeDescrptionLongTo
								.getStringValue();
					},
					getDateTo : function() {
						var iQFieldDateTo = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_DATE_TO);
						var iQFieldValueDateTo;
						if (iQFieldDateTo === null) {
							return null;
						}
						iQFieldValueDateTo = this.getFieldValue(iQFieldDateTo);
						return iQFieldValueDateTo.getDateValue();
					},
					getDateFrom : function() {
						var iQFieldDateFrom = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_DATE_FROM);
						var iQFieldValueDateFrom;
						if (iQFieldDateFrom === null) {
							return null;
						}
						iQFieldValueDateFrom = this
								.getFieldValue(iQFieldDateFrom);
						return iQFieldValueDateFrom.getDateValue();
					},
					getNodeId : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_NODE_ID);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getInfoObject : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyIntervalManager.FIELD_NAME_INFO_OBJECT_NAME);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getFormattedValue : function() {
						var dimension = this.getDimension();
						var attributeByType;
						var attributeMember;
						if (dimension !== null) {
							attributeByType = dimension
									.getFirstFieldByType(sap.firefly.PresentationType.KEY);
							if (attributeByType !== null) {
								attributeMember = this.m_attributeMemberMap
										.getByKey(attributeByType.getName());
								if (attributeMember !== null) {
									return attributeMember.getFormattedValue();
								}
							}
						}
						return null;
					},
					getValue : function() {
						var attributeByType = this.getDimension()
								.getFirstFieldByType(
										sap.firefly.PresentationType.KEY);
						var attributeMember;
						var value;
						if (attributeByType === null) {
							return sap.firefly.XStringValue.create(this
									.getName());
						}
						attributeMember = this.m_attributeMemberMap
								.getByKey(attributeByType.getName());
						value = attributeMember.getValue();
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalStateException("Value is null");
						}
						return value;
					},
					getDimension : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_dimension);
					},
					setDimension : function(dimension) {
						this.m_dimension = sap.firefly.XWeakReferenceUtil
								.getWeakRef(dimension);
					},
					getFieldValue : function(field) {
						var name = field.getName();
						return this.m_attributeMemberMap.getByKey(name);
					},
					getAllFieldValues : function() {
						return this.m_attributeMemberMap;
					},
					getResultSetFieldValues : function() {
						var rsAttributeMembers = sap.firefly.XList.create();
						var resultSetAttributes = this.getDimension()
								.getResultSetFields();
						var attribute;
						var member;
						var i;
						for (i = 0; i < resultSetAttributes.size(); i++) {
							attribute = resultSetAttributes.getFieldByIndex(i);
							member = this.m_attributeMemberMap
									.getByKey(attribute.getName());
							rsAttributeMembers.add(member);
						}
						return rsAttributeMembers;
					},
					addFieldValue : function(fieldValue) {
						this.addFieldValueInternal(fieldValue.getField(),
								fieldValue);
					},
					createAndAddField : function(field) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldWithValue : function(field, value) {
						if (value.getValueType() === sap.firefly.XValueType.STRING) {
							return this.createAndAddFieldValueWithString(field,
									(value).getStringValue());
						} else {
							if (value.getValueType() === sap.firefly.XValueType.AMOUNT) {
								return this.createAndAddFieldValueWithAmount(
										field, (value).getAmountValue());
							} else {
								if (value.getValueType() === sap.firefly.XValueType.INTEGER) {
									return this
											.createAndAddFieldValueWithInteger(
													field, (value)
															.getIntegerValue());
								} else {
									if (value.getValueType() === sap.firefly.XValueType.LONG) {
										return this
												.createAndAddFieldValueWithLong(
														field, (value)
																.getLongValue());
									} else {
										if (value.getValueType() === sap.firefly.XValueType.DOUBLE) {
											return this
													.createAndAddFieldValueWithDouble(
															field,
															(value)
																	.getDoubleValue());
										} else {
											if (value.getValueType() === sap.firefly.XValueType.BOOLEAN) {
												return this
														.createAndAddFieldValueWithBoolean(
																field,
																(value)
																		.getBooleanValue());
											} else {
												if (value.getValueType() === sap.firefly.XValueType.DATE) {
													return this
															.createAndAddFieldValueWithDate(
																	field,
																	value);
												} else {
													if (value.getValueType() === sap.firefly.XValueType.DATE_TIME) {
														return this
																.createAndAddFieldValueWithDateTime(
																		field,
																		value);
													} else {
														if (value
																.getValueType() === sap.firefly.XValueType.TIME) {
															return this
																	.createAndAddFieldValueWithTime(
																			field,
																			value);
														}
													}
												}
											}
										}
									}
								}
							}
						}
						return null;
					},
					createAndAddFieldValueWithString : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(sap.firefly.XStringValue
								.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithAmount : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(sap.firefly.XAmountValue
								.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithInteger : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(sap.firefly.XIntegerValue
								.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithLong : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember
								.setValue(sap.firefly.XLongValue.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithDouble : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(sap.firefly.XDoubleValue
								.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithDate : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(value);
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithDateTime : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(value);
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithTime : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(value);
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithBoolean : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(sap.firefly.XBooleanValue
								.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					addFieldValueInternal : function(field, newMember) {
						this.m_attributeMemberMap.put(field.getName(),
								newMember);
					},
					createSelection : function() {
						var selection = sap.firefly.QFilterOperation._create(
								null, null, null);
						return selection;
					},
					getAttributeMemberByPresentation : function(presentation) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getValueAsString : function() {
						var value = this.getValue();
						var valueType = value.getValueType();
						var stringValue;
						var dateValue;
						var timeValue;
						var dateTimeValue;
						var integerValue;
						var longValue;
						var doubleValue;
						if (valueType === sap.firefly.XValueType.STRING) {
							stringValue = value;
							return stringValue.getStringValue();
						} else {
							if (valueType === sap.firefly.XValueType.DATE) {
								dateValue = value;
								return dateValue.toIsoFormat();
							} else {
								if (valueType === sap.firefly.XValueType.TIME) {
									timeValue = value;
									return timeValue.toIsoFormat();
								} else {
									if (valueType === sap.firefly.XValueType.DATE_TIME) {
										dateTimeValue = value;
										return dateTimeValue.toIsoFormat();
									} else {
										if (valueType === sap.firefly.XValueType.INTEGER) {
											integerValue = value;
											return sap.firefly.XInteger
													.convertIntegerToString(integerValue
															.getIntegerValue());
										} else {
											if (valueType === sap.firefly.XValueType.LONG) {
												longValue = value;
												return sap.firefly.XLong
														.convertLongToString(longValue
																.getLongValue());
											} else {
												if ((valueType === sap.firefly.XValueType.DOUBLE)
														|| (valueType === sap.firefly.XValueType.DECIMAL_FLOAT)) {
													doubleValue = value;
													return sap.firefly.XDouble
															.convertDoubleToString(doubleValue
																	.getDoubleValue());
												} else {
													throw sap.firefly.XException
															.createIllegalStateException(sap.firefly.XString
																	.concatenate2(
																			"Value type not supported: ",
																			valueType
																					.getName()));
												}
											}
										}
									}
								}
							}
						}
					},
					getInternalType : function() {
						return sap.firefly.XValueType.STRING;
					},
					getBooleanValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.BOOLEAN);
						return (value).getBooleanValue();
					},
					getDoubleValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.DOUBLE);
						return (value).getDoubleValue();
					},
					getIntegerValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.INTEGER);
						return (value).getIntegerValue();
					},
					getLongValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.LONG);
						return (value).getLongValue();
					},
					getDateValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.DATE);
						return value;
					},
					getTimeValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.TIME);
						return value;
					},
					getTimeSpanValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getPolygonValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.POLYGON);
						return value;
					},
					getGeometry : function() {
						var value = this.getValue();
						return value;
					},
					getPointValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.POINT);
						return value;
					},
					getStringValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.STRING);
						return (value).getStringValue();
					},
					getStructureValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.STRUCTURE);
						return value;
					},
					getStructureListValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.LIST);
						return value;
					},
					getPropertiesValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.PROPERTIES);
						return value;
					},
					getErrorValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getIntByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getIntegerValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getIntegerValue();
					},
					getDoubleByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getDoubleValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getDoubleValue();
					},
					getDateByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getDateValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getDateValue();
					},
					getStringByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getStringValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getStringValue();
					},
					getTimeSpanByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getTimeSpanValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getTimeSpanValue();
					},
					getPolygonByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getPolygonValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getPolygonValue();
					},
					setType : function(type) {
						this.m_memberType = type;
					},
					getType : function() {
						return this.getMemberType();
					},
					getMemberType : function() {
						return this.m_memberType;
					},
					getValueType : function() {
						return sap.firefly.XValueType.STRING;
					},
					getOlapComponentType : function() {
						return this.m_memberType;
					},
					getKeyFieldValue : function() {
						var keyField = this.getDimension().getKeyField();
						return this.getFieldValue(keyField);
					},
					getNodeType : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDimensionAccessor : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isComponentNode : function() {
						return false;
					},
					getComponentProperties : function() {
						return null;
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						if ((this.m_attributeMemberMap !== null)
								&& (this.m_attributeMemberMap.size() > 0)) {
							buffer.append("\n");
						}
						buffer.append(this.getName());
						buffer.append(": ");
						buffer.append(this.getText());
						if ((this.m_attributeMemberMap !== null)
								&& (this.m_attributeMemberMap.size() > 0)) {
							buffer.append(" (");
							buffer.append(this.m_attributeMemberMap.toString());
							buffer.append(")");
						}
						return buffer.toString();
					},
					getPropertyStringValue : function(type) {
						return null;
					},
					setPropertyStringValue : function(type, value) {
					},
					getPropertyConstantValue : function(type) {
						return null;
					},
					setPropertyConstantValue : function(type, value) {
					},
					getParentComponent : function() {
						return null;
					},
					setParent : function(parent) {
					},
					getDeltaChangeState : function() {
						return null;
					},
					resetChangeState : function() {
					},
					notifyChildChanged : function(changedNodes) {
					},
					notifyNodeChanged : function() {
					},
					isEventingStopped : function() {
						return false;
					},
					getModCounter : function() {
						return 0;
					},
					unregisterChangedListener : function(listener) {
						return null;
					},
					registerChangedListener : function(listener,
							customIdentifier) {
						return null;
					},
					getChangedListeners : function() {
						return null;
					},
					getField : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDimensionMember : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSelectValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSelectField : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSelectHierarchyName : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDateTimeValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.DATE_TIME);
						return value;
					},
					setProtocolExtension : function(element, replace) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getProtocolExtension : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isProtocolExtensionReplacing : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getMultiPolygonValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getLineStringValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.LINE_STRING);
						return value;
					},
					getMultiLineStringValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.MULTI_LINE_STRING);
						return value;
					},
					getNullValue : function() {
						return null;
					},
					setResultVisibility : function(memberVisibility) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getResultVisibility : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isRoot : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDimensionMemberNameValueException : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setDimensionMemberNameValueException : function(
							valueException) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getVariableContainer : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getFieldAccessorSingle : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getTagging : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setTagging : function(tagging) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getMultiPointValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.MULTI_POINT);
						return value;
					},
					serializeToFormat : function(modelFormat) {
						return this.serialize(modelFormat, null);
					},
					registerDeserializeListener : function(listener,
							customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					unregisterDeserializeListener : function(listener) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					queueEventing : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getNotificationListener : function() {
						return null;
					},
					setNotificationListener : function(owner) {
					},
					hasValue : function() {
						return false;
					},
					getSelectableElement : function() {
						return null;
					},
					isNode : function() {
						return this.getMemberType().isNode();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectHierarchyMember",
				sap.firefly.QModelComponent,
				{
					$statics : {
						createIInfoObjectHierarchyMember : function(
								iQDimensionBase) {
							var iInfoObjectHierarchyMember = new sap.firefly.InfoObjectHierarchyMember();
							iInfoObjectHierarchyMember.setupMember(
									iQDimensionBase, null);
							return iInfoObjectHierarchyMember;
						}
					},
					m_dimension : null,
					m_attributeMemberMap : null,
					m_memberType : null,
					m_info_object_node_name_value : null,
					setupMember : function(dimension, origin) {
						var attributeMembers;
						var iterator;
						var originAttributeMember;
						var cloneAttribute;
						var newFieldValue;
						var cloneAttributeMember;
						this.setupModelComponent(dimension, null);
						this.setName(dimension.getName());
						this.setText(dimension.getText());
						this.m_info_object_node_name_value = sap.firefly.XHashMapOfStringByString
								.create();
						this.m_attributeMemberMap = sap.firefly.XHashMapByString
								.create();
						if (origin !== null) {
							attributeMembers = origin.getAllFieldValues();
							iterator = attributeMembers.getIterator();
							while (iterator.hasNext()) {
								originAttributeMember = iterator.next();
								cloneAttribute = originAttributeMember
										.getField();
								newFieldValue = sap.firefly.QFieldValue.create(
										this.getContext(), dimension
												.getFieldByName(cloneAttribute
														.getName()), null);
								(newFieldValue)
										.copyFieldValue(originAttributeMember);
								cloneAttributeMember = newFieldValue;
								this.m_attributeMemberMap.put(cloneAttribute
										.getName(), cloneAttributeMember);
							}
							this.setDimension(origin.getDimension());
							this.setType(origin.getMemberType());
						} else {
							this.setDimension(dimension);
						}
					},
					getHieId : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_HIERARCHY_ID);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getObjectVerion : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_OBJECT_VERSION);
						var iQFieldValueNodeId;
						if (iQFieldNodeId === null) {
							return null;
						}
						iQFieldValueNodeId = this.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getInfoObject : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_INFO_OBJECT_NAME);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getNodeName : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NODE_NAME);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getNodeNameByInfoObject : function(infoObject) {
						var patternByInfoObject;
						var nodeNameByInfoObject;
						var indexBy;
						var patternByInfoObjectLength;
						var numberOfInfoObjects;
						var separator;
						var iSeparator;
						var cmpInfoObject;
						var cmpInfoObjectLength;
						if (!this.m_info_object_node_name_value.isEmpty()) {
							return this.m_info_object_node_name_value
									.getByKey(infoObject);
						}
						patternByInfoObject = this.getCMPPattern();
						nodeNameByInfoObject = this.getNodeName();
						if ((nodeNameByInfoObject === null)
								|| (sap.firefly.XString
										.size(nodeNameByInfoObject) === 0)) {
							return null;
						}
						if ((patternByInfoObject === null)
								|| (sap.firefly.XString
										.size(patternByInfoObject) === 0)) {
							if (sap.firefly.XString.isEqual(infoObject, this
									.getInfoObject())) {
								return nodeNameByInfoObject;
							}
							return null;
						}
						indexBy = sap.firefly.XString
								.indexOf(
										patternByInfoObject,
										sap.firefly.XString
												.concatenate2(
														sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT,
														sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT_TO_VALUE));
						patternByInfoObjectLength = sap.firefly.XString
								.substring(patternByInfoObject, (indexBy + 2),
										-1);
						patternByInfoObject = sap.firefly.XString.substring(
								patternByInfoObject, 0, indexBy);
						indexBy = sap.firefly.XString
								.indexOf(
										patternByInfoObject,
										sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT);
						if (indexBy === -1) {
							if (sap.firefly.XString.isEqual(infoObject, this
									.getInfoObject())) {
								return nodeNameByInfoObject;
							}
							return null;
						}
						numberOfInfoObjects = sap.firefly.XInteger
								.convertStringToInteger(sap.firefly.XString
										.substring(patternByInfoObject, 0,
												indexBy));
						separator = patternByInfoObjectLength;
						for (iSeparator = 0; iSeparator < numberOfInfoObjects; iSeparator++) {
							indexBy = sap.firefly.XString
									.indexOf(
											separator,
											sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT_VALUE);
							if (indexBy > -1) {
								separator = sap.firefly.XString.substring(
										separator, (indexBy + 1), -1);
							}
						}
						if (sap.firefly.XString.size(separator) > 0) {
							patternByInfoObjectLength = sap.firefly.XString
									.substring(
											patternByInfoObjectLength,
											0,
											(sap.firefly.XString
													.size(patternByInfoObjectLength)
													- sap.firefly.XString
															.size(separator) - 1));
						}
						patternByInfoObject = sap.firefly.XString.substring(
								patternByInfoObject, (indexBy + 1), -1);
						indexBy = sap.firefly.XString
								.indexOf(
										patternByInfoObject,
										sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT);
						while (indexBy > -1) {
							cmpInfoObject = sap.firefly.XString.substring(
									patternByInfoObject, 0, indexBy);
							patternByInfoObject = sap.firefly.XString
									.substring(patternByInfoObject,
											(indexBy + 1), -1);
							indexBy = sap.firefly.XString
									.indexOf(
											patternByInfoObjectLength,
											sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT_VALUE);
							cmpInfoObjectLength = sap.firefly.XString
									.substring(patternByInfoObjectLength, 0,
											indexBy);
							this.m_info_object_node_name_value
									.put(
											cmpInfoObject,
											sap.firefly.XString
													.substring(
															nodeNameByInfoObject,
															0,
															sap.firefly.XInteger
																	.convertStringToInteger(cmpInfoObjectLength)));
							patternByInfoObjectLength = sap.firefly.XString
									.substring(patternByInfoObjectLength,
											(indexBy + 1), -1);
							nodeNameByInfoObject = sap.firefly.XString
									.substring(
											nodeNameByInfoObject,
											sap.firefly.XInteger
													.convertStringToInteger(cmpInfoObjectLength),
											-1);
							indexBy = sap.firefly.XString
									.indexOf(
											patternByInfoObject,
											sap.firefly.InfoObjectHierarchyManager.CMP_SEPARATOR_INFO_OBJECT);
							if ((indexBy === -1)
									&& (sap.firefly.XString
											.size(patternByInfoObject) > 0)) {
								if (sap.firefly.XString.size(separator) > 0) {
									indexBy = sap.firefly.XString.indexOf(
											nodeNameByInfoObject, separator);
									nodeNameByInfoObject = sap.firefly.XString
											.substring(nodeNameByInfoObject,
													(indexBy + 1), -1);
								} else {
									nodeNameByInfoObject = sap.firefly.XString
											.substring(
													nodeNameByInfoObject,
													0,
													sap.firefly.XInteger
															.convertStringToInteger(cmpInfoObjectLength));
								}
								this.m_info_object_node_name_value.put(
										patternByInfoObject,
										nodeNameByInfoObject);
								break;
							}
							if (sap.firefly.XString.size(separator) > 0) {
								indexBy = sap.firefly.XString.indexOf(
										nodeNameByInfoObject, separator);
								nodeNameByInfoObject = sap.firefly.XString
										.substring(nodeNameByInfoObject,
												(indexBy + 1), -1);
							} else {
								nodeNameByInfoObject = sap.firefly.XString
										.substring(
												nodeNameByInfoObject,
												0,
												sap.firefly.XInteger
														.convertStringToInteger(cmpInfoObjectLength));
							}
						}
						return this.m_info_object_node_name_value
								.getByKey(infoObject);
					},
					getCMPPattern : function() {
						var iQFieldNodeCMPPattern = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_CMP_PATTERN);
						var iQFieldValueCMPPattern;
						if (iQFieldNodeCMPPattern === null) {
							return null;
						}
						iQFieldValueCMPPattern = this
								.getFieldValue(iQFieldNodeCMPPattern);
						return iQFieldValueCMPPattern.getStringValue();
					},
					getNodeDescrptionShort : function() {
						var iQFieldNodeDescrptionShort = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_TXT_SH);
						var iQFieldValueNodeDescrptionShort;
						if (iQFieldNodeDescrptionShort === null) {
							return null;
						}
						iQFieldValueNodeDescrptionShort = this
								.getFieldValue(iQFieldNodeDescrptionShort);
						return iQFieldValueNodeDescrptionShort.getStringValue();
					},
					getNodeDescrptionMedium : function() {
						var iQFieldNodeDescrptionMedium = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_TXT_MD);
						var iQFieldValueNodeDescrptionMedium;
						if (iQFieldNodeDescrptionMedium === null) {
							return null;
						}
						iQFieldValueNodeDescrptionMedium = this
								.getFieldValue(iQFieldNodeDescrptionMedium);
						return iQFieldValueNodeDescrptionMedium
								.getStringValue();
					},
					getNodeDescrptionLong : function() {
						var iQFieldNodeDescrptionLong = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_TXT_LG);
						var iQFieldValueNodeDescrptionLong;
						if (iQFieldNodeDescrptionLong === null) {
							return null;
						}
						iQFieldValueNodeDescrptionLong = this
								.getFieldValue(iQFieldNodeDescrptionLong);
						return iQFieldValueNodeDescrptionLong.getStringValue();
					},
					getNodeId : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NODE_ID);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getMemberId : function() {
						return this.getNodeId();
					},
					getLevel : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_T_LEVEL);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getLink : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_LINK);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getParentId : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_PARENT_ID);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getChildId : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_CHILD_ID);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getNextId : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_NEXT_ID);
						var iQFieldValueNodeId = this
								.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					getDateTo : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_DATE_TO);
						var iQFieldValueNodeId;
						if (iQFieldNodeId === null) {
							return null;
						}
						iQFieldValueNodeId = this.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getDateValue();
					},
					getDateFrom : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_DATE_FROM);
						var iQFieldValueNodeId;
						if (iQFieldNodeId === null) {
							return null;
						}
						iQFieldValueNodeId = this.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getDateValue();
					},
					getReverseSign : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_SIGN_CH);
						var iQFieldValueNodeId;
						if (iQFieldNodeId === null) {
							return null;
						}
						iQFieldValueNodeId = this.getFieldValue(iQFieldNodeId);
						return iQFieldValueNodeId.getStringValue();
					},
					isInterval : function() {
						var iQFieldNodeId = this
								.getDimension()
								.getFieldByName(
										sap.firefly.InfoObjectHierarchyManager.FIELD_NAME_INTERVL);
						var iQFieldValueNodeId;
						var intervalString;
						if (iQFieldNodeId === null) {
							return false;
						}
						iQFieldValueNodeId = this.getFieldValue(iQFieldNodeId);
						intervalString = iQFieldValueNodeId.getStringValue();
						return sap.firefly.XString.isEqual(intervalString,
								sap.firefly.InAConstants.VA_ABAP_TRUE);
					},
					getFormattedValue : function() {
						var dimension = this.getDimension();
						var attributeByType;
						var attributeMember;
						if (dimension !== null) {
							attributeByType = dimension
									.getFirstFieldByType(sap.firefly.PresentationType.KEY);
							if (attributeByType !== null) {
								attributeMember = this.m_attributeMemberMap
										.getByKey(attributeByType.getName());
								if (attributeMember !== null) {
									return attributeMember.getFormattedValue();
								}
							}
						}
						return null;
					},
					getValue : function() {
						var attributeByType = this.getDimension()
								.getFirstFieldByType(
										sap.firefly.PresentationType.KEY);
						var attributeMember;
						var value;
						if (attributeByType === null) {
							return sap.firefly.XStringValue.create(this
									.getName());
						}
						attributeMember = this.m_attributeMemberMap
								.getByKey(attributeByType.getName());
						value = attributeMember.getValue();
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalStateException("Value is null");
						}
						return value;
					},
					getDimension : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_dimension);
					},
					setDimension : function(dimension) {
						this.m_dimension = sap.firefly.XWeakReferenceUtil
								.getWeakRef(dimension);
					},
					getFieldValue : function(field) {
						var name = field.getName();
						return this.m_attributeMemberMap.getByKey(name);
					},
					getAllFieldValues : function() {
						return this.m_attributeMemberMap;
					},
					getResultSetFieldValues : function() {
						var rsAttributeMembers = sap.firefly.XList.create();
						var resultSetAttributes = this.getDimension()
								.getResultSetFields();
						var attribute;
						var member;
						var i;
						for (i = 0; i < resultSetAttributes.size(); i++) {
							attribute = resultSetAttributes.getFieldByIndex(i);
							member = this.m_attributeMemberMap
									.getByKey(attribute.getName());
							rsAttributeMembers.add(member);
						}
						return rsAttributeMembers;
					},
					addFieldValue : function(fieldValue) {
						this.addFieldValueInternal(fieldValue.getField(),
								fieldValue);
					},
					createAndAddField : function(field) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldWithValue : function(field, value) {
						if (value.getValueType() === sap.firefly.XValueType.STRING) {
							return this.createAndAddFieldValueWithString(field,
									(value).getStringValue());
						} else {
							if (value.getValueType() === sap.firefly.XValueType.AMOUNT) {
								return this.createAndAddFieldValueWithAmount(
										field, (value).getAmountValue());
							} else {
								if (value.getValueType() === sap.firefly.XValueType.INTEGER) {
									return this
											.createAndAddFieldValueWithInteger(
													field, (value)
															.getIntegerValue());
								} else {
									if (value.getValueType() === sap.firefly.XValueType.LONG) {
										return this
												.createAndAddFieldValueWithLong(
														field, (value)
																.getLongValue());
									} else {
										if (value.getValueType() === sap.firefly.XValueType.DOUBLE) {
											return this
													.createAndAddFieldValueWithDouble(
															field,
															(value)
																	.getDoubleValue());
										} else {
											if (value.getValueType() === sap.firefly.XValueType.BOOLEAN) {
												return this
														.createAndAddFieldValueWithBoolean(
																field,
																(value)
																		.getBooleanValue());
											} else {
												if (value.getValueType() === sap.firefly.XValueType.DATE) {
													return this
															.createAndAddFieldValueWithDate(
																	field,
																	value);
												} else {
													if (value.getValueType() === sap.firefly.XValueType.DATE_TIME) {
														return this
																.createAndAddFieldValueWithDateTime(
																		field,
																		value);
													} else {
														if (value
																.getValueType() === sap.firefly.XValueType.TIME) {
															return this
																	.createAndAddFieldValueWithTime(
																			field,
																			value);
														}
													}
												}
											}
										}
									}
								}
							}
						}
						return null;
					},
					createAndAddFieldValueWithString : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(sap.firefly.XStringValue
								.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithAmount : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(sap.firefly.XAmountValue
								.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithInteger : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(sap.firefly.XIntegerValue
								.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithLong : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember
								.setValue(sap.firefly.XLongValue.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithDouble : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(sap.firefly.XDoubleValue
								.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithDate : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(value);
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithDateTime : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(value);
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithTime : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(value);
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldValueWithBoolean : function(field, value) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						newMember.setValue(sap.firefly.XBooleanValue
								.create(value));
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					addFieldValueInternal : function(field, newMember) {
						this.m_attributeMemberMap.put(field.getName(),
								newMember);
					},
					createSelection : function() {
						var selection = sap.firefly.QFilterOperation._create(
								null, null, null);
						return selection;
					},
					getAttributeMemberByPresentation : function(presentation) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getInternalType : function() {
						return sap.firefly.XValueType.STRING;
					},
					getValueAsString : function() {
						var value = this.getValue();
						var valueType = value.getValueType();
						var stringValue;
						var dateValue;
						var timeValue;
						var dateTimeValue;
						var integerValue;
						var longValue;
						var doubleValue;
						if (valueType === sap.firefly.XValueType.STRING) {
							stringValue = value;
							return stringValue.getStringValue();
						} else {
							if (valueType === sap.firefly.XValueType.DATE) {
								dateValue = value;
								return dateValue.toIsoFormat();
							} else {
								if (valueType === sap.firefly.XValueType.TIME) {
									timeValue = value;
									return timeValue.toIsoFormat();
								} else {
									if (valueType === sap.firefly.XValueType.DATE_TIME) {
										dateTimeValue = value;
										return dateTimeValue.toIsoFormat();
									} else {
										if (valueType === sap.firefly.XValueType.INTEGER) {
											integerValue = value;
											return sap.firefly.XInteger
													.convertIntegerToString(integerValue
															.getIntegerValue());
										} else {
											if (valueType === sap.firefly.XValueType.LONG) {
												longValue = value;
												return sap.firefly.XLong
														.convertLongToString(longValue
																.getLongValue());
											} else {
												if ((valueType === sap.firefly.XValueType.DOUBLE)
														|| (valueType === sap.firefly.XValueType.DECIMAL_FLOAT)) {
													doubleValue = value;
													return sap.firefly.XDouble
															.convertDoubleToString(doubleValue
																	.getDoubleValue());
												} else {
													throw sap.firefly.XException
															.createIllegalStateException(sap.firefly.XString
																	.concatenate2(
																			"Value type not supported: ",
																			valueType
																					.getName()));
												}
											}
										}
									}
								}
							}
						}
					},
					getBooleanValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.BOOLEAN);
						return (value).getBooleanValue();
					},
					getDoubleValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.DOUBLE);
						return (value).getDoubleValue();
					},
					getIntegerValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.INTEGER);
						return (value).getIntegerValue();
					},
					getLongValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.LONG);
						return (value).getLongValue();
					},
					getDateValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.DATE);
						return value;
					},
					getTimeValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.TIME);
						return value;
					},
					getTimeSpanValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getGeometry : function() {
						var value = this.getValue();
						return value;
					},
					getPolygonValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.POLYGON);
						return value;
					},
					getPointValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.POINT);
						return value;
					},
					getStringValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.STRING);
						return (value).getStringValue();
					},
					getStructureValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.STRUCTURE);
						return value;
					},
					getStructureListValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.LIST);
						return value;
					},
					getPropertiesValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.PROPERTIES);
						return value;
					},
					getErrorValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getIntByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getIntegerValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getIntegerValue();
					},
					getDoubleByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getDoubleValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getDoubleValue();
					},
					getDateByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getDateValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getDateValue();
					},
					getStringByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getStringValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getStringValue();
					},
					getTimeSpanByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getTimeSpanValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getTimeSpanValue();
					},
					getPolygonByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getPolygonValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getPolygonValue();
					},
					setType : function(type) {
						this.m_memberType = type;
					},
					getType : function() {
						return this.getMemberType();
					},
					getMemberType : function() {
						return this.m_memberType;
					},
					getValueType : function() {
						return sap.firefly.XValueType.STRING;
					},
					getOlapComponentType : function() {
						return this.m_memberType;
					},
					getKeyFieldValue : function() {
						var keyField = this.getDimension().getKeyField();
						return this.getFieldValue(keyField);
					},
					getNodeType : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDimensionAccessor : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isComponentNode : function() {
						return false;
					},
					getComponentProperties : function() {
						return null;
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						if ((this.m_attributeMemberMap !== null)
								&& (this.m_attributeMemberMap.size() > 0)) {
							buffer.append("\n");
						}
						buffer.append(this.getName());
						buffer.append(": ");
						buffer.append(this.getText());
						if ((this.m_attributeMemberMap !== null)
								&& (this.m_attributeMemberMap.size() > 0)) {
							buffer.append(" (");
							buffer.append(this.m_attributeMemberMap.toString());
							buffer.append(")");
						}
						return buffer.toString();
					},
					getPropertyStringValue : function(type) {
						return null;
					},
					setPropertyStringValue : function(type, value) {
					},
					getPropertyConstantValue : function(type) {
						return null;
					},
					setPropertyConstantValue : function(type, value) {
					},
					getParentComponent : function() {
						return null;
					},
					setParent : function(parent) {
					},
					getDeltaChangeState : function() {
						return null;
					},
					resetChangeState : function() {
					},
					notifyChildChanged : function(changedNodes) {
					},
					notifyNodeChanged : function() {
					},
					isEventingStopped : function() {
						return false;
					},
					getModCounter : function() {
						return 0;
					},
					unregisterChangedListener : function(listener) {
						return null;
					},
					registerChangedListener : function(listener,
							customIdentifier) {
						return null;
					},
					getChangedListeners : function() {
						return null;
					},
					getField : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDimensionMember : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSelectValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSelectField : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSelectHierarchyName : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDateTimeValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.DATE_TIME);
						return value;
					},
					setProtocolExtension : function(element, replace) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getProtocolExtension : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isProtocolExtensionReplacing : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getMultiPolygonValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getLineStringValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getMultiLineStringValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getNullValue : function() {
						return null;
					},
					setResultVisibility : function(memberVisibility) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getResultVisibility : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isRoot : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDimensionMemberNameValueException : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setDimensionMemberNameValueException : function(
							valueException) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getVariableContainer : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getFieldAccessorSingle : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getTagging : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setTagging : function(tagging) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getMultiPointValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.MULTI_POINT);
						return value;
					},
					serializeToFormat : function(modelFormat) {
						return this.serialize(modelFormat, null);
					},
					registerDeserializeListener : function(listener,
							customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					unregisterDeserializeListener : function(listener) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					queueEventing : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getNotificationListener : function() {
						return null;
					},
					setNotificationListener : function(owner) {
					},
					hasValue : function() {
						return false;
					},
					getSelectableElement : function() {
						return null;
					},
					isNode : function() {
						return this.getMemberType().isNode();
					},
					getChildCount : function() {
						var iQFieldChildCount = this.getDimension()
								.getFieldByName("CHILDCOUNT");
						var iQFieldValueChildCount = this
								.getFieldValue(iQFieldChildCount);
						return iQFieldValueChildCount.getIntegerValue();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectHierarchyValueHelp",
				sap.firefly.QModelComponent,
				{
					$statics : {
						createModelComponent : function(environment, config,
								dimensionBase, name, syncType) {
							var object = new sap.firefly.InfoObjectHierarchyValueHelp();
							object.setupHierarchyValueHelp(environment
									.getContext(), config, dimensionBase, null,
									sap.firefly.InAConstants.VA_OBJVERS_ACTIVE,
									name, syncType);
							return object;
						},
						create : function(environment, config, dimension,
								objectVersion, name, syncType) {
							var object = new sap.firefly.InfoObjectHierarchyValueHelp();
							object.setupHierarchyValueHelp(environment
									.getContext(), config, null, dimension,
									objectVersion, name, syncType);
							return object;
						}
					},
					m_config : null,
					m_dimension : null,
					m_queryModelHierarchyHelp : null,
					m_objectVersion : null,
					m_hierarchies : null,
					m_isInitialized : false,
					m_syncType : null,
					setupHierarchyValueHelp : function(context, config,
							dimensionBase, dimension, objectVersion, name,
							syncType) {
						this.setupModelComponent(context, dimensionBase);
						if (dimensionBase !== null) {
							this.m_dimension = sap.firefly.XWeakReferenceUtil
									.getWeakRef(dimensionBase);
						} else {
							if (dimension !== null) {
								this.m_dimension = sap.firefly.XWeakReferenceUtil
										.getWeakRef(dimension);
							}
						}
						this.setName(name);
						this.m_objectVersion = objectVersion;
						this.m_config = config;
						this.m_isInitialized = false;
						this.m_syncType = syncType;
						if (this.m_syncType === null) {
							this.m_syncType = sap.firefly.SyncType.NON_BLOCKING;
						}
						this.initializeHierarchyValueHelp();
					},
					initializeHierarchyValueHelp : function() {
						var dimension;
						var application;
						var systemName;
						var systemDescription;
						var dimensionName;
						var dataSource;
						var serviceConfig;
						if ((this.m_dimension === null)
								|| (this.m_isInitialized)) {
							return;
						}
						this.m_isInitialized = true;
						dimension = this.m_dimension.getReference();
						application = dimension.getApplication();
						systemName = dimension.getQueryModel().getDataSource()
								.getSystemName();
						systemDescription = application.getSystemLandscape()
								.getSystemDescription(systemName);
						dimensionName = dimension.getName();
						dataSource = dimension.getQueryModel().getDataSource()
								.getFullQualifiedName();
						if (systemDescription === null) {
							throw sap.firefly.XException
									.createRuntimeException(sap.firefly.XStringUtils
											.concatenate2(
													"System Description not found. System Name: ",
													systemName));
						}
						if (sap.firefly.HierarchyCatalogUtil
								.isHierarchyCatalogSupported(systemDescription) === false) {
							throw sap.firefly.XException
									.createRuntimeException("Hierarchy Catalog Service is not supported");
						}
						serviceConfig = sap.firefly.OlapApiModule.SERVICE_TYPE_HIERARCHY_CATALOG
								.createServiceConfig(application);
						serviceConfig.setSystemName(systemName);
						serviceConfig.setDataSourceName(dataSource);
						serviceConfig.setDimensionName(dimensionName);
						serviceConfig.setEnvironmentName(this.m_config
								.getDataSource().getEnvironmentName());
						serviceConfig.processHierarchyCatalogManagerCreation(
								sap.firefly.SyncType.BLOCKING, this, null);
					},
					getHierarchies : function() {
						return this.m_hierarchies;
					},
					getQueryModel : function() {
						return this.m_queryModelHierarchyHelp;
					},
					getDimension : function() {
						return this.m_dimension.getReference();
					},
					onHierarchyCatalogManagerCreated : function(extResult,
							hierarchyCatalogManager, customIdentifier) {
						var iQueryManager;
						var iQConvenienceCommands;
						var textDimension;
						var dateFromDimension;
						var ownerDimension;
						var idDimension;
						var typeDimension;
						var objVersDimension;
						var remoteDimension;
						if (extResult.hasErrors()
								|| (hierarchyCatalogManager === null)) {
							throw sap.firefly.XException
									.createRuntimeException(extResult
											.getSummary());
						}
						iQueryManager = (hierarchyCatalogManager)
								.getQueryManager();
						this.m_queryModelHierarchyHelp = (hierarchyCatalogManager)
								.getQueryManager().getQueryModel();
						hierarchyCatalogManager
								.setSingleSelectionHierarchyObjectVersion(
										this.m_objectVersion, true);
						iQConvenienceCommands = iQueryManager.getQueryModel()
								.getConvenienceCommands();
						iQConvenienceCommands.resetToDefault();
						iQConvenienceCommands.moveDimensionToAxis(
								sap.firefly.HierarchyCatalogManager.BW_D_NAME,
								sap.firefly.AxisType.ROWS);
						iQConvenienceCommands
								.addFieldToResultSet(
										sap.firefly.HierarchyCatalogManager.BW_D_NAME,
										sap.firefly.HierarchyCatalogManager.BW_A_NAME_KEY);
						textDimension = iQConvenienceCommands
								.moveDimensionToAxis(
										sap.firefly.HierarchyCatalogManager.BW_D_TEXT,
										sap.firefly.AxisType.ROWS);
						if (textDimension
								.getFieldByName(sap.firefly.HierarchyCatalogManager.BW_A_TEXT_SHORT_TEXT) !== null) {
							iQConvenienceCommands
									.addFieldToResultSet(
											sap.firefly.HierarchyCatalogManager.BW_D_TEXT,
											sap.firefly.HierarchyCatalogManager.BW_A_TEXT_SHORT_TEXT);
						}
						if (textDimension
								.getFieldByName(sap.firefly.HierarchyCatalogManager.BW_A_TEXT_MEDIUM_TEXT) !== null) {
							iQConvenienceCommands
									.addFieldToResultSet(
											sap.firefly.HierarchyCatalogManager.BW_D_TEXT,
											sap.firefly.HierarchyCatalogManager.BW_A_TEXT_MEDIUM_TEXT);
						}
						if (textDimension
								.getFieldByName(sap.firefly.HierarchyCatalogManager.BW_A_TEXT_LONG_TEXT) !== null) {
							iQConvenienceCommands
									.addFieldToResultSet(
											sap.firefly.HierarchyCatalogManager.BW_D_TEXT,
											sap.firefly.HierarchyCatalogManager.BW_A_TEXT_LONG_TEXT);
						}
						iQConvenienceCommands
								.moveDimensionToAxis(
										sap.firefly.HierarchyCatalogManager.BW_D_VERSION,
										sap.firefly.AxisType.ROWS);
						iQConvenienceCommands
								.addFieldToResultSet(
										sap.firefly.HierarchyCatalogManager.BW_D_VERSION,
										sap.firefly.HierarchyCatalogManager.BW_A_VERSION_KEY);
						iQConvenienceCommands
								.moveDimensionToAxis(
										sap.firefly.HierarchyCatalogManager.BW_D_VERSION,
										sap.firefly.AxisType.ROWS);
						iQConvenienceCommands
								.addFieldToResultSet(
										sap.firefly.HierarchyCatalogManager.BW_D_VERSION,
										sap.firefly.HierarchyCatalogManager.BW_A_VERSION_LONG_TEXT);
						iQConvenienceCommands
								.moveDimensionToAxis(
										sap.firefly.HierarchyCatalogManager.BW_D_DATE_TO,
										sap.firefly.AxisType.ROWS);
						iQConvenienceCommands
								.addFieldToResultSet(
										sap.firefly.HierarchyCatalogManager.BW_D_DATE_TO,
										sap.firefly.HierarchyCatalogManager.BW_A_DATE_TO_KEY);
						dateFromDimension = iQConvenienceCommands
								.moveDimensionToAxis(
										sap.firefly.HierarchyCatalogManager.BW_D_DATE_FROM,
										sap.firefly.AxisType.ROWS);
						if (dateFromDimension !== null) {
							iQConvenienceCommands
									.addFieldToResultSet(
											sap.firefly.HierarchyCatalogManager.BW_D_DATE_FROM,
											sap.firefly.HierarchyCatalogManager.BW_A_DATE_FROM_KEY);
						}
						ownerDimension = iQConvenienceCommands
								.moveDimensionToAxis(
										sap.firefly.HierarchyCatalogManager.BW_D_OWNER,
										sap.firefly.AxisType.ROWS);
						if (ownerDimension !== null) {
							iQConvenienceCommands
									.addFieldToResultSet(
											sap.firefly.HierarchyCatalogManager.BW_D_OWNER,
											sap.firefly.HierarchyCatalogManager.BW_A_OWNER_KEY);
						}
						idDimension = iQConvenienceCommands
								.moveDimensionToAxis(
										sap.firefly.HierarchyCatalogManager.BW_D_HIEID,
										sap.firefly.AxisType.ROWS);
						if (idDimension !== null) {
							iQConvenienceCommands
									.addFieldToResultSet(
											sap.firefly.HierarchyCatalogManager.BW_D_HIEID,
											sap.firefly.HierarchyCatalogManager.BW_A_HIEID_KEY);
						}
						typeDimension = iQConvenienceCommands
								.moveDimensionToAxis(
										sap.firefly.HierarchyCatalogManager.BW_D_HIETYPE,
										sap.firefly.AxisType.ROWS);
						if (typeDimension !== null) {
							iQConvenienceCommands
									.addFieldToResultSet(
											sap.firefly.HierarchyCatalogManager.BW_D_HIETYPE,
											sap.firefly.HierarchyCatalogManager.BW_A_HIETYPE_KEY);
						}
						objVersDimension = iQConvenienceCommands
								.moveDimensionToAxis(
										sap.firefly.HierarchyCatalogManager.BW_D_OBJVERS,
										sap.firefly.AxisType.ROWS);
						if (objVersDimension !== null) {
							iQConvenienceCommands
									.addFieldToResultSet(
											sap.firefly.HierarchyCatalogManager.BW_D_OBJVERS,
											sap.firefly.HierarchyCatalogManager.BW_A_OBJVERS_KEY);
						}
						remoteDimension = iQConvenienceCommands
								.moveDimensionToAxis(
										sap.firefly.HierarchyCatalogManager.BW_D_IS_REMOTE,
										sap.firefly.AxisType.ROWS);
						if (remoteDimension !== null) {
							iQConvenienceCommands
									.addFieldToResultSet(
											sap.firefly.HierarchyCatalogManager.BW_D_IS_REMOTE,
											sap.firefly.HierarchyCatalogManager.BW_A_IS_REMOTE_KEY);
						}
						iQConvenienceCommands
								.clearFiltersByDimensionName(sap.firefly.HierarchyCatalogManager.BW_D_OBJVERS);
						iQConvenienceCommands
								.addSingleMemberFilterByDimensionName(
										sap.firefly.HierarchyCatalogManager.BW_D_OBJVERS,
										this.m_objectVersion,
										sap.firefly.ComparisonOperator.EQUAL);
						iQueryManager.processQueryExecution(this.m_syncType,
								this, customIdentifier);
					},
					onHierarchyCatalogResult : function(extResult, result,
							customIdentifier) {
						this.processHierarchyCatalogResult(result);
					},
					onQueryExecuted : function(extResult, resultSetContainer,
							customIdentifier) {
						var classicResultSet;
						var hierarchyCatalogResult;
						if (extResult.isValid()) {
							classicResultSet = resultSetContainer
									.getClassicResultSet();
							hierarchyCatalogResult = sap.firefly.HierarchyCatalogResult
									.create(classicResultSet, (this.m_dimension
											.getReference()).getName());
							this
									.processHierarchyCatalogResult(hierarchyCatalogResult);
						}
					},
					processHierarchyCatalogResult : function(
							hierarchyCatalogResult) {
						var catalogItems;
						var changedNodes;
						var i;
						var catalogItem;
						var dimension;
						var dimensionName;
						var hierarchy;
						if (hierarchyCatalogResult === null) {
							return;
						}
						this.m_hierarchies = sap.firefly.XList.create();
						catalogItems = sap.firefly.HierarchyCatalogUtil
								.getHierarchyItems(hierarchyCatalogResult);
						if (catalogItems.size() > 0) {
							changedNodes = sap.firefly.XList.create();
							for (i = 0; i < catalogItems.size(); i++) {
								catalogItem = catalogItems.get(i);
								dimension = this.m_dimension.getReference();
								dimensionName = catalogItem.getDimensionName();
								if (sap.firefly.XString.compare(dimension
										.getName(), dimensionName) !== 0) {
									throw sap.firefly.XException
											.createRuntimeException(sap.firefly.XStringUtils
													.concatenate4(
															"Hierarchy Catalog: different dimension names. (1)",
															dimension.getName(),
															" (2) ",
															dimensionName));
								}
								hierarchy = sap.firefly.QHierarchy.create(
										dimension.getContext(), dimension,
										catalogItem.getHierarchyName());
								hierarchy.setHierarchyDescription(catalogItem
										.getHierarchyDescription());
								hierarchy.setHierarchyVersion(catalogItem
										.getVersionName());
								hierarchy.setVersionDescription(catalogItem
										.getVersionDescription());
								hierarchy.setDateTo(catalogItem.getDateTo());
								hierarchy
										.setDateFrom(catalogItem.getDateFrom());
								hierarchy.setOwner(catalogItem.getOwner());
								hierarchy.setHierId(catalogItem.getHierId());
								hierarchy
										.setHierType(catalogItem.getHierType());
								hierarchy.setObjectVersion(catalogItem
										.getObjectVersion());
								hierarchy.setIsRemote(catalogItem.isRemote());
								this.m_hierarchies.add(hierarchy);
								changedNodes.add(hierarchy);
							}
							this.notifyNodeChanged();
						}
					},
					isComponentNode : function() {
						return true;
					},
					getIndexedChildren : function() {
						var children = sap.firefly.XList.create();
						var i;
						if (this.m_hierarchies !== null) {
							for (i = 0; i < this.m_hierarchies.size(); i++) {
								children.add(this.m_hierarchies.get(i));
							}
						} else {
							if (this.m_isInitialized === false) {
								this.initializeHierarchyValueHelp();
								children.add(sap.firefly.QModelComponentNode
										.createLeave(this.getContext(),
												"Loading..."));
							}
						}
						return children.getIterator();
					},
					toString : function() {
						if (this.m_hierarchies !== null) {
							return this.m_hierarchies.toString();
						}
						return "[]";
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectQDimensionMember",
				sap.firefly.QModelComponent,
				{
					$statics : {
						createQDimensionMember : function(dimension) {
							var member = new sap.firefly.InfoObjectQDimensionMember();
							member.setupQDimensionMember(dimension, null);
							return member;
						}
					},
					m_dimension : null,
					m_attributeMemberMap : null,
					m_memberType : null,
					setupQDimensionMember : function(dimension, origin) {
						var attributeMembers;
						var iterator;
						var originAttributeMember;
						var cloneAttribute;
						var newFieldValue;
						var cloneAttributeMember;
						this.setupModelComponent(dimension, null);
						this.setName(dimension.getName());
						this.setText(dimension.getText());
						this.m_attributeMemberMap = sap.firefly.XHashMapByString
								.create();
						if (origin !== null) {
							attributeMembers = origin.getAllFieldValues();
							iterator = attributeMembers.getIterator();
							while (iterator.hasNext()) {
								originAttributeMember = iterator.next();
								cloneAttribute = originAttributeMember
										.getField();
								newFieldValue = sap.firefly.QFieldValue.create(
										this.getContext(), dimension
												.getFieldByName(cloneAttribute
														.getName()), null);
								(newFieldValue)
										.copyFieldValue(originAttributeMember);
								cloneAttributeMember = newFieldValue;
								this.m_attributeMemberMap.put(cloneAttribute
										.getName(), cloneAttributeMember);
							}
							this.setDimension(origin.getDimension());
							this.setType(origin.getMemberType());
						} else {
							this.setDimension(dimension);
						}
					},
					getFormattedValue : function() {
						var dimension = this.getDimension();
						var attributeByType;
						var attributeMember;
						if (dimension !== null) {
							attributeByType = dimension
									.getFirstFieldByType(sap.firefly.PresentationType.KEY);
							if (attributeByType !== null) {
								attributeMember = this.m_attributeMemberMap
										.getByKey(attributeByType.getName());
								if (attributeMember !== null) {
									return attributeMember.getFormattedValue();
								}
							}
						}
						return null;
					},
					getValue : function() {
						var attributeByType = this.getDimension()
								.getFirstFieldByType(
										sap.firefly.PresentationType.KEY);
						var attributeMember;
						var value;
						if (attributeByType === null) {
							return sap.firefly.XStringValue.create(this
									.getName());
						}
						attributeMember = this.m_attributeMemberMap
								.getByKey(attributeByType.getName());
						value = attributeMember.getValue();
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalStateException("Value is null");
						}
						return value;
					},
					getDimension : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_dimension);
					},
					setDimension : function(dimension) {
						this.m_dimension = sap.firefly.XWeakReferenceUtil
								.getWeakRef(dimension);
					},
					getFieldValue : function(field) {
						var name = field.getName();
						return this.m_attributeMemberMap.getByKey(name);
					},
					getAllFieldValues : function() {
						return this.m_attributeMemberMap;
					},
					getResultSetFieldValues : function() {
						var rsAttributeMembers = sap.firefly.XList.create();
						var resultSetAttributes = this.getDimension()
								.getResultSetFields();
						var attribute;
						var member;
						var i;
						for (i = 0; i < resultSetAttributes.size(); i++) {
							attribute = resultSetAttributes.getFieldByIndex(i);
							member = this.m_attributeMemberMap
									.getByKey(attribute.getName());
							rsAttributeMembers.add(member);
						}
						return rsAttributeMembers;
					},
					addFieldValue : function(fieldValue) {
						this.addFieldValueInternal(fieldValue.getField(),
								fieldValue);
					},
					createAndAddField : function(field) {
						var newMember = sap.firefly.QFieldValue.create(field
								.getContext(), field, this);
						this.addFieldValueInternal(field, newMember);
						return newMember;
					},
					createAndAddFieldWithValue : function(field, value) {
						if (value.getValueType() === sap.firefly.XValueType.STRING) {
							return this.createAndAddFieldValueWithString(field,
									(value).getStringValue());
						} else {
							if (value.getValueType() === sap.firefly.XValueType.AMOUNT) {
								return this.createAndAddFieldValueWithAmount(
										field, (value).getAmountValue());
							} else {
								if (value.getValueType() === sap.firefly.XValueType.INTEGER) {
									return this
											.createAndAddFieldValueWithInteger(
													field, (value)
															.getIntegerValue());
								} else {
									if (value.getValueType() === sap.firefly.XValueType.LONG) {
										return this
												.createAndAddFieldValueWithLong(
														field, (value)
																.getLongValue());
									} else {
										if (value.getValueType() === sap.firefly.XValueType.DOUBLE) {
											return this
													.createAndAddFieldValueWithDouble(
															field,
															(value)
																	.getDoubleValue());
										} else {
											if (value.getValueType() === sap.firefly.XValueType.BOOLEAN) {
												return this
														.createAndAddFieldValueWithBoolean(
																field,
																(value)
																		.getBooleanValue());
											} else {
												if (value.getValueType() === sap.firefly.XValueType.DATE) {
													return this
															.createAndAddFieldValueWithDate(
																	field,
																	value);
												} else {
													if (value.getValueType() === sap.firefly.XValueType.DATE_TIME) {
														return this
																.createAndAddFieldValueWithDateTime(
																		field,
																		value);
													} else {
														if (value
																.getValueType() === sap.firefly.XValueType.TIME) {
															return this
																	.createAndAddFieldValueWithTime(
																			field,
																			value);
														}
													}
												}
											}
										}
									}
								}
							}
						}
						return null;
					},
					createAndAddFieldValueWithString : function(field, value) {
						var newMember = this.createAndAddField(field);
						newMember.setValue(sap.firefly.XStringValue
								.create(value));
						return newMember;
					},
					createAndAddFieldValueWithAmount : function(field, value) {
						var newMember = this.createAndAddField(field);
						newMember.setValue(sap.firefly.XAmountValue
								.create(value));
						return newMember;
					},
					createAndAddFieldValueWithInteger : function(field, value) {
						var newMember = this.createAndAddField(field);
						newMember.setValue(sap.firefly.XIntegerValue
								.create(value));
						return newMember;
					},
					createAndAddFieldValueWithLong : function(field, value) {
						var newMember = this.createAndAddField(field);
						newMember
								.setValue(sap.firefly.XLongValue.create(value));
						return newMember;
					},
					createAndAddFieldValueWithDouble : function(field, value) {
						var newMember = this.createAndAddField(field);
						newMember.setValue(sap.firefly.XDoubleValue
								.create(value));
						return newMember;
					},
					createAndAddFieldValueWithDate : function(field, value) {
						var newMember = this.createAndAddField(field);
						newMember.setValue(value);
						return newMember;
					},
					createAndAddFieldValueWithDateTime : function(field, value) {
						var newMember = this.createAndAddField(field);
						newMember.setValue(value);
						return newMember;
					},
					createAndAddFieldValueWithTime : function(field, value) {
						var newMember = this.createAndAddField(field);
						newMember.setValue(value);
						return newMember;
					},
					createAndAddFieldValueWithBoolean : function(field, value) {
						var newMember = this.createAndAddField(field);
						newMember.setValue(sap.firefly.XBooleanValue
								.create(value));
						return newMember;
					},
					addFieldValueInternal : function(field, newMember) {
						this.m_attributeMemberMap.put(field.getName(),
								newMember);
					},
					createSelection : function() {
						return sap.firefly.QFilterOperation._create(null, null,
								null);
					},
					getAttributeMemberByPresentation : function(presentation) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getInternalType : function() {
						return sap.firefly.XValueType.STRING;
					},
					getValueAsString : function() {
						var value = this.getValue();
						var valueType = value.getValueType();
						var stringValue;
						var dateValue;
						var timeValue;
						var dateTimeValue;
						var integerValue;
						var longValue;
						var doubleValue;
						if (valueType === sap.firefly.XValueType.STRING) {
							stringValue = value;
							return stringValue.getStringValue();
						} else {
							if (valueType === sap.firefly.XValueType.DATE) {
								dateValue = value;
								return dateValue.toIsoFormat();
							} else {
								if (valueType === sap.firefly.XValueType.TIME) {
									timeValue = value;
									return timeValue.toIsoFormat();
								} else {
									if (valueType === sap.firefly.XValueType.DATE_TIME) {
										dateTimeValue = value;
										return dateTimeValue.toIsoFormat();
									} else {
										if (valueType === sap.firefly.XValueType.INTEGER) {
											integerValue = value;
											return sap.firefly.XInteger
													.convertIntegerToString(integerValue
															.getIntegerValue());
										} else {
											if (valueType === sap.firefly.XValueType.LONG) {
												longValue = value;
												return sap.firefly.XLong
														.convertLongToString(longValue
																.getLongValue());
											} else {
												if ((valueType === sap.firefly.XValueType.DOUBLE)
														|| (valueType === sap.firefly.XValueType.DECIMAL_FLOAT)) {
													doubleValue = value;
													return sap.firefly.XDouble
															.convertDoubleToString(doubleValue
																	.getDoubleValue());
												} else {
													throw sap.firefly.XException
															.createIllegalStateException(sap.firefly.XString
																	.concatenate2(
																			"Value type not supported: ",
																			valueType
																					.getName()));
												}
											}
										}
									}
								}
							}
						}
					},
					getBooleanValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.BOOLEAN);
						return (value).getBooleanValue();
					},
					getDoubleValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.DOUBLE);
						return (value).getDoubleValue();
					},
					getIntegerValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.INTEGER);
						return (value).getIntegerValue();
					},
					getLongValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.LONG);
						return (value).getLongValue();
					},
					getDateValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.DATE);
						return value;
					},
					getTimeValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.TIME);
						return value;
					},
					getTimeSpanValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getGeometry : function() {
						var value = this.getValue();
						return value;
					},
					getPolygonValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.POLYGON);
						return value;
					},
					getPointValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.POINT);
						return value;
					},
					getStringValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.STRING);
						return (value).getStringValue();
					},
					getStructureValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.STRUCTURE);
						return value;
					},
					getStructureListValue : function() {
						var value = this.getValue();
						this
								.assertValueType(value,
										sap.firefly.XValueType.LIST);
						return value;
					},
					getPropertiesValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.PROPERTIES);
						return value;
					},
					getErrorValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getIntByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getIntegerValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getIntegerValue();
					},
					getDoubleByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getDoubleValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getDoubleValue();
					},
					getDateByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getDateValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getDateValue();
					},
					getStringByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getStringValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getStringValue();
					},
					getTimeSpanByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getTimeSpanValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getTimeSpanValue();
					},
					getPolygonByPresentation : function(presentation) {
						var attributeMember;
						if (presentation === sap.firefly.PresentationType.SELF) {
							return this.getPolygonValue();
						}
						attributeMember = this
								.getAttributeMemberByPresentation(presentation);
						return attributeMember.getPolygonValue();
					},
					setType : function(type) {
						this.m_memberType = type;
					},
					getType : function() {
						return this.getMemberType();
					},
					getMemberType : function() {
						return this.m_memberType;
					},
					getValueType : function() {
						return sap.firefly.XValueType.STRING;
					},
					getKeyFieldValue : function() {
						var keyField = this.getDimension().getKeyField();
						return this.getFieldValue(keyField);
					},
					getNodeType : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDimensionAccessor : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getOlapComponentType : function() {
						return this.m_memberType;
					},
					isComponentNode : function() {
						return false;
					},
					getComponentProperties : function() {
						return null;
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						if ((this.m_attributeMemberMap !== null)
								&& (this.m_attributeMemberMap.size() > 0)) {
							buffer.append("\n");
						}
						buffer.append(this.getName());
						buffer.append(": ");
						buffer.append(this.getText());
						if ((this.m_attributeMemberMap !== null)
								&& (this.m_attributeMemberMap.size() > 0)) {
							buffer.append(" (");
							buffer.append(this.m_attributeMemberMap.toString());
							buffer.append(")");
						}
						return buffer.toString();
					},
					getPropertyStringValue : function(type) {
						return null;
					},
					setPropertyStringValue : function(type, value) {
					},
					getPropertyConstantValue : function(type) {
						return null;
					},
					setPropertyConstantValue : function(type, value) {
					},
					getParentComponent : function() {
						return null;
					},
					setParent : function(parent) {
					},
					getDeltaChangeState : function() {
						return null;
					},
					resetChangeState : function() {
					},
					notifyChildChanged : function(changedNodes) {
					},
					notifyNodeChanged : function() {
					},
					isEventingStopped : function() {
						return false;
					},
					getModCounter : function() {
						return 0;
					},
					unregisterChangedListener : function(listener) {
						return null;
					},
					registerChangedListener : function(listener,
							customIdentifier) {
						return null;
					},
					getChangedListeners : function() {
						return null;
					},
					getField : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDimensionMember : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSelectHierarchyName : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSelectValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSelectField : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDateTimeValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.DATE_TIME);
						return value;
					},
					setProtocolExtension : function(element, replace) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getProtocolExtension : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isProtocolExtensionReplacing : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getMultiPolygonValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getLineStringValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getMultiLineStringValue : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getNullValue : function() {
						return null;
					},
					setResultVisibility : function(memberVisibility) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getResultVisibility : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isRoot : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDimensionMemberNameValueException : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setDimensionMemberNameValueException : function(
							valueException) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getVariableContainer : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getFieldAccessorSingle : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getTagging : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setTagging : function(tagging) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getMultiPointValue : function() {
						var value = this.getValue();
						this.assertValueType(value,
								sap.firefly.XValueType.MULTI_POINT);
						return value;
					},
					serializeToFormat : function(modelFormat) {
						return this.serialize(modelFormat, null);
					},
					registerDeserializeListener : function(listener,
							customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					unregisterDeserializeListener : function(listener) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					queueEventing : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getNotificationListener : function() {
						return null;
					},
					setNotificationListener : function(owner) {
					},
					hasValue : function() {
						return false;
					},
					getSelectableElement : function() {
						return null;
					},
					isNode : function() {
						return this.getMemberType().isNode();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.Layer",
				sap.firefly.QModelComponent,
				{
					$statics : {
						create : function(layerModel, layerId) {
							var layer = new sap.firefly.Layer();
							layer.setupLayer(layerModel, layerId);
							return layer;
						},
						C_LAYER_ID : "LayerId",
						C_SYSTEM_NAME : "SystemName",
						C_DATA_SOURCE : "DataSource",
						C_QUERY_MODEL_INA_REPOSITORY : "QueryModelInaRepository",
						importLayer : function(importer, layerStructure, layer,
								layerModel) {
							var layerId;
							var result;
							var systemName;
							var dataSource;
							if (importer.getMode() !== sap.firefly.QModelFormat.LAYER) {
								importer.addError(0, "internal error");
								return;
							}
							layerId = sap.firefly.PrUtils
									.getStringValueProperty(layerStructure,
											sap.firefly.Layer.C_LAYER_ID, null);
							if (sap.firefly.XStringUtils.isNullOrEmpty(layerId)) {
								importer.addError(0, "illegal layer id");
								return;
							}
							result = layer;
							if (result === null) {
								result = layerModel.createLayer(layerId);
								if (result === null) {
									importer.addError(0, "illegal layer id");
									return;
								}
							} else {
								if (sap.firefly.XString.isEqual(result
										.getLayerId(), layerId) === false) {
									importer.addError(0, "illegal layer id");
									return;
								}
							}
							result.queueEventing();
							systemName = sap.firefly.PrUtils
									.getStringValueProperty(layerStructure,
											sap.firefly.Layer.C_SYSTEM_NAME,
											null);
							result.setSystemName(systemName);
							dataSource = sap.firefly.PrUtils
									.getStringValueProperty(layerStructure,
											sap.firefly.Layer.C_DATA_SOURCE,
											null);
							result.setDataSource(dataSource);
							result.m_queryModelInaRepository = sap.firefly.PrUtils
									.createDeepCopy(sap.firefly.PrUtils
											.getStructureProperty(
													layerStructure,
													sap.firefly.Layer.C_QUERY_MODEL_INA_REPOSITORY));
							result.resumeEventing();
						},
						exportLayer : function(exporter, layer) {
							var layerStructure;
							var queryModelSerialization;
							if (exporter.getMode() !== sap.firefly.QModelFormat.LAYER) {
								return null;
							}
							if (layer === null) {
								return null;
							}
							layerStructure = sap.firefly.PrStructure.create();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(layer.m_layerId)) {
								layerStructure.setStringByName(
										sap.firefly.Layer.C_LAYER_ID,
										layer.m_layerId);
							}
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(layer.m_systemName)) {
								layerStructure.setStringByName(
										sap.firefly.Layer.C_SYSTEM_NAME,
										layer.m_systemName);
							}
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(layer.m_dataSource)) {
								layerStructure.setStringByName(
										sap.firefly.Layer.C_DATA_SOURCE,
										layer.m_dataSource);
							}
							if (layer.m_layerQueryModel !== null) {
								queryModelSerialization = layer
										.getQueryModel()
										.serializeToElement(
												sap.firefly.QModelFormat.INA_REPOSITORY,
												null);
								if (queryModelSerialization !== null) {
									layerStructure
											.setElementByName(
													sap.firefly.Layer.C_QUERY_MODEL_INA_REPOSITORY,
													queryModelSerialization);
								}
							}
							return layerStructure;
						}
					},
					m_layerId : null,
					m_systemName : null,
					m_dataSource : null,
					m_queryModelInaRepository : null,
					m_layerQueryModel : null,
					setupLayer : function(layerModel, layerId) {
						this.setupModelComponent(layerModel.getContext(),
								layerModel);
						this.setName(layerId);
						this.m_layerId = layerId;
					},
					releaseObject : function() {
						this.m_layerId = null;
						this.m_layerQueryModel = sap.firefly.XObject
								.releaseIfNotNull(this.m_layerQueryModel);
						sap.firefly.Layer.$superclass.releaseObject.call(this);
					},
					getOlapComponentType : function() {
						return sap.firefly.OlapComponentType.LAYER;
					},
					getLayerModel : function() {
						return this.getParentComponent();
					},
					getLayerId : function() {
						return this.m_layerId;
					},
					getSystemName : function() {
						return this.m_systemName;
					},
					setSystemName : function(systemName) {
						if (sap.firefly.XString.isEqual(this.m_systemName,
								systemName)) {
							return;
						}
						this.m_systemName = systemName;
						this.m_layerQueryModel = null;
						this.notifyNodeChanged();
					},
					getDataSourceFQN : function() {
						return this.m_dataSource;
					},
					setDataSource : function(dataSource) {
						if (sap.firefly.XString.isEqual(this.m_dataSource,
								dataSource)) {
							return;
						}
						this.m_dataSource = dataSource;
						this.m_layerQueryModel = null;
						this.notifyNodeChanged();
					},
					getQueryModelInaRepository : function() {
						return this.m_queryModelInaRepository;
					},
					getQueryModel : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_layerQueryModel);
					},
					setQueryModel : function(queryModel) {
						var querySystemName;
						var ds;
						if (sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_layerQueryModel) === queryModel) {
							return;
						}
						this.m_layerQueryModel = sap.firefly.XWeakReferenceUtil
								.getWeakRef(queryModel);
						if (this.m_layerQueryModel !== null) {
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(this.m_systemName)) {
								querySystemName = this.getQueryModel()
										.getQueryManager()
										.getSystemDescription().getName();
								if (sap.firefly.XString.isEqual(
										this.m_systemName, querySystemName) === false) {
									throw sap.firefly.XException
											.createRuntimeException("internal error");
								}
							}
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(this.m_dataSource)) {
								ds = sap.firefly.QDataSource.create();
								ds.setFullQualifiedName(this.m_dataSource);
								if (sap.firefly.XString.isEqual(this
										.getQueryModel().getDataSource()
										.getFullQualifiedName(), ds
										.getFullQualifiedName()) === false) {
									throw sap.firefly.XException
											.createRuntimeException("internal error");
								}
							}
						}
						this.notifyNodeChanged();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.LayerModel",
				sap.firefly.QModelComponent,
				{
					$statics : {
						create : function(layerService) {
							var layerModel = new sap.firefly.LayerModel();
							layerModel.setupLayerModel(layerService);
							return layerModel;
						},
						resolveQueryModel : function(component) {
							var olapComponentType;
							var parentComponent;
							if (component === null) {
								return null;
							}
							olapComponentType = component
									.getOlapComponentType();
							if (olapComponentType === null) {
								return null;
							}
							if (olapComponentType === sap.firefly.OlapComponentType.QUERY_MODEL) {
								return component;
							}
							parentComponent = component.getParentComponent();
							return sap.firefly.LayerModel
									.resolveQueryModel(parentComponent);
						},
						isIdenticalDataSource : function(layer1, layer2) {
							var queryModel1;
							var queryModel2;
							var querySystemName1;
							var querySystemName2;
							var queryFqn1;
							var queryFqn2;
							var layerSystemName1;
							var layerSystemName2;
							var layerFqn1;
							var layerFqn2;
							if (layer1 === null) {
								return false;
							}
							if (layer2 === null) {
								return false;
							}
							queryModel1 = layer1.getQueryModel();
							queryModel2 = layer2.getQueryModel();
							if ((queryModel1 !== null)
									&& (queryModel2 !== null)) {
								querySystemName1 = queryModel1
										.getQueryManager()
										.getSystemDescription().getName();
								querySystemName2 = queryModel2
										.getQueryManager()
										.getSystemDescription().getName();
								if (sap.firefly.XString.isEqual(
										querySystemName1, querySystemName2) === false) {
									return false;
								}
								queryFqn1 = queryModel1.getQueryManager()
										.getDataSource().getFullQualifiedName();
								queryFqn2 = queryModel2.getQueryManager()
										.getDataSource().getFullQualifiedName();
								if (sap.firefly.XString.isEqual(queryFqn1,
										queryFqn2) === false) {
									return false;
								}
								return true;
							}
							layerSystemName1 = layer1.getSystemName();
							layerSystemName2 = layer2.getSystemName();
							if (sap.firefly.XString.isEqual(layerSystemName1,
									layerSystemName2) === false) {
								return false;
							}
							layerFqn1 = layer1.getDataSourceFQN();
							layerFqn2 = layer2.getDataSourceFQN();
							if (sap.firefly.XString.isEqual(layerFqn1,
									layerFqn2) === false) {
								return false;
							}
							return true;
						},
						addSyncDefinition : function(
								layerSyncDefinitionsByLayerId, layerId,
								layerSyncDefinition) {
							var layerSyncDefinitionsByHashKey = layerSyncDefinitionsByLayerId
									.getByKey(layerId);
							if (layerSyncDefinitionsByHashKey === null) {
								layerSyncDefinitionsByHashKey = sap.firefly.XHashMapByString
										.create();
								layerSyncDefinitionsByLayerId.put(layerId,
										layerSyncDefinitionsByHashKey);
							}
							layerSyncDefinitionsByHashKey.put(
									layerSyncDefinition.getHashKey(),
									layerSyncDefinition);
						},
						removeSyncDefinition : function(
								layerSyncDefinitionsByLayerId, layerId,
								layerSyncDefinition) {
							var layerSyncDefinitionsByHashKey = layerSyncDefinitionsByLayerId
									.getByKey(layerId);
							if (layerSyncDefinitionsByHashKey === null) {
								return;
							}
							layerSyncDefinitionsByHashKey
									.remove(layerSyncDefinition.getHashKey());
							if (layerSyncDefinitionsByHashKey.size() < 1) {
								layerSyncDefinitionsByLayerId.remove(layerId);
								layerSyncDefinitionsByHashKey.releaseObject();
							}
						},
						getSyncDefinitionsByLayerId : function(
								layerSyncDefinitionsByLayerId, layerId) {
							var result = sap.firefly.XHashMapByString.create();
							var syncDefinitions = layerSyncDefinitionsByLayerId
									.getByKey(layerId);
							var hashKeys;
							var syncDefinitionIndex;
							var hashKey;
							var syncDefinition;
							if (syncDefinitions !== null) {
								hashKeys = syncDefinitions
										.getKeysAsReadOnlyListOfString();
								for (syncDefinitionIndex = 0; syncDefinitionIndex < hashKeys
										.size(); syncDefinitionIndex++) {
									hashKey = hashKeys.get(syncDefinitionIndex);
									syncDefinition = syncDefinitions
											.getByKey(hashKey);
									result.put(hashKey, syncDefinition);
								}
							}
							return result;
						},
						C_LAYERS : "Layers",
						C_LAYER_SYNC_DEFINITIONS : "LayerSyncDefinitions",
						importLayerModel : function(importer,
								layerModelStructure, layerModel) {
							var layersList;
							var layerIndex;
							var layerStructure;
							var syncDefinitionsList;
							var syncDefintionIndex;
							var syncDefinitionStructure;
							if (importer.getMode() !== sap.firefly.QModelFormat.LAYER) {
								importer.addError(0, "internal error");
								return;
							}
							layerModel.queueEventing();
							layersList = sap.firefly.PrUtils.getListProperty(
									layerModelStructure,
									sap.firefly.LayerModel.C_LAYERS);
							for (layerIndex = 0; layerIndex < sap.firefly.PrUtils
									.getListSize(layersList, 0); layerIndex++) {
								layerStructure = sap.firefly.PrUtils
										.getStructureElement(layersList,
												layerIndex);
								sap.firefly.Layer.importLayer(importer,
										layerStructure, null, layerModel);
							}
							syncDefinitionsList = sap.firefly.PrUtils
									.getListProperty(
											layerModelStructure,
											sap.firefly.LayerModel.C_LAYER_SYNC_DEFINITIONS);
							for (syncDefintionIndex = 0; syncDefintionIndex < sap.firefly.PrUtils
									.getListSize(syncDefinitionsList, 0); syncDefintionIndex++) {
								syncDefinitionStructure = sap.firefly.PrUtils
										.getStructureElement(
												syncDefinitionsList,
												syncDefintionIndex);
								sap.firefly.LayerSyncDefinition
										.importLayerSyncDefinition(importer,
												syncDefinitionStructure, null,
												layerModel);
							}
							layerModel.resumeEventing();
						},
						exportLayerModel : function(exporter, layerModel) {
							var layerModelStructure;
							var layersList;
							var layerIds;
							var layerIndex;
							var layerId;
							var layer;
							var layerStructure;
							var syncDefinitionsList;
							var syncDefinitionKeys;
							var syncDefinitionIndex;
							var syncDefinitionKey;
							var syncDefinition;
							var syncDefinitionStructure;
							if (exporter.getMode() !== sap.firefly.QModelFormat.LAYER) {
								return null;
							}
							layerModelStructure = sap.firefly.PrStructure
									.create();
							if (layerModel.m_layersById.size() > 0) {
								layersList = layerModelStructure
										.setNewListByName(sap.firefly.LayerModel.C_LAYERS);
								layerIds = sap.firefly.XListOfString
										.createFromReadOnlyList(layerModel.m_layersById
												.getKeysAsReadOnlyListOfString());
								layerIds
										.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
								for (layerIndex = 0; layerIndex < layerIds
										.size(); layerIndex++) {
									layerId = layerIds.get(layerIndex);
									layer = layerModel.m_layersById
											.getByKey(layerId);
									layerStructure = sap.firefly.Layer
											.exportLayer(exporter, layer);
									if (layerStructure === null) {
										continue;
									}
									layersList.add(layerStructure);
								}
							}
							if (layerModel.m_layerSyncDefinitionsByHashKey
									.size() > 0) {
								syncDefinitionsList = layerModelStructure
										.setNewListByName(sap.firefly.LayerModel.C_LAYER_SYNC_DEFINITIONS);
								syncDefinitionKeys = sap.firefly.XListOfString
										.createFromReadOnlyList(layerModel.m_layerSyncDefinitionsByHashKey
												.getKeysAsReadOnlyListOfString());
								syncDefinitionKeys
										.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
								for (syncDefinitionIndex = 0; syncDefinitionIndex < syncDefinitionKeys
										.size(); syncDefinitionIndex++) {
									syncDefinitionKey = syncDefinitionKeys
											.get(syncDefinitionIndex);
									syncDefinition = layerModel.m_layerSyncDefinitionsByHashKey
											.getByKey(syncDefinitionKey);
									syncDefinitionStructure = sap.firefly.LayerSyncDefinition
											.exportLayerSyncDefinition(
													exporter, syncDefinition);
									if (syncDefinitionStructure === null) {
										continue;
									}
									syncDefinitionsList
											.add(syncDefinitionStructure);
								}
							}
							return layerModelStructure;
						}
					},
					m_layerService : null,
					m_layersById : null,
					m_layerSyncDefinitionsByHashKey : null,
					m_layerSyncDefinitionsBySenderLayerId : null,
					m_layerSyncDefinitionsByReceiverLayerId : null,
					setupLayerModel : function(layerService) {
						this.setupModelComponent(layerService.getContext(),
								null);
						this.m_layerService = sap.firefly.XWeakReferenceUtil
								.getWeakRef(layerService);
						this.m_layersById = sap.firefly.XHashMapByString
								.create();
						this.m_layerSyncDefinitionsByHashKey = sap.firefly.XHashMapByString
								.create();
						this.m_layerSyncDefinitionsBySenderLayerId = sap.firefly.XHashMapByString
								.create();
						this.m_layerSyncDefinitionsByReceiverLayerId = sap.firefly.XHashMapByString
								.create();
					},
					getLayerService : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_layerService);
					},
					releaseObject : function() {
						var layers;
						var layerIndex;
						var layer;
						var syncDefinitionHashKeys;
						var syncDefinitionIndex;
						var syncDefinitionHashKey;
						var layerSyncDefinition;
						if (this.m_layersById !== null) {
							layers = this.m_layersById
									.getValuesAsReadOnlyList();
							for (layerIndex = 0; layerIndex < layers.size(); layerIndex++) {
								layer = layers.get(layerIndex);
								layer.unregisterChangedListener(this);
								layer.releaseObject();
							}
							this.m_layersById.releaseObject();
							this.m_layersById = null;
						}
						if (this.m_layerSyncDefinitionsByHashKey !== null) {
							syncDefinitionHashKeys = sap.firefly.XListOfString
									.createFromReadOnlyList(this.m_layerSyncDefinitionsByHashKey
											.getKeysAsReadOnlyListOfString());
							syncDefinitionHashKeys
									.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
							for (syncDefinitionIndex = 0; syncDefinitionIndex < syncDefinitionHashKeys
									.size(); syncDefinitionIndex++) {
								syncDefinitionHashKey = syncDefinitionHashKeys
										.get(syncDefinitionIndex);
								layerSyncDefinition = this.m_layerSyncDefinitionsByHashKey
										.getByKey(syncDefinitionHashKey);
								layerSyncDefinition.releaseObject();
								this.m_layerSyncDefinitionsByHashKey
										.remove(syncDefinitionHashKey);
							}
							this.m_layerSyncDefinitionsByHashKey
									.releaseObject();
							this.m_layerSyncDefinitionsByHashKey = null;
						}
						this.m_layerSyncDefinitionsBySenderLayerId = sap.firefly.XObject
								.releaseIfNotNull(this.m_layerSyncDefinitionsBySenderLayerId);
						this.m_layerSyncDefinitionsByReceiverLayerId = sap.firefly.XObject
								.releaseIfNotNull(this.m_layerSyncDefinitionsByReceiverLayerId);
						if (this.m_layerService !== null) {
							this.m_layerService = null;
						}
						sap.firefly.LayerModel.$superclass.releaseObject
								.call(this);
					},
					getOlapComponentType : function() {
						return sap.firefly.OlapComponentType.LAYER_MODEL;
					},
					createLayer : function(layerId) {
						var layer;
						if (sap.firefly.XStringUtils.isNullOrEmpty(layerId)) {
							return null;
						}
						if (this.m_layersById.containsKey(layerId)) {
							return null;
						}
						layer = sap.firefly.Layer.create(this, layerId);
						layer.registerChangedListener(this, null);
						this.m_layersById.put(layerId, layer);
						this.notifyNodeChanged();
						return layer;
					},
					destroyLayer : function(layerId) {
						var layer;
						if (sap.firefly.XStringUtils.isNullOrEmpty(layerId)) {
							return null;
						}
						layer = this.m_layersById.getByKey(layerId);
						if (layer !== null) {
							this.queueEventing();
							this.m_layersById.remove(layerId);
							layer.unregisterChangedListener(this);
							layer.releaseObject();
							this.updateLayerChange(layerId);
							this.notifyNodeChanged();
							this.resumeEventing();
						}
						return layer;
					},
					getLayers : function() {
						var layers = sap.firefly.XHashMapByString.create();
						var layerIds = this.m_layersById
								.getKeysAsReadOnlyListOfString();
						var i;
						var layerId;
						var layer;
						for (i = 0; i < layerIds.size(); i++) {
							layerId = layerIds.get(i);
							layer = this.m_layersById.getByKey(layerId);
							layers.put(layerId, layer);
						}
						return layers;
					},
					getLayer : function(layerId) {
						if (sap.firefly.XStringUtils.isNullOrEmpty(layerId)) {
							return null;
						}
						return this.m_layersById.getByKey(layerId);
					},
					getLayerByComponent : function(component) {
						var queryModel = sap.firefly.LayerModel
								.resolveQueryModel(component);
						var resultLayer;
						var layerIds;
						var i;
						var layerId;
						var layer;
						var layerQueryModel;
						if (queryModel === null) {
							return null;
						}
						if (this.m_layersById.size() < 1) {
							return null;
						}
						resultLayer = null;
						layerIds = this.m_layersById
								.getKeysAsReadOnlyListOfString();
						for (i = 0; i < layerIds.size(); i++) {
							layerId = layerIds.get(i);
							layer = this.m_layersById.getByKey(layerId);
							layerQueryModel = layer.getQueryModel();
							if (layerQueryModel === queryModel) {
								if (resultLayer !== null) {
									return null;
								}
								resultLayer = layer;
							}
						}
						return resultLayer;
					},
					getQueryModel : function() {
						return null;
					},
					loadQueryModels : function(syncType, commandListener,
							customIdentifier) {
						var application = this.getApplication();
						var commandFactory = sap.firefly.XCommandFactory
								.create(this.getApplication());
						var commandArray = commandFactory
								.createCommandArray(sap.firefly.XCommandType.ARRAY_CONCURRENT);
						var layerKeys;
						var i;
						var layerKey;
						var layer;
						var cmdCreateQueryManager;
						var systemName;
						var dataSource;
						var queryModelInaRepository;
						var cmdSetQueryManagerAtLayer;
						if (this.m_layersById.size() > 0) {
							layerKeys = sap.firefly.XListOfString
									.createFromReadOnlyList(this.m_layersById
											.getKeysAsReadOnlyListOfString());
							layerKeys
									.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
							for (i = 0; i < layerKeys.size(); i++) {
								layerKey = layerKeys.get(i);
								layer = this.m_layersById.getByKey(layerKey);
								cmdCreateQueryManager = commandFactory
										.createCommand(sap.firefly.CmdCreateQueryManager.CMD_NAME);
								cmdCreateQueryManager
										.addParameter(
												sap.firefly.CmdCreateQueryManager.PARAM_I_APPLICATION,
												application);
								systemName = layer.getSystemName();
								if (sap.firefly.XStringUtils
										.isNotNullAndNotEmpty(systemName)) {
									cmdCreateQueryManager
											.addParameterString(
													sap.firefly.CmdCreateQueryManager.PARAM_I_SYSTEM,
													layer.getSystemName());
								}
								dataSource = layer.getDataSourceFQN();
								if (sap.firefly.XStringUtils
										.isNotNullAndNotEmpty(dataSource)) {
									cmdCreateQueryManager
											.addParameterString(
													sap.firefly.CmdCreateQueryManager.PARAM_I_DATA_SOURCE,
													layer.getDataSourceFQN());
								}
								queryModelInaRepository = layer
										.getQueryModelInaRepository();
								if (queryModelInaRepository !== null) {
									cmdCreateQueryManager
											.addParameter(
													sap.firefly.CmdCreateQueryManager.PARAM_I_QUERY_MODEL_STRUCTURE_INA_REPOSITORY,
													queryModelInaRepository);
								}
								cmdSetQueryManagerAtLayer = commandFactory
										.createCommand(sap.firefly.CmdSetQueryManagerAtLayer.CMD_NAME);
								cmdSetQueryManagerAtLayer
										.addParameter(
												sap.firefly.CmdSetQueryManagerAtLayer.PARAM_I_LAYER_MODEL,
												this);
								cmdSetQueryManagerAtLayer
										.addParameterString(
												sap.firefly.CmdSetQueryManagerAtLayer.PARAM_I_LAYER_ID,
												layer.getLayerId());
								cmdCreateQueryManager
										.setFollowUpCommand(
												sap.firefly.XCommandFollowUpType.SUCCESS,
												cmdSetQueryManagerAtLayer);
								cmdCreateQueryManager
										.setFollowUpCommandParameterMapping(
												sap.firefly.XCommandFollowUpType.SUCCESS,
												sap.firefly.CmdSetQueryManagerAtLayer.PARAM_I_QUERY_MANAGER,
												sap.firefly.CmdCreateQueryManager.PARAM_E_QUERY_MANAGER);
								commandArray.addCommand(cmdCreateQueryManager);
							}
						}
						return commandArray.processCommand(syncType,
								commandListener, customIdentifier);
					},
					supportsLayerSync : function(senderComponent,
							receiverComponent) {
						var senderLayer;
						var senderPath;
						var resolvedSenderComponent;
						var receiverLayer;
						var receiverPath;
						var resolvedReceiverComponent;
						if (senderComponent === null) {
							return false;
						}
						if (receiverComponent === null) {
							return false;
						}
						if (sap.firefly.QModelComponentTunnel
								.isValidCombination(senderComponent,
										receiverComponent) === false) {
							return false;
						}
						senderLayer = this.getLayerByComponent(senderComponent);
						if (senderLayer === null) {
							return false;
						}
						senderPath = sap.firefly.LayerRelationDefinition
								.getComponentPath(senderComponent);
						resolvedSenderComponent = sap.firefly.LayerRelationDefinition
								.resolveComponent(senderLayer.getLayerModel(),
										senderLayer.getLayerId(), senderPath);
						if (resolvedSenderComponent === null) {
							return false;
						}
						if (senderComponent !== resolvedSenderComponent) {
							return false;
						}
						receiverLayer = this
								.getLayerByComponent(receiverComponent);
						if (receiverLayer === null) {
							return false;
						}
						receiverPath = sap.firefly.LayerRelationDefinition
								.getComponentPath(receiverComponent);
						resolvedReceiverComponent = sap.firefly.LayerRelationDefinition
								.resolveComponent(
										receiverLayer.getLayerModel(),
										receiverLayer.getLayerId(),
										receiverPath);
						if (resolvedReceiverComponent === null) {
							return false;
						}
						if (receiverComponent !== resolvedReceiverComponent) {
							return false;
						}
						if (sap.firefly.LayerModel.isIdenticalDataSource(
								senderLayer, receiverLayer) === false) {
							return false;
						}
						if (this
								.isComponentWithTypeOf(
										senderComponent,
										sap.firefly.OlapComponentType.FILTER_EXPRESSION)
								&& this
										.isComponentWithTypeOf(
												receiverComponent,
												sap.firefly.OlapComponentType.FILTER_EXPRESSION)) {
							return true;
						}
						if (this.isComponentWithTypeOf(senderComponent,
								sap.firefly.FilterComponentType.CARTESIAN_LIST)
								&& this
										.isComponentWithTypeOf(
												receiverComponent,
												sap.firefly.FilterComponentType.CARTESIAN_LIST)) {
							return true;
						}
						if (this.isComponentWithTypeOf(senderComponent,
								sap.firefly.VariableType.ANY_VARIABLE)
								&& this.isComponentWithTypeOf(
										receiverComponent,
										sap.firefly.VariableType.ANY_VARIABLE)) {
							if (senderLayer.getQueryModel().getQueryManager()
									.isDirectVariableTransferEnabled() === false) {
								return false;
							}
							if (receiverLayer.getQueryModel().getQueryManager()
									.isDirectVariableTransferEnabled() === false) {
								return false;
							}
							return true;
						}
						if (this.isComponentWithTypeOf(senderComponent,
								sap.firefly.MemberType.RESTRICTED_MEASURE)
								&& this
										.isComponentWithTypeOf(
												receiverComponent,
												sap.firefly.MemberType.RESTRICTED_MEASURE)) {
							return true;
						}
						if (this.isComponentWithTypeOf(senderComponent,
								sap.firefly.DimensionType.MEASURE_STRUCTURE)
								&& this
										.isComponentWithTypeOf(
												receiverComponent,
												sap.firefly.DimensionType.MEASURE_STRUCTURE)) {
							return true;
						}
						return false;
					},
					isComponentWithTypeOf : function(component, componentTypeOf) {
						var componentType;
						if (component === null) {
							return false;
						}
						componentType = component.getOlapComponentType();
						if (componentType === null) {
							return false;
						}
						return componentType.isTypeOf(componentTypeOf);
					},
					defineLayerSync : function(senderComponent,
							receiverComponent, active) {
						if (this.supportsLayerSync(senderComponent,
								receiverComponent) === false) {
							return null;
						}
						return this._defineLayerSyncNoCheck(senderComponent,
								receiverComponent, active);
					},
					addLayerSync : function(layerSyncDefinition) {
						var result = null;
						var hashKey = layerSyncDefinition.getHashKey();
						var existingLayerSyncDefinition = this.m_layerSyncDefinitionsByHashKey
								.getByKey(hashKey);
						if (existingLayerSyncDefinition === null) {
							layerSyncDefinition.initializeModelComponent();
							this.m_layerSyncDefinitionsByHashKey.put(hashKey,
									layerSyncDefinition);
							sap.firefly.LayerModel.addSyncDefinition(
									this.m_layerSyncDefinitionsBySenderLayerId,
									layerSyncDefinition.getSenderLayerId(),
									layerSyncDefinition);
							sap.firefly.LayerModel
									.addSyncDefinition(
											this.m_layerSyncDefinitionsByReceiverLayerId,
											layerSyncDefinition
													.getReceiverLayerId(),
											layerSyncDefinition);
							result = layerSyncDefinition;
							this.notifyNodeChanged();
						} else {
							result = existingLayerSyncDefinition;
							layerSyncDefinition.releaseObject();
						}
						return result;
					},
					_defineLayerSyncNoCheck : function(senderComponent,
							receiverComponent, active) {
						var newLayerSyncDefinition = sap.firefly.LayerSyncDefinition
								.create(this);
						var hashKey;
						var createdNewSyncDefinition;
						var layerSyncDefinition;
						newLayerSyncDefinition.setComponentsInformation(
								senderComponent, receiverComponent);
						hashKey = newLayerSyncDefinition.getHashKey();
						createdNewSyncDefinition = false;
						layerSyncDefinition = this.m_layerSyncDefinitionsByHashKey
								.getByKey(hashKey);
						if (layerSyncDefinition === null) {
							layerSyncDefinition = newLayerSyncDefinition;
							layerSyncDefinition.initializeModelComponent();
							this.m_layerSyncDefinitionsByHashKey.put(hashKey,
									layerSyncDefinition);
							sap.firefly.LayerModel.addSyncDefinition(
									this.m_layerSyncDefinitionsBySenderLayerId,
									newLayerSyncDefinition.getSenderLayerId(),
									layerSyncDefinition);
							sap.firefly.LayerModel
									.addSyncDefinition(
											this.m_layerSyncDefinitionsByReceiverLayerId,
											newLayerSyncDefinition
													.getReceiverLayerId(),
											layerSyncDefinition);
							createdNewSyncDefinition = true;
						} else {
							newLayerSyncDefinition.releaseObject();
						}
						this.queueEventing();
						layerSyncDefinition.setActive(active);
						if (createdNewSyncDefinition) {
							this.notifyNodeChanged();
						}
						this.resumeEventing();
						return layerSyncDefinition;
					},
					getLayerSyncDefinition : function(senderComponent,
							receiverComponent) {
						if (this.supportsLayerSync(senderComponent,
								receiverComponent) === false) {
							return null;
						}
						return this._getLayerSyncDefinitionNoCheck(
								senderComponent, receiverComponent);
					},
					_getLayerSyncDefinitionNoCheck : function(senderComponent,
							receiverComponent) {
						var newLayerSyncDefinition = sap.firefly.LayerSyncDefinition
								.create(this);
						var hashKey;
						newLayerSyncDefinition.setComponentsInformation(
								senderComponent, receiverComponent);
						hashKey = newLayerSyncDefinition.getHashKey();
						newLayerSyncDefinition.releaseObject();
						return this.m_layerSyncDefinitionsByHashKey
								.getByKey(hashKey);
					},
					deleteLayerSyncDefinition : function(layerSyncDefinition) {
						var hashKey;
						var existingDefinition;
						if (layerSyncDefinition === null) {
							return false;
						}
						hashKey = (layerSyncDefinition).getHashKey();
						existingDefinition = this.m_layerSyncDefinitionsByHashKey
								.getByKey(hashKey);
						if (existingDefinition === null) {
							return false;
						}
						if (existingDefinition !== layerSyncDefinition) {
							throw sap.firefly.XException
									.createRuntimeException("internal error");
						}
						this.queueEventing();
						this.m_layerSyncDefinitionsByHashKey.remove(hashKey);
						sap.firefly.LayerModel.removeSyncDefinition(
								this.m_layerSyncDefinitionsBySenderLayerId,
								existingDefinition.getSenderLayerId(),
								existingDefinition);
						sap.firefly.LayerModel.removeSyncDefinition(
								this.m_layerSyncDefinitionsByReceiverLayerId,
								existingDefinition.getReceiverLayerId(),
								existingDefinition);
						existingDefinition.releaseObject();
						this.notifyNodeChanged();
						this.resumeEventing();
						return true;
					},
					getLayerSyncDefinitions : function() {
						var result = sap.firefly.XHashMapByString.create();
						var layerSyncDefinitions;
						var syncDefinitionIndex;
						var layerSyncDefinition;
						if (this.m_layerSyncDefinitionsByHashKey.size() > 0) {
							layerSyncDefinitions = this.m_layerSyncDefinitionsByHashKey
									.getValuesAsReadOnlyList();
							for (syncDefinitionIndex = 0; syncDefinitionIndex < layerSyncDefinitions
									.size(); syncDefinitionIndex++) {
								layerSyncDefinition = layerSyncDefinitions
										.get(syncDefinitionIndex);
								result.put(layerSyncDefinition.getHashKey(),
										layerSyncDefinition);
							}
						}
						return result;
					},
					getLayerSyncDefinitionsBySenderLayer : function(senderLayer) {
						if (senderLayer.getLayerModel() !== this) {
							throw sap.firefly.XException
									.createRuntimeException("illegal layer");
						}
						return this
								.getLayerSyncDefinitionsBySenderLayerId(senderLayer
										.getLayerId());
					},
					getLayerSyncDefinitionsByReceiverLayer : function(
							receiverLayer) {
						if (receiverLayer.getLayerModel() !== this) {
							throw sap.firefly.XException
									.createRuntimeException("illegal layer");
						}
						return this
								.getLayerSyncDefinitionsByReceiverLayerId(receiverLayer
										.getLayerId());
					},
					getLayerSyncDefinitionsBySenderLayerId : function(
							senderLayerId) {
						return sap.firefly.LayerModel
								.getSyncDefinitionsByLayerId(
										this.m_layerSyncDefinitionsBySenderLayerId,
										senderLayerId);
					},
					getLayerSyncDefinitionsByReceiverLayerId : function(
							receiverLayerId) {
						return sap.firefly.LayerModel
								.getSyncDefinitionsByLayerId(
										this.m_layerSyncDefinitionsByReceiverLayerId,
										receiverLayerId);
					},
					updateLayerChange : function(layerId) {
						if ((this.m_layerSyncDefinitionsBySenderLayerId.size() > 0)
								&& (this.m_layerSyncDefinitionsBySenderLayerId
										.containsKey(layerId))) {
							this
									.updateSyncDefinitions(this
											.getLayerSyncDefinitionsBySenderLayerId(layerId));
						}
						if ((this.m_layerSyncDefinitionsByReceiverLayerId
								.size() > 0)
								&& (this.m_layerSyncDefinitionsByReceiverLayerId
										.containsKey(layerId))) {
							this
									.updateSyncDefinitions(this
											.getLayerSyncDefinitionsByReceiverLayerId(layerId));
						}
					},
					updateSyncDefinitions : function(syncDefinitions) {
						var hashKeys;
						var i;
						var hashKey;
						var syncDefinition;
						if (syncDefinitions === null) {
							return;
						}
						hashKeys = syncDefinitions
								.getKeysAsReadOnlyListOfString();
						for (i = 0; i < hashKeys.size(); i++) {
							hashKey = hashKeys.get(i);
							syncDefinition = syncDefinitions.getByKey(hashKey);
							syncDefinition.updateSyncDefinition();
						}
					},
					onModelComponentChanged : function(modelComponent,
							customIdentifier) {
						var componentType = modelComponent
								.getOlapComponentType();
						var layer;
						if (componentType === sap.firefly.OlapComponentType.LAYER) {
							layer = modelComponent;
							if (layer.getLayerModel() === this) {
								this.updateLayerChange(layer.getLayerId());
							}
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.LayerRelationDefinition",
				sap.firefly.QModelComponent,
				{
					$statics : {
						getComponentPath : function(component) {
							var result = sap.firefly.PrList.create();
							var list = sap.firefly.LayerRelationDefinition
									.getComponentPathListReverseOrder(
											component, null);
							var i;
							if (list !== null) {
								for (i = list.size() - 1; i >= 0; i--) {
									result.add(list.get(i));
								}
							}
							return result;
						},
						getComponentPathListReverseOrder : function(component,
								componentPath) {
							var resultPath = componentPath;
							var componentType;
							var resultPathPart;
							if (component === null) {
								return resultPath;
							}
							componentType = component.getOlapComponentType();
							if ((componentType === null)
									|| (componentType === sap.firefly.OlapComponentType.QUERY_MODEL)) {
								return resultPath;
							}
							resultPathPart = sap.firefly.PrStructure.create();
							resultPathPart
									.setStringByName(
											sap.firefly.LayerRelationDefinition.C_COMPONENT_NAME,
											component.getName());
							resultPathPart
									.setStringByName(
											sap.firefly.LayerRelationDefinition.C_COMPONENT_TYPE,
											componentType.getName());
							if (resultPath === null) {
								resultPath = sap.firefly.XList.create();
							}
							resultPath.add(resultPathPart);
							return sap.firefly.LayerRelationDefinition
									.getComponentPathListReverseOrder(component
											.getParentComponent(), resultPath);
						},
						resolveComponent : function(layerModel, layerId,
								componentPath) {
							var layer;
							var queryModel;
							var component;
							var i;
							var componentPathPart;
							var typeString;
							var nameString;
							var children;
							var matchingChildComponent;
							var childComponent;
							var childName;
							var olapComponentType;
							var olapComponentTypeString;
							if (layerModel === null) {
								return null;
							}
							layer = layerModel.getLayer(layerId);
							if (layer === null) {
								return null;
							}
							queryModel = layer.getQueryModel();
							if (queryModel === null) {
								return null;
							}
							component = queryModel;
							if ((componentPath !== null)
									&& (componentPath.size() > 0)) {
								for (i = 0; i < sap.firefly.PrUtils
										.getListSize(componentPath, 0); i++) {
									componentPathPart = sap.firefly.PrUtils
											.getStructureElement(componentPath,
													i);
									if (componentPathPart === null) {
										return null;
									}
									typeString = sap.firefly.PrUtils
											.getStringValueProperty(
													componentPathPart,
													sap.firefly.LayerRelationDefinition.C_COMPONENT_TYPE,
													null);
									nameString = sap.firefly.PrUtils
											.getStringValueProperty(
													componentPathPart,
													sap.firefly.LayerRelationDefinition.C_COMPONENT_NAME,
													null);
									children = component.getChildrenIterator();
									if (children === null) {
										return null;
									}
									matchingChildComponent = null;
									while (children.hasNext()) {
										childComponent = children.next();
										if (childComponent !== null) {
											childName = childComponent
													.getName();
											olapComponentType = childComponent
													.getOlapComponentType();
											olapComponentTypeString = olapComponentType
													.getName();
											if (sap.firefly.XString.isEqual(
													typeString,
													olapComponentTypeString)
													&& sap.firefly.XString
															.isEqual(
																	nameString,
																	childName)) {
												if (matchingChildComponent !== null) {
													return null;
												}
												matchingChildComponent = childComponent;
											}
										}
									}
									if (matchingChildComponent === null) {
										return null;
									}
									component = matchingChildComponent;
								}
							}
							return component;
						},
						C_COMPONENT_TYPE : "ComponentType",
						C_COMPONENT_NAME : "ComponentName",
						C_SENDER_LAYER_ID : "SenderLayerId",
						C_RECEIVER_LAYER_ID : "ReceiverLayerId",
						C_ACTIVE : "Active",
						exportLayerRelationDefinition : function(exporter,
								layerRelationDefinition) {
							var layerRelationDefinitionStructure;
							if (exporter.getMode() !== sap.firefly.QModelFormat.LAYER) {
								return null;
							}
							if (layerRelationDefinition === null) {
								return null;
							}
							layerRelationDefinitionStructure = layerRelationDefinition
									.exportKeyStructure();
							layerRelationDefinitionStructure
									.setBooleanByName(
											sap.firefly.LayerRelationDefinition.C_ACTIVE,
											layerRelationDefinition.isActive());
							return sap.firefly.PrStructure
									.createDeepCopy(layerRelationDefinitionStructure);
						},
						importLayerRelationDefinition : function(importer,
								layerRelationDefinitionStructure,
								layerRelationDefinition) {
							var senderLayerId;
							var receiverLayerId;
							if (importer.getMode() !== sap.firefly.QModelFormat.LAYER) {
								importer.addError(0, "internal error");
								return;
							}
							senderLayerId = sap.firefly.PrUtils
									.getStringValueProperty(
											layerRelationDefinitionStructure,
											sap.firefly.LayerRelationDefinition.C_SENDER_LAYER_ID,
											null);
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(senderLayerId)) {
								importer.addError(0, "illegal sender layer id");
								return;
							}
							receiverLayerId = sap.firefly.PrUtils
									.getStringValueProperty(
											layerRelationDefinitionStructure,
											sap.firefly.LayerRelationDefinition.C_RECEIVER_LAYER_ID,
											null);
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(receiverLayerId)) {
								importer.addError(0,
										"illegal receiver layer id");
								return;
							}
							if (layerRelationDefinition.m_modelComponentInitialized) {
								if (sap.firefly.XString.isEqual(senderLayerId,
										layerRelationDefinition
												.getSenderLayerId()) === false) {
									importer.addError(0,
											"illegal sender layer id");
									return;
								}
								if (sap.firefly.XString.isEqual(
										receiverLayerId,
										layerRelationDefinition
												.getReceiverLayerId()) === false) {
									importer.addError(0,
											"illegal receiver layer id");
									return;
								}
							} else {
								layerRelationDefinition.m_senderLayerId = senderLayerId;
								layerRelationDefinition.m_receiverLayerId = receiverLayerId;
							}
						}
					},
					m_layerModel : null,
					m_senderLayerId : null,
					m_receiverLayerId : null,
					m_cachedSenderLayer : null,
					m_cachedReceiverLayer : null,
					m_active : false,
					m_modelComponentInitialized : false,
					m_hashKey : null,
					getLayerModel : function() {
						var layerModel = sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_layerModel);
						return layerModel;
					},
					setupLayerRelationDefinition : function(layerModel) {
						this.m_layerModel = sap.firefly.XWeakReferenceUtil
								.getWeakRef(layerModel);
					},
					isModelComponentInitialized : function() {
						return this.m_modelComponentInitialized;
					},
					initializeModelComponent : function() {
						var layerModel;
						if (this.m_modelComponentInitialized) {
							return;
						}
						this.m_modelComponentInitialized = true;
						layerModel = this.getLayerModel();
						this.setupModelComponent(layerModel.getContext(),
								layerModel);
						this.initializeDefinition();
					},
					initializeDefinition : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setLayersInformation : function(senderLayer, receiverLayer) {
						var senderLayerId;
						var receiverLayerId;
						if (senderLayer === null) {
							throw sap.firefly.XException
									.createIllegalStateException("null");
						}
						if (receiverLayer === null) {
							throw sap.firefly.XException
									.createIllegalStateException("null");
						}
						if (senderLayer.getLayerModel() !== receiverLayer
								.getLayerModel()) {
							throw sap.firefly.XException
									.createIllegalStateException("internal error");
						}
						if (senderLayer === receiverLayer) {
							throw sap.firefly.XException
									.createIllegalStateException("internal error");
						}
						senderLayerId = senderLayer.getLayerId();
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(senderLayerId)) {
							throw sap.firefly.XException
									.createIllegalStateException("null");
						}
						if (sap.firefly.XString.isEqual(this.m_senderLayerId,
								senderLayerId) === false) {
							this.m_senderLayerId = senderLayerId;
						}
						receiverLayerId = receiverLayer.getLayerId();
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(receiverLayerId)) {
							throw sap.firefly.XException
									.createIllegalStateException("null");
						}
						if (sap.firefly.XString.isEqual(this.m_receiverLayerId,
								receiverLayerId) === false) {
							this.m_receiverLayerId = receiverLayerId;
						}
					},
					getQueryModel : function() {
						return null;
					},
					resetCache : function() {
						this.m_cachedSenderLayer = null;
						this.m_cachedReceiverLayer = null;
					},
					resolveSenderLayer : function() {
						var senderLayer = sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_cachedSenderLayer);
						var layerModel;
						if (senderLayer === null) {
							layerModel = this.getLayerModel();
							senderLayer = layerModel
									.getLayer(this.m_senderLayerId);
							this.m_cachedSenderLayer = sap.firefly.XWeakReferenceUtil
									.getWeakRef(senderLayer);
						}
						return senderLayer;
					},
					resolveReceiverLayer : function() {
						var receiverLayer = sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_cachedReceiverLayer);
						var layerModel;
						if (receiverLayer === null) {
							layerModel = this.getLayerModel();
							receiverLayer = layerModel
									.getLayer(this.m_receiverLayerId);
							this.m_cachedReceiverLayer = sap.firefly.XWeakReferenceUtil
									.getWeakRef(receiverLayer);
						}
						return receiverLayer;
					},
					setActive : function(active) {
						if (this.m_active === active) {
							return;
						}
						this.m_active = active;
						this.notifyNodeChanged();
					},
					isActive : function() {
						return this.m_active;
					},
					exportKeyStructure : function() {
						var result = sap.firefly.PrStructure.create();
						result
								.setStringByName(
										sap.firefly.LayerRelationDefinition.C_SENDER_LAYER_ID,
										this.m_senderLayerId);
						result
								.setStringByName(
										sap.firefly.LayerRelationDefinition.C_RECEIVER_LAYER_ID,
										this.m_receiverLayerId);
						return result;
					},
					getHashKey : function() {
						var hashKeyStructure;
						var jsonSerialized;
						var sha1;
						if (this.m_hashKey === null) {
							hashKeyStructure = this.exportKeyStructure();
							jsonSerialized = sap.firefly.PrToString.serialize(
									hashKeyStructure, true, true, 2);
							sha1 = sap.firefly.XString
									.createSHA1(jsonSerialized);
							this.m_hashKey = sap.firefly.XStringValue
									.create(sha1);
						}
						return this.m_hashKey.getStringValue();
					},
					releaseObject : function() {
						this.m_layerModel = null;
						this.m_senderLayerId = null;
						this.m_receiverLayerId = null;
						this.resetCache();
						if (this.m_modelComponentInitialized) {
							sap.firefly.LayerRelationDefinition.$superclass.releaseObject
									.call(this);
						}
					},
					getSenderLayerId : function() {
						return this.m_senderLayerId;
					},
					getReceiverLayerId : function() {
						return this.m_receiverLayerId;
					},
					importInternalState : function(
							layerRelationDefinitionStructure) {
						var active = sap.firefly.PrUtils.getBooleanProperty(
								layerRelationDefinitionStructure,
								sap.firefly.LayerRelationDefinition.C_ACTIVE);
						if (active !== null) {
							this.setActive(active.getBooleanValue());
						}
					}
				});
$Firefly.createClass("sap.firefly.LayerServiceConfig",
		sap.firefly.DfServiceConfigClassic, {
			$statics : {
				CLAZZ : null,
				staticSetup : function() {
					sap.firefly.LayerServiceConfig.CLAZZ = sap.firefly.XClass
							.create(sap.firefly.LayerServiceConfig);
				}
			},
			isSystemBoundService : function() {
				return false;
			}
		});
$Firefly
		.createClass(
				"sap.firefly.LayerSyncDefinition",
				sap.firefly.LayerRelationDefinition,
				{
					$statics : {
						create : function(layerModel) {
							var layerSyncDefinition = new sap.firefly.LayerSyncDefinition();
							layerSyncDefinition
									.setupLayerRelationDefinition(layerModel);
							return layerSyncDefinition;
						},
						C_SENDER_COMPONENT_PATH : "SenderComponentPath",
						C_RECEIVER_COMPONENT_PATH : "ReceiverComponentPath",
						C_COMPONENT_TUNNEL : "ComponentTunnel",
						C_DEACTIVATE_ON_RECEIVER_CHANGE : "DeactivateOnReceiverChange",
						importLayerSyncDefinition : function(importer,
								layerSyncDefinitionStructure,
								layerSyncDefinition, layerModel) {
							var result;
							var senderComponentPath;
							var receiverComponentPath;
							if (importer.getMode() !== sap.firefly.QModelFormat.LAYER) {
								importer.addError(0, "internal error");
								return;
							}
							result = layerSyncDefinition;
							if (result === null) {
								result = sap.firefly.LayerSyncDefinition
										.create(layerModel);
							}
							sap.firefly.LayerRelationDefinition
									.importLayerRelationDefinition(importer,
											layerSyncDefinitionStructure,
											result);
							senderComponentPath = sap.firefly.PrUtils
									.createDeepCopy(sap.firefly.PrUtils
											.getListProperty(
													layerSyncDefinitionStructure,
													sap.firefly.LayerSyncDefinition.C_SENDER_COMPONENT_PATH));
							if (senderComponentPath === null) {
								importer.addError(0,
										"illegal sender component path");
								return;
							}
							receiverComponentPath = sap.firefly.PrUtils
									.createDeepCopy(sap.firefly.PrUtils
											.getListProperty(
													layerSyncDefinitionStructure,
													sap.firefly.LayerSyncDefinition.C_RECEIVER_COMPONENT_PATH));
							if (receiverComponentPath === null) {
								importer.addError(0,
										"illegal receiver component path");
								return;
							}
							if (result.isModelComponentInitialized()) {
								if (senderComponentPath
										.isEqualTo(result.m_senderComponentPath) === false) {
									importer.addError(0,
											"illegal sender component path");
									return;
								}
								if (receiverComponentPath
										.isEqualTo(result.m_receiverComponentPath) === false) {
									importer.addError(0,
											"illegal receiver component path");
									return;
								}
							} else {
								result.m_senderComponentPath = senderComponentPath;
								result.m_receiverComponentPath = receiverComponentPath;
								result = layerModel.addLayerSync(result);
							}
							result.queueEventing();
							result
									.importInternalState(layerSyncDefinitionStructure);
							result.resumeEventing();
						},
						exportLayerSyncDefinition : function(exporter,
								layerSyncDefinition) {
							var layerSyncDefinitionStructure;
							if (exporter.getMode() !== sap.firefly.QModelFormat.LAYER) {
								return null;
							}
							if (layerSyncDefinition === null) {
								return null;
							}
							layerSyncDefinitionStructure = sap.firefly.LayerRelationDefinition
									.exportLayerRelationDefinition(exporter,
											layerSyncDefinition);
							if (layerSyncDefinitionStructure === null) {
								return null;
							}
							if (layerSyncDefinition.m_componentTunnel !== null) {
								layerSyncDefinitionStructure
										.setElementByName(
												sap.firefly.LayerSyncDefinition.C_COMPONENT_TUNNEL,
												layerSyncDefinition.m_componentTunnel
														.serializeToElement());
							}
							if (layerSyncDefinition.m_deactivateOnReceiverChange) {
								layerSyncDefinitionStructure
										.setBooleanByName(
												sap.firefly.LayerSyncDefinition.C_DEACTIVATE_ON_RECEIVER_CHANGE,
												true);
							}
							return sap.firefly.PrStructure
									.createDeepCopy(layerSyncDefinitionStructure);
						}
					},
					m_componentTunnel : null,
					m_senderComponentPath : null,
					m_receiverComponentPath : null,
					m_cachedSenderComponent : null,
					m_cachedReceiverComponent : null,
					m_deactivateOnReceiverChange : false,
					m_listenerCustomIdentifer : null,
					m_listener : null,
					updateSyncDefinition : function() {
						this.resetCache();
						this.m_componentTunnel.setSender(this
								.resolveSenderComponent());
						this.m_componentTunnel.setReceiver(this
								.resolveReceiverComponent());
						this.m_componentTunnel.pauseInheritance(!this
								.isActive());
					},
					initializeDefinition : function() {
						this.m_componentTunnel = sap.firefly.QModelComponentTunnel
								.create(null, null, null);
						this.m_componentTunnel.setChangeListener(this);
						this.updateSyncDefinition();
					},
					getOlapComponentType : function() {
						return sap.firefly.OlapComponentType.LAYER_SYNC_DEFINITION;
					},
					setComponentsInformation : function(senderComponent,
							receiverComponent) {
						var layerModel = this.getLayerModel();
						var senderLayer = layerModel
								.getLayerByComponent(senderComponent);
						var receiverLayer = layerModel
								.getLayerByComponent(receiverComponent);
						var senderComponentPath;
						var receiverComponentPath;
						this.setLayersInformation(senderLayer, receiverLayer);
						senderComponentPath = sap.firefly.LayerRelationDefinition
								.getComponentPath(senderComponent);
						if (senderComponentPath
								.isEqualTo(this.m_senderComponentPath) === false) {
							this.m_senderComponentPath = senderComponentPath;
						}
						receiverComponentPath = sap.firefly.LayerRelationDefinition
								.getComponentPath(receiverComponent);
						if (receiverComponentPath
								.isEqualTo(this.m_receiverComponentPath) === false) {
							this.m_receiverComponentPath = receiverComponentPath;
						}
					},
					notifyNodeChanged : function() {
						this.updateSyncDefinition();
						sap.firefly.LayerSyncDefinition.$superclass.notifyNodeChanged
								.call(this);
					},
					resetCache : function() {
						this.m_cachedSenderComponent = null;
						this.m_cachedReceiverComponent = null;
						sap.firefly.LayerSyncDefinition.$superclass.resetCache
								.call(this);
					},
					resolveSenderComponent : function() {
						var senderComponent = sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_cachedSenderComponent);
						if (senderComponent === null) {
							senderComponent = sap.firefly.LayerRelationDefinition
									.resolveComponent(this.getLayerModel(),
											this.getSenderLayerId(),
											this.m_senderComponentPath);
							this.m_cachedSenderComponent = sap.firefly.XWeakReferenceUtil
									.getWeakRef(senderComponent);
						}
						return senderComponent;
					},
					resolveReceiverComponent : function() {
						var receiverComponent = sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_cachedReceiverComponent);
						if (receiverComponent === null) {
							receiverComponent = sap.firefly.LayerRelationDefinition
									.resolveComponent(this.getLayerModel(),
											this.getReceiverLayerId(),
											this.m_receiverComponentPath);
							this.m_cachedReceiverComponent = sap.firefly.XWeakReferenceUtil
									.getWeakRef(receiverComponent);
						}
						return receiverComponent;
					},
					resetToSender : function() {
						if (this.m_componentTunnel.getSender() === null) {
							return false;
						}
						if (this.m_componentTunnel.getReceiver() === null) {
							return false;
						}
						this.m_componentTunnel.loadLastTunnelChangeToReceiver();
						return true;
					},
					resetToReceiver : function() {
						if (this.m_componentTunnel.getReceiver() === null) {
							return false;
						}
						this.m_componentTunnel.loadApiReceiverState();
						return true;
					},
					exportKeyStructure : function() {
						var result = sap.firefly.LayerSyncDefinition.$superclass.exportKeyStructure
								.call(this);
						result
								.setElementByName(
										sap.firefly.LayerSyncDefinition.C_SENDER_COMPONENT_PATH,
										this.m_senderComponentPath);
						result
								.setElementByName(
										sap.firefly.LayerSyncDefinition.C_RECEIVER_COMPONENT_PATH,
										this.m_receiverComponentPath);
						return result;
					},
					isDeactivateOnReceiverChange : function() {
						return this.m_deactivateOnReceiverChange;
					},
					setDeactivateOnReceiverChange : function(
							deactivateOnReceiverChange) {
						if (this.m_deactivateOnReceiverChange === deactivateOnReceiverChange) {
							return;
						}
						this.m_deactivateOnReceiverChange = deactivateOnReceiverChange;
						this.notifyNodeChanged();
					},
					onModelComponentTunnelChanged : function(
							modelComponentTunnel) {
						if (modelComponentTunnel === null) {
							throw sap.firefly.XException
									.createIllegalStateException("model component tunnel null");
						}
						if (modelComponentTunnel !== this.m_componentTunnel) {
							return;
						}
						if (this.m_deactivateOnReceiverChange) {
							if (modelComponentTunnel.getTypeOfLastChange() === sap.firefly.QModelComponentChangeType.CHANGE_FROM_RECEIVER) {
								this.setActive(false);
							}
						}
						if ((this.m_listener !== null)
								&& (modelComponentTunnel.getTypeOfLastChange() !== sap.firefly.QModelComponentChangeType.CHANGE_FROM_RECEIVER)) {
							this.m_listener.onReceiverChange(this,
									this.m_listenerCustomIdentifer);
						}
					},
					setReceiverChangeListener : function(listener,
							customIdentifier) {
						this.m_listener = listener;
						this.m_listenerCustomIdentifer = customIdentifier;
					},
					releaseObject : function() {
						this.m_senderComponentPath = null;
						this.m_receiverComponentPath = null;
						this.m_listener = null;
						this.m_listenerCustomIdentifer = null;
						sap.firefly.LayerSyncDefinition.$superclass.releaseObject
								.call(this);
					},
					importInternalState : function(
							layerRelationDefinitionStructure) {
						var componentTunnelElement;
						sap.firefly.LayerSyncDefinition.$superclass.importInternalState
								.call(this, layerRelationDefinitionStructure);
						componentTunnelElement = sap.firefly.PrUtils
								.getProperty(
										layerRelationDefinitionStructure,
										sap.firefly.LayerSyncDefinition.C_COMPONENT_TUNNEL);
						if (componentTunnelElement !== null) {
							this.m_componentTunnel
									.deserializeFromElement(componentTunnelElement);
							this.m_componentTunnel.setSender(this
									.resolveSenderComponent());
							this.m_componentTunnel.setReceiver(this
									.resolveReceiverComponent());
						}
						this
								.setDeactivateOnReceiverChange(sap.firefly.PrUtils
										.getBooleanValueProperty(
												layerRelationDefinitionStructure,
												sap.firefly.LayerSyncDefinition.C_DEACTIVATE_ON_RECEIVER_CHANGE,
												false));
					},
					startRecordingReceiverChanges : function() {
						if (this.m_componentTunnel !== null) {
							this.m_componentTunnel
									.startRecordingReceiverChanges();
						}
					},
					stopRecordingReceiverChanges : function() {
						if (this.m_componentTunnel !== null) {
							this.m_componentTunnel
									.stopRecordingReceiverChanges();
						}
					},
					isRecordingReceiverChanges : function() {
						if (this.m_componentTunnel !== null) {
							return this.m_componentTunnel
									.isRecordingReceiverChanges();
						}
						return false;
					},
					clearRecordedReceiverChanges : function() {
						if (this.m_componentTunnel !== null) {
							this.m_componentTunnel
									.clearRecordedReceiverChanges();
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectQAxis",
				sap.firefly.QAxisDimensionList,
				{
					$statics : {
						createAxis : function(axisType) {
							var axis = new sap.firefly.InfoObjectQAxis();
							axis.setupQAxis(axisType);
							return axis;
						}
					},
					m_axisType : null,
					m_isHierarchyActive : false,
					m_zeroSuppressionType : null,
					m_defaultZeroSuppressionType : null,
					m_supportsZeroSuppression : false,
					setupQAxis : function(axisType) {
						this.m_axisType = axisType;
						this.m_zeroSuppressionType = sap.firefly.ZeroSuppressionType.NONE;
						this.m_supportsZeroSuppression = false;
					},
					releaseObject : function() {
						this.m_axisType = null;
						this.m_zeroSuppressionType = null;
						this.m_defaultZeroSuppressionType = null;
						sap.firefly.InfoObjectQAxis.$superclass.releaseObject
								.call(this);
					},
					getOlapComponentType : function() {
						return sap.firefly.OlapComponentType.AXIS;
					},
					getType : function() {
						return this.m_axisType;
					},
					getZeroSuppressionType : function() {
						return this.m_zeroSuppressionType;
					},
					setZeroSuppressionType : function(suppressionType) {
						if (this.m_supportsZeroSuppression === false) {
							throw sap.firefly.XException
									.createRuntimeException("Zero suppression not supported");
						}
						if ((this.m_axisType === sap.firefly.AxisType.COLUMNS)
								|| (this.m_axisType === sap.firefly.AxisType.ROWS)) {
							this.m_zeroSuppressionType = suppressionType;
						}
					},
					supportsZeroSuppression : function() {
						return this.m_supportsZeroSuppression;
					},
					setSupportsZeroSuppression : function(
							supportsZeroSuppression) {
						this.m_supportsZeroSuppression = supportsZeroSuppression;
					},
					getDimensionList : function() {
						return this;
					},
					getDimensionListBase : function() {
						return this;
					},
					getAxis : function() {
						return this;
					},
					getAxisBase : function() {
						return this;
					},
					isHierarchyActive : function() {
						return this.m_isHierarchyActive;
					},
					setIsHierarchyActive : function(isActive) {
						this.m_isHierarchyActive = isActive;
					},
					getEffectiveFields : function() {
						var size = this.size();
						var effective = sap.firefly.XList.create();
						var i;
						var dimension;
						for (i = 0; i < size; i++) {
							dimension = this.getDimensionByIndex(i);
							this.collectEffectiveFields(effective, dimension);
						}
						return effective;
					},
					collectEffectiveFields : function(effective, fieldContainer) {
						var resultSetFields = fieldContainer
								.getResultSetFields();
						var j;
						var attribute;
						for (j = 0; j < resultSetFields.size(); j++) {
							attribute = resultSetFields.get(j);
							effective.add(attribute);
						}
					},
					supportsResultVisibility : function() {
						return this.getQueryModel().supportsResultVisibility();
					},
					getResultVisibility : function() {
						return this
								.getResultVisibilityByElement(sap.firefly.ResultStructureElement.TOTAL);
					},
					getResultVisibilitySettings : function() {
						return null;
					},
					clearResultVisibilitySettings : function() {
					},
					getResultVisibilityByElement : function(element) {
						return this.getResultVisibilityByElementAndAlignment(
								this.getResultAlignment(), element);
					},
					getResultVisibilityByElementAndAlignment : function(
							alignment, element) {
						var iterator;
						var visibility;
						var dimension;
						if (alignment === null) {
							return null;
						}
						iterator = this.getDimensionList().getIterator();
						visibility = null;
						while (iterator.hasNext()) {
							dimension = iterator.next();
							if (dimension.isStructure() === false) {
								if (visibility === null) {
									visibility = dimension
											.getResultVisibilityByElementAndAlignment(
													alignment, element);
									continue;
								}
								if (visibility !== dimension
										.getResultVisibilityByElementAndAlignment(
												alignment, element)) {
									return null;
								}
							}
						}
						return visibility;
					},
					setResultVisibility : function(visibility) {
						this.setResultVisibilityByElement(
								sap.firefly.ResultStructureElement.TOTAL,
								visibility);
					},
					setResultVisibilityByElement : function(element, visibility) {
						this.setResultVisibilityByElementAndAlignment(this
								.getResultAlignment(), element, visibility);
					},
					setResultVisibilityByElementAndAlignment : function(
							alignment, element, visibility) {
						var i;
						var dimension;
						for (i = 0; i < this.getDimensionList().size(); i++) {
							dimension = this.getDimensionByIndex(i);
							if (alignment === null) {
								dimension
										.setResultVisibilityByElementAndAlignment(
												dimension.getResultAlignment(),
												element, visibility);
							} else {
								dimension
										.setResultVisibilityByElementAndAlignment(
												alignment, element, visibility);
							}
						}
					},
					supportsResultAlignment : function() {
						return this.supportsResultVisibility();
					},
					setResultAlignment : function(alignment) {
						var i;
						var dimensionBase;
						if (this.supportsResultVisibility()) {
							if (this.supportsResultAlignment()
									&& this.getQueryModel()
											.getSupportedResultAlignments()
											.contains(alignment)) {
								if (this.getResultAlignment() !== alignment) {
									for (i = 0; i < this.getDimensionListBase()
											.size(); i++) {
										dimensionBase = this
												.getDimensionBase(i);
										dimensionBase
												.getResultStructureControllerBase()
												.setResultAlignmentBase(
														alignment, true);
									}
								}
							}
						}
					},
					getResultAlignment : function() {
						var iterator = this.getDimensionList().getIterator();
						var alignment = null;
						var dimension;
						while (iterator.hasNext()) {
							dimension = iterator.next();
							if (dimension.isStructure() === false) {
								if (alignment === null) {
									alignment = dimension.getResultAlignment();
									continue;
								}
								if (alignment !== dimension
										.getResultAlignment()) {
									return null;
								}
							}
						}
						return alignment;
					},
					getSupportedResultAlignmentLevel : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSupportedResultAlignments : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					supportsResultAlignmentType : function(resultAlignment) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					supportsConditionalResultVisibility : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					supportsConditionalResults : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSupportedConditionalResults : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getResultStructureReorderingCapability : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						buffer.append(this.m_axisType.getName());
						return buffer.toString();
					},
					getParentResultStructureController : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getResultStructureController : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getResultStructureControllerBase : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getResultStructureChildren : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					supportsTotals : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isTotalsAlignmentOnDefault : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					restoreTotalsAlignment : function(restoreAction,
							recurseChildren) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSupportedResultVisibilityLevel : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getModelLevel : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isTotalsVisibilityOnDefault : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isTotalsStructureOnDefault : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					restoreTotalsVisibility : function(restoreAction,
							recurseChildren) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getDefaultZeroSuppressionType : function() {
						return this.m_defaultZeroSuppressionType;
					},
					setDefaultZeroSuppression : function(defaultZeroSuppression) {
						this.m_defaultZeroSuppressionType = defaultZeroSuppression;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.OlapBwExtImplModule",
				sap.firefly.DfModule,
				{
					$statics : {
						s_module : null,
						getInstance : function() {
							return sap.firefly.OlapBwExtImplModule
									.initVersion(sap.firefly.XVersion.API_DEFAULT);
						},
						initVersion : function(version) {
							var registrationService;
							if (sap.firefly.OlapBwExtImplModule.s_module === null) {
								if (sap.firefly.OlapImplModule
										.initVersion(version) === null) {
									throw sap.firefly.XException
											.createInitializationException();
								}
								if (sap.firefly.OlapBwExtApiModule
										.initVersion(version) === null) {
									throw sap.firefly.XException
											.createInitializationException();
								}
								sap.firefly.OlapBwExtImplModule.s_module = new sap.firefly.OlapBwExtImplModule();
								registrationService = sap.firefly.RegistrationService
										.getInstance();
								sap.firefly.WorkspaceManager.staticSetup();
								sap.firefly.WorkstatusManager.staticSetup();
								sap.firefly.InfoObjectManager.staticSetup();
								sap.firefly.AggregationLevelFactory
										.staticSetup();
								registrationService
										.addReferenceWithType(
												sap.firefly.OlapApiModule.AGGREGATION_LEVEL_FACTORY,
												null,
												sap.firefly.AggregationLevelFactory.CLAZZ);
								sap.firefly.WorkspaceService.staticSetup();
								registrationService
										.addService(
												sap.firefly.OlapBwExtApiModule.XS_WORKSPACE,
												sap.firefly.WorkspaceService.CLAZZ);
								sap.firefly.WorkstatusService.staticSetup();
								registrationService
										.addService(
												sap.firefly.OlapBwExtApiModule.XS_WORKSTATUS,
												sap.firefly.WorkstatusService.CLAZZ);
								sap.firefly.InfoObjectService.staticSetup();
								registrationService
										.addService(
												sap.firefly.OlapBwExtApiModule.XS_INFOOBJECT,
												sap.firefly.InfoObjectService.CLAZZ);
								sap.firefly.XCmdSetQueryManagerAtLayer
										.staticSetup();
								sap.firefly.XCmdSetQueryManagerAtLayerResult
										.staticSetup();
								registrationService
										.addCommand(
												sap.firefly.CmdSetQueryManagerAtLayer.CMD_NAME,
												sap.firefly.XCmdSetQueryManagerAtLayer.CLAZZ);
							}
							return sap.firefly.OlapBwExtImplModule.s_module;
						}
					}
				});
sap.firefly.OlapBwExtImplModule.getInstance();