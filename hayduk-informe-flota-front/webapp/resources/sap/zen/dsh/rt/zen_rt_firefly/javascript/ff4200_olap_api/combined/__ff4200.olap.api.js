$Firefly.createClass("sap.firefly.XCommandCallback", sap.firefly.XObject, {
	$statics : {
		create : function(callbackListener) {
			var callback = new sap.firefly.XCommandCallback();
			callback.m_callbackListener = callbackListener;
			return callback;
		}
	},
	m_callbackListener : null,
	onCommandProcessed : function(extResult, commandResult, customIdentifier) {
		this.m_callbackListener.onXCommandCallbackProcessed(extResult,
				commandResult, customIdentifier);
	}
});
$Firefly
		.createClass(
				"sap.firefly.XCommandFactory",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(application) {
							var commandFactory = new sap.firefly.XCommandFactory();
							commandFactory.m_version = application.getVersion();
							return commandFactory;
						}
					},
					m_version : 0,
					createCommand : function(commandName) {
						return this.createWithType(
								sap.firefly.XCommandType.CUSTOM, commandName);
					},
					createCommandArray : function(commandType) {
						if ((commandType !== sap.firefly.XCommandType.ARRAY_CONCURRENT)
								&& (commandType !== sap.firefly.XCommandType.ARRAY_BATCH)) {
							return null;
						}
						return this.createWithType(commandType, "DEFAULT");
					},
					createWithType : function(commandType, commandName) {
						var registrationService = sap.firefly.RegistrationService
								.getInstance();
						var fqn = sap.firefly.XStringBuffer.create();
						var references;
						var commandClass;
						var command;
						fqn.append(sap.firefly.RegistrationService.COMMAND)
								.append(".").append(commandType.getName())
								.append(".").append(commandName);
						references = registrationService.getReferences(fqn
								.toString());
						if (references === null) {
							return null;
						}
						if (references.size() !== 1) {
							return null;
						}
						commandClass = references.get(0);
						command = commandClass.newInstance(this);
						command.setupCommand(this, commandType, commandName);
						return command;
					},
					getVersion : function() {
						return this.m_version;
					}
				});
$Firefly.createClass("sap.firefly.XPlanningCommandCallback",
		sap.firefly.XObject, {
			$statics : {
				create : function(commandListener) {
					var callback = new sap.firefly.XPlanningCommandCallback();
					callback.m_commandListener = commandListener;
					return callback;
				}
			},
			m_commandListener : null,
			onCommandProcessed : function(extPlanningCommandResult) {
				this.m_commandListener
						.onXPlanningCommandProcessed(extPlanningCommandResult);
			}
		});
$Firefly
		.createClass(
				"sap.firefly.CmdCreateQueryManager",
				sap.firefly.XObject,
				{
					$statics : {
						CMD_NAME : "CREATE_QUERY_MANAGER",
						PARAM_I_APPLICATION : "APPLICATION",
						PARAM_I_SYSTEM : "SYSTEM",
						PARAM_I_DATA_SOURCE : "DATA_SOURCE",
						PARAM_I_QUERY_MODEL_STRUCTURE_INA_REPOSITORY : "QUERY_MODEL_STRUCTURE_INA_REPOSITORY",
						PARAM_E_QUERY_MANAGER : "QUERY_MANAGER"
					}
				});
$Firefly
		.createClass(
				"sap.firefly.CmdDeserializeBlending",
				sap.firefly.XObject,
				{
					$statics : {
						CMD_NAME : "DESERIALIZE_BLENDING",
						PARAM_I_QUERY_MODEL_STRING_INA_REPOSITORY : "QUERY_MODEL_STRING_INA_REPOSITORY",
						PARAM_I_APPLICATION : "APPLICATION",
						PARAM_I_SYSTEM : "SYSTEM",
						PARAM_I_SYSTEMS : "SYSTEMS",
						PARAM_E_QUERY_MANAGER : "QUERY_MANAGER"
					}
				});
$Firefly
		.createClass(
				"sap.firefly.CmdDeserializeCalculatedDimension",
				sap.firefly.XObject,
				{
					$statics : {
						CMD_NAME : "DESERIALIZE_CALCULATED_DIMENSION",
						PARAM_I_QUERY_MODELS_STRING_INA_REPOSITORY : "QUERY_MODELS_STRING_INA_REPOSITORY",
						PARAM_I_APPLICATION : "APPLICATION",
						PARAM_I_SYSTEM : "SYSTEM"
					}
				});
$Firefly
		.createClass(
				"sap.firefly.CmdDeserializeExtendedDimension",
				sap.firefly.XObject,
				{
					$statics : {
						CMD_NAME : "DESERIALIZE_EXTENDED_DIMENSION",
						PARAM_I_QUERY_MODEL_STRING_INA_REPOSITORY : "QUERY_MODEL_STRING_INA_REPOSITORY",
						PARAM_I_QUERY_MODEL : "QUERYMODEL",
						PARAM_E_QUERY_MANAGER : "QUERY_MANAGER"
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningConstants",
				sap.firefly.XObject,
				{
					$statics : {
						DATA_AREA : "DATA_AREA",
						ENVIRONMENT : "ENVIRONMENT",
						MODEL : "MODEL",
						CELL_LOCKING : "CELL_LOCKING",
						PLANNING_SCHEMA : "PLANNING_SCHEMA",
						PLANNING_MODEL : "PLANNING_MODEL",
						PLANNING_MODEL_BEHAVIOUR : "PLANNING_MODEL_BEHAVIOUR",
						WITH_SHARED_VERSIONS : "WITH_SHARED_VERSIONS",
						WITH_BACKUP_TIMESTAMP : "WITH_BACKUP_TIMESTAMP",
						WITH_FAST_ACTION_PARAMETERS : "WITH_FAST_ACTION_PARAMETERS",
						WITH_FAST_PRIVILEGE_INITIALIZATION : "WITH_FAST_PRIVILEGE_INITIALIZATION",
						WITH_UNDO_REDO_STACK : "WITH_UNDO_REDO_STACK",
						WITH_ACTION_STATE : "WITH_ACTION_STATE",
						WITH_STRICT_ERROR_HANDLING : "WITH_STRICT_ERROR_HANDLING",
						WITH_IGNORE_UNDESIRED_SHARED_VERSIONS : "WITH_IGNORE_UNDESIRED_SHARED_VERSIONS",
						PERSISTENCE_TYPE : "PERSISTENCE_TYPE",
						BACKEND_USER_NAME : "BACKEND_USER_NAME",
						DIM_VERSION : "$$Version$$",
						DATA_AREA_DEFAULT : "DEFAULT"
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DataAreaUtil",
				sap.firefly.XObject,
				{
					$statics : {
						getPlanningService : function(application, systemName,
								dataArea) {
							var planningServices = sap.firefly.DataAreaUtil
									.getPlanningServices(application,
											systemName, dataArea);
							var planningService;
							if (planningServices === null) {
								return null;
							}
							if (planningServices.size() !== 1) {
								return null;
							}
							planningService = planningServices.get(0);
							return planningService;
						},
						isServiceQueryRelated : function(queryManager,
								systemName, dataAreaName) {
							var systemDescription = queryManager
									.getSystemDescription();
							var systemType;
							var datasource;
							var queryDataArea;
							if (systemDescription === null) {
								return false;
							}
							systemType = systemDescription.getSystemType();
							if (systemType.isTypeOf(sap.firefly.SystemType.BW) === false) {
								return false;
							}
							if (sap.firefly.XString.isEqual(systemName,
									queryManager.getSystemDescription()
											.getName()) === false) {
								return false;
							}
							datasource = queryManager.getDataSource();
							if (datasource === null) {
								return false;
							}
							queryDataArea = datasource.getDataArea();
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(queryDataArea)) {
								queryDataArea = sap.firefly.PlanningConstants.DATA_AREA_DEFAULT;
							}
							if (sap.firefly.XString.isEqual(dataAreaName,
									queryDataArea) === false) {
								return false;
							}
							return true;
						},
						isServicePlanningRelated : function(service,
								systemName, dataAreaName) {
							var serviceConfig = service
									.getPlanningServiceConfig();
							var systemDescription;
							var properties;
							var serviceDataArea;
							if (serviceConfig === null) {
								return false;
							}
							systemDescription = serviceConfig
									.getSystemDescription();
							if (systemDescription === null) {
								return false;
							}
							if (sap.firefly.XString.isEqual(systemName,
									systemDescription.getName()) === false) {
								return false;
							}
							if (systemDescription.getSystemType().isTypeOf(
									sap.firefly.SystemType.BW) === false) {
								return false;
							}
							properties = serviceConfig.getProperties();
							serviceDataArea = properties
									.getStringByNameWithDefault(
											sap.firefly.PlanningConstants.DATA_AREA,
											sap.firefly.PlanningConstants.DATA_AREA_DEFAULT);
							if (sap.firefly.XString.isEqual(dataAreaName,
									serviceDataArea) === false) {
								return false;
							}
							return true;
						},
						getPlanningServices : function(application, systemName,
								dataArea) {
							var dataAreaName;
							var services;
							var result;
							var i;
							var service;
							if (application === null) {
								return null;
							}
							if (systemName === null) {
								return null;
							}
							dataAreaName = dataArea;
							if (dataAreaName === null) {
								dataAreaName = sap.firefly.PlanningConstants.DATA_AREA_DEFAULT;
							}
							services = application
									.getServices(sap.firefly.OlapApiModule.SERVICE_TYPE_PLANNING);
							if (services === null) {
								return null;
							}
							result = null;
							for (i = 0; i < services.size(); i++) {
								service = services.get(i);
								if (sap.firefly.DataAreaUtil
										.isServicePlanningRelated(service,
												systemName, dataAreaName) === false) {
									continue;
								}
								if (result === null) {
									result = sap.firefly.XList.create();
								}
								result.add(service);
							}
							return result;
						},
						getQueryConsumerServices : function(dataArea) {
							var planningService;
							var application;
							var dataAreaName;
							var systemName;
							if (dataArea === null) {
								return null;
							}
							planningService = dataArea.getPlanningService();
							if (planningService === null) {
								return null;
							}
							application = planningService.getApplication();
							if (application === null) {
								return null;
							}
							dataAreaName = dataArea.getDataArea();
							if (dataAreaName === null) {
								dataAreaName = sap.firefly.PlanningConstants.DATA_AREA_DEFAULT;
							}
							systemName = dataArea.getPlanningService()
									.getPlanningServiceConfig().getSystemName();
							return sap.firefly.DataAreaUtil
									.getQueryConsumerServicesByName(
											application, systemName,
											dataAreaName);
						},
						getQueryConsumerServicesByName : function(application,
								systemName, dataArea) {
							var services = application
									.getServices(sap.firefly.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER);
							var dataAreaName;
							var result;
							var i;
							var queryManager;
							if (services === null) {
								return null;
							}
							dataAreaName = dataArea;
							if (dataAreaName === null) {
								dataAreaName = sap.firefly.PlanningConstants.DATA_AREA_DEFAULT;
							}
							result = null;
							for (i = 0; i < services.size(); i++) {
								queryManager = services.get(i);
								if (sap.firefly.DataAreaUtil
										.isServiceQueryRelated(queryManager,
												systemName, dataAreaName) === false) {
									continue;
								}
								if (result === null) {
									result = sap.firefly.XList.create();
								}
								result.add(queryManager);
							}
							return result;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningModelUtil",
				sap.firefly.XObject,
				{
					$statics : {
						closeActiveVersions : function(versions, doDropVersions) {
							var i;
							var version;
							if ((versions !== null) && (versions.size() > 0)) {
								for (i = 0; i < versions.size(); i++) {
									version = versions.get(i);
									if (version.isSharedVersion() === false) {
										if (version.isActive()) {
											sap.firefly.PlanningModelUtil
													.assertCommandOk(version
															.createRequestCloseVersion()
															.setCloseMode(
																	sap.firefly.CloseModeType.KILL_ACTION_SEQUENCE)
															.processCommand(
																	sap.firefly.SyncType.BLOCKING,
																	null, null));
										}
										if (doDropVersions) {
											sap.firefly.PlanningModelUtil
													.assertCommandOk(version
															.createRequestDropVersion()
															.processCommand(
																	sap.firefly.SyncType.BLOCKING,
																	null, null));
										}
									}
								}
							}
						},
						initEnforceNoVersion : function(planningModel) {
							var versions;
							if (planningModel === null) {
								return;
							}
							versions = planningModel.getVersions();
							sap.firefly.PlanningModelUtil.closeActiveVersions(
									versions, true);
							if (planningModel.getVersions().size() !== 0) {
								throw sap.firefly.XException
										.createRuntimeException("Illegal versions");
							}
						},
						initCreateDefaultVersion : function(planningModel) {
							var version;
							var versions;
							var versionIdentifier;
							var restoreBackupType;
							var initVersion;
							if (planningModel === null) {
								return;
							}
							version = null;
							versions = planningModel.getVersions();
							if ((versions === null) || (versions.size() < 1)) {
								versionIdentifier = planningModel
										.getVersionIdentifier(
												sap.firefly.PlanningModelUtil
														.getNewPlanningVersionId(versions),
												false, null);
								version = planningModel.getVersionById(
										versionIdentifier, "Planning Version");
							} else {
								sap.firefly.PlanningModelUtil
										.closeActiveVersions(versions, false);
								version = versions.get(0);
							}
							restoreBackupType = sap.firefly.RestoreBackupType.NONE;
							if (version.getVersionState() === sap.firefly.PlanningVersionState.DIRTY) {
								restoreBackupType = sap.firefly.RestoreBackupType.RESTORE_FALSE;
							}
							initVersion = version
									.createRequestVersion(sap.firefly.PlanningModelRequestType.INIT_VERSION);
							initVersion.setRestoreBackupType(restoreBackupType);
							sap.firefly.PlanningModelUtil
									.assertCommandOk(initVersion
											.processCommand(
													sap.firefly.SyncType.BLOCKING,
													null, null));
						},
						initEnforceSingleVersion : function(planningModel) {
							var version;
							var versions;
							var versionIdentifier;
							var initVersion;
							if (planningModel === null) {
								return;
							}
							version = null;
							versions = planningModel.getVersions();
							sap.firefly.PlanningModelUtil.closeActiveVersions(
									versions, true);
							versionIdentifier = planningModel
									.getVersionIdentifier(
											sap.firefly.PlanningModelUtil
													.getNewPlanningVersionId(versions),
											false, null);
							version = planningModel.getVersionById(
									versionIdentifier, "Planning Version");
							if (version.getVersionId() !== 1) {
								throw sap.firefly.XException
										.createRuntimeException("Illegal versions");
							}
							initVersion = version
									.createRequestVersion(sap.firefly.PlanningModelRequestType.INIT_VERSION);
							initVersion
									.setRestoreBackupType(sap.firefly.RestoreBackupType.NONE);
							sap.firefly.PlanningModelUtil
									.assertCommandOk(initVersion
											.processCommand(
													sap.firefly.SyncType.BLOCKING,
													null, null));
							versions = planningModel.getVersions();
							if (versions.size() !== 1) {
								throw sap.firefly.XException
										.createRuntimeException("Illegal versions");
							}
							if (versions.get(0) !== version) {
								throw sap.firefly.XException
										.createRuntimeException("Illegal versions");
							}
						},
						dropAllVersions : function(planningModel) {
							var versions;
							if (planningModel === null) {
								return;
							}
							versions = planningModel.getVersions();
							sap.firefly.PlanningModelUtil.closeActiveVersions(
									versions, true);
							versions = planningModel.getVersions();
							if (versions.size() !== 0) {
								throw sap.firefly.XException
										.createRuntimeException("Illegal versions");
							}
						},
						assertCommandOk : function(commandResult) {
							if (commandResult === null) {
								throw sap.firefly.XException
										.createRuntimeException("Command result null");
							}
							if (commandResult.hasErrors()) {
								throw sap.firefly.XException
										.createRuntimeException(commandResult
												.getSummary());
							}
						},
						getNewPlanningVersionId : function(planningVersions) {
							var newVersionId = 1;
							while (sap.firefly.PlanningModelUtil
									.containsPlanningVersionId(
											planningVersions, newVersionId)) {
								newVersionId++;
							}
							return newVersionId;
						},
						containsPlanningVersionId : function(planningVersions,
								versionId) {
							var i;
							var planningVersion;
							if (planningVersions === null) {
								return false;
							}
							for (i = 0; i < planningVersions.size(); i++) {
								planningVersion = planningVersions.get(i);
								if (planningVersion.isSharedVersion()) {
									continue;
								}
								if (planningVersion.getVersionId() === versionId) {
									return true;
								}
							}
							return false;
						},
						createQueryConsumerServiceConfig : function(
								planningModel, datasource) {
							var serviceConfig;
							var queryConsumerServiceConfig;
							if (planningModel === null) {
								throw sap.firefly.XException
										.createRuntimeException("planning model is null");
							}
							if (datasource === null) {
								throw sap.firefly.XException
										.createRuntimeException("query identifier is null");
							}
							serviceConfig = planningModel.getPlanningService()
									.getPlanningServiceConfig();
							queryConsumerServiceConfig = sap.firefly.QueryServiceConfig
									.createWithDataSource(serviceConfig
											.getApplication(), serviceConfig
											.getSystemDescription().getName(),
											datasource);
							return queryConsumerServiceConfig;
						},
						getPlanningService : function(application, systemName,
								planningSchema, planningModel) {
							var planningServices = sap.firefly.PlanningModelUtil
									.getPlanningServices(application,
											systemName, planningSchema,
											planningModel);
							var planningService;
							if (planningServices === null) {
								return null;
							}
							if (planningServices.size() !== 1) {
								return null;
							}
							planningService = planningServices.get(0);
							return planningService;
						},
						getPlanningServices : function(application, systemName,
								planningSchema, planningModel) {
							var services;
							var result;
							var i;
							var service;
							var serviceConfig;
							var systemDescription;
							var systemType;
							var properties;
							if (application === null) {
								return null;
							}
							services = application
									.getServices(sap.firefly.OlapApiModule.SERVICE_TYPE_PLANNING);
							if (services === null) {
								return null;
							}
							result = null;
							for (i = 0; i < services.size(); i++) {
								service = services.get(i);
								serviceConfig = service
										.getPlanningServiceConfig();
								if (serviceConfig === null) {
									continue;
								}
								systemDescription = serviceConfig
										.getSystemDescription();
								if (systemDescription === null) {
									continue;
								}
								if (sap.firefly.XString.isEqual(systemName,
										systemDescription.getName()) === false) {
									continue;
								}
								systemType = systemDescription.getSystemType();
								if (systemType === null) {
									continue;
								}
								if (systemType
										.isTypeOf(sap.firefly.SystemType.HANA) === false) {
									continue;
								}
								properties = serviceConfig.getProperties();
								if (sap.firefly.XString
										.isEqual(
												planningSchema,
												properties
														.getStringByNameWithDefault(
																sap.firefly.PlanningConstants.PLANNING_SCHEMA,
																null)) === false) {
									continue;
								}
								if (sap.firefly.XString
										.isEqual(
												planningModel,
												properties
														.getStringByNameWithDefault(
																sap.firefly.PlanningConstants.PLANNING_MODEL,
																null)) === false) {
									continue;
								}
								if (result === null) {
									result = sap.firefly.XList.create();
								}
								result.add(service);
							}
							return result;
						},
						getPlanningServiceFromQueryDataSource : function(
								application, systemName, dataSource) {
							var planningServices = sap.firefly.PlanningModelUtil
									.getPlanningServicesFromQueryDataSource(
											application, systemName, dataSource);
							var planningService;
							if (planningServices === null) {
								return null;
							}
							if (planningServices.size() !== 1) {
								return null;
							}
							planningService = planningServices.get(0);
							return planningService;
						},
						getPlanningServicesFromQueryDataSource : function(
								application, systemName, dataSource) {
							var fullQualifiedName;
							var services;
							var result;
							var i;
							var service;
							var serviceConfig;
							var systemDescription;
							var systemType;
							var planningContext;
							var planningModel;
							var dataSources;
							var j;
							if (application === null) {
								return null;
							}
							if (systemName === null) {
								return null;
							}
							if (dataSource === null) {
								return null;
							}
							fullQualifiedName = dataSource
									.getFullQualifiedName();
							services = application
									.getServices(sap.firefly.OlapApiModule.SERVICE_TYPE_PLANNING);
							if (services === null) {
								return null;
							}
							result = null;
							for (i = 0; i < services.size(); i++) {
								service = services.get(i);
								serviceConfig = service
										.getPlanningServiceConfig();
								if (serviceConfig === null) {
									continue;
								}
								systemDescription = serviceConfig
										.getSystemDescription();
								if (systemDescription === null) {
									continue;
								}
								if (sap.firefly.XString.isEqual(systemName,
										systemDescription.getName()) === false) {
									continue;
								}
								systemType = systemDescription.getSystemType();
								if (systemType !== sap.firefly.SystemType.HANA) {
									continue;
								}
								planningContext = service.getPlanningContext();
								if (planningContext === null) {
									continue;
								}
								if (planningContext.getPlanningContextType() !== sap.firefly.PlanningContextType.PLANNING_MODEL) {
									continue;
								}
								planningModel = planningContext;
								dataSources = planningModel
										.getQueryDataSources();
								if (dataSources === null) {
									continue;
								}
								for (j = 0; j < dataSources.size(); j++) {
									if (sap.firefly.XString.isEqual(dataSources
											.get(j).getDataSource()
											.getFullQualifiedName(),
											fullQualifiedName)) {
										if (result === null) {
											result = sap.firefly.XList.create();
										}
										result.add(service);
										break;
									}
								}
							}
							return result;
						},
						getQueryConsumerServices : function(planningModel) {
							var application;
							var services;
							var dataSources;
							var dataSourcesMap;
							var i;
							var dataSource;
							var dataSourceName;
							var result;
							var systemName;
							var j;
							var queryManager;
							var systemDescription;
							var systemType;
							var datasource;
							var identifierString;
							if (planningModel === null) {
								return null;
							}
							application = planningModel.getPlanningService()
									.getApplication();
							services = application
									.getServices(sap.firefly.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER);
							if (services === null) {
								return null;
							}
							dataSources = planningModel.getQueryDataSources();
							if (dataSources === null) {
								return null;
							}
							dataSourcesMap = null;
							for (i = 0; i < dataSources.size(); i++) {
								if (dataSourcesMap === null) {
									dataSourcesMap = sap.firefly.XHashMapByString
											.create();
								}
								dataSource = dataSources.get(i);
								dataSourceName = dataSource.getDataSource()
										.getFullQualifiedName();
								dataSourcesMap.put(dataSourceName, dataSource);
							}
							if (dataSourcesMap === null) {
								return null;
							}
							result = null;
							systemName = planningModel.getPlanningService()
									.getPlanningServiceConfig().getSystemName();
							for (j = 0; j < services.size(); j++) {
								queryManager = services.get(j);
								systemDescription = queryManager
										.getSystemDescription();
								if (systemDescription === null) {
									continue;
								}
								systemType = systemDescription.getSystemType();
								if (systemType !== sap.firefly.SystemType.HANA) {
									continue;
								}
								if (sap.firefly.XString.isEqual(systemName,
										queryManager.getSystemDescription()
												.getName()) === false) {
									continue;
								}
								datasource = queryManager.getDataSource();
								if (datasource === null) {
									continue;
								}
								identifierString = datasource
										.getFullQualifiedName();
								if (dataSourcesMap
										.containsKey(identifierString) === false) {
									continue;
								}
								if (result === null) {
									result = sap.firefly.XList.create();
								}
								if (result.contains(queryManager)) {
									continue;
								}
								result.add(queryManager);
							}
							return result;
						}
					}
				});
$Firefly.createClass("sap.firefly.BlendingConstants", sap.firefly.XObject, {
	$statics : {
		ERROR_INVALID_QUERY_MODEL : 3001,
		ERROR_INVALID_DIMENSION : 3002,
		ERROR_INVALID_MAPPING : 3003,
		ERROR_INVALID_BLENDING_DATA_SOURCE : 3004,
		ERROR_INVALID_BLENDING_DEFINITION : 3005,
		ERROR_INVALID_FIELD : 3005,
		EXCEPTION_SETTING_BLENDING_DUPLICATE : "BlendingDuplicate",
		EXCEPTION_SETTING_BLENDING_AGGREGATE : "BlendingAggregate"
	}
});
$Firefly.createClass("sap.firefly.BlendingCapabilities", sap.firefly.XObject, {
	$statics : {
		isObjectTypeSupportedForBlending : function(type) {
			if (type === null) {
				return false;
			}
			return (type === sap.firefly.MetaObjectType.DBVIEW)
					|| (type === sap.firefly.MetaObjectType.PLANNING)
					|| (type === sap.firefly.MetaObjectType.BLENDING);
		},
		isDimensionTypeSupportedForBlending : function(type) {
			if (type === null) {
				return false;
			}
			return type.isValidForBlending();
		},
		getMaxNumberOfBlendingQueries : function() {
			return 2;
		},
		isAxisTypeSupportedForBlending : function(type) {
			if (type === null) {
				return false;
			}
			return (type === sap.firefly.AxisType.COLUMNS)
					|| (type === sap.firefly.AxisType.ROWS);
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.BlendingSource",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(queryModel, queryAliasName) {
							var queryModelDefinitionName;
							var source;
							if (queryModel === null) {
								throw sap.firefly.XException
										.createIllegalArgumentException("query model null");
							}
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(queryAliasName)) {
								throw sap.firefly.XException
										.createIllegalArgumentException("Query Alias name null");
							}
							sap.firefly.BlendingValidation
									.isQueryModelValidForBlending(queryModel,
											null);
							queryModelDefinitionName = queryModel
									.getDefinitionName();
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(queryModelDefinitionName)) {
								queryModel.setDefinitionName(queryAliasName);
							}
							source = new sap.firefly.BlendingSource();
							source.m_queryModel = sap.firefly.XWeakReferenceUtil
									.getWeakRef(queryModel);
							source.m_aliasName = queryAliasName;
							return source;
						}
					},
					m_queryModel : null,
					m_aliasName : null,
					m_isRemote : false,
					cloneBlendingSource : function() {
						var origQueryManager = this.getQueryModel()
								.getQueryManager();
						var cloneQueryManager = origQueryManager
								.cloneQueryManager();
						var blendingSource = sap.firefly.BlendingSource.create(
								cloneQueryManager.getQueryModel(), this
										.getQueryAliasName());
						blendingSource.setIsRemoteSource(this.m_isRemote);
						return blendingSource;
					},
					clone : function() {
						return this.cloneBlendingSource();
					},
					isEqualTo : function(other) {
						var xOther;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						xOther = other;
						if (sap.firefly.XString.isEqual(this
								.getQueryAliasName(), xOther
								.getQueryAliasName()) === false) {
							return false;
						}
						if (this.isRemoteSource() !== xOther.isRemoteSource()) {
							return false;
						}
						if (this.getQueryModel().isEqualTo(
								xOther.getQueryModel()) === false) {
							return false;
						}
						return true;
					},
					releaseObject : function() {
						this.m_aliasName = null;
						this.m_queryModel = null;
						sap.firefly.BlendingSource.$superclass.releaseObject
								.call(this);
					},
					getQueryModel : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_queryModel);
					},
					getQueryAliasName : function() {
						return this.m_aliasName;
					},
					isRemoteSource : function() {
						return this.m_isRemote;
					},
					setIsRemoteSource : function(isRemoteSource) {
						this.m_isRemote = isRemoteSource;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.BlendingValidation",
				sap.firefly.XObject,
				{
					$statics : {
						addError : function(messages, errorCode, message,
								extendedInfo) {
							var messageSb = sap.firefly.XStringBuffer.create();
							messageSb.append("Blending Validation Error ");
							messageSb.appendInt(errorCode);
							messageSb.append(": ");
							messageSb.append(message);
							if (messages === null) {
								throw sap.firefly.XException
										.createIllegalArgumentException(messageSb
												.toString());
							}
							messages.addErrorExt(
									sap.firefly.OriginLayer.DRIVER, errorCode,
									messageSb.toString(), extendedInfo);
						},
						isQueryModelValidForBlending : function(queryModel,
								messageManager) {
							var queryManager;
							var systemDescription;
							var systemType;
							var dataSource;
							if (queryModel === null) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_QUERY_MODEL,
												"The QueryModel is null",
												queryModel);
								return false;
							}
							queryManager = queryModel.getQueryManager();
							if (queryManager === null) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_QUERY_MODEL,
												"The QueryManager is null",
												queryModel);
								return false;
							}
							systemDescription = queryManager
									.getSystemDescription();
							if (systemDescription === null) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_QUERY_MODEL,
												"The SystemDescription is null",
												queryModel);
								return false;
							}
							systemType = systemDescription.getSystemType();
							if (systemType === null) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_QUERY_MODEL,
												"The SystemType is null",
												queryModel);
								return false;
							}
							if (systemType !== sap.firefly.SystemType.HANA) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_QUERY_MODEL,
												"Currently only HANA supports blending",
												queryModel);
								return false;
							}
							dataSource = queryModel.getDataSource();
							if (dataSource === null) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_QUERY_MODEL,
												"The DataSource is null",
												queryModel);
								return false;
							}
							if (sap.firefly.BlendingCapabilities
									.isObjectTypeSupportedForBlending(dataSource
											.getType()) === false) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_QUERY_MODEL,
												sap.firefly.XStringUtils
														.concatenate3(
																"The DataSource Type '",
																dataSource
																		.getType()
																		.getCamelCaseName(),
																"' is not supported"),
												queryModel);
								return false;
							}
							return true;
						},
						isFieldImplicitlyRequested : function(field) {
							if (field.isAlwaysRequested()) {
								return true;
							}
							if (field.isKeyField()) {
								return true;
							}
							if (field.getDimension().getKeyField() === field) {
								return true;
							}
							if (field.isDefaultTextField()) {
								return true;
							}
							if (field.getDimension().getTextField() === field) {
								return true;
							}
							if (field.hasSorting()
									&& (field.getResultSetSorting()
											.getDirection() !== sap.firefly.XSortDirection.DEFAULT_VALUE)) {
								return true;
							}
							return false;
						},
						isFieldValidForBlending : function(field,
								messageManager, validateAll) {
							var resultSetFields;
							if (field === null) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_FIELD,
												"The field is null", field);
								return false;
							}
							if (validateAll) {
								if (sap.firefly.BlendingValidation
										.isDimensionValidForBlending(field
												.getDimension(),
												messageManager, validateAll) === false) {
									return false;
								}
							}
							if (sap.firefly.BlendingValidation
									.isFieldImplicitlyRequested(field)) {
								return true;
							}
							resultSetFields = field.getDimension()
									.getResultSetFields();
							if (resultSetFields.contains(field)) {
								return true;
							}
							sap.firefly.BlendingValidation
									.addError(
											messageManager,
											sap.firefly.BlendingConstants.ERROR_INVALID_FIELD,
											sap.firefly.XStringUtils
													.concatenate3(
															"The field '",
															field.getName(),
															"' is not requested"),
											field);
							return false;
						},
						isDimensionValidForBlending : function(dimension,
								messageManager, validateAll) {
							var isNotAccount;
							var isNotMeasure;
							if (dimension === null) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_DIMENSION,
												"The Dimension is null",
												dimension);
								return false;
							}
							if (validateAll) {
								if (sap.firefly.BlendingValidation
										.isQueryModelValidForBlending(dimension
												.getQueryModel(),
												messageManager) === false) {
									return false;
								}
							}
							isNotAccount = dimension.getDimensionType() !== sap.firefly.DimensionType.ACCOUNT;
							isNotMeasure = dimension.getDimensionType() !== sap.firefly.DimensionType.MEASURE_STRUCTURE;
							if ((sap.firefly.BlendingCapabilities
									.isAxisTypeSupportedForBlending(dimension
											.getAxis().getType()) === false)
									&& isNotAccount && isNotMeasure) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_DIMENSION,
												sap.firefly.XStringUtils
														.concatenate3(
																"The axis of the dimension '",
																dimension
																		.getName(),
																"' is not supported for blending"),
												dimension);
								return false;
							}
							if (sap.firefly.BlendingCapabilities
									.isDimensionTypeSupportedForBlending(dimension
											.getDimensionType()) === false) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_DIMENSION,
												sap.firefly.XStringUtils
														.concatenate3(
																"The type of the dimension '",
																dimension
																		.getName(),
																"' is not supported for blending"),
												dimension);
								return false;
							}
							return true;
						},
						assertBlendingDefinitionIsValid : function(
								blendingDefinition) {
							sap.firefly.BlendingValidation
									.isBlendingDefinitionValid(
											blendingDefinition, null);
						},
						isBlendingDefinitionValid : function(
								blendingDefinition, messageManager) {
							var mappings;
							var mappingIterator;
							var mapping;
							if (blendingDefinition === null) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_BLENDING_DEFINITION,
												"The BlendingDefinition is null",
												blendingDefinition);
								return false;
							}
							if (blendingDefinition.getSources().size() < 2) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_BLENDING_DEFINITION,
												"At least 2 sources must be defined for blending",
												blendingDefinition);
								return false;
							}
							if (sap.firefly.BlendingValidation
									.assertMandatoryJoinTypes(
											blendingDefinition, messageManager) === false) {
								return false;
							}
							mappings = blendingDefinition.getMappings();
							mappingIterator = mappings.getIterator();
							while (mappingIterator.hasNext()) {
								mapping = mappingIterator.next();
								if ((mapping.getConstantMappings()
										.hasElements())
										&& ((mapping.getLinkType() !== sap.firefly.BlendingLinkType.ALL_DATA) && (mapping
												.getLinkType() !== sap.firefly.BlendingLinkType.NONE))) {
									mappingIterator.releaseObject();
									sap.firefly.BlendingValidation
											.addError(
													messageManager,
													sap.firefly.BlendingConstants.ERROR_INVALID_BLENDING_DEFINITION,
													"Constant Mappings are only allowed for ALL_DATA or NONE links",
													mapping);
									return false;
								}
							}
							mappingIterator.releaseObject();
							return true;
						},
						assertMandatoryJoinTypes : function(blendingDefinition,
								messageManager) {
							var containsJoin = false;
							var containsUnion = false;
							var mappings = blendingDefinition.getMappings();
							var mappingIterator = mappings.getIterator();
							var mapping;
							while (mappingIterator.hasNext()) {
								mapping = mappingIterator.next();
								if ((mapping.getLinkType() === sap.firefly.BlendingLinkType.ALL_DATA)
										|| (mapping.getLinkType() === sap.firefly.BlendingLinkType.PRIMARY)
										|| (mapping.getLinkType() === sap.firefly.BlendingLinkType.INTERSECT)) {
									containsJoin = true;
								}
								if (mapping.getLinkType() === sap.firefly.BlendingLinkType.COEXIST) {
									containsUnion = true;
								}
								if (containsJoin && containsUnion) {
									return true;
								}
							}
							mappingIterator.releaseObject();
							if (containsJoin === false) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_BLENDING_DEFINITION,
												"There has to be at least one mapping with linktype 'ALL_DATA', 'PRIMARY' or 'INTERSECT'",
												blendingDefinition);
							}
							if (containsUnion === false) {
								sap.firefly.BlendingValidation
										.addError(
												messageManager,
												sap.firefly.BlendingConstants.ERROR_INVALID_BLENDING_DEFINITION,
												"There has to be at least one mapping with linktype 'CO_EXIST'",
												blendingDefinition);
							}
							return false;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.AbstractSpatialClustering",
				sap.firefly.XObject,
				{
					$statics : {
						ORDER : null
					},
					m_clusterField : null,
					m_isActive : false,
					m_parameters : null,
					setupClustering : function() {
						if (sap.firefly.AbstractSpatialClustering.ORDER === null) {
							this.createOrder();
						}
						this.m_parameters = sap.firefly.XHashMapByString
								.create();
						this.m_isActive = true;
					},
					createOrder : function() {
						var dbScanParameter;
						var gridParameter;
						var kMeansParameter;
						sap.firefly.AbstractSpatialClustering.ORDER = sap.firefly.XHashMapByString
								.create();
						dbScanParameter = sap.firefly.XArrayOfString.create(2);
						dbScanParameter.set(0, "EPS");
						dbScanParameter.set(1, "MinPoints");
						sap.firefly.AbstractSpatialClustering.ORDER.put(
								sap.firefly.ClusterAlgorithm.DB_SCAN.getName(),
								dbScanParameter);
						gridParameter = sap.firefly.XArrayOfString.create(6);
						gridParameter.set(0, "XCells");
						gridParameter.set(1, "YCells");
						gridParameter.set(2, "XLowerBound");
						gridParameter.set(3, "YLowerBound");
						gridParameter.set(4, "XUpperBound");
						gridParameter.set(5, "YUpperBound");
						sap.firefly.AbstractSpatialClustering.ORDER.put(
								sap.firefly.ClusterAlgorithm.GRID.getName(),
								gridParameter);
						kMeansParameter = sap.firefly.XArrayOfString.create(4);
						kMeansParameter.set(0, "Clusters");
						kMeansParameter.set(1, "MaxIterations");
						kMeansParameter.set(2, "Threshold");
						kMeansParameter.set(3, "Init");
						sap.firefly.AbstractSpatialClustering.ORDER.put(
								sap.firefly.ClusterAlgorithm.K_MEANS.getName(),
								kMeansParameter);
					},
					isEqualTo : function(other) {
						var xOther;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						xOther = other;
						if (xOther.getClusterAlgorithm() !== this
								.getClusterAlgorithm()) {
							return false;
						}
						if (xOther.isActive() !== this.isActive()) {
							return false;
						}
						if (xOther.getClusterField() !== this.getClusterField()) {
							return false;
						}
						return this.areParametersEqual(
								sap.firefly.AbstractSpatialClustering.ORDER
										.getByKey(xOther.getClusterAlgorithm()
												.getName()), this
										.getParameters(), xOther
										.getParameters());
					},
					areParametersEqual : function(order, thisParameter,
							otherParameter) {
						var i;
						var name;
						var thisValue;
						for (i = 0; i < order.size(); i++) {
							name = order.get(i);
							if (thisParameter.containsKey(name) !== otherParameter
									.containsKey(name)) {
								return false;
							}
							thisValue = thisParameter.getByKey(name);
							if (thisValue !== null) {
								if (thisValue.isEqualTo(otherParameter
										.getByKey(name)) === false) {
									return false;
								}
							}
						}
						return true;
					},
					releaseObject : function() {
						this.m_parameters = sap.firefly.XObject
								.releaseIfNotNull(this.m_parameters);
						this.m_clusterField = null;
						sap.firefly.AbstractSpatialClustering.$superclass.releaseObject
								.call(this);
					},
					getClusterAlgorithm : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getClusterField : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_clusterField);
					},
					getParameters : function() {
						return this.m_parameters;
					},
					isActive : function() {
						return this.m_isActive;
					},
					setActive : function(isActive) {
						this.m_isActive = isActive;
					},
					setClusterField : function(field) {
						if (field === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("The cluster field must not be null!");
						}
						if (field.getValueType().isSpatial() === false) {
							throw sap.firefly.XException
									.createIllegalArgumentException("The cluster field must be spatial!");
						}
						this.m_clusterField = sap.firefly.XWeakReferenceUtil
								.getWeakRef(field);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.HierarchyPathUtil",
				sap.firefly.XObject,
				{
					$statics : {
						PATH_ELEMENT_NAME : "Name",
						PATH_ELEMENT_DESCRIPTION : "Description",
						PATH_ELEMENT_UNIQUE_NAME : "UniqueName",
						getPathField : function(queryModel, dimensionName) {
							var dimension;
							var pathFieldName;
							if (queryModel === null) {
								return null;
							}
							if (queryModel.getQueryManager()
									.supportsHierarchyPath() === false) {
								return null;
							}
							dimension = queryModel
									.getDimensionByName(dimensionName);
							if (dimension === null) {
								return null;
							}
							pathFieldName = sap.firefly.XStringUtils
									.concatenate3("[", dimension.getName(),
											"].path");
							return dimension.getFieldByName(pathFieldName);
						},
						addPathFieldToResultSet : function(queryModel,
								dimensionName, asHiddenField) {
							var field = sap.firefly.HierarchyPathUtil
									.getPathField(queryModel, dimensionName);
							var convenienceCommands;
							var hiddenField;
							if (field === null) {
								return null;
							}
							convenienceCommands = queryModel
									.getConvenienceCommands();
							if (asHiddenField) {
								hiddenField = convenienceCommands
										.clearFieldFromResultSet(dimensionName,
												field.getName());
								if (hiddenField !== null) {
									hiddenField.setAlwaysRequested(true);
								}
							} else {
								convenienceCommands.addFieldToResultSet(
										dimensionName, field.getName());
							}
							return field;
						},
						getPathStructureFromDimensionMember : function(
								dimensionMember) {
							var dimension = dimensionMember.getDimension();
							var pathField = sap.firefly.HierarchyPathUtil
									.getPathField(dimension.getQueryModel(),
											dimension.getName());
							var fieldValue;
							var pathValues;
							if (pathField === null) {
								return null;
							}
							fieldValue = dimensionMember
									.getFieldValue(pathField);
							if (fieldValue === null) {
								return null;
							}
							if (fieldValue.getValueType() !== sap.firefly.XValueType.STRING) {
								throw sap.firefly.XException
										.createIllegalStateException("illegal value type");
							}
							pathValues = fieldValue.getStringValue();
							return sap.firefly.HierarchyPathUtil
									.parsePathValues(pathValues);
						},
						parsePathValues : function(pathValues) {
							var stringToParse;
							var sb;
							var jsonParser;
							var jsonElement;
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(pathValues)) {
								return null;
							}
							if (sap.firefly.XString.endsWith(pathValues, '"}')) {
								sb = sap.firefly.XStringBuffer.create();
								sb.append(sap.firefly.XString.substring(
										pathValues, 0, sap.firefly.XString
												.size(pathValues) - 2));
								sb.append("}");
								stringToParse = sb.toString();
							} else {
								stringToParse = pathValues;
							}
							jsonParser = sap.firefly.JsonParserFactory
									.newInstance();
							jsonElement = jsonParser.parse(stringToParse);
							if (jsonParser.hasErrors()) {
								throw sap.firefly.XException
										.createRuntimeException(jsonParser
												.getSummary());
							}
							if (jsonElement === null) {
								return null;
							}
							if (jsonElement.getType() !== sap.firefly.PrElementType.STRUCTURE) {
								throw sap.firefly.XException
										.createRuntimeException("JSON string is not a structure");
							}
							return jsonElement;
						}
					}
				});
$Firefly.createClass("sap.firefly.HierarchyCatalogUtil", sap.firefly.XObject, {
	$statics : {
		isHierarchyCatalogSupported : function(systemDescription) {
			var application;
			var connectionPool;
			var connectionContainer;
			var allOpenConnections;
			var serverMetadata;
			var capabilityContainer;
			if (systemDescription === null) {
				return false;
			}
			application = systemDescription.getApplication();
			if (application === null) {
				return false;
			}
			connectionPool = application.getConnectionPool();
			if (connectionPool === null) {
				return false;
			}
			connectionContainer = null;
			allOpenConnections = connectionPool
					.getOpenConnections(systemDescription.getName());
			if (allOpenConnections.hasElements()) {
				connectionContainer = allOpenConnections.get(0);
			} else {
				connectionContainer = connectionPool
						.getConnection(systemDescription.getName());
			}
			if (connectionContainer === null) {
				return false;
			}
			serverMetadata = connectionContainer.getServerMetadata();
			if (serverMetadata === null) {
				return false;
			}
			capabilityContainer = serverMetadata
					.getMetadataForService(sap.firefly.ServerService.ANALYTIC);
			if (capabilityContainer === null) {
				return false;
			}
			return capabilityContainer.containsKey("HierarchyCatalog");
		},
		getHierarchyItems : function(catalogResult) {
			var result = sap.firefly.XList.create();
			var iterator;
			var item;
			var copy;
			if (catalogResult !== null) {
				iterator = catalogResult.getObjectsIterator();
				if (iterator !== null) {
					while (iterator.hasNext()) {
						item = iterator.next();
						copy = item.clone();
						result.add(copy);
					}
					iterator.releaseObject();
				}
			}
			return result;
		},
		getHierarchyNames : function(catalogResult) {
			var result = sap.firefly.XListOfString.create();
			var set = sap.firefly.XHashSetOfString.create();
			var iterator;
			var catalogItem;
			var key;
			if (catalogResult !== null) {
				iterator = catalogResult.getObjectsIterator();
				if (iterator !== null) {
					while (iterator.hasNext()) {
						catalogItem = iterator.next();
						key = catalogItem.getHierarchyName();
						if (set.contains(key)) {
							continue;
						}
						set.put(key);
						result.add(key);
					}
					iterator.releaseObject();
				}
			}
			return result;
		},
		getDistinctHierarchyNames : function(catalogResult) {
			var result = sap.firefly.XList.create();
			var set = sap.firefly.XHashSetOfString.create();
			var iterator;
			var catalogItem;
			var key;
			var copy;
			if (catalogResult !== null) {
				iterator = catalogResult.getObjectsIterator();
				if (iterator !== null) {
					while (iterator.hasNext()) {
						catalogItem = iterator.next();
						key = catalogItem.getHierarchyName();
						if (set.contains(key)) {
							continue;
						}
						copy = catalogItem.clone();
						set.put(key);
						result.add(copy);
					}
					iterator.releaseObject();
				}
			}
			return result;
		},
		getVersionNames : function(catalogResult) {
			var result = sap.firefly.XListOfString.create();
			var set = sap.firefly.XHashSetOfString.create();
			var iterator;
			var catalogItem;
			var key;
			if (catalogResult !== null) {
				iterator = catalogResult.getObjectsIterator();
				if (iterator !== null) {
					while (iterator.hasNext()) {
						catalogItem = iterator.next();
						key = catalogItem.getVersionName();
						if (set.contains(key)) {
							continue;
						}
						set.put(key);
						result.add(key);
					}
					iterator.releaseObject();
				}
			}
			return result;
		},
		getDistinctVersionNames : function(catalogResult) {
			var result = sap.firefly.XList.create();
			var set = sap.firefly.XHashSetOfString.create();
			var iterator;
			var catalogItem;
			var key;
			var copy;
			if (catalogResult !== null) {
				iterator = catalogResult.getObjectsIterator();
				if (iterator !== null) {
					while (iterator.hasNext()) {
						catalogItem = iterator.next();
						key = catalogItem.getVersionName();
						if (set.contains(key)) {
							continue;
						}
						copy = catalogItem.clone();
						set.put(key);
						result.add(copy);
					}
					iterator.releaseObject();
				}
			}
			return result;
		}
	}
});
$Firefly.createClass("sap.firefly.QFactory", sap.firefly.XObject, {
	$statics : {
		newFormulaConstant : function() {
			return sap.firefly.QFactory2.newFormulaConstant(null);
		},
		newFormulaConstantWithStringValue : function(stringValue) {
			return sap.firefly.QFactory2.newFormulaConstantWithStringValue(
					null, stringValue);
		},
		newFormulaConstantWithIntValue : function(intValue) {
			return sap.firefly.QFactory2.newFormulaConstantWithIntValue(null,
					intValue);
		},
		newFormulaConstantWithDoubleValue : function(doubleValue) {
			return sap.firefly.QFactory2.newFormulaConstantWithDoubleValue(
					null, doubleValue);
		},
		newFormulaOperation : function() {
			return sap.firefly.QFactory2.newFormulaOperation(null);
		},
		newFormulaAttributeWithName : function(fieldName) {
			return sap.firefly.QFactory2.newFormulaAttributeWithName(null,
					fieldName);
		},
		newFormulaFunction : function() {
			return sap.firefly.QFactory2.newFormulaFunction(null);
		},
		newFormulaFunctionWithName : function(functionName) {
			return sap.firefly.QFactory2.newFormulaFunctionWithName(null,
					functionName);
		},
		newFormulaMember : function() {
			return sap.firefly.QFactory2.newFormulaMember(null);
		},
		newFormulaMemberWithName : function(memberName) {
			return sap.firefly.QFactory2.newFormulaMemberWithName(null,
					memberName);
		},
		newFilterAnd : function() {
			return sap.firefly.QFactory2.newFilterAnd(null);
		},
		newFilterOr : function() {
			return sap.firefly.QFactory2.newFilterOr(null);
		},
		newFilterNot : function() {
			return sap.firefly.QFactory2.newFilterNot(null);
		},
		newFilterOperation : function() {
			return sap.firefly.QFactory2.newFilterOperation(null);
		},
		newFilterOperation2 : function(application, filterExpression) {
			return sap.firefly.QFactory2._getInstance().newFilterOperation2(
					application, filterExpression);
		},
		newFilterCartesianElement : function() {
			return sap.firefly.QFactory2.newFilterCartesianElement(null);
		},
		newFilterCartesianProduct : function() {
			return sap.firefly.QFactory2.newFilterCartesianProduct(null);
		},
		newFilterCartesianProduct2 : function(application, filterExpression) {
			return sap.firefly.QFactory2._getInstance()
					.newFilterCartesianProduct2(application, filterExpression);
		},
		newFilterCartesianList : function() {
			return sap.firefly.QFactory2.newFilterCartesianList(null);
		},
		newFilterCartesianList2 : function(application, filterExpression) {
			return sap.firefly.QFactory2._getInstance()
					.newFilterCartesianList2(application, filterExpression);
		},
		newDimensionElement : function(selectField, hierarchyName, value) {
			return sap.firefly.QFactory2.newDimensionElement(selectField,
					hierarchyName, value);
		},
		newDrillPathElement : function() {
			return sap.firefly.QFactory2.newDrillPathElement(null);
		},
		getInAConstant : function(qFactoryConstant) {
			return sap.firefly.QFactory2._getInstance().getInAConstant(
					qFactoryConstant);
		},
		newAggregationLevel : function(name) {
			return sap.firefly.QFactory2.newAggregationLevel(null, name);
		},
		newDataSource : function() {
			return sap.firefly.QFactory2.newDataSource();
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.QFactory2",
				sap.firefly.XObject,
				{
					$statics : {
						s_factory : null,
						_getInstance : function() {
							return sap.firefly.QFactory2.s_factory;
						},
						setInstance : function(factory) {
							sap.firefly.QFactory2.s_factory = factory;
						},
						createMemberNavigation : function(memberFunction) {
							return sap.firefly.QFactory2.s_factory
									.createMemberNavigation(memberFunction);
						},
						createNavigationParameterWithStringConstant : function(
								constantValue) {
							return sap.firefly.QFactory2.s_factory
									.createNavigationParameterWithStringConstant(constantValue);
						},
						createNavigationParameterWithIntegerConstant : function(
								constantValue) {
							return sap.firefly.QFactory2.s_factory
									.createNavigationParameterWithIntegerConstant(constantValue);
						},
						createNavigationParameterWithLevelLiteral : function(
								levelValue) {
							return sap.firefly.QFactory2.s_factory
									.createNavigationParameterWithLevelLiteral(levelValue);
						},
						createNavigationParameterWithLevelNumber : function(
								levelValue) {
							return sap.firefly.QFactory2.s_factory
									.createNavigationParameterWithLevelNumber(levelValue);
						},
						createNavigationParameterWithMemberName : function(
								fqnName) {
							return sap.firefly.QFactory2.s_factory
									.createNavigationParameterWithMemberName(fqnName);
						},
						newFormulaConstant : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newFormulaConstantExt(context);
						},
						newFormulaConstantWithStringValue : function(context,
								stringValue) {
							var newStringConstant = sap.firefly.QFactory2
									.newFormulaConstant(context);
							newStringConstant.setStringValue(stringValue);
							return newStringConstant;
						},
						newFormulaConstantWithIntValue : function(context,
								intValue) {
							var newIntConstant = sap.firefly.QFactory2
									.newFormulaConstant(context);
							newIntConstant.setIntegerValue(intValue);
							return newIntConstant;
						},
						newFormulaConstantWithDoubleValue : function(context,
								doubleValue) {
							var newDobuleConstant = sap.firefly.QFactory2
									.newFormulaConstant(context);
							newDobuleConstant.setDoubleValue(doubleValue);
							return newDobuleConstant;
						},
						newFormulaOperation : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newFormulaOperationExt(context);
						},
						newFormulaAttributeWithName : function(context,
								fieldName) {
							var newFormulaAttribute = sap.firefly.QFactory2.s_factory
									.newFormulaAttributeExt(context);
							newFormulaAttribute.setFieldByName(fieldName);
							return newFormulaAttribute;
						},
						newFormulaFunction : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newFormulaFunctionExt(context);
						},
						newFormulaFunctionWithName : function(context,
								functionName) {
							var newFormulaFunction = sap.firefly.QFactory2
									.newFormulaFunction(context);
							newFormulaFunction.setFunctionName(functionName);
							return newFormulaFunction;
						},
						newFormulaMember : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newFormulaMemberExt(context);
						},
						newFormulaMemberWithName : function(context, memberName) {
							var newFormulaMember = sap.firefly.QFactory2
									.newFormulaMember(context);
							newFormulaMember.setMemberName(memberName);
							return newFormulaMember;
						},
						newFilterAnd : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newFilterAndExt(context);
						},
						newFilterTuple : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newFilterTupleExt(context);
						},
						newFilterOr : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newFilterOrExt(context);
						},
						newFilterNot : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newFilterNotExt(context);
						},
						newFilterOperation : function(context) {
							var filterExpression2 = null;
							var componentType;
							if (context !== null) {
								componentType = context.getComponentType();
								if (componentType === sap.firefly.OlapComponentType.FILTER_EXPRESSION) {
									filterExpression2 = context;
								}
							}
							return sap.firefly.QFactory2.s_factory
									.newFilterOperationExt(context,
											filterExpression2);
						},
						newFilterCartesianElement : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newFilterCartesianElementExt(context);
						},
						newFilterCartesianProduct : function(context) {
							var filterExpression2 = null;
							var componentType;
							if (context !== null) {
								componentType = context.getComponentType();
								if (componentType === sap.firefly.OlapComponentType.FILTER_EXPRESSION) {
									filterExpression2 = context;
								}
							}
							return sap.firefly.QFactory2.s_factory
									.newFilterCartesianProductExt(context,
											filterExpression2);
						},
						newFilterCartesianList : function(context) {
							var filterExpression2 = null;
							var componentType;
							if (context !== null) {
								componentType = context.getComponentType();
								if (componentType === sap.firefly.OlapComponentType.FILTER_EXPRESSION) {
									filterExpression2 = context;
								}
							}
							return sap.firefly.QFactory2.s_factory
									.newFilterCartesianListExt(context,
											filterExpression2);
						},
						newDimensionElement : function(selectField,
								hierarchyName, value) {
							return sap.firefly.QFactory2.s_factory
									.newDimensionElement(selectField,
											hierarchyName, value);
						},
						newDrillPathElement : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newDrillPathElementExt(context);
						},
						getInAConstant : function(qFactoryConstant) {
							return sap.firefly.QFactory2.s_factory
									.getInAConstant(qFactoryConstant);
						},
						newAggregationLevel : function(context, name) {
							return sap.firefly.QFactory2.s_factory
									.newAggregationLevelExt(context, name);
						},
						newDataSourceExt : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newDataSource(context);
						},
						newDataSource : function() {
							return sap.firefly.QFactory2.s_factory
									.newDataSource(null);
						},
						newDrillManager : function(context) {
							return sap.firefly.QFactory2.s_factory
									.newDrillManager(context);
						},
						newCatalogSpace : function(application) {
							return sap.firefly.QFactory2.s_factory
									.newCatalogSpace(application);
						}
					}
				});
$Firefly.createClass("sap.firefly.QFactoryConstants", sap.firefly.XObject, {
	$statics : {
		FIELD_NAME : "_FIELDNAME_"
	}
});
$Firefly.createClass("sap.firefly.TmxFactory", sap.firefly.XObject, {
	$statics : {
		s_factory : null,
		s_singleton : null,
		setFactory : function(factory) {
			sap.firefly.TmxFactory.s_factory = factory;
		},
		getSingleton : function() {
			if (sap.firefly.TmxFactory.s_singleton === null) {
				sap.firefly.TmxFactory.s_singleton = sap.firefly.TmxFactory
						.create();
			}
			return sap.firefly.TmxFactory.s_singleton;
		},
		create : function() {
			return sap.firefly.TmxFactory.s_factory.createUsingFactory(null);
		},
		createWithApplication : function(application) {
			return sap.firefly.TmxFactory.s_factory
					.createUsingFactory(application);
		},
		createStandalone : function(landscapeUrl) {
			return sap.firefly.TmxFactory.s_factory
					.createStandaloneInFactory(landscapeUrl);
		}
	},
	createUsingFactory : function(application) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	createStandaloneInFactory : function(landscapeUrl) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	}
});
$Firefly
		.createClass(
				"sap.firefly.BlendingAttributeMapping",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(attributeName, isLinkKey,
								blendingDefinition) {
							var mapping = new sap.firefly.BlendingAttributeMapping();
							mapping.setup(attributeName, isLinkKey,
									blendingDefinition);
							return mapping;
						}
					},
					m_attributeMappings : null,
					m_attributeName : null,
					m_blendingDefinition : null,
					m_isLinkKey : false,
					m_mappingDefinitionType : null,
					setup : function(attributeName, isLinkKey,
							blendingDefinition) {
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(attributeName)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("The attribute name must not be null!");
						}
						if (blendingDefinition === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Blending definition must not be null!");
						}
						this.m_mappingDefinitionType = sap.firefly.BlendingMappingDefinitionType.ATTRIBUTE;
						this.m_attributeMappings = sap.firefly.XList.create();
						this.m_attributeName = attributeName;
						this.m_isLinkKey = isLinkKey;
						this.m_blendingDefinition = sap.firefly.XWeakReferenceUtil
								.getWeakRef(blendingDefinition);
					},
					addAttributeMappingDefinition : function(
							attributeMappingDefinition) {
						this.m_attributeMappings
								.add(attributeMappingDefinition);
					},
					addNewAttributeDimensionMappingDefinition : function(field,
							queryAliasName) {
						var attributeMappingDefinition = this
								.newAttributeMappingDefinition(field,
										queryAliasName);
						this
								.addAttributeMappingDefinition(attributeMappingDefinition);
						return attributeMappingDefinition;
					},
					addNewAttributeDimensionMappingDefinitionByName : function(
							fieldName, queryAliasName) {
						var attributeMappingDefinitionByName = this
								.newAttributeMappingDefinitionByName(fieldName,
										queryAliasName);
						this
								.addAttributeMappingDefinition(attributeMappingDefinitionByName);
						return attributeMappingDefinitionByName;
					},
					addNewAttributeDimensionMappingDefinitionByObject : function(
							field) {
						var attributeMappingDefinition = this
								.newAttributeMappingDefinitionByObject(field);
						this
								.addAttributeMappingDefinition(attributeMappingDefinition);
						return attributeMappingDefinition;
					},
					clone : function() {
						return this.cloneMapping();
					},
					cloneMapping : function() {
						var clone = sap.firefly.BlendingAttributeMapping
								.create(this.getAttributeName(), this
										.isLinkKey(), this
										.getBlendingDefinition());
						var iterator = this.getAttributeMappingDefinitions()
								.getIterator();
						var mappingDefinition;
						while (iterator.hasNext()) {
							mappingDefinition = iterator.next();
							clone
									.addAttributeMappingDefinition(mappingDefinition
											.cloneMappingDefinition());
						}
						iterator.releaseObject();
						return clone;
					},
					getAttributeMappingDefinitions : function() {
						return this.m_attributeMappings;
					},
					getAttributeName : function() {
						return this.m_attributeName;
					},
					getBlendingDefinition : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_blendingDefinition);
					},
					getMappingDefinitionType : function() {
						return this.m_mappingDefinitionType;
					},
					isEqualTo : function(other) {
						var otherGeneral;
						var xOther;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						otherGeneral = other;
						if (this.getMappingDefinitionType() !== otherGeneral
								.getMappingDefinitionType()) {
							return false;
						}
						xOther = other;
						if (sap.firefly.XString.isEqual(
								this.getAttributeName(), xOther
										.getAttributeName()) === false) {
							return false;
						}
						if (this.isLinkKey() !== xOther.isLinkKey()) {
							return false;
						}
						if (this.getAttributeMappingDefinitions().isEqualTo(
								xOther.getAttributeMappingDefinitions()) === false) {
							return false;
						}
						return true;
					},
					isLinkKey : function() {
						return this.m_isLinkKey;
					},
					newAttributeMappingDefinition : function(field,
							queryAliasName) {
						sap.firefly.BlendingValidation.isFieldValidForBlending(
								field, null, true);
						return sap.firefly.BlendingMappingDefinition
								.createAttributeMapping(field.getName(),
										queryAliasName);
					},
					newAttributeMappingDefinitionByName : function(fieldName,
							queryAliasName) {
						var blendingQueryModel = this.getBlendingDefinition()
								.getBlendingSourceByAlias(queryAliasName);
						var fieldByName;
						if (blendingQueryModel === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException(sap.firefly.XStringUtils
											.concatenate3(
													"No Blending source found for alias '",
													queryAliasName, "'!"));
						}
						fieldByName = blendingQueryModel
								.getFieldByName(fieldName);
						return this.newAttributeMappingDefinition(fieldByName,
								queryAliasName);
					},
					newAttributeMappingDefinitionByObject : function(field) {
						var queryAliasName = this.getBlendingDefinition()
								.getBlendingAliasByQueryModel(
										field.getContext().getQueryModel());
						return this.newAttributeMappingDefinition(field,
								queryAliasName);
					},
					releaseObject : function() {
						this.m_attributeMappings = sap.firefly.XObject
								.releaseIfNotNull(this.m_attributeMappings);
						this.m_attributeName = null;
						this.m_mappingDefinitionType = null;
						this.m_blendingDefinition = null;
						sap.firefly.BlendingAttributeMapping.$superclass.releaseObject
								.call(this);
					},
					removeAttributeMappingDefinitionAt : function(indexToRemove) {
						this.m_attributeMappings.removeAt(indexToRemove);
					},
					setAttributeName : function(attributeName) {
						this.m_attributeName = attributeName;
					},
					setIsLinkKey : function(isLinkKey) {
						this.m_isLinkKey = isLinkKey;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.BlendingDefinition",
				sap.firefly.XObject,
				{
					$statics : {
						create : function() {
							var blending = new sap.firefly.BlendingDefinition();
							blending.m_mappings = sap.firefly.XLinkedHashMapByString
									.create();
							blending.m_sources = sap.firefly.XLinkedHashMapByString
									.create();
							return blending;
						}
					},
					m_mappings : null,
					m_sources : null,
					m_queryModel : null,
					cloneBlendingDefinition : function() {
						var clone = sap.firefly.BlendingDefinition.create();
						var sourceIterator = this.m_sources.getIterator();
						var source;
						var mappingIterator;
						var mapping;
						var cloneMapping;
						while (sourceIterator.hasNext()) {
							source = sourceIterator.next();
							clone.addSource(source.cloneBlendingSource());
						}
						sourceIterator.releaseObject();
						mappingIterator = this.m_mappings.getIterator();
						while (mappingIterator.hasNext()) {
							mapping = mappingIterator.next();
							cloneMapping = mapping.cloneMapping();
							cloneMapping.setBlendingDefinition(clone);
							clone.addMapping(cloneMapping);
						}
						mappingIterator.releaseObject();
						return clone;
					},
					addSingleMemberSelectionByDimensionNameToSourceQueryByAlias : function(
							sourceQueryAlias, sourceDimensionName,
							sourceMemberName, comparisonOperator) {
						var sourceQuery = this
								.getBlendingSourceByAlias(sourceQueryAlias);
						var addSingleMemberFilterByDimensionName;
						if (sourceQuery === null) {
							throw sap.firefly.XException
									.createRuntimeException(sap.firefly.XStringUtils
											.concatenate3(
													"No Source Query for Alias '",
													sourceQueryAlias,
													"' was found!"));
						}
						addSingleMemberFilterByDimensionName = sourceQuery
								.getConvenienceCommands()
								.addSingleMemberFilterByDimensionName(
										sourceDimensionName, sourceMemberName,
										comparisonOperator);
						this.notifyQueryModel();
						return addSingleMemberFilterByDimensionName;
					},
					clone : function() {
						return this.cloneBlendingDefinition();
					},
					releaseObject : function() {
						this.m_mappings = sap.firefly.XObject
								.releaseIfNotNull(this.m_mappings);
						this.m_sources = sap.firefly.XObject
								.releaseIfNotNull(this.m_sources);
						this.m_queryModel = null;
						sap.firefly.BlendingDefinition.$superclass.releaseObject
								.call(this);
					},
					addMapping : function(mapping) {
						if (mapping === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Mapping is null");
						}
						this.m_mappings.put(mapping.getMemberName(), mapping);
						return this;
					},
					removeMappingByName : function(memberAliasName) {
						this.m_mappings.remove(memberAliasName);
						return this;
					},
					getMappings : function() {
						return this.m_mappings.getValuesAsReadOnlyList();
					},
					addSource : function(source) {
						var queryModel;
						if (source === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Source is null");
						}
						queryModel = source.getQueryModel();
						if (queryModel.supportsCubeBlending() === false) {
							throw sap.firefly.XException
									.createRuntimeException("The backend is not capable of blending!");
						}
						if (!queryModel.supportsCubeBlendingWithNSubqueries()
								&& (this.m_sources.size() >= sap.firefly.BlendingCapabilities
										.getMaxNumberOfBlendingQueries())) {
							throw sap.firefly.XException
									.createRuntimeException("Currently only 2 sources are allowed");
						}
						if (this.m_sources.containsKey(source
								.getQueryAliasName())) {
							throw sap.firefly.XException
									.createIllegalArgumentException(sap.firefly.XStringUtils
											.concatenate3("The query alias '",
													source.getQueryAliasName(),
													"' is not unique!"));
						}
						sap.firefly.BlendingValidation
								.isQueryModelValidForBlending(queryModel, null);
						this.m_sources.put(source.getQueryAliasName(), source);
						return this;
					},
					removeSourceByName : function(queryAliasName) {
						this.m_sources.remove(queryAliasName);
						return this;
					},
					getSources : function() {
						return this.m_sources.getValuesAsReadOnlyList();
					},
					newSource : function(queryModel, queryAliasName) {
						this.asserQueryAlias(queryAliasName);
						sap.firefly.BlendingValidation
								.isQueryModelValidForBlending(queryModel, null);
						return sap.firefly.BlendingSource.create(queryModel,
								queryAliasName);
					},
					addNewSource : function(queryModel, queryAliasName) {
						var newSource = this.newSource(queryModel,
								queryAliasName);
						this.addSource(newSource);
						return newSource;
					},
					newDimensionMapping : function(linkType, aliasName) {
						var dimensionMapping;
						this.assertMemberAlias(aliasName);
						dimensionMapping = sap.firefly.BlendingMapping.create(
								linkType, this);
						dimensionMapping.setMemberName(aliasName);
						return dimensionMapping;
					},
					addNewDimensionMapping : function(linkType, aliasName) {
						var dimensionMapping = this.newDimensionMapping(
								linkType, aliasName);
						this.addMapping(dimensionMapping);
						return dimensionMapping;
					},
					asserQueryAlias : function(queryAliasName) {
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(queryAliasName)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("The query alias must not be empty or null!");
						}
					},
					assertMemberAlias : function(memberAliasName) {
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(memberAliasName)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("The member alias must not be empty or null!");
						}
					},
					getBlendingAliasByQueryModel : function(queryModel) {
						var sourceIterator;
						var blendingSource;
						if (queryModel === null) {
							return null;
						}
						sourceIterator = this.getSources().getIterator();
						while (sourceIterator.hasNext()) {
							blendingSource = sourceIterator.next();
							if (blendingSource.getQueryModel() === queryModel) {
								sourceIterator.releaseObject();
								return blendingSource.getQueryAliasName();
							}
						}
						sourceIterator.releaseObject();
						return null;
					},
					getBlendingSourceByAlias : function(queryAliasName) {
						var blendingSource = this.m_sources
								.getByKey(queryAliasName);
						if (blendingSource === null) {
							return null;
						}
						return blendingSource.getQueryModel();
					},
					isEqualTo : function(other) {
						var xOther;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						xOther = other;
						if (this.getMappings().isEqualTo(xOther.getMappings()) === false) {
							return false;
						}
						if (this.getSources().isEqualTo(xOther.getSources()) === false) {
							return false;
						}
						return true;
					},
					notifyQueryModel : function() {
						var queryModel = this.getQueryModel();
						if (queryModel !== null) {
							queryModel.updateCubeBlendingMappings();
						}
					},
					getQueryModel : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_queryModel);
					},
					setQueryModel : function(queryModel) {
						this.m_queryModel = sap.firefly.XWeakReferenceUtil
								.getWeakRef(queryModel);
					},
					getMappingByAliasName : function(aliasName) {
						return this.m_mappings.getByKey(aliasName);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.BlendingMappingDefinition",
				sap.firefly.XObject,
				{
					$statics : {
						createDimensionMapping : function(dimensionName,
								queryAliasName) {
							var dimensionMappingDefinition = new sap.firefly.BlendingMappingDefinition();
							dimensionMappingDefinition
									.setup(
											queryAliasName,
											dimensionName,
											sap.firefly.BlendingMappingDefinitionType.DIMENSION);
							return dimensionMappingDefinition;
						},
						createAttributeMapping : function(attributeName,
								queryAliasName) {
							var dimensionMappingDefinition = new sap.firefly.BlendingMappingDefinition();
							dimensionMappingDefinition
									.setup(
											queryAliasName,
											attributeName,
											sap.firefly.BlendingMappingDefinitionType.ATTRIBUTE);
							return dimensionMappingDefinition;
						},
						createConstantMapping : function(memberKey,
								queryAliasName) {
							var dimensionMappingDefinition = new sap.firefly.BlendingMappingDefinition();
							dimensionMappingDefinition
									.setup(
											queryAliasName,
											memberKey,
											sap.firefly.BlendingMappingDefinitionType.CONSTANT);
							return dimensionMappingDefinition;
						}
					},
					m_mappingDefinitionType : null,
					m_queryAliasName : null,
					m_memberName : null,
					cloneMappingDefinition : function() {
						if (this.getMappingDefinitionType() === sap.firefly.BlendingMappingDefinitionType.ATTRIBUTE) {
							return sap.firefly.BlendingMappingDefinition
									.createAttributeMapping(this
											.getMemberName(), this
											.getQueryAliasName());
						}
						if (this.getMappingDefinitionType() === sap.firefly.BlendingMappingDefinitionType.CONSTANT) {
							return sap.firefly.BlendingMappingDefinition
									.createConstantMapping(
											this.getMemberName(), this
													.getQueryAliasName());
						}
						return sap.firefly.BlendingMappingDefinition
								.createDimensionMapping(this.getMemberName(),
										this.getQueryAliasName());
					},
					clone : function() {
						return this.cloneMappingDefinition();
					},
					setup : function(queryAliasName, memberName, mappingType) {
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(queryAliasName)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Query alias name is null");
						}
						if (sap.firefly.XStringUtils.isNullOrEmpty(memberName)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Member name is null");
						}
						this.m_mappingDefinitionType = mappingType;
						this.m_queryAliasName = queryAliasName;
						this.m_memberName = memberName;
					},
					releaseObject : function() {
						this.m_mappingDefinitionType = null;
						this.m_queryAliasName = null;
						this.m_memberName = null;
						sap.firefly.BlendingMappingDefinition.$superclass.releaseObject
								.call(this);
					},
					isEqualTo : function(other) {
						var otherGeneral;
						var xOther;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						otherGeneral = other;
						if (this.getMappingDefinitionType() !== otherGeneral
								.getMappingDefinitionType()) {
							return false;
						}
						xOther = other;
						if (sap.firefly.XString.isEqual(this.getMemberName(),
								xOther.getMemberName()) === false) {
							return false;
						}
						if (sap.firefly.XString.isEqual(this
								.getQueryAliasName(), xOther
								.getQueryAliasName()) === false) {
							return false;
						}
						return true;
					},
					getMappingDefinitionType : function() {
						return this.m_mappingDefinitionType;
					},
					getQueryAliasName : function() {
						return this.m_queryAliasName;
					},
					getMemberName : function() {
						return this.m_memberName;
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						sb.append(this.m_queryAliasName).append(".");
						sb.append(this.m_memberName);
						sb.append("(");
						sb.append(this.m_mappingDefinitionType.getName());
						sb.append(")");
						return sb.toString();
					}
				});
$Firefly.createClass("sap.firefly.ClusteringDbScan",
		sap.firefly.AbstractSpatialClustering, {
			$statics : {
				create : function() {
					var dbScan = new sap.firefly.ClusteringDbScan();
					dbScan.setupDbScan();
					return dbScan;
				}
			},
			m_eps : null,
			m_minPoints : null,
			setupDbScan : function() {
				sap.firefly.ClusteringDbScan.$superclass.setupClustering
						.call(this);
				this.m_eps = sap.firefly.XDoubleValue.create(0);
				this.m_minPoints = sap.firefly.XIntegerValue.create(0);
				this.m_parameters.put("EPS", this.m_eps);
				this.m_parameters.put("MinPoints", this.m_minPoints);
			},
			clone : function() {
				var clone = sap.firefly.ClusteringDbScan.create();
				clone.setActive(this.isActive());
				if (this.getClusterField() !== null) {
					clone.setClusterField(this.getClusterField());
				}
				clone.setEps(this.getEps());
				clone.setMinPoints(this.getMinPoints());
				return clone;
			},
			releaseObject : function() {
				this.m_eps = sap.firefly.XObject.releaseIfNotNull(this.m_eps);
				this.m_minPoints = sap.firefly.XObject
						.releaseIfNotNull(this.m_minPoints);
				sap.firefly.ClusteringDbScan.$superclass.releaseObject
						.call(this);
			},
			getEps : function() {
				return this.m_eps.getDoubleValue();
			},
			setEps : function(eps) {
				this.m_eps.setDoubleValue(eps);
			},
			getMinPoints : function() {
				return this.m_minPoints.getIntegerValue();
			},
			setMinPoints : function(minPoints) {
				this.m_minPoints.setIntegerValue(minPoints);
			},
			getClusterAlgorithm : function() {
				return sap.firefly.ClusterAlgorithm.DB_SCAN;
			}
		});
$Firefly
		.createClass("sap.firefly.ClusteringGrid",
				sap.firefly.AbstractSpatialClustering, {
					$statics : {
						create : function() {
							var grid = new sap.firefly.ClusteringGrid();
							grid.setupGrid();
							return grid;
						}
					},
					m_lowerBoundX : null,
					m_upperBoundX : null,
					m_lowerBoundY : null,
					m_upperBoundY : null,
					m_cellsX : null,
					m_cellsY : null,
					setupGrid : function() {
						sap.firefly.ClusteringGrid.$superclass.setupClustering
								.call(this);
						this.m_cellsX = sap.firefly.XIntegerValue.create(0);
						this.m_cellsY = sap.firefly.XIntegerValue.create(0);
						this.m_parameters.put("XCells", this.m_cellsX);
						this.m_parameters.put("YCells", this.m_cellsY);
					},
					clone : function() {
						var clone = sap.firefly.ClusteringGrid.create();
						clone.setActive(this.isActive());
						if (this.getClusterField() !== null) {
							clone.setClusterField(this.getClusterField());
						}
						clone.setCellsX(this.getCellsX());
						clone.setCellsY(this.getCellsY());
						if (this.m_lowerBoundX !== null) {
							clone.setLowerBoundX(this.getLowerBoundX());
						}
						if (this.m_upperBoundX !== null) {
							clone.setUpperBoundX(this.getUpperBoundX());
						}
						if (this.m_lowerBoundY !== null) {
							clone.setLowerBoundY(this.getLowerBoundY());
						}
						if (this.m_upperBoundY !== null) {
							clone.setUpperBoundY(this.getUpperBoundY());
						}
						return clone;
					},
					releaseObject : function() {
						this.m_lowerBoundX = sap.firefly.XObject
								.releaseIfNotNull(this.m_lowerBoundX);
						this.m_upperBoundX = sap.firefly.XObject
								.releaseIfNotNull(this.m_upperBoundX);
						this.m_lowerBoundY = sap.firefly.XObject
								.releaseIfNotNull(this.m_lowerBoundY);
						this.m_upperBoundY = sap.firefly.XObject
								.releaseIfNotNull(this.m_upperBoundY);
						this.m_cellsX = sap.firefly.XObject
								.releaseIfNotNull(this.m_cellsX);
						this.m_cellsY = sap.firefly.XObject
								.releaseIfNotNull(this.m_cellsY);
						sap.firefly.ClusteringGrid.$superclass.releaseObject
								.call(this);
					},
					getLowerBoundX : function() {
						if (this.m_lowerBoundX === null) {
							return 0;
						}
						return this.m_lowerBoundX.getDoubleValue();
					},
					setLowerBoundX : function(lowerBoundX) {
						if (this.m_lowerBoundX === null) {
							this.m_lowerBoundX = sap.firefly.XDoubleValue
									.create(lowerBoundX);
							this.m_parameters.put("XLowerBound",
									this.m_lowerBoundX);
						} else {
							this.m_lowerBoundX.setDoubleValue(lowerBoundX);
						}
					},
					getLowerBoundY : function() {
						if (this.m_lowerBoundY === null) {
							return 0;
						}
						return this.m_lowerBoundY.getDoubleValue();
					},
					setLowerBoundY : function(lowerBoundY) {
						if (this.m_lowerBoundY === null) {
							this.m_lowerBoundY = sap.firefly.XDoubleValue
									.create(lowerBoundY);
							this.m_parameters.put("YLowerBound",
									this.m_lowerBoundY);
						} else {
							this.m_lowerBoundY.setDoubleValue(lowerBoundY);
						}
					},
					getUpperBoundX : function() {
						if (this.m_upperBoundX === null) {
							return 0;
						}
						return this.m_upperBoundX.getDoubleValue();
					},
					setUpperBoundX : function(upperBoundX) {
						if (this.m_upperBoundX === null) {
							this.m_upperBoundX = sap.firefly.XDoubleValue
									.create(upperBoundX);
							this.m_parameters.put("XUpperBound",
									this.m_upperBoundX);
						} else {
							this.m_upperBoundX.setDoubleValue(upperBoundX);
						}
					},
					getUpperBoundY : function() {
						if (this.m_upperBoundY === null) {
							return 0;
						}
						return this.m_upperBoundY.getDoubleValue();
					},
					setUpperBoundY : function(upperBoundY) {
						if (this.m_upperBoundY === null) {
							this.m_upperBoundY = sap.firefly.XDoubleValue
									.create(upperBoundY);
							this.m_parameters.put("YUpperBound",
									this.m_upperBoundY);
						} else {
							this.m_upperBoundY.setDoubleValue(upperBoundY);
						}
					},
					getCellsX : function() {
						return this.m_cellsX.getIntegerValue();
					},
					setCellsX : function(cellsX) {
						this.m_cellsX.setIntegerValue(cellsX);
					},
					getCellsY : function() {
						return this.m_cellsY.getIntegerValue();
					},
					setCellsY : function(cellsY) {
						this.m_cellsY.setIntegerValue(cellsY);
					},
					getClusterAlgorithm : function() {
						return sap.firefly.ClusterAlgorithm.GRID;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ClusteringKmeans",
				sap.firefly.AbstractSpatialClustering,
				{
					$statics : {
						create : function() {
							var kMeans = new sap.firefly.ClusteringKmeans();
							kMeans.setupKMeans();
							return kMeans;
						}
					},
					m_clusters : null,
					m_maxIterations : null,
					m_threshold : null,
					m_init : null,
					setupKMeans : function() {
						sap.firefly.ClusteringKmeans.$superclass.setupClustering
								.call(this);
						this.m_clusters = sap.firefly.XIntegerValue.create(0);
						this.m_parameters.put("Clusters", this.m_clusters);
					},
					clone : function() {
						var clone = sap.firefly.ClusteringKmeans.create();
						clone.setActive(this.isActive());
						if (this.getClusterField() !== null) {
							clone.setClusterField(this.getClusterField());
						}
						clone.setClusters(this.getClusters());
						if (this.m_init !== null) {
							clone.setInit(this.getInit());
						}
						if (this.m_maxIterations !== null) {
							clone.setMaxIterations(this.getMaxIterations());
						}
						if (this.m_threshold !== null) {
							clone.setThreshold(this.getThreshold());
						}
						return clone;
					},
					releaseObject : function() {
						this.m_init = sap.firefly.XObject
								.releaseIfNotNull(this.m_init);
						this.m_clusters = sap.firefly.XObject
								.releaseIfNotNull(this.m_clusters);
						this.m_maxIterations = sap.firefly.XObject
								.releaseIfNotNull(this.m_maxIterations);
						this.m_threshold = sap.firefly.XObject
								.releaseIfNotNull(this.m_threshold);
						sap.firefly.ClusteringKmeans.$superclass.releaseObject
								.call(this);
					},
					getClusters : function() {
						return this.m_clusters.getIntegerValue();
					},
					setClusters : function(clusters) {
						this.m_clusters.setIntegerValue(clusters);
					},
					getMaxIterations : function() {
						if (this.m_maxIterations === null) {
							return 0;
						}
						return this.m_maxIterations.getIntegerValue();
					},
					setMaxIterations : function(maxIterations) {
						if (this.m_maxIterations === null) {
							this.m_maxIterations = sap.firefly.XIntegerValue
									.create(maxIterations);
							this.m_parameters.put("MaxIterations",
									this.m_maxIterations);
						} else {
							this.m_maxIterations.setIntegerValue(maxIterations);
						}
					},
					getThreshold : function() {
						if (this.m_threshold === null) {
							return 0;
						}
						return this.m_threshold.getDoubleValue();
					},
					setThreshold : function(threshold) {
						if (this.m_threshold === null) {
							this.m_threshold = sap.firefly.XDoubleValue
									.create(threshold);
							this.m_parameters
									.put("Threshold", this.m_threshold);
						} else {
							this.m_threshold.setDoubleValue(threshold);
						}
					},
					getInit : function() {
						if (this.m_init === null) {
							return null;
						}
						return this.m_init.getStringValue();
					},
					setInit : function(setValue) {
						if (this.m_init === null) {
							this.m_init = sap.firefly.XStringValue
									.create(setValue);
							this.m_parameters.put("Init", this.m_init);
						} else {
							this.m_init.setStringValue(setValue);
						}
					},
					getClusterAlgorithm : function() {
						return sap.firefly.ClusterAlgorithm.K_MEANS;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.BlendingConstantMapping",
				sap.firefly.XObject,
				{
					$statics : {
						createConstantMapping : function(memberKey,
								queryAliasName) {
							var constantMappingDefinition = new sap.firefly.BlendingConstantMapping();
							constantMappingDefinition
									.setup(
											queryAliasName,
											memberKey,
											sap.firefly.BlendingMappingDefinitionType.CONSTANT);
							return constantMappingDefinition;
						}
					},
					m_mappingDefinitionType : null,
					m_queryAliasName : null,
					m_valueType : null,
					m_memberKey : null,
					cloneMappingDefinition : function() {
						var clone = sap.firefly.BlendingConstantMapping
								.createConstantMapping(this.getMemberName(),
										this.getQueryAliasName());
						return clone;
					},
					clone : function() {
						return this.cloneMappingDefinition();
					},
					isEqualTo : function(other) {
						var otherGeneral;
						var xOther;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						otherGeneral = other;
						if (this.getMappingDefinitionType() !== otherGeneral
								.getMappingDefinitionType()) {
							return false;
						}
						xOther = other;
						if (sap.firefly.XString.isEqual(this.getMemberName(),
								xOther.getMemberName()) === false) {
							return false;
						}
						if (sap.firefly.XString.isEqual(this
								.getQueryAliasName(), xOther
								.getQueryAliasName()) === false) {
							return false;
						}
						if (this.getValueType() !== xOther.getValueType()) {
							return false;
						}
						return true;
					},
					setup : function(queryAliasName, memberKey, mappingType) {
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(queryAliasName)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Query Alias name is null!");
						}
						this.m_mappingDefinitionType = mappingType;
						this.m_queryAliasName = queryAliasName;
						this.m_memberKey = memberKey;
						this.m_valueType = sap.firefly.XValueType.STRING;
					},
					releaseObject : function() {
						this.m_mappingDefinitionType = null;
						this.m_queryAliasName = null;
						this.m_valueType = null;
						this.m_memberKey = null;
						sap.firefly.BlendingConstantMapping.$superclass.releaseObject
								.call(this);
					},
					getMappingDefinitionType : function() {
						return this.m_mappingDefinitionType;
					},
					getQueryAliasName : function() {
						return this.m_queryAliasName;
					},
					getMemberName : function() {
						return this.m_memberKey;
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						sb.append(this.m_queryAliasName).append(".");
						sb.append(this.m_memberKey);
						sb.append("(");
						sb.append(this.m_mappingDefinitionType.getName());
						sb.append(")");
						return sb.toString();
					},
					getValueType : function() {
						return this.m_valueType;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.BlendingMapping",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(linkType, blendingDefinition) {
							var mapping;
							if (linkType === null) {
								throw sap.firefly.XException
										.createIllegalArgumentException("Blending link type is null");
							}
							if (blendingDefinition === null) {
								throw sap.firefly.XException
										.createIllegalArgumentException("Blending definition is null");
							}
							mapping = new sap.firefly.BlendingMapping();
							mapping.setup(linkType, blendingDefinition);
							return mapping;
						}
					},
					m_attributeMappings : null,
					m_blendingDefinition : null,
					m_constantMappings : null,
					m_dimensionMappingDefinitions : null,
					m_isPreservingMembers : false,
					m_isReturningOriginKeys : false,
					m_linkType : null,
					m_mappingDefinitionType : null,
					m_memberName : null,
					addAttributeMapping : function(attributeMapping) {
						this.m_attributeMappings.add(attributeMapping);
						this.getBlendingDefinition().notifyQueryModel();
					},
					addConstantMapping : function(constantMapping) {
						this.m_constantMappings.add(constantMapping);
						this.getBlendingDefinition().notifyQueryModel();
					},
					addMappingDefinition : function(mappingDefinition) {
						if (mappingDefinition === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Mapping definition is null");
						}
						if (this.m_dimensionMappingDefinitions.size() >= this
								.getBlendingDefinition().getSources().size()) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Cannot add more dimension mappings than blending sources");
						}
						this.m_dimensionMappingDefinitions
								.add(mappingDefinition);
						this.getBlendingDefinition().notifyQueryModel();
						return this;
					},
					addNewAttributeMappingByName : function(attributeName,
							isLinkKey) {
						var attributeMapping = this.newAttributeMappingByName(
								attributeName, isLinkKey);
						this.addAttributeMapping(attributeMapping);
						this.getBlendingDefinition().notifyQueryModel();
						return attributeMapping;
					},
					addNewConstantMapping : function(memberKey, queryAliasName) {
						var newConstantMapping = this.newConstantMapping(
								memberKey, queryAliasName);
						this.addConstantMapping(newConstantMapping);
						this.getBlendingDefinition().notifyQueryModel();
						return newConstantMapping;
					},
					addNewDimensionMappingDefinition : function(dimension,
							queryAliasName) {
						var dimensionBlendingMappingDefinition = this
								.newDimensionMappingDefinition(dimension,
										queryAliasName);
						this
								.addMappingDefinition(dimensionBlendingMappingDefinition);
						this.getBlendingDefinition().notifyQueryModel();
						return dimensionBlendingMappingDefinition;
					},
					addNewDimensionMappingDefinitionByObject : function(
							dimension) {
						var dimensionMappingDefinition = this
								.newDimensionMappingDefinitionByObject(dimension);
						this.addMappingDefinition(dimensionMappingDefinition);
						this.getBlendingDefinition().notifyQueryModel();
						return dimensionMappingDefinition;
					},
					addNewDimensionMappingDefinitionByName : function(
							dimensionName, queryAliasName) {
						var dimensionMappingDefinition = this
								.newDimensionMappingDefinitionByName(
										dimensionName, queryAliasName);
						this.addMappingDefinition(dimensionMappingDefinition);
						this.getBlendingDefinition().notifyQueryModel();
						return dimensionMappingDefinition;
					},
					clone : function() {
						return this.cloneMapping();
					},
					cloneMapping : function() {
						var clone = sap.firefly.BlendingMapping.create(this
								.getLinkType(), this.getBlendingDefinition());
						var definitionIterator = this.getMappingDefinitions()
								.getIterator();
						var definition;
						var attributeMappingIterator;
						var attributeMapping;
						var constantMappingIterator;
						var constantMapping;
						while (definitionIterator.hasNext()) {
							definition = definitionIterator.next();
							clone.addMappingDefinition(definition
									.cloneMappingDefinition());
						}
						definitionIterator.releaseObject();
						attributeMappingIterator = this.getAttributeMappings()
								.getIterator();
						while (attributeMappingIterator.hasNext()) {
							attributeMapping = attributeMappingIterator.next();
							clone.addAttributeMapping(attributeMapping
									.cloneMapping());
						}
						attributeMappingIterator.releaseObject();
						constantMappingIterator = this.getConstantMappings()
								.getIterator();
						while (constantMappingIterator.hasNext()) {
							constantMapping = constantMappingIterator.next();
							clone.addConstantMapping(constantMapping
									.cloneMappingDefinition());
						}
						constantMappingIterator.releaseObject();
						clone
								.setIsPreservingMembers(this
										.isPreservingMembers());
						clone.setIsReturningOriginKeys(this
								.isReturningOriginKeys());
						clone.setMemberName(this.getMemberName());
						return clone;
					},
					isEqualTo : function(other) {
						var otherGeneral;
						var xOther;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						otherGeneral = other;
						if (this.getMappingDefinitionType() !== otherGeneral
								.getMappingDefinitionType()) {
							return false;
						}
						xOther = other;
						if (sap.firefly.XString.isEqual(this.getMemberName(),
								xOther.getMemberName()) === false) {
							return false;
						}
						if (this.getMappingDefinitions().isEqualTo(
								xOther.getMappingDefinitions()) === false) {
							return false;
						}
						if (this.getConstantMappings().isEqualTo(
								xOther.getConstantMappings()) === false) {
							return false;
						}
						if (this.getAttributeMappings().isEqualTo(
								xOther.getAttributeMappings()) === false) {
							return false;
						}
						return true;
					},
					getAttributeMappings : function() {
						return this.m_attributeMappings;
					},
					getBlendingDefinition : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_blendingDefinition);
					},
					getConstantMappings : function() {
						return this.m_constantMappings;
					},
					getLinkType : function() {
						return this.m_linkType;
					},
					getMappingDefinitions : function() {
						return this.m_dimensionMappingDefinitions;
					},
					getMappingDefinitionType : function() {
						return this.m_mappingDefinitionType;
					},
					getMemberName : function() {
						return this.m_memberName;
					},
					isPreservingMembers : function() {
						return this.m_isPreservingMembers;
					},
					newAttributeMappingByName : function(attributeName,
							isLinkKey) {
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(attributeName)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("The attribute name must not be empty!");
						}
						return sap.firefly.BlendingAttributeMapping.create(
								attributeName, isLinkKey, this
										.getBlendingDefinition());
					},
					newConstantMapping : function(memberKey, queryAliasName) {
						var blendingQueryModel = this.getBlendingDefinition()
								.getBlendingSourceByAlias(queryAliasName);
						if (blendingQueryModel === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException(sap.firefly.XStringUtils
											.concatenate3(
													"No Blending source found for alias '",
													queryAliasName, "'!"));
						}
						return sap.firefly.BlendingConstantMapping
								.createConstantMapping(memberKey,
										queryAliasName);
					},
					newDimensionMappingDefinitionByObject : function(dimension) {
						var queryAliasName;
						if (dimension === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("The dimension must not be null!");
						}
						queryAliasName = this.getBlendingDefinition()
								.getBlendingAliasByQueryModel(
										dimension.getQueryModel());
						return this.newDimensionMappingDefinition(dimension,
								queryAliasName);
					},
					newDimensionMappingDefinition : function(dimension,
							queryAliasName) {
						if (dimension === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("The dimension must not be null!");
						}
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(queryAliasName)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("The query alias name must not be null or empty!");
						}
						sap.firefly.BlendingValidation
								.isDimensionValidForBlending(dimension, null,
										false);
						return sap.firefly.BlendingMappingDefinition
								.createDimensionMapping(dimension.getName(),
										queryAliasName);
					},
					newDimensionMappingDefinitionByName : function(
							dimensionName, queryAliasName) {
						var blendingQueryModel = this.getBlendingDefinition()
								.getBlendingSourceByAlias(queryAliasName);
						var dimension;
						if (blendingQueryModel === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException(sap.firefly.XStringUtils
											.concatenate3(
													"No Blending source found for alias '",
													queryAliasName, "'!"));
						}
						dimension = blendingQueryModel
								.getDimensionByName(dimensionName);
						return this.newDimensionMappingDefinition(dimension,
								queryAliasName);
					},
					removeAttributeMappingAt : function(indexToRemove) {
						this.m_attributeMappings.removeAt(indexToRemove);
						this.getBlendingDefinition().notifyQueryModel();
					},
					removeMappingDefinitionAt : function(indexToRemove) {
						this.m_dimensionMappingDefinitions
								.removeAt(indexToRemove);
						this.getBlendingDefinition().notifyQueryModel();
						return this;
					},
					setIsPreservingMembers : function(isPreserving) {
						if (this.m_isPreservingMembers !== isPreserving) {
							this.m_isPreservingMembers = isPreserving;
							this.getBlendingDefinition().notifyQueryModel();
						}
					},
					setMemberName : function(memberName) {
						if (sap.firefly.XString.isEqual(this.m_memberName,
								memberName) === false) {
							this.m_memberName = memberName;
							this.getBlendingDefinition().notifyQueryModel();
						}
					},
					setup : function(linkType, blendingDefinition) {
						this.m_linkType = linkType;
						this.m_mappingDefinitionType = sap.firefly.BlendingMappingDefinitionType.DIMENSION;
						this.m_dimensionMappingDefinitions = sap.firefly.XList
								.create();
						this.m_attributeMappings = sap.firefly.XList.create();
						this.m_constantMappings = sap.firefly.XList.create();
						this.setBlendingDefinition(blendingDefinition);
						this.m_isPreservingMembers = false;
						this.m_isReturningOriginKeys = true;
					},
					releaseObject : function() {
						this.m_dimensionMappingDefinitions = sap.firefly.XObject
								.releaseIfNotNull(this.m_dimensionMappingDefinitions);
						this.m_attributeMappings = sap.firefly.XObject
								.releaseIfNotNull(this.m_attributeMappings);
						this.m_constantMappings = sap.firefly.XObject
								.releaseIfNotNull(this.m_constantMappings);
						this.m_linkType = null;
						this.m_mappingDefinitionType = null;
						this.m_memberName = null;
						this.m_blendingDefinition = null;
						sap.firefly.BlendingMapping.$superclass.releaseObject
								.call(this);
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						if (this.m_dimensionMappingDefinitions !== null) {
							sb.append(this.m_dimensionMappingDefinitions
									.toString());
						}
						sb.append("\n\tLinked with: ").append(
								this.m_linkType.getName());
						sb.append("\n\tDefinition Type: ").append(
								this.m_mappingDefinitionType.getName());
						sb.append("\n\tMember Alias: ").append(
								this.m_memberName);
						if (this.m_linkType === sap.firefly.BlendingLinkType.NONE) {
							sb.append("\n\tIs Preserving Members: ");
							sb.appendBoolean(this.m_isPreservingMembers);
							sb.append("\n\tIs Returning Folding Keys:");
							sb.appendBoolean(this.m_isReturningOriginKeys);
						}
						return sb.toString();
					},
					isReturningOriginKeys : function() {
						return this.m_isReturningOriginKeys;
					},
					setIsReturningOriginKeys : function(isReturningOriginKeys) {
						if (this.m_isReturningOriginKeys !== isReturningOriginKeys) {
							this.m_isReturningOriginKeys = isReturningOriginKeys;
							this.getBlendingDefinition().notifyQueryModel();
						}
					},
					setBlendingDefinition : function(blendingDefinition) {
						this.m_blendingDefinition = sap.firefly.XWeakReferenceUtil
								.getWeakRef(blendingDefinition);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XCommandFollowUpType",
				sap.firefly.XConstant,
				{
					$statics : {
						ALWAYS : null,
						SUCCESS : null,
						ERROR : null,
						s_instances : null,
						staticSetup : function() {
							sap.firefly.XCommandFollowUpType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.XCommandFollowUpType.ALWAYS = sap.firefly.XCommandFollowUpType
									.create("ALWAYS");
							sap.firefly.XCommandFollowUpType.SUCCESS = sap.firefly.XCommandFollowUpType
									.create("SUCCESS");
							sap.firefly.XCommandFollowUpType.ERROR = sap.firefly.XCommandFollowUpType
									.create("ERROR");
						},
						create : function(name) {
							var newConstant = new sap.firefly.XCommandFollowUpType();
							newConstant.setName(name);
							sap.firefly.XCommandFollowUpType.s_instances.put(
									name, newConstant);
							return newConstant;
						},
						lookup : function(name) {
							var type = sap.firefly.XCommandFollowUpType.s_instances
									.getByKey(name);
							return type;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XCommandType",
				sap.firefly.XConstant,
				{
					$statics : {
						CUSTOM : null,
						ARRAY_CONCURRENT : null,
						ARRAY_BATCH : null,
						s_instances : null,
						staticSetup : function() {
							sap.firefly.XCommandType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.XCommandType.CUSTOM = sap.firefly.XCommandType
									.create("CUSTOM");
							sap.firefly.XCommandType.ARRAY_CONCURRENT = sap.firefly.XCommandType
									.create("ARRAY_CONCURRENT");
							sap.firefly.XCommandType.ARRAY_BATCH = sap.firefly.XCommandType
									.create("ARRAY_BATCH");
						},
						create : function(name) {
							var newConstant = new sap.firefly.XCommandType();
							newConstant.setName(name);
							sap.firefly.XCommandType.s_instances.put(name,
									newConstant);
							return newConstant;
						},
						lookup : function(name) {
							var type = sap.firefly.XCommandType.s_instances
									.getByKey(name);
							return type;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningContextType",
				sap.firefly.XConstant,
				{
					$statics : {
						DATA_AREA : null,
						PLANNING_MODEL : null,
						staticSetup : function() {
							sap.firefly.PlanningContextType.DATA_AREA = sap.firefly.PlanningContextType
									.create("DATA_AREA");
							sap.firefly.PlanningContextType.PLANNING_MODEL = sap.firefly.PlanningContextType
									.create("PLANNING_MODEL");
						},
						create : function(name) {
							var object = new sap.firefly.PlanningContextType();
							object.setupConstant(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningMode",
				sap.firefly.XConstant,
				{
					$statics : {
						FOR_PRIVATE_VERSIONS_ONLY : null,
						DISABLE_PLANNING : null,
						FORCE_PLANNING : null,
						SERVER_DEFAULT : null,
						staticSetup : function() {
							sap.firefly.PlanningMode.FOR_PRIVATE_VERSIONS_ONLY = sap.firefly.PlanningMode
									.create("ForPrivateVersionsOnly");
							sap.firefly.PlanningMode.DISABLE_PLANNING = sap.firefly.PlanningMode
									.create("DisablePlanning");
							sap.firefly.PlanningMode.FORCE_PLANNING = sap.firefly.PlanningMode
									.create("ForcePlanning");
							sap.firefly.PlanningMode.SERVER_DEFAULT = sap.firefly.PlanningMode
									.create("ServerDefault");
						},
						create : function(name) {
							var object = new sap.firefly.PlanningMode();
							object.setupConstant(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningVersionRestrictionType",
				sap.firefly.XConstant,
				{
					$statics : {
						NONE : null,
						ONLY_PRIVATE_VERSIONS : null,
						SERVER_DEFAULT : null,
						staticSetup : function() {
							sap.firefly.PlanningVersionRestrictionType.NONE = sap.firefly.PlanningVersionRestrictionType
									.create("NONE");
							sap.firefly.PlanningVersionRestrictionType.ONLY_PRIVATE_VERSIONS = sap.firefly.PlanningVersionRestrictionType
									.create("OnlyPrivateVersion");
							sap.firefly.PlanningVersionRestrictionType.SERVER_DEFAULT = sap.firefly.PlanningVersionRestrictionType
									.create("ServerDefault");
						},
						create : function(name) {
							var object = new sap.firefly.PlanningVersionRestrictionType();
							object.setupConstant(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningVersionSettingsMode",
				sap.firefly.XConstant,
				{
					$statics : {
						SERVER_DEFAULT : null,
						QUERY_SERVICE : null,
						PLANNING_SERVICE : null,
						staticSetup : function() {
							sap.firefly.PlanningVersionSettingsMode.SERVER_DEFAULT = sap.firefly.PlanningVersionSettingsMode
									.create("ServerDefault");
							sap.firefly.PlanningVersionSettingsMode.QUERY_SERVICE = sap.firefly.PlanningVersionSettingsMode
									.create("QueryService");
							sap.firefly.PlanningVersionSettingsMode.PLANNING_SERVICE = sap.firefly.PlanningVersionSettingsMode
									.create("PlanningService");
						},
						create : function(name) {
							var object = new sap.firefly.PlanningVersionSettingsMode();
							object.setupConstant(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningContextCommandType",
				sap.firefly.XConstant,
				{
					$statics : {
						PUBLISH : null,
						SAVE : null,
						BACKUP : null,
						RESET : null,
						REFRESH : null,
						CLOSE : null,
						HARD_DELETE : null,
						staticSetup : function() {
							sap.firefly.PlanningContextCommandType.PUBLISH = sap.firefly.PlanningContextCommandType
									.create("PUBLISH", true);
							sap.firefly.PlanningContextCommandType.SAVE = sap.firefly.PlanningContextCommandType
									.create("SAVE", false);
							sap.firefly.PlanningContextCommandType.BACKUP = sap.firefly.PlanningContextCommandType
									.create("BACKUP", true);
							sap.firefly.PlanningContextCommandType.RESET = sap.firefly.PlanningContextCommandType
									.create("RESET", true);
							sap.firefly.PlanningContextCommandType.REFRESH = sap.firefly.PlanningContextCommandType
									.create("REFRESH", true);
							sap.firefly.PlanningContextCommandType.CLOSE = sap.firefly.PlanningContextCommandType
									.create("CLOSE", true);
							sap.firefly.PlanningContextCommandType.HARD_DELETE = sap.firefly.PlanningContextCommandType
									.create("HARD_DELETE", true);
						},
						create : function(name, isInvalidatingResultSet) {
							var object = new sap.firefly.PlanningContextCommandType();
							object.setupConstant(name);
							object
									.setInvalidatingResultSet(isInvalidatingResultSet);
							return object;
						}
					},
					m_isInvalidatingResultSet : false,
					isInvalidatingResultSet : function() {
						return this.m_isInvalidatingResultSet;
					},
					setInvalidatingResultSet : function(isInvalidatingResultSet) {
						this.m_isInvalidatingResultSet = isInvalidatingResultSet;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.CellLockingType",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						ALL_CONTEXTS : null,
						LOCAL_CONTEXT : null,
						OFF : null,
						DEFAULT_SETTING_BACKEND : null,
						staticSetup : function() {
							sap.firefly.CellLockingType.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.CellLockingType.ALL_CONTEXTS = sap.firefly.CellLockingType
									.create("ALL_CONTEXTS");
							sap.firefly.CellLockingType.LOCAL_CONTEXT = sap.firefly.CellLockingType
									.create("LOCAL_CONTEXT");
							sap.firefly.CellLockingType.OFF = sap.firefly.CellLockingType
									.create("OFF");
							sap.firefly.CellLockingType.DEFAULT_SETTING_BACKEND = sap.firefly.CellLockingType
									.create("DEFAULT_SETTING_BACKEND");
						},
						create : function(name) {
							var object = new sap.firefly.CellLockingType();
							object.setupConstant(name);
							sap.firefly.CellLockingType.s_all.put(object);
							return object;
						},
						lookup : function(name) {
							return sap.firefly.CellLockingType.s_all
									.getByKey(name);
						},
						lookupByBWName : function(bwName) {
							if (sap.firefly.XStringUtils.isNullOrEmpty(bwName)) {
								return sap.firefly.CellLockingType.DEFAULT_SETTING_BACKEND;
							}
							if (sap.firefly.XString.isEqual("X", bwName)) {
								return sap.firefly.CellLockingType.ALL_CONTEXTS;
							}
							if (sap.firefly.XString.isEqual("L", bwName)) {
								return sap.firefly.CellLockingType.LOCAL_CONTEXT;
							}
							if (sap.firefly.XString.isEqual("#", bwName)) {
								return sap.firefly.CellLockingType.OFF;
							}
							return sap.firefly.CellLockingType.DEFAULT_SETTING_BACKEND;
						},
						lookupWithDefault : function(name, defaultValue) {
							var result = sap.firefly.CellLockingType.s_all
									.getByKey(name);
							if (result === null) {
								return defaultValue;
							}
							return result;
						}
					},
					toBwName : function() {
						if (this === sap.firefly.CellLockingType.ALL_CONTEXTS) {
							return "X";
						}
						if (this === sap.firefly.CellLockingType.LOCAL_CONTEXT) {
							return "L";
						}
						if (this === sap.firefly.CellLockingType.OFF) {
							return "#";
						}
						if (this === sap.firefly.CellLockingType.DEFAULT_SETTING_BACKEND) {
							return "";
						}
						throw sap.firefly.XException
								.createRuntimeException("illegal cell locking type");
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningSequenceStepType",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						SERVICE : null,
						MANUAL_ENTRY : null,
						staticSetup : function() {
							sap.firefly.PlanningSequenceStepType.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.PlanningSequenceStepType.SERVICE = sap.firefly.PlanningSequenceStepType
									.create("Service");
							sap.firefly.PlanningSequenceStepType.MANUAL_ENTRY = sap.firefly.PlanningSequenceStepType
									.create("ManualEntry");
						},
						create : function(name) {
							var object = new sap.firefly.PlanningSequenceStepType();
							object.setupConstant(name);
							sap.firefly.PlanningSequenceStepType.s_all
									.put(object);
							return object;
						},
						lookup : function(name) {
							return sap.firefly.PlanningSequenceStepType.s_all
									.getByKey(name);
						},
						lookupWithDefault : function(name, defaultValue) {
							var result = sap.firefly.PlanningSequenceStepType.s_all
									.getByKey(name);
							if (result === null) {
								return defaultValue;
							}
							return result;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningModelBehaviour",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						STANDARD : null,
						CREATE_DEFAULT_VERSION : null,
						ENFORCE_NO_VERSION : null,
						ENFORCE_SINGLE_VERSION : null,
						ENFORCE_NO_VERSION_HARD_DELETE : null,
						staticSetup : function() {
							sap.firefly.PlanningModelBehaviour.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.PlanningModelBehaviour.STANDARD = sap.firefly.PlanningModelBehaviour
									.create("STANDARD");
							sap.firefly.PlanningModelBehaviour.CREATE_DEFAULT_VERSION = sap.firefly.PlanningModelBehaviour
									.create("CREATE_DEFAULT_VERSION");
							sap.firefly.PlanningModelBehaviour.ENFORCE_NO_VERSION = sap.firefly.PlanningModelBehaviour
									.create("ENFORCE_NO_VERSION");
							sap.firefly.PlanningModelBehaviour.ENFORCE_SINGLE_VERSION = sap.firefly.PlanningModelBehaviour
									.create("ENFORCE_SINGLE_VERSION");
							sap.firefly.PlanningModelBehaviour.ENFORCE_NO_VERSION_HARD_DELETE = sap.firefly.PlanningModelBehaviour
									.create("ENFORCE_NO_VERSION_HARD_DELETE");
						},
						create : function(name) {
							var object = new sap.firefly.PlanningModelBehaviour();
							object.setupConstant(name);
							sap.firefly.PlanningModelBehaviour.s_all
									.put(object);
							return object;
						},
						lookup : function(name) {
							return sap.firefly.PlanningModelBehaviour.s_all
									.getByKey(name);
						},
						lookupWithDefault : function(name, defaultValue) {
							var result = sap.firefly.PlanningModelBehaviour.s_all
									.getByKey(name);
							if (result === null) {
								return defaultValue;
							}
							return result;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningPersistenceType",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						DEFAULT : null,
						ALWAYS : null,
						NON_PUBLISH_CONTAINERS : null,
						NEVER : null,
						AUTO : null,
						staticSetup : function() {
							sap.firefly.PlanningPersistenceType.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.PlanningPersistenceType.DEFAULT = sap.firefly.PlanningPersistenceType
									.create("default");
							sap.firefly.PlanningPersistenceType.ALWAYS = sap.firefly.PlanningPersistenceType
									.create("always");
							sap.firefly.PlanningPersistenceType.NON_PUBLISH_CONTAINERS = sap.firefly.PlanningPersistenceType
									.create("non_publish_containers");
							sap.firefly.PlanningPersistenceType.NEVER = sap.firefly.PlanningPersistenceType
									.create("never");
							sap.firefly.PlanningPersistenceType.AUTO = sap.firefly.PlanningPersistenceType
									.create("auto");
						},
						create : function(name) {
							var object = new sap.firefly.PlanningPersistenceType();
							object.setupConstant(name);
							sap.firefly.PlanningPersistenceType.s_all
									.put(object);
							return object;
						},
						lookup : function(name) {
							return sap.firefly.PlanningPersistenceType.s_all
									.getByKey(name);
						},
						lookupWithDefault : function(name, defaultValue) {
							var result = sap.firefly.PlanningPersistenceType.s_all
									.getByKey(name);
							if (result === null) {
								return defaultValue;
							}
							return result;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningPrivilege",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						READ : null,
						WRITE : null,
						PUBLISH : null,
						OWNER : null,
						staticSetup : function() {
							sap.firefly.PlanningPrivilege.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.PlanningPrivilege.READ = sap.firefly.PlanningPrivilege
									.create("read");
							sap.firefly.PlanningPrivilege.WRITE = sap.firefly.PlanningPrivilege
									.create("write");
							sap.firefly.PlanningPrivilege.PUBLISH = sap.firefly.PlanningPrivilege
									.create("publish");
							sap.firefly.PlanningPrivilege.OWNER = sap.firefly.PlanningPrivilege
									.create("owner");
						},
						create : function(name) {
							var object = new sap.firefly.PlanningPrivilege();
							object.setupConstant(name);
							sap.firefly.PlanningPrivilege.s_all.put(object);
							return object;
						},
						lookup : function(name) {
							return sap.firefly.PlanningPrivilege.s_all
									.getByKey(name);
						},
						lookupWithDefault : function(name, defaultValue) {
							var result = sap.firefly.PlanningPrivilege.s_all
									.getByKey(name);
							if (result === null) {
								return defaultValue;
							}
							return result;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningPrivilegeState",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						NEW : null,
						GRANTED : null,
						TO_BE_GRANTED : null,
						TO_BE_REVOKED : null,
						staticSetup : function() {
							sap.firefly.PlanningPrivilegeState.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.PlanningPrivilegeState.NEW = sap.firefly.PlanningPrivilegeState
									.create("new");
							sap.firefly.PlanningPrivilegeState.GRANTED = sap.firefly.PlanningPrivilegeState
									.create("granted");
							sap.firefly.PlanningPrivilegeState.TO_BE_GRANTED = sap.firefly.PlanningPrivilegeState
									.create("to_be_granted");
							sap.firefly.PlanningPrivilegeState.TO_BE_REVOKED = sap.firefly.PlanningPrivilegeState
									.create("to_be_revoked");
						},
						create : function(name) {
							var object = new sap.firefly.PlanningPrivilegeState();
							object.setupConstant(name);
							sap.firefly.PlanningPrivilegeState.s_all
									.put(object);
							return object;
						},
						lookup : function(name) {
							return sap.firefly.PlanningPrivilegeState.s_all
									.getByKey(name);
						},
						lookupWithDefault : function(name, defaultValue) {
							var result = sap.firefly.PlanningPrivilegeState.s_all
									.getByKey(name);
							if (result === null) {
								return defaultValue;
							}
							return result;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningVersionState",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						CHANGED : null,
						UNCHANGED : null,
						CLEAN : null,
						DIRTY : null,
						RECOVERED : null,
						SLEEPING : null,
						staticSetup : function() {
							sap.firefly.PlanningVersionState.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.PlanningVersionState.CHANGED = sap.firefly.PlanningVersionState
									.create("changed", true);
							sap.firefly.PlanningVersionState.UNCHANGED = sap.firefly.PlanningVersionState
									.create("unchanged", true);
							sap.firefly.PlanningVersionState.CLEAN = sap.firefly.PlanningVersionState
									.create("clean", false);
							sap.firefly.PlanningVersionState.DIRTY = sap.firefly.PlanningVersionState
									.create("dirty", false);
							sap.firefly.PlanningVersionState.RECOVERED = sap.firefly.PlanningVersionState
									.create("recovered", false);
							sap.firefly.PlanningVersionState.SLEEPING = sap.firefly.PlanningVersionState
									.create("sleeping", false);
						},
						create : function(name, isActive) {
							var object = new sap.firefly.PlanningVersionState();
							object.setupConstant(name);
							object.m_active = isActive;
							sap.firefly.PlanningVersionState.s_all.put(object);
							return object;
						},
						lookup : function(name) {
							return sap.firefly.PlanningVersionState.s_all
									.getByKey(name);
						}
					},
					m_active : false,
					isActive : function() {
						return this.m_active;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.CloseModeType",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						BACKUP : null,
						SAVE : null,
						NONE : null,
						KILL_ACTION_SEQUENCE : null,
						DISCARD : null,
						KILL_ACTION_SEQUENCE_AND_DISCARD : null,
						staticSetup : function() {
							sap.firefly.CloseModeType.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.CloseModeType.BACKUP = sap.firefly.CloseModeType
									.create("BACKUP", false, false);
							sap.firefly.CloseModeType.SAVE = sap.firefly.CloseModeType
									.create("SAVE", false, false);
							sap.firefly.CloseModeType.NONE = sap.firefly.CloseModeType
									.create("NONE", true, false);
							sap.firefly.CloseModeType.KILL_ACTION_SEQUENCE = sap.firefly.CloseModeType
									.create("KILL_ACTION_SEQUENCE", true, true);
							sap.firefly.CloseModeType.DISCARD = sap.firefly.CloseModeType
									.create("DISCARD", false, false);
							sap.firefly.CloseModeType.KILL_ACTION_SEQUENCE_AND_DISCARD = sap.firefly.CloseModeType
									.create("KILL_ACTION_SEQUENCE_AND_DISCARD",
											false, true);
						},
						create : function(name, onlyClient, killActionSequence) {
							var object = new sap.firefly.CloseModeType();
							object.setupConstant(name);
							object.m_onlyClient = onlyClient;
							object.m_killActionSequence = killActionSequence;
							sap.firefly.CloseModeType.s_all.put(object);
							return object;
						},
						lookup : function(name) {
							return sap.firefly.CloseModeType.s_all
									.getByKey(name);
						},
						lookupWithDefault : function(name, defaultValue) {
							var result = sap.firefly.CloseModeType.s_all
									.getByKey(name);
							if (result === null) {
								return defaultValue;
							}
							return result;
						}
					},
					m_onlyClient : false,
					m_killActionSequence : false,
					isOnlyClient : function() {
						return this.m_onlyClient;
					},
					isWithKillActionSequence : function() {
						return this.m_killActionSequence;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.RestoreBackupType",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						RESTORE_TRUE : null,
						RESTORE_FALSE : null,
						NONE : null,
						staticSetup : function() {
							sap.firefly.RestoreBackupType.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.RestoreBackupType.RESTORE_TRUE = sap.firefly.RestoreBackupType
									.create("TRUE");
							sap.firefly.RestoreBackupType.RESTORE_FALSE = sap.firefly.RestoreBackupType
									.create("FALSE");
							sap.firefly.RestoreBackupType.NONE = sap.firefly.RestoreBackupType
									.create("NONE");
						},
						create : function(name) {
							var object = new sap.firefly.RestoreBackupType();
							object.setupConstant(name);
							sap.firefly.RestoreBackupType.s_all.put(object);
							return object;
						},
						lookup : function(name) {
							return sap.firefly.RestoreBackupType.s_all
									.getByKey(name);
						},
						lookupWithDefault : function(name, defaultValue) {
							var result = sap.firefly.RestoreBackupType.s_all
									.getByKey(name);
							if (result === null) {
								return defaultValue;
							}
							return result;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.StartActionSequenceModeType",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						REPLACE_SEQUENCE : null,
						NONE : null,
						staticSetup : function() {
							sap.firefly.StartActionSequenceModeType.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.StartActionSequenceModeType.REPLACE_SEQUENCE = sap.firefly.StartActionSequenceModeType
									.create("REPLACE_SEQUENCE");
							sap.firefly.StartActionSequenceModeType.NONE = sap.firefly.StartActionSequenceModeType
									.create("NONE");
						},
						create : function(name) {
							var object = new sap.firefly.StartActionSequenceModeType();
							object.setupConstant(name);
							sap.firefly.StartActionSequenceModeType.s_all
									.put(object);
							return object;
						},
						lookup : function(name) {
							return sap.firefly.StartActionSequenceModeType.s_all
									.getByKey(name);
						},
						lookupWithDefault : function(name, defaultValue) {
							var result = sap.firefly.StartActionSequenceModeType.s_all
									.getByKey(name);
							if (result === null) {
								return defaultValue;
							}
							return result;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.BlendingLinkType",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						NONE : null,
						COEXIST : null,
						PRIMARY : null,
						ALL_DATA : null,
						INTERSECT : null,
						staticSetup : function() {
							sap.firefly.BlendingLinkType.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.BlendingLinkType.NONE = sap.firefly.BlendingLinkType
									.create("None");
							sap.firefly.BlendingLinkType.COEXIST = sap.firefly.BlendingLinkType
									.create("Coexist");
							sap.firefly.BlendingLinkType.PRIMARY = sap.firefly.BlendingLinkType
									.create("Primary");
							sap.firefly.BlendingLinkType.ALL_DATA = sap.firefly.BlendingLinkType
									.create("AllData");
							sap.firefly.BlendingLinkType.INTERSECT = sap.firefly.BlendingLinkType
									.create("Intersect");
						},
						create : function(name) {
							var newConstant = new sap.firefly.BlendingLinkType();
							newConstant.setName(name);
							sap.firefly.BlendingLinkType.s_all.put(newConstant);
							return newConstant;
						},
						lookup : function(name) {
							return sap.firefly.BlendingLinkType.s_all
									.getByKey(name);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.BlendingMappingDefinitionType",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						DIMENSION : null,
						ATTRIBUTE : null,
						CONSTANT : null,
						staticSetup : function() {
							sap.firefly.BlendingMappingDefinitionType.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.BlendingMappingDefinitionType.DIMENSION = sap.firefly.BlendingMappingDefinitionType
									.create("Dimension");
							sap.firefly.BlendingMappingDefinitionType.ATTRIBUTE = sap.firefly.BlendingMappingDefinitionType
									.create("Attribute");
							sap.firefly.BlendingMappingDefinitionType.CONSTANT = sap.firefly.BlendingMappingDefinitionType
									.create("Constant");
						},
						create : function(name) {
							var newConstant = new sap.firefly.BlendingMappingDefinitionType();
							newConstant.setName(name);
							sap.firefly.BlendingMappingDefinitionType.s_all
									.put(newConstant);
							return newConstant;
						},
						lookup : function(name) {
							return sap.firefly.BlendingMappingDefinitionType.s_all
									.getByKey(name);
						},
						lookupWithDefault : function(name, defaultValue) {
							var mode = sap.firefly.BlendingMappingDefinitionType
									.lookup(name);
							if (mode === null) {
								return defaultValue;
							}
							return mode;
						}
					}
				});
$Firefly.createClass("sap.firefly.ActionChoice", sap.firefly.XConstant,
		{
			$statics : {
				OFF : null,
				ONCE : null,
				ON : null,
				staticSetup : function() {
					sap.firefly.ActionChoice.OFF = sap.firefly.ActionChoice
							.create("Off");
					sap.firefly.ActionChoice.ONCE = sap.firefly.ActionChoice
							.create("Once");
					sap.firefly.ActionChoice.ON = sap.firefly.ActionChoice
							.create("On");
				},
				create : function(name) {
					var drillState = new sap.firefly.ActionChoice();
					drillState.setName(name);
					return drillState;
				}
			}
		});
$Firefly
		.createClass(
				"sap.firefly.AggregationType",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						AVERAGE : null,
						COUNT : null,
						COUNT_DISTINCT : null,
						FIRST : null,
						LAST : null,
						MAX : null,
						MIN : null,
						RANK : null,
						RANK_DENSE : null,
						RANK_OLYMPIC : null,
						RANK_PERCENTILE : null,
						RANK_PERCENT : null,
						SUM : null,
						STANDARD_DEVIATION : null,
						VARIANCE : null,
						NOP_NULL : null,
						NOP_NULL_ZERO : null,
						AVERAGE_NULL : null,
						AVERAGE_NULL_ZERO : null,
						COUNT_NULL : null,
						COUNT_NULL_ZERO : null,
						staticSetup : function() {
							sap.firefly.AggregationType.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.AggregationType.AVERAGE = sap.firefly.AggregationType
									.create("AVERAGE");
							sap.firefly.AggregationType.COUNT = sap.firefly.AggregationType
									.create("COUNT");
							sap.firefly.AggregationType.COUNT_DISTINCT = sap.firefly.AggregationType
									.create("COUNT_DISTINCT");
							sap.firefly.AggregationType.FIRST = sap.firefly.AggregationType
									.create("FIRST");
							sap.firefly.AggregationType.LAST = sap.firefly.AggregationType
									.create("LAST");
							sap.firefly.AggregationType.MAX = sap.firefly.AggregationType
									.create("MAX");
							sap.firefly.AggregationType.MIN = sap.firefly.AggregationType
									.create("MIN");
							sap.firefly.AggregationType.RANK = sap.firefly.AggregationType
									.create("RANK");
							sap.firefly.AggregationType.RANK_DENSE = sap.firefly.AggregationType
									.create("RANK_DENSE");
							sap.firefly.AggregationType.RANK_OLYMPIC = sap.firefly.AggregationType
									.create("RANK_OLYMPIC");
							sap.firefly.AggregationType.RANK_PERCENTILE = sap.firefly.AggregationType
									.create("RANK_PERCENTILE");
							sap.firefly.AggregationType.RANK_PERCENT = sap.firefly.AggregationType
									.create("RANK_PERCENT");
							sap.firefly.AggregationType.SUM = sap.firefly.AggregationType
									.create("SUM");
							sap.firefly.AggregationType.STANDARD_DEVIATION = sap.firefly.AggregationType
									.create("STANDARD_DEVIATION");
							sap.firefly.AggregationType.VARIANCE = sap.firefly.AggregationType
									.create("VARIANCE");
							sap.firefly.AggregationType.NOP_NULL = sap.firefly.AggregationType
									.create("NOPNULL");
							sap.firefly.AggregationType.NOP_NULL_ZERO = sap.firefly.AggregationType
									.create("NOPNULLZERO");
							sap.firefly.AggregationType.AVERAGE_NULL = sap.firefly.AggregationType
									.create("AVERAGENULL");
							sap.firefly.AggregationType.AVERAGE_NULL_ZERO = sap.firefly.AggregationType
									.create("AVERAGENULLZERO");
							sap.firefly.AggregationType.COUNT_NULL = sap.firefly.AggregationType
									.create("COUNTNULL");
							sap.firefly.AggregationType.COUNT_NULL_ZERO = sap.firefly.AggregationType
									.create("COUNTNULLZERO");
						},
						create : function(name) {
							var newConstant = new sap.firefly.AggregationType();
							newConstant.setName(name);
							sap.firefly.AggregationType.s_all.put(newConstant);
							return newConstant;
						},
						lookup : function(name) {
							return sap.firefly.AggregationType.s_all
									.getByKey(name);
						}
					}
				});
$Firefly.createClass("sap.firefly.AlertCategory", sap.firefly.XConstant, {
	$statics : {
		NORMAL : null,
		GOOD : null,
		CRITICAL : null,
		BAD : null,
		staticSetup : function() {
			sap.firefly.AlertCategory.NORMAL = sap.firefly.AlertCategory
					.create("NORMAL", 0);
			sap.firefly.AlertCategory.GOOD = sap.firefly.AlertCategory.create(
					"GOOD", 1);
			sap.firefly.AlertCategory.CRITICAL = sap.firefly.AlertCategory
					.create("CRITICAL", 2);
			sap.firefly.AlertCategory.BAD = sap.firefly.AlertCategory.create(
					"BAD", 3);
		},
		create : function(name, priority) {
			var object = new sap.firefly.AlertCategory();
			object.setupAlertCategory(name, priority);
			return object;
		}
	},
	m_priority : 0,
	setupAlertCategory : function(name, priority) {
		this.setName(name);
		this.m_priority = priority;
	},
	getPriority : function() {
		return this.m_priority;
	}
});
$Firefly.createClass("sap.firefly.AlertLevel", sap.firefly.XConstant, {
	$statics : {
		NORMAL : null,
		GOOD_1 : null,
		GOOD_2 : null,
		GOOD_3 : null,
		CRITICAL_1 : null,
		CRITICAL_2 : null,
		CRITICAL_3 : null,
		BAD_1 : null,
		BAD_2 : null,
		BAD_3 : null,
		staticSetup : function() {
			sap.firefly.AlertLevel.NORMAL = sap.firefly.AlertLevel.create(0,
					sap.firefly.AlertCategory.NORMAL, 1);
			sap.firefly.AlertLevel.GOOD_1 = sap.firefly.AlertLevel.create(1,
					sap.firefly.AlertCategory.GOOD, 1);
			sap.firefly.AlertLevel.GOOD_2 = sap.firefly.AlertLevel.create(2,
					sap.firefly.AlertCategory.GOOD, 2);
			sap.firefly.AlertLevel.GOOD_3 = sap.firefly.AlertLevel.create(3,
					sap.firefly.AlertCategory.GOOD, 3);
			sap.firefly.AlertLevel.CRITICAL_1 = sap.firefly.AlertLevel.create(
					4, sap.firefly.AlertCategory.CRITICAL, 1);
			sap.firefly.AlertLevel.CRITICAL_2 = sap.firefly.AlertLevel.create(
					5, sap.firefly.AlertCategory.CRITICAL, 2);
			sap.firefly.AlertLevel.CRITICAL_3 = sap.firefly.AlertLevel.create(
					6, sap.firefly.AlertCategory.CRITICAL, 3);
			sap.firefly.AlertLevel.BAD_1 = sap.firefly.AlertLevel.create(7,
					sap.firefly.AlertCategory.BAD, 1);
			sap.firefly.AlertLevel.BAD_2 = sap.firefly.AlertLevel.create(8,
					sap.firefly.AlertCategory.BAD, 2);
			sap.firefly.AlertLevel.BAD_3 = sap.firefly.AlertLevel.create(9,
					sap.firefly.AlertCategory.BAD, 3);
		},
		create : function(value, category, priority) {
			var object = new sap.firefly.AlertLevel();
			object.setup(value, priority, category);
			return object;
		}
	},
	m_priority : 0,
	m_category : null,
	m_level : 0,
	setup : function(value, priority, category) {
		this.setName(sap.firefly.XInteger.convertIntegerToString(value));
		this.m_priority = priority;
		this.m_level = value;
		this.m_category = category;
	},
	getPriority : function() {
		return this.m_priority;
	},
	getLevel : function() {
		return this.m_level;
	},
	getCategory : function() {
		return this.m_category;
	}
});
$Firefly.createClass("sap.firefly.Alignment", sap.firefly.XConstant, {
	$statics : {
		DEFAULT_VALUE : null,
		CHILDREN_BELOW_PARENT : null,
		CHILDREN_ABOVE_PARENT : null,
		staticSetup : function() {
			sap.firefly.Alignment.DEFAULT_VALUE = sap.firefly.Alignment
					.create("Default");
			sap.firefly.Alignment.CHILDREN_BELOW_PARENT = sap.firefly.Alignment
					.create("Below");
			sap.firefly.Alignment.CHILDREN_ABOVE_PARENT = sap.firefly.Alignment
					.create("Above");
		},
		create : function(name) {
			var object = new sap.firefly.Alignment();
			object.setName(name);
			return object;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.ConditionDimensionEvaluationType",
				sap.firefly.XConstant,
				{
					$statics : {
						ALL_IN_DRILL_DOWN : null,
						MOST_DETAILED_ON_ROWS : null,
						MOST_DETAILED_ON_COLS : null,
						GIVEN_LIST : null,
						s_lookupNames : null,
						staticSetup : function() {
							sap.firefly.ConditionDimensionEvaluationType.s_lookupNames = sap.firefly.XHashMapByString
									.create();
							sap.firefly.ConditionDimensionEvaluationType.ALL_IN_DRILL_DOWN = sap.firefly.ConditionDimensionEvaluationType
									.create("allInDrilldown");
							sap.firefly.ConditionDimensionEvaluationType.MOST_DETAILED_ON_ROWS = sap.firefly.ConditionDimensionEvaluationType
									.create("mostDetailedOnRows");
							sap.firefly.ConditionDimensionEvaluationType.MOST_DETAILED_ON_COLS = sap.firefly.ConditionDimensionEvaluationType
									.create("mostDetailedOnCols");
							sap.firefly.ConditionDimensionEvaluationType.GIVEN_LIST = sap.firefly.ConditionDimensionEvaluationType
									.create("givenList");
						},
						create : function(name) {
							var newObj = new sap.firefly.ConditionDimensionEvaluationType();
							newObj.setName(name);
							sap.firefly.ConditionDimensionEvaluationType.s_lookupNames
									.put(name, newObj);
							return newObj;
						},
						lookupName : function(name) {
							return sap.firefly.ConditionDimensionEvaluationType.s_lookupNames
									.getByKey(name);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.CurrentMemberFunction",
				sap.firefly.XConstant,
				{
					$statics : {
						ASCENDANTS : null,
						CHILDREN : null,
						FIRST_CHILD : null,
						FIRST_SIBLING : null,
						LAST_CHILD : null,
						LAST_SIBLING : null,
						LEAVES : null,
						MTD : null,
						NEXT_MEMBER : null,
						PARENT : null,
						PREV_MEMBER : null,
						QTD : null,
						SIBLINGS : null,
						WTD : null,
						YTD : null,
						DEFAULT_MEMBER : null,
						ANCESTOR : null,
						ANCESTOR_UP_TO_LEVEL : null,
						CLOSING_PERIOD : null,
						COUSIN : null,
						DESCENDANTS : null,
						DISTINCT : null,
						DRILLDOWN_LEVEL : null,
						DRILLDOWN_MEMBER : null,
						DRILLUP_LEVEL : null,
						DRILLUP_MEMBER : null,
						HEAD : null,
						HIERARCHIZE : null,
						LAG : null,
						LAST_PERIODS : null,
						LEAD : null,
						MEMBERS : null,
						MEMBERS_ASCENDANTS_DESCENDANTS : null,
						OPENING_PERIOD : null,
						PARALLEL_PERIOD : null,
						PERIODS_TO_DATE : null,
						RANGE : null,
						SUBSET : null,
						TAIL : null,
						UNION : null,
						s_all : null,
						staticSetup : function() {
							sap.firefly.CurrentMemberFunction.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.CurrentMemberFunction.ASCENDANTS = sap.firefly.CurrentMemberFunction
									.create("Ascendants");
							sap.firefly.CurrentMemberFunction.CHILDREN = sap.firefly.CurrentMemberFunction
									.create("Children");
							sap.firefly.CurrentMemberFunction.FIRST_CHILD = sap.firefly.CurrentMemberFunction
									.create("FirstChild");
							sap.firefly.CurrentMemberFunction.FIRST_SIBLING = sap.firefly.CurrentMemberFunction
									.create("FirstSibling");
							sap.firefly.CurrentMemberFunction.LAST_CHILD = sap.firefly.CurrentMemberFunction
									.create("LastChild");
							sap.firefly.CurrentMemberFunction.LAST_SIBLING = sap.firefly.CurrentMemberFunction
									.create("LastSibling");
							sap.firefly.CurrentMemberFunction.LEAVES = sap.firefly.CurrentMemberFunction
									.create("Leaves");
							sap.firefly.CurrentMemberFunction.MTD = sap.firefly.CurrentMemberFunction
									.create("MTD");
							sap.firefly.CurrentMemberFunction.NEXT_MEMBER = sap.firefly.CurrentMemberFunction
									.create("NextMember");
							sap.firefly.CurrentMemberFunction.PARENT = sap.firefly.CurrentMemberFunction
									.create("Parent");
							sap.firefly.CurrentMemberFunction.PREV_MEMBER = sap.firefly.CurrentMemberFunction
									.create("PrevMember");
							sap.firefly.CurrentMemberFunction.QTD = sap.firefly.CurrentMemberFunction
									.create("QTD");
							sap.firefly.CurrentMemberFunction.SIBLINGS = sap.firefly.CurrentMemberFunction
									.create("Siblings");
							sap.firefly.CurrentMemberFunction.WTD = sap.firefly.CurrentMemberFunction
									.create("WTD");
							sap.firefly.CurrentMemberFunction.YTD = sap.firefly.CurrentMemberFunction
									.create("YTD");
							sap.firefly.CurrentMemberFunction.DEFAULT_MEMBER = sap.firefly.CurrentMemberFunction
									.create("DefaultMember");
							sap.firefly.CurrentMemberFunction.ANCESTOR = sap.firefly.CurrentMemberFunction
									.create("Ancestor");
							sap.firefly.CurrentMemberFunction.ANCESTOR_UP_TO_LEVEL = sap.firefly.CurrentMemberFunction
									.create("AncestorUpToLevel");
							sap.firefly.CurrentMemberFunction.CLOSING_PERIOD = sap.firefly.CurrentMemberFunction
									.create("ClosingPeriod");
							sap.firefly.CurrentMemberFunction.COUSIN = sap.firefly.CurrentMemberFunction
									.create("Cousin");
							sap.firefly.CurrentMemberFunction.DESCENDANTS = sap.firefly.CurrentMemberFunction
									.create("Descendants");
							sap.firefly.CurrentMemberFunction.DISTINCT = sap.firefly.CurrentMemberFunction
									.create("Distinct");
							sap.firefly.CurrentMemberFunction.DRILLDOWN_LEVEL = sap.firefly.CurrentMemberFunction
									.create("DrillDownLevel");
							sap.firefly.CurrentMemberFunction.DRILLDOWN_MEMBER = sap.firefly.CurrentMemberFunction
									.create("DrillDownMember");
							sap.firefly.CurrentMemberFunction.DRILLUP_LEVEL = sap.firefly.CurrentMemberFunction
									.create("DrillUpLevel");
							sap.firefly.CurrentMemberFunction.DRILLUP_MEMBER = sap.firefly.CurrentMemberFunction
									.create("DrillUpMember");
							sap.firefly.CurrentMemberFunction.HEAD = sap.firefly.CurrentMemberFunction
									.create("Head");
							sap.firefly.CurrentMemberFunction.HIERARCHIZE = sap.firefly.CurrentMemberFunction
									.create("Hierarchize");
							sap.firefly.CurrentMemberFunction.LAG = sap.firefly.CurrentMemberFunction
									.create("Lag");
							sap.firefly.CurrentMemberFunction.LAST_PERIODS = sap.firefly.CurrentMemberFunction
									.create("LastPeriods");
							sap.firefly.CurrentMemberFunction.LEAD = sap.firefly.CurrentMemberFunction
									.create("Lead");
							sap.firefly.CurrentMemberFunction.MEMBERS = sap.firefly.CurrentMemberFunction
									.create("Members");
							sap.firefly.CurrentMemberFunction.MEMBERS_ASCENDANTS_DESCENDANTS = sap.firefly.CurrentMemberFunction
									.create("MembersAscendantsDescendants");
							sap.firefly.CurrentMemberFunction.OPENING_PERIOD = sap.firefly.CurrentMemberFunction
									.create("OpeningPeriod");
							sap.firefly.CurrentMemberFunction.PARALLEL_PERIOD = sap.firefly.CurrentMemberFunction
									.create("ParallelPeriod");
							sap.firefly.CurrentMemberFunction.PERIODS_TO_DATE = sap.firefly.CurrentMemberFunction
									.create("PeriodsToDate");
							sap.firefly.CurrentMemberFunction.RANGE = sap.firefly.CurrentMemberFunction
									.create("Range");
							sap.firefly.CurrentMemberFunction.SUBSET = sap.firefly.CurrentMemberFunction
									.create("SubSet");
							sap.firefly.CurrentMemberFunction.TAIL = sap.firefly.CurrentMemberFunction
									.create("Tail");
							sap.firefly.CurrentMemberFunction.UNION = sap.firefly.CurrentMemberFunction
									.create("Union");
						},
						create : function(name) {
							var newConstant = new sap.firefly.CurrentMemberFunction();
							newConstant.setName(name);
							sap.firefly.CurrentMemberFunction.s_all
									.put(newConstant);
							return newConstant;
						},
						lookup : function(name) {
							return sap.firefly.CurrentMemberFunction.s_all
									.getByKey(name);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DataEntryProcessingType",
				sap.firefly.XConstant,
				{
					$statics : {
						FULL : null,
						IGNORE_AGGREGATION_TYPE : null,
						IGNORE_CALCULATIONS : null,
						staticSetup : function() {
							sap.firefly.DataEntryProcessingType.FULL = sap.firefly.DataEntryProcessingType
									.create("Full");
							sap.firefly.DataEntryProcessingType.IGNORE_AGGREGATION_TYPE = sap.firefly.DataEntryProcessingType
									.create("IgnoreAggregationType");
							sap.firefly.DataEntryProcessingType.IGNORE_CALCULATIONS = sap.firefly.DataEntryProcessingType
									.create("IgnoreCalculations");
						},
						create : function(name) {
							var type = new sap.firefly.DataEntryProcessingType();
							type.setName(name);
							return type;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DisaggregationMode",
				sap.firefly.XConstant,
				{
					$statics : {
						ABSOLUTE : null,
						COPY : null,
						DELTA : null,
						NONE : null,
						s_all : null,
						staticSetup : function() {
							sap.firefly.DisaggregationMode.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.DisaggregationMode.ABSOLUTE = sap.firefly.DisaggregationMode
									.create("Absolute");
							sap.firefly.DisaggregationMode.COPY = sap.firefly.DisaggregationMode
									.create("Copy");
							sap.firefly.DisaggregationMode.DELTA = sap.firefly.DisaggregationMode
									.create("Delta");
							sap.firefly.DisaggregationMode.NONE = sap.firefly.DisaggregationMode
									.create("None");
						},
						create : function(name) {
							var newConstant = new sap.firefly.DisaggregationMode();
							newConstant.setName(name);
							sap.firefly.DisaggregationMode.s_all
									.put(newConstant);
							return newConstant;
						},
						lookup : function(name) {
							return sap.firefly.DisaggregationMode.s_all
									.getByKey(name);
						},
						lookupWithDefault : function(name, defaultValue) {
							var mode = sap.firefly.DisaggregationMode.s_all
									.getByKey(name);
							if (mode === null) {
								return defaultValue;
							}
							return mode;
						}
					}
				});
$Firefly.createClass("sap.firefly.DrillState", sap.firefly.XConstant,
		{
			$statics : {
				EXPANDED : null,
				COLLAPSED : null,
				LEAF : null,
				DRILL_DOWN : null,
				staticSetup : function() {
					sap.firefly.DrillState.EXPANDED = sap.firefly.DrillState
							.create("Expanded");
					sap.firefly.DrillState.COLLAPSED = sap.firefly.DrillState
							.create("Collapsed");
					sap.firefly.DrillState.LEAF = sap.firefly.DrillState
							.create("Leaf");
					sap.firefly.DrillState.DRILL_DOWN = sap.firefly.DrillState
							.create("DrillDown");
				},
				create : function(name) {
					var drillState = new sap.firefly.DrillState();
					drillState.setName(name);
					return drillState;
				}
			}
		});
$Firefly
		.createClass(
				"sap.firefly.ExceptionSetting",
				sap.firefly.XConstant,
				{
					$statics : {
						ALERT_LEVEL : null,
						NUMERIC_PRECISION : null,
						NUMERIC_SCALE : null,
						NUMERIC_SHIFT : null,
						POSTFIX : null,
						PREFIX : null,
						SIGN_INVERSION : null,
						s_all : null,
						staticSetup : function() {
							sap.firefly.ExceptionSetting.s_all = sap.firefly.XHashMapByString
									.create();
							sap.firefly.ExceptionSetting.ALERT_LEVEL = sap.firefly.ExceptionSetting
									.create("$$AlertLevel$$");
							sap.firefly.ExceptionSetting.NUMERIC_PRECISION = sap.firefly.ExceptionSetting
									.create("$$NumericPrecision$$");
							sap.firefly.ExceptionSetting.NUMERIC_SCALE = sap.firefly.ExceptionSetting
									.create("$$NumericScale$$");
							sap.firefly.ExceptionSetting.NUMERIC_SHIFT = sap.firefly.ExceptionSetting
									.create("$$NumericShift$$");
							sap.firefly.ExceptionSetting.POSTFIX = sap.firefly.ExceptionSetting
									.create("$$Postfix$$");
							sap.firefly.ExceptionSetting.PREFIX = sap.firefly.ExceptionSetting
									.create("$$Prefix$$");
							sap.firefly.ExceptionSetting.SIGN_INVERSION = sap.firefly.ExceptionSetting
									.create("$$SignInversion$$");
						},
						create : function(name) {
							var setting = new sap.firefly.ExceptionSetting();
							setting.setName(name);
							sap.firefly.ExceptionSetting.s_all.put(name,
									setting);
							return setting;
						},
						getByName : function(name) {
							return sap.firefly.ExceptionSetting.s_all
									.getByKey(name);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ExecutionEngine",
				sap.firefly.XConstant,
				{
					$statics : {
						SQL : null,
						MDS : null,
						CALC_ENGINE : null,
						s_lookupNames : null,
						staticSetup : function() {
							sap.firefly.ExecutionEngine.s_lookupNames = sap.firefly.XHashMapByString
									.create();
							sap.firefly.ExecutionEngine.SQL = sap.firefly.ExecutionEngine
									.create("SQL");
							sap.firefly.ExecutionEngine.MDS = sap.firefly.ExecutionEngine
									.create("MDS");
							sap.firefly.ExecutionEngine.CALC_ENGINE = sap.firefly.ExecutionEngine
									.create("CE");
						},
						create : function(name) {
							var newObj = new sap.firefly.ExecutionEngine();
							newObj.setName(name);
							sap.firefly.ExecutionEngine.s_lookupNames.put(name,
									newObj);
							return newObj;
						},
						lookupName : function(name) {
							return sap.firefly.ExecutionEngine.s_lookupNames
									.getByKey(name);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.FieldLayoutType",
				sap.firefly.XConstant,
				{
					$statics : {
						FIELD_BASED : null,
						ATTRIBUTE_BASED : null,
						ATTRIBUTES_AND_PRESENTATIONS : null,
						staticSetup : function() {
							sap.firefly.FieldLayoutType.FIELD_BASED = sap.firefly.FieldLayoutType
									.create("FieldBased");
							sap.firefly.FieldLayoutType.ATTRIBUTE_BASED = sap.firefly.FieldLayoutType
									.create("AttributeBased");
							sap.firefly.FieldLayoutType.ATTRIBUTES_AND_PRESENTATIONS = sap.firefly.FieldLayoutType
									.create("AttributesAndPresentations");
						},
						create : function(name) {
							var pt = new sap.firefly.FieldLayoutType();
							pt.setName(name);
							return pt;
						}
					}
				});
$Firefly.createClass("sap.firefly.FieldUsageType", sap.firefly.XConstant, {
	$statics : {
		HIERARCHY : null,
		FLAT : null,
		ALL : null,
		s_lookup : null,
		staticSetup : function() {
			sap.firefly.FieldUsageType.s_lookup = sap.firefly.XHashMapByString
					.create();
			sap.firefly.FieldUsageType.HIERARCHY = sap.firefly.FieldUsageType
					.create("Hierarchy");
			sap.firefly.FieldUsageType.FLAT = sap.firefly.FieldUsageType
					.create("Flat");
			sap.firefly.FieldUsageType.ALL = sap.firefly.FieldUsageType
					.create("All");
		},
		create : function(name) {
			var pt = new sap.firefly.FieldUsageType();
			pt.setName(name);
			sap.firefly.FieldUsageType.s_lookup.put(name, pt);
			return pt;
		},
		lookup : function(name) {
			return sap.firefly.FieldUsageType.s_lookup.getByKey(name);
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.FilterLayer",
				sap.firefly.XConstant,
				{
					$statics : {
						ALL : null,
						FIXED : null,
						DYNAMIC : null,
						VISIBILITY : null,
						staticSetup : function() {
							sap.firefly.FilterLayer.ALL = sap.firefly.FilterLayer
									.create("All");
							sap.firefly.FilterLayer.FIXED = sap.firefly.FilterLayer
									.create("Fixed");
							sap.firefly.FilterLayer.DYNAMIC = sap.firefly.FilterLayer
									.create("Dynamic");
							sap.firefly.FilterLayer.VISIBILITY = sap.firefly.FilterLayer
									.create("Visibility");
						},
						create : function(name) {
							var object = new sap.firefly.FilterLayer();
							object.setName(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.FilterScopeVariables",
				sap.firefly.XConstant,
				{
					$statics : {
						IGNORE : null,
						NOT_AFFECTED_BY_VARIABLES : null,
						NOT_CREATED_BY_VARIABLES : null,
						staticSetup : function() {
							sap.firefly.FilterScopeVariables.IGNORE = sap.firefly.FilterScopeVariables
									.create("Fixed");
							sap.firefly.FilterScopeVariables.NOT_AFFECTED_BY_VARIABLES = sap.firefly.FilterScopeVariables
									.create("NotAffectedByVariables");
							sap.firefly.FilterScopeVariables.NOT_CREATED_BY_VARIABLES = sap.firefly.FilterScopeVariables
									.create("NotCreatedByVariables");
						},
						create : function(name) {
							var object = new sap.firefly.FilterScopeVariables();
							object.setName(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.HierarchyLevelType",
				sap.firefly.XConstant,
				{
					$statics : {
						REGULAR : null,
						ALL : null,
						TIME_YEAR : null,
						TIME_HALF_YEAR : null,
						TIME_QUARTER : null,
						TIME_MONTH : null,
						TIME_WEEK : null,
						TIME_DAY : null,
						TIME_HOUR : null,
						TIME_MINUTE : null,
						TIME_SECOND : null,
						staticSetup : function() {
							sap.firefly.HierarchyLevelType.REGULAR = sap.firefly.HierarchyLevelType
									.create("Regular");
							sap.firefly.HierarchyLevelType.ALL = sap.firefly.HierarchyLevelType
									.create("All");
							sap.firefly.HierarchyLevelType.TIME_YEAR = sap.firefly.HierarchyLevelType
									.create("TIME_YEAR");
							sap.firefly.HierarchyLevelType.TIME_HALF_YEAR = sap.firefly.HierarchyLevelType
									.create("TIME_HALF_YEAR");
							sap.firefly.HierarchyLevelType.TIME_QUARTER = sap.firefly.HierarchyLevelType
									.create("TIME_QUARTAL");
							sap.firefly.HierarchyLevelType.TIME_MONTH = sap.firefly.HierarchyLevelType
									.create("TIME_MONTH");
							sap.firefly.HierarchyLevelType.TIME_WEEK = sap.firefly.HierarchyLevelType
									.create("TIME_WEEK");
							sap.firefly.HierarchyLevelType.TIME_DAY = sap.firefly.HierarchyLevelType
									.create("TIME_DAY");
							sap.firefly.HierarchyLevelType.TIME_HOUR = sap.firefly.HierarchyLevelType
									.create("TIME_HOUR");
							sap.firefly.HierarchyLevelType.TIME_MINUTE = sap.firefly.HierarchyLevelType
									.create("TIME_MINUTE");
							sap.firefly.HierarchyLevelType.TIME_SECOND = sap.firefly.HierarchyLevelType
									.create("TIME_SECOND");
						},
						create : function(name) {
							var newConstant = new sap.firefly.HierarchyLevelType();
							newConstant.setName(name);
							return newConstant;
						}
					}
				});
$Firefly.createClass("sap.firefly.InfoObjectType", sap.firefly.XConstant, {
	$statics : {
		CHA : null,
		KYF : null,
		TIM : null,
		UNI : null,
		DPA : null,
		ATR : null,
		MTA : null,
		XXL : null,
		ALL : null,
		staticSetupInfoObject : function() {
			sap.firefly.InfoObjectType.CHA = sap.firefly.InfoObjectType
					.createInfoObject("CHA");
			sap.firefly.InfoObjectType.KYF = sap.firefly.InfoObjectType
					.createInfoObject("KYF");
			sap.firefly.InfoObjectType.TIM = sap.firefly.InfoObjectType
					.createInfoObject("TIM");
			sap.firefly.InfoObjectType.UNI = sap.firefly.InfoObjectType
					.createInfoObject("UNI");
			sap.firefly.InfoObjectType.DPA = sap.firefly.InfoObjectType
					.createInfoObject("DPA");
			sap.firefly.InfoObjectType.ATR = sap.firefly.InfoObjectType
					.createInfoObject("ATR");
			sap.firefly.InfoObjectType.MTA = sap.firefly.InfoObjectType
					.createInfoObject("MTA");
			sap.firefly.InfoObjectType.XXL = sap.firefly.InfoObjectType
					.createInfoObject("XXL");
			sap.firefly.InfoObjectType.ALL = sap.firefly.InfoObjectType
					.createInfoObject("ALL");
		},
		createInfoObject : function(name) {
			var newConstant = new sap.firefly.InfoObjectType();
			newConstant.setName(name);
			return newConstant;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.InputReadinessType",
				sap.firefly.XConstant,
				{
					$statics : {
						INPUT_ENABLED : null,
						PUBLIC_VERSION : null,
						INACTIVE_VERSION : null,
						NON_PLANNABLE_EXCEPTION_AGGREGATION_RESULT : null,
						MISSING_INVERSE_FORMULA : null,
						CURRENT_MEMBER_NAVIGATION : null,
						UNSUPPORTED_POST_AGGREGATION_TYPE : null,
						UNSUPPORTED_AGGREGATION_EXCEPTION_AGGREGATION_COMBINATION : null,
						UNSUPPORTED_EXCEPTION_AGGREGATION_TYPE : null,
						UNSUPPORTED_AGGREGATION_TYPE : null,
						EXCEPTION_AGGREGATION_ON_FORMULA : null,
						CALCULATION_BEFORE_AGGREGATION : null,
						AGGREGATE_OF_DIFFERENT_VERSIONS : null,
						HAS_CHILDREN_WITH_DIFFERENT_FEATURES : null,
						HAS_EPM_EXCEPTION : null,
						NO_ACTION_AVAILABLE : null,
						UNBOOKED : null,
						BLENDING_RESULT : null,
						UNSUPPORTED_VALUE_TYPE : null,
						NO_VERSION : null,
						PLANNING_DISABLED : null,
						UNSUPPORTED_CALCULATION_STEP : null,
						QUERY_HAS_CALCULATED_DIMENSION : null,
						NESTED_FORMULA : null,
						QUERY_HAS_MEASURE_BASED_CALCULATED_DIMENSION : null,
						s_instances : null,
						staticSetup : function() {
							sap.firefly.InputReadinessType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.InputReadinessType.INPUT_ENABLED = sap.firefly.InputReadinessType
									.create("InputEnabled");
							sap.firefly.InputReadinessType.PUBLIC_VERSION = sap.firefly.InputReadinessType
									.create("PublicVersion");
							sap.firefly.InputReadinessType.INACTIVE_VERSION = sap.firefly.InputReadinessType
									.create("InactiveVersion");
							sap.firefly.InputReadinessType.NON_PLANNABLE_EXCEPTION_AGGREGATION_RESULT = sap.firefly.InputReadinessType
									.create("NonPlannableExceptionAggregationResult");
							sap.firefly.InputReadinessType.MISSING_INVERSE_FORMULA = sap.firefly.InputReadinessType
									.create("MissingInverseFormula");
							sap.firefly.InputReadinessType.CURRENT_MEMBER_NAVIGATION = sap.firefly.InputReadinessType
									.create("CurrentMemberNavigation");
							sap.firefly.InputReadinessType.UNSUPPORTED_POST_AGGREGATION_TYPE = sap.firefly.InputReadinessType
									.create("UnsupportedPostAggregationType");
							sap.firefly.InputReadinessType.UNSUPPORTED_AGGREGATION_EXCEPTION_AGGREGATION_COMBINATION = sap.firefly.InputReadinessType
									.create("UnsupportedAggregationExceptionAggregationCombination");
							sap.firefly.InputReadinessType.UNSUPPORTED_EXCEPTION_AGGREGATION_TYPE = sap.firefly.InputReadinessType
									.create("UnsupportedExceptionAggregationType");
							sap.firefly.InputReadinessType.UNSUPPORTED_AGGREGATION_TYPE = sap.firefly.InputReadinessType
									.create("UnsupportedAggregationType");
							sap.firefly.InputReadinessType.EXCEPTION_AGGREGATION_ON_FORMULA = sap.firefly.InputReadinessType
									.create("ExceptionAggregationOnFormula");
							sap.firefly.InputReadinessType.CALCULATION_BEFORE_AGGREGATION = sap.firefly.InputReadinessType
									.create("CalculationBeforeAggregation");
							sap.firefly.InputReadinessType.AGGREGATE_OF_DIFFERENT_VERSIONS = sap.firefly.InputReadinessType
									.create("AggregateOfDifferentVersions");
							sap.firefly.InputReadinessType.HAS_CHILDREN_WITH_DIFFERENT_FEATURES = sap.firefly.InputReadinessType
									.create("HasChildrenWithDifferentFeatures");
							sap.firefly.InputReadinessType.HAS_EPM_EXCEPTION = sap.firefly.InputReadinessType
									.create("HasEPMException");
							sap.firefly.InputReadinessType.NO_ACTION_AVAILABLE = sap.firefly.InputReadinessType
									.create("NoActionAvailable");
							sap.firefly.InputReadinessType.UNBOOKED = sap.firefly.InputReadinessType
									.create("Unbooked");
							sap.firefly.InputReadinessType.BLENDING_RESULT = sap.firefly.InputReadinessType
									.create("BlendingResult");
							sap.firefly.InputReadinessType.UNSUPPORTED_VALUE_TYPE = sap.firefly.InputReadinessType
									.create("UnsupportedValueType");
							sap.firefly.InputReadinessType.NO_VERSION = sap.firefly.InputReadinessType
									.create("NoVersion");
							sap.firefly.InputReadinessType.PLANNING_DISABLED = sap.firefly.InputReadinessType
									.create("PlanningDisabled");
							sap.firefly.InputReadinessType.UNSUPPORTED_CALCULATION_STEP = sap.firefly.InputReadinessType
									.create("UnsupportedCalculationStep");
							sap.firefly.InputReadinessType.QUERY_HAS_CALCULATED_DIMENSION = sap.firefly.InputReadinessType
									.create("QueryHasCalculatedDimension");
							sap.firefly.InputReadinessType.NESTED_FORMULA = sap.firefly.InputReadinessType
									.create("NestedFormula");
							sap.firefly.InputReadinessType.QUERY_HAS_MEASURE_BASED_CALCULATED_DIMENSION = sap.firefly.InputReadinessType
									.create("QueryHasMeasureBasedCalculatedDimension");
						},
						create : function(name) {
							var flag = new sap.firefly.InputReadinessType();
							flag.setName(name);
							sap.firefly.InputReadinessType.s_instances.put(
									name, flag);
							return flag;
						},
						get : function(name) {
							return sap.firefly.InputReadinessType.s_instances
									.getByKey(name);
						},
						getOrCreate : function(name) {
							var readinessType;
							if (sap.firefly.XStringUtils.isNullOrEmpty(name)) {
								return null;
							}
							readinessType = sap.firefly.InputReadinessType
									.get(name);
							if (readinessType === null) {
								readinessType = sap.firefly.InputReadinessType
										.create(name);
							}
							return readinessType;
						}
					}
				});
$Firefly.createClass("sap.firefly.LocalityType", sap.firefly.XConstant, {
	$statics : {
		CENTRAL : null,
		LOCAL : null,
		staticSetupLocality : function() {
			sap.firefly.LocalityType.CENTRAL = sap.firefly.LocalityType
					.createLocality("C");
			sap.firefly.LocalityType.LOCAL = sap.firefly.LocalityType
					.createLocality("L");
		},
		createLocality : function(name) {
			var newConstant = new sap.firefly.LocalityType();
			newConstant.setName(name);
			return newConstant;
		},
		getLocalityType : function(type) {
			if (sap.firefly.XString.isEqual(sap.firefly.LocalityType.CENTRAL
					.getName(), type)) {
				return sap.firefly.LocalityType.CENTRAL;
			} else {
				if (sap.firefly.XString.isEqual(sap.firefly.LocalityType.LOCAL
						.getName(), type)) {
					return sap.firefly.LocalityType.LOCAL;
				}
			}
			return null;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.MetaObjectType",
				sap.firefly.XConstant,
				{
					$statics : {
						QUERY : null,
						QUERY_VALUEHELP : null,
						QUERY_VALUEHELP_DESIGNTIME : null,
						DEFAULT_PLAN_QUERY : null,
						DEFAULT_REPORT_QUERY : null,
						LOCAL_QUERY : null,
						QUERY_VIEW : null,
						INFOPROVIDER : null,
						DBVIEW : null,
						CATEGORY : null,
						CONNECTOR : null,
						CATALOG_VIEW : null,
						CATALOG_VIEW_2 : null,
						WORKSTATUS : null,
						PLANNING : null,
						CUBE : null,
						ALVL : null,
						DIMENSION : null,
						INFO_CUBE : null,
						LOG_PARTITIONED_OBJECT : null,
						HYBRIDPROVIDER : null,
						MULTIPROVIDER : null,
						INFOSET : null,
						AGGREGATION_LEVEL : null,
						VIRTUAL_PROVIDER : null,
						AINX_PROVIDER : null,
						INFOOBJECT : null,
						REPOSITORY : null,
						HIERARCHY : null,
						HIERARCHY_MEMBER : null,
						HIERARCHY_INTERVAL : null,
						MASTERDATA : null,
						USER_MANAGEMENT : null,
						INA_MODEL : null,
						PLANNING_MODEL : null,
						PLANNING_FUNCTION : null,
						PLANNING_SEQUENCE : null,
						FILTER : null,
						MULTI_SOURCE : null,
						BLENDING : null,
						TRANSIENT_QUERY : null,
						MODEL : null,
						MODEL_VALUEHELP : null,
						UNX : null,
						s_instances : null,
						staticSetup : function() {
							sap.firefly.MetaObjectType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.MetaObjectType.QUERY = sap.firefly.MetaObjectType
									.create("Query");
							sap.firefly.MetaObjectType.QUERY_VALUEHELP = sap.firefly.MetaObjectType
									.create("Query/ValueHelp");
							sap.firefly.MetaObjectType.QUERY_VALUEHELP_DESIGNTIME = sap.firefly.MetaObjectType
									.create("Query/ValueHelp/DesignTime");
							sap.firefly.MetaObjectType.DEFAULT_PLAN_QUERY = sap.firefly.MetaObjectType
									.create("DefaultPlanQuery");
							sap.firefly.MetaObjectType.DEFAULT_REPORT_QUERY = sap.firefly.MetaObjectType
									.create("DefaultReportQuery");
							sap.firefly.MetaObjectType.LOCAL_QUERY = sap.firefly.MetaObjectType
									.create("LocalQuery");
							sap.firefly.MetaObjectType.QUERY_VIEW = sap.firefly.MetaObjectType
									.create("QueryView");
							sap.firefly.MetaObjectType.INFOPROVIDER = sap.firefly.MetaObjectType
									.create("InfoProvider");
							sap.firefly.MetaObjectType.DBVIEW = sap.firefly.MetaObjectType
									.create("View");
							sap.firefly.MetaObjectType.CATEGORY = sap.firefly.MetaObjectType
									.create("Category");
							sap.firefly.MetaObjectType.CONNECTOR = sap.firefly.MetaObjectType
									.create("Connector");
							sap.firefly.MetaObjectType.CATALOG_VIEW = sap.firefly.MetaObjectType
									.create("CatalogView");
							sap.firefly.MetaObjectType.CATALOG_VIEW_2 = sap.firefly.MetaObjectType
									.create("CatalogView2");
							sap.firefly.MetaObjectType.PLANNING = sap.firefly.MetaObjectType
									.create("Planning");
							sap.firefly.MetaObjectType.CUBE = sap.firefly.MetaObjectType
									.create("Cube");
							sap.firefly.MetaObjectType.ALVL = sap.firefly.MetaObjectType
									.create("ALVL");
							sap.firefly.MetaObjectType.WORKSTATUS = sap.firefly.MetaObjectType
									.create("WorkStatus");
							sap.firefly.MetaObjectType.DIMENSION = sap.firefly.MetaObjectType
									.create("Dimension");
							sap.firefly.MetaObjectType.INFO_CUBE = sap.firefly.MetaObjectType
									.create("InfoCube");
							sap.firefly.MetaObjectType.LOG_PARTITIONED_OBJECT = sap.firefly.MetaObjectType
									.create("LogPartitionedObject");
							sap.firefly.MetaObjectType.HYBRIDPROVIDER = sap.firefly.MetaObjectType
									.create("Hybridprovider");
							sap.firefly.MetaObjectType.MULTIPROVIDER = sap.firefly.MetaObjectType
									.create("MultiProvider");
							sap.firefly.MetaObjectType.INFOSET = sap.firefly.MetaObjectType
									.create("InfoSet");
							sap.firefly.MetaObjectType.AGGREGATION_LEVEL = sap.firefly.MetaObjectType
									.create("AggregationLevel");
							sap.firefly.MetaObjectType.VIRTUAL_PROVIDER = sap.firefly.MetaObjectType
									.create("VirtualProvider");
							sap.firefly.MetaObjectType.AINX_PROVIDER = sap.firefly.MetaObjectType
									.create("AINXProvider");
							sap.firefly.MetaObjectType.INFOOBJECT = sap.firefly.MetaObjectType
									.create("InfoObject");
							sap.firefly.MetaObjectType.REPOSITORY = sap.firefly.MetaObjectType
									.create("Repository");
							sap.firefly.MetaObjectType.HIERARCHY = sap.firefly.MetaObjectType
									.create("Hierarchy");
							sap.firefly.MetaObjectType.HIERARCHY_MEMBER = sap.firefly.MetaObjectType
									.create("HierarchyMember");
							sap.firefly.MetaObjectType.HIERARCHY_INTERVAL = sap.firefly.MetaObjectType
									.create("HierarchyInterval");
							sap.firefly.MetaObjectType.MASTERDATA = sap.firefly.MetaObjectType
									.create("Masterdata");
							sap.firefly.MetaObjectType.USER_MANAGEMENT = sap.firefly.MetaObjectType
									.create("UserManagement");
							sap.firefly.MetaObjectType.INA_MODEL = sap.firefly.MetaObjectType
									.create("inamodel");
							sap.firefly.MetaObjectType.PLANNING_MODEL = sap.firefly.MetaObjectType
									.create("PlanningModel");
							sap.firefly.MetaObjectType.PLANNING_FUNCTION = sap.firefly.MetaObjectType
									.create("PlanningFunction");
							sap.firefly.MetaObjectType.PLANNING_SEQUENCE = sap.firefly.MetaObjectType
									.create("PlanningSequence");
							sap.firefly.MetaObjectType.FILTER = sap.firefly.MetaObjectType
									.create("Filter");
							sap.firefly.MetaObjectType.MULTI_SOURCE = sap.firefly.MetaObjectType
									.create("MultiSource");
							sap.firefly.MetaObjectType.BLENDING = sap.firefly.MetaObjectType
									.create("Blending");
							sap.firefly.MetaObjectType.TRANSIENT_QUERY = sap.firefly.MetaObjectType
									.create("TRPR");
							sap.firefly.MetaObjectType.MODEL = sap.firefly.MetaObjectType
									.create("Model");
							sap.firefly.MetaObjectType.MODEL_VALUEHELP = sap.firefly.MetaObjectType
									.create("Model/ValueHelp");
							sap.firefly.MetaObjectType.UNX = sap.firefly.MetaObjectType
									.create("Unx");
						},
						create : function(camelCaseName) {
							var newConstant = new sap.firefly.MetaObjectType();
							var name = sap.firefly.XString
									.convertToLowerCase(camelCaseName);
							newConstant
									.setupMetaObjectType(name, camelCaseName);
							sap.firefly.MetaObjectType.s_instances.put(name,
									newConstant);
							return newConstant;
						},
						lookup : function(name) {
							var lowerCase = sap.firefly.XString
									.convertToLowerCase(name);
							return sap.firefly.MetaObjectType.s_instances
									.getByKey(lowerCase);
						},
						lookupAndCreate : function(camelCaseName) {
							var result = sap.firefly.MetaObjectType
									.lookup(camelCaseName);
							if (result === null) {
								result = sap.firefly.MetaObjectType
										.create(camelCaseName);
							}
							return result;
						},
						getAll : function() {
							var iterator = sap.firefly.MetaObjectType.s_instances
									.getIterator();
							return iterator;
						}
					},
					m_camelCaseName : null,
					setupMetaObjectType : function(name, camelCaseName) {
						this.setName(name);
						this.m_camelCaseName = camelCaseName;
					},
					getCamelCaseName : function() {
						return this.m_camelCaseName;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PresentationSelect",
				sap.firefly.XConstant,
				{
					$statics : {
						KEY : null,
						TEXT : null,
						KEY_AND_TEXT : null,
						staticSetup : function() {
							sap.firefly.PresentationSelect.KEY = sap.firefly.PresentationSelect
									.createPresentation("Key");
							sap.firefly.PresentationSelect.TEXT = sap.firefly.PresentationSelect
									.createPresentation("Text");
							sap.firefly.PresentationSelect.KEY_AND_TEXT = sap.firefly.PresentationSelect
									.createPresentation("KeyAndText");
						},
						createPresentation : function(name) {
							var newConstant = new sap.firefly.PresentationSelect();
							newConstant.setName(name);
							return newConstant;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ProviderType",
				sap.firefly.XConstant,
				{
					$statics : {
						ANALYTICS : null,
						ANALYTICS_VALUE_HELP : null,
						PLANNING : null,
						CATALOG : null,
						PLANNING_COMMAND : null,
						LIST_REPORTING : null,
						s_instances : null,
						staticSetup : function() {
							sap.firefly.ProviderType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.ProviderType.ANALYTICS = sap.firefly.ProviderType
									.create("Analytics");
							sap.firefly.ProviderType.ANALYTICS_VALUE_HELP = sap.firefly.ProviderType
									.create("AnalyticsValueHelp");
							sap.firefly.ProviderType.ANALYTICS.m_associatedValueHelp = sap.firefly.ProviderType.ANALYTICS_VALUE_HELP;
							sap.firefly.ProviderType.LIST_REPORTING = sap.firefly.ProviderType
									.create("ListReporting");
							sap.firefly.ProviderType.PLANNING = sap.firefly.ProviderType
									.create("Planning");
							sap.firefly.ProviderType.CATALOG = sap.firefly.ProviderType
									.create("Catalog");
							sap.firefly.ProviderType.PLANNING_COMMAND = sap.firefly.ProviderType
									.create("PlanningCommand");
						},
						create : function(name) {
							var newConstant = new sap.firefly.ProviderType();
							newConstant.setName(name);
							sap.firefly.ProviderType.s_instances.put(name,
									newConstant);
							newConstant.m_associatedValueHelp = newConstant;
							return newConstant;
						},
						getAll : function() {
							return sap.firefly.ProviderType.s_instances;
						}
					},
					m_associatedValueHelp : null,
					getAssociatedValueHelp : function() {
						return this.m_associatedValueHelp;
					}
				});
$Firefly.createClass("sap.firefly.QContextType", sap.firefly.XConstant, {
	$statics : {
		RESULT_SET : null,
		SELECTOR : null,
		VARIABLE : null,
		s_instances : null,
		staticSetup : function() {
			sap.firefly.QContextType.s_instances = sap.firefly.XSetOfNameObject
					.create();
			sap.firefly.QContextType.RESULT_SET = sap.firefly.QContextType
					.create("ResultSet");
			sap.firefly.QContextType.SELECTOR = sap.firefly.QContextType
					.create("Selector");
			sap.firefly.QContextType.VARIABLE = sap.firefly.QContextType
					.create("Variable");
		},
		create : function(name) {
			var newConstant = new sap.firefly.QContextType();
			newConstant.setName(name);
			sap.firefly.QContextType.s_instances.put(newConstant);
			return newConstant;
		},
		lookup : function(name) {
			return sap.firefly.QContextType.s_instances.getByKey(name);
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.QExceptionEvalType",
				sap.firefly.XConstant,
				{
					$statics : {
						TOTALS : null,
						DATA : null,
						ALL : null,
						staticSetup : function() {
							sap.firefly.QExceptionEvalType.TOTALS = sap.firefly.QExceptionEvalType
									.create("Totals");
							sap.firefly.QExceptionEvalType.DATA = sap.firefly.QExceptionEvalType
									.create("Data");
							sap.firefly.QExceptionEvalType.ALL = sap.firefly.QExceptionEvalType
									.create("All");
						},
						create : function(name) {
							var newObj = new sap.firefly.QExceptionEvalType();
							newObj.setName(name);
							return newObj;
						},
						lookupExceptionEvalType : function(name) {
							if (sap.firefly.XString.isEqual(name,
									sap.firefly.QExceptionEvalType.TOTALS
											.getName())) {
								return sap.firefly.QExceptionEvalType.TOTALS;
							} else {
								if (sap.firefly.XString.isEqual(name,
										sap.firefly.QExceptionEvalType.DATA
												.getName())) {
									return sap.firefly.QExceptionEvalType.DATA;
								}
							}
							return sap.firefly.QExceptionEvalType.ALL;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QExceptionHeaderSettings",
				sap.firefly.XConstant,
				{
					$statics : {
						NONE : null,
						ROW : null,
						COLUMN : null,
						ROW_AND_COLUMN : null,
						staticSetup : function() {
							sap.firefly.QExceptionHeaderSettings.NONE = sap.firefly.QExceptionHeaderSettings
									.create("none");
							sap.firefly.QExceptionHeaderSettings.ROW = sap.firefly.QExceptionHeaderSettings
									.create("row");
							sap.firefly.QExceptionHeaderSettings.COLUMN = sap.firefly.QExceptionHeaderSettings
									.create("column");
							sap.firefly.QExceptionHeaderSettings.ROW_AND_COLUMN = sap.firefly.QExceptionHeaderSettings
									.create("rowAndColumn");
						},
						create : function(name) {
							var newObj = new sap.firefly.QExceptionHeaderSettings();
							newObj.setName(name);
							return newObj;
						},
						lookupExceptionHeaderSetting : function(name) {
							if (sap.firefly.XString
									.isEqual(
											name,
											sap.firefly.QExceptionHeaderSettings.ROW_AND_COLUMN
													.getName())) {
								return sap.firefly.QExceptionHeaderSettings.ROW_AND_COLUMN;
							} else {
								if (sap.firefly.XString
										.isEqual(
												name,
												sap.firefly.QExceptionHeaderSettings.COLUMN
														.getName())) {
									return sap.firefly.QExceptionHeaderSettings.COLUMN;
								} else {
									if (sap.firefly.XString
											.isEqual(
													name,
													sap.firefly.QExceptionHeaderSettings.ROW
															.getName())) {
										return sap.firefly.QExceptionHeaderSettings.ROW;
									}
								}
							}
							return sap.firefly.QExceptionHeaderSettings.NONE;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QSetSignComparisonOperatorGroup",
				sap.firefly.XConstant,
				{
					$statics : {
						SINGLE_VALUE : null,
						INTERVAL : null,
						RANGE : null,
						staticSetup : function() {
							sap.firefly.QSetSignComparisonOperatorGroup.SINGLE_VALUE = sap.firefly.QSetSignComparisonOperatorGroup
									.create("SingleValue");
							sap.firefly.QSetSignComparisonOperatorGroup.INTERVAL = sap.firefly.QSetSignComparisonOperatorGroup
									.create("Interval");
							sap.firefly.QSetSignComparisonOperatorGroup.RANGE = sap.firefly.QSetSignComparisonOperatorGroup
									.create("Range");
						},
						create : function(name) {
							var newConstant = new sap.firefly.QSetSignComparisonOperatorGroup();
							newConstant.setName(name);
							newConstant.setupContent();
							return newConstant;
						}
					},
					m_setSigns : null,
					m_comparisonOperators : null,
					setupContent : function() {
						var operatorForSign;
						var operatorForSignIncluding;
						var operatorSignIncluding;
						var operatorSignExcluding;
						this.m_setSigns = sap.firefly.XListOfNameObject
								.create();
						this.m_comparisonOperators = sap.firefly.XHashMapByString
								.create();
						if (sap.firefly.XString.isEqual(this.getName(),
								"SingleValue")) {
							this.m_setSigns.add(sap.firefly.SetSign.INCLUDING);
							operatorForSign = sap.firefly.XListOfNameObject
									.create();
							operatorForSign
									.add(sap.firefly.ComparisonOperator.EQUAL);
							this.m_comparisonOperators.put(
									sap.firefly.SetSign.INCLUDING.getName(),
									operatorForSign);
						} else {
							if (sap.firefly.XString.isEqual(this.getName(),
									"Interval")) {
								this.m_setSigns
										.add(sap.firefly.SetSign.INCLUDING);
								operatorForSignIncluding = sap.firefly.XListOfNameObject
										.create();
								operatorForSignIncluding
										.add(sap.firefly.ComparisonOperator.BETWEEN);
								operatorForSignIncluding
										.add(sap.firefly.ComparisonOperator.EQUAL);
								this.m_comparisonOperators
										.put(sap.firefly.SetSign.INCLUDING
												.getName(),
												operatorForSignIncluding);
							} else {
								if (sap.firefly.XString.isEqual(this.getName(),
										"Range")) {
									this.m_setSigns
											.add(sap.firefly.SetSign.INCLUDING);
									operatorSignIncluding = sap.firefly.XListOfNameObject
											.create();
									operatorSignIncluding
											.add(sap.firefly.ComparisonOperator.BETWEEN);
									operatorSignIncluding
											.add(sap.firefly.ComparisonOperator.EQUAL);
									operatorSignIncluding
											.add(sap.firefly.ComparisonOperator.GREATER_EQUAL);
									operatorSignIncluding
											.add(sap.firefly.ComparisonOperator.GREATER_THAN);
									operatorSignIncluding
											.add(sap.firefly.ComparisonOperator.LESS_EQUAL);
									operatorSignIncluding
											.add(sap.firefly.ComparisonOperator.LESS_THAN);
									operatorSignIncluding
											.add(sap.firefly.ComparisonOperator.NOT_EQUAL);
									operatorSignIncluding
											.add(sap.firefly.ComparisonOperator.NOT_BETWEEN);
									operatorSignIncluding
											.add(sap.firefly.ComparisonOperator.LIKE);
									operatorSignIncluding
											.add(sap.firefly.ComparisonOperator.MATCH);
									this.m_comparisonOperators.put(
											sap.firefly.SetSign.INCLUDING
													.getName(),
											operatorSignIncluding);
									this.m_setSigns
											.add(sap.firefly.SetSign.EXCLUDING);
									operatorSignExcluding = sap.firefly.XListOfNameObject
											.create();
									operatorSignExcluding
											.add(sap.firefly.ComparisonOperator.BETWEEN);
									operatorSignExcluding
											.add(sap.firefly.ComparisonOperator.EQUAL);
									operatorSignExcluding
											.add(sap.firefly.ComparisonOperator.GREATER_EQUAL);
									operatorSignExcluding
											.add(sap.firefly.ComparisonOperator.GREATER_THAN);
									operatorSignExcluding
											.add(sap.firefly.ComparisonOperator.LESS_EQUAL);
									operatorSignExcluding
											.add(sap.firefly.ComparisonOperator.LESS_THAN);
									operatorSignExcluding
											.add(sap.firefly.ComparisonOperator.NOT_EQUAL);
									operatorSignExcluding
											.add(sap.firefly.ComparisonOperator.NOT_BETWEEN);
									operatorSignExcluding
											.add(sap.firefly.ComparisonOperator.LIKE);
									operatorSignExcluding
											.add(sap.firefly.ComparisonOperator.MATCH);
									this.m_comparisonOperators.put(
											sap.firefly.SetSign.EXCLUDING
													.getName(),
											operatorSignExcluding);
								}
							}
						}
					},
					getSetSigns : function() {
						return this.m_setSigns;
					},
					getComparisonOperatorsForSign : function(sign) {
						return this.m_comparisonOperators.getByKey(sign
								.getName());
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QueryFilterUsage",
				sap.firefly.XConstant,
				{
					$statics : {
						QUERY_FILTER : null,
						QUERY_FILTER_EXCLUDING_DIMENSION : null,
						SELECTOR_FILTER : null,
						staticSetup : function() {
							sap.firefly.QueryFilterUsage.QUERY_FILTER = sap.firefly.QueryFilterUsage
									.create("Complete");
							sap.firefly.QueryFilterUsage.QUERY_FILTER_EXCLUDING_DIMENSION = sap.firefly.QueryFilterUsage
									.create("ExludingDimension");
							sap.firefly.QueryFilterUsage.SELECTOR_FILTER = sap.firefly.QueryFilterUsage
									.create("Selector");
						},
						create : function(name) {
							var object = new sap.firefly.QueryFilterUsage();
							object.setupConstant(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ReorderingCapability",
				sap.firefly.XConstant,
				{
					$statics : {
						NONE : null,
						RESTRICTED : null,
						FULL : null,
						staticSetup : function() {
							sap.firefly.ReorderingCapability.NONE = sap.firefly.ReorderingCapability
									.create("None");
							sap.firefly.ReorderingCapability.RESTRICTED = sap.firefly.ReorderingCapability
									.create("Restricted");
							sap.firefly.ReorderingCapability.FULL = sap.firefly.ReorderingCapability
									.create("Full");
						},
						create : function(name) {
							var pt = new sap.firefly.ReorderingCapability();
							pt.setName(name);
							return pt;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.RestoreAction",
				sap.firefly.XConstant,
				{
					$statics : {
						COPY : null,
						CONDITIONAL_COPY : null,
						DEFAULT_VALUE : null,
						staticSetup : function() {
							sap.firefly.RestoreAction.COPY = sap.firefly.RestoreAction
									.create("Copy");
							sap.firefly.RestoreAction.CONDITIONAL_COPY = sap.firefly.RestoreAction
									.create("ConditionalCopy");
							sap.firefly.RestoreAction.DEFAULT_VALUE = sap.firefly.RestoreAction
									.create("DefaultValue");
						},
						create : function(name) {
							var newConstant = new sap.firefly.RestoreAction();
							newConstant.setupConstant(name);
							return newConstant;
						}
					}
				});
$Firefly.createClass("sap.firefly.ResultAlignment", sap.firefly.XConstant, {
	$statics : {
		TOP : null,
		BOTTOM : null,
		TOPBOTTOM : null,
		NONE : null,
		STRUCTURE : null,
		staticSetup : function() {
			sap.firefly.ResultAlignment.TOP = sap.firefly.ResultAlignment
					.create("Top");
			sap.firefly.ResultAlignment.BOTTOM = sap.firefly.ResultAlignment
					.create("Bottom");
			sap.firefly.ResultAlignment.TOPBOTTOM = sap.firefly.ResultAlignment
					.create("TopBottom");
			sap.firefly.ResultAlignment.NONE = sap.firefly.ResultAlignment
					.create("None");
			sap.firefly.ResultAlignment.STRUCTURE = sap.firefly.ResultAlignment
					.create("Structure");
		},
		create : function(name) {
			var object = new sap.firefly.ResultAlignment();
			object.setName(name);
			return object;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.ResultCalculation",
				sap.firefly.XConstant,
				{
					$statics : {
						NOT_DEFINED : null,
						MINIMUM : null,
						MAXIMUM : null,
						SUM : null,
						SUMMATION_OF_ROUNDED_VALUES : null,
						COUNTER_FOR_ALL_DETAILED_VALUES : null,
						COUNTER_FOR_ALL_DETAILED_VALUES_NZ_NULL_ERROR : null,
						FIRST_VALUE : null,
						FIRST_VALUE_NOT_ZERO_NULL_ERROR : null,
						LAST_VALUE : null,
						LAST_VALUE_NOT_ZERO_NULL_ERROR : null,
						AVERAGE : null,
						AVERAGE_DETAILED_VALUES_NOT_ZERO_NULL_ERROR : null,
						STANDARD_DEVIATION : null,
						MEDIAN : null,
						MEDIAN_DETAILED_VALUES_NOT_ZERO_NULL_ERROR : null,
						VARIANCE : null,
						HIDE : null,
						staticSetup : function() {
							sap.firefly.ResultCalculation.NOT_DEFINED = sap.firefly.ResultCalculation
									.create("00");
							sap.firefly.ResultCalculation.SUM = sap.firefly.ResultCalculation
									.create("01");
							sap.firefly.ResultCalculation.MAXIMUM = sap.firefly.ResultCalculation
									.create("02");
							sap.firefly.ResultCalculation.MINIMUM = sap.firefly.ResultCalculation
									.create("03");
							sap.firefly.ResultCalculation.COUNTER_FOR_ALL_DETAILED_VALUES = sap.firefly.ResultCalculation
									.create("04");
							sap.firefly.ResultCalculation.COUNTER_FOR_ALL_DETAILED_VALUES_NZ_NULL_ERROR = sap.firefly.ResultCalculation
									.create("05");
							sap.firefly.ResultCalculation.AVERAGE = sap.firefly.ResultCalculation
									.create("06");
							sap.firefly.ResultCalculation.AVERAGE_DETAILED_VALUES_NOT_ZERO_NULL_ERROR = sap.firefly.ResultCalculation
									.create("07");
							sap.firefly.ResultCalculation.STANDARD_DEVIATION = sap.firefly.ResultCalculation
									.create("08");
							sap.firefly.ResultCalculation.VARIANCE = sap.firefly.ResultCalculation
									.create("09");
							sap.firefly.ResultCalculation.FIRST_VALUE = sap.firefly.ResultCalculation
									.create("11");
							sap.firefly.ResultCalculation.LAST_VALUE = sap.firefly.ResultCalculation
									.create("12");
							sap.firefly.ResultCalculation.SUMMATION_OF_ROUNDED_VALUES = sap.firefly.ResultCalculation
									.create("13");
							sap.firefly.ResultCalculation.HIDE = sap.firefly.ResultCalculation
									.create("14");
						},
						create : function(name) {
							var rc = new sap.firefly.ResultCalculation();
							rc.setName(name);
							return rc;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ResultSetEncoding",
				sap.firefly.XConstant,
				{
					$statics : {
						NONE : null,
						AUTO : null,
						DELTA_RUN_LENGTH : null,
						staticSetup : function() {
							sap.firefly.ResultSetEncoding.NONE = sap.firefly.ResultSetEncoding
									.create("None");
							sap.firefly.ResultSetEncoding.AUTO = sap.firefly.ResultSetEncoding
									.create("Auto");
							sap.firefly.ResultSetEncoding.DELTA_RUN_LENGTH = sap.firefly.ResultSetEncoding
									.create("DeltaRunLength");
						},
						create : function(name) {
							var drillState = new sap.firefly.ResultSetEncoding();
							drillState.setName(name);
							return drillState;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ResultStructureElement",
				sap.firefly.XConstant,
				{
					$statics : {
						MEMBERS : null,
						TOTAL : null,
						TOTAL_INCLUDED_MEMBERS : null,
						TOTAL_REMAINING_MEMBERS : null,
						staticSetup : function() {
							sap.firefly.ResultStructureElement.MEMBERS = sap.firefly.ResultStructureElement
									.create("Members");
							sap.firefly.ResultStructureElement.TOTAL = sap.firefly.ResultStructureElement
									.create("Total");
							sap.firefly.ResultStructureElement.TOTAL_INCLUDED_MEMBERS = sap.firefly.ResultStructureElement
									.create("TotalIncludedMembers");
							sap.firefly.ResultStructureElement.TOTAL_REMAINING_MEMBERS = sap.firefly.ResultStructureElement
									.create("TotalRemainingMembers");
						},
						create : function(name) {
							var object = new sap.firefly.ResultStructureElement();
							object.setName(name);
							return object;
						},
						getStructureElementByMemberType : function(memberType) {
							if (memberType === sap.firefly.MemberType.RESULT) {
								return sap.firefly.ResultStructureElement.TOTAL;
							}
							if (memberType === sap.firefly.MemberType.CONDITION_OTHERS_RESULT) {
								return sap.firefly.ResultStructureElement.TOTAL_REMAINING_MEMBERS;
							}
							if (memberType === sap.firefly.MemberType.CONDITION_RESULT) {
								return sap.firefly.ResultStructureElement.TOTAL_INCLUDED_MEMBERS;
							}
							if (memberType
									.isTypeOf(sap.firefly.MemberType.MEMBER)) {
								return sap.firefly.ResultStructureElement.MEMBERS;
							}
							return null;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ResultVisibility",
				sap.firefly.XConstant,
				{
					$statics : {
						VISIBLE : null,
						HIDDEN : null,
						CONDITIONAL : null,
						staticSetup : function() {
							sap.firefly.ResultVisibility.VISIBLE = sap.firefly.ResultVisibility
									.create("Visible");
							sap.firefly.ResultVisibility.HIDDEN = sap.firefly.ResultVisibility
									.create("Hidden");
							sap.firefly.ResultVisibility.CONDITIONAL = sap.firefly.ResultVisibility
									.create("Conditional");
						},
						create : function(name) {
							var object = new sap.firefly.ResultVisibility();
							object.setName(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ReturnedDataSelection",
				sap.firefly.XConstant,
				{
					$statics : {
						s_lookup : null,
						CELL_DATA_TYPE : null,
						ACTIONS : null,
						CELL_FORMAT : null,
						CELL_VALUE_TYPES : null,
						CELL_MEASURE : null,
						EXCEPTION_ALERTLEVEL : null,
						EXCEPTION_NAME : null,
						EXCEPTION_SETTINGS : null,
						EXCEPTIONS : null,
						INPUT_ENABLED : null,
						INPUT_READINESS_STATES : null,
						NUMERIC_ROUNDING : null,
						NUMERIC_SHIFT : null,
						TUPLE_DISPLAY_LEVEL : null,
						TUPLE_DRILL_STATE : null,
						TUPLE_ELEMENT_IDS : null,
						TUPLE_ELEMENT_INDEXES : null,
						TUPLE_LEVEL : null,
						TUPLE_PARENT_INDEXES : null,
						UNIT_DESCRIPTIONS : null,
						UNIT_TYPES : null,
						UNITS : null,
						VALUES : null,
						VALUES_FORMATTED : null,
						VALUES_ROUNDED : null,
						staticSetup : function() {
							sap.firefly.ReturnedDataSelection.s_lookup = sap.firefly.XHashMapByString
									.create();
							sap.firefly.ReturnedDataSelection.ACTIONS = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("Actions");
							sap.firefly.ReturnedDataSelection.CELL_DATA_TYPE = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("CellDataType");
							sap.firefly.ReturnedDataSelection.CELL_FORMAT = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("CellFormat");
							sap.firefly.ReturnedDataSelection.CELL_MEASURE = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("CellMeasure");
							sap.firefly.ReturnedDataSelection.CELL_VALUE_TYPES = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("CellValueTypes");
							sap.firefly.ReturnedDataSelection.EXCEPTION_ALERTLEVEL = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("ExceptionAlertLevel");
							sap.firefly.ReturnedDataSelection.EXCEPTION_NAME = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("ExceptionName");
							sap.firefly.ReturnedDataSelection.EXCEPTION_SETTINGS = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("ExceptionSettings");
							sap.firefly.ReturnedDataSelection.EXCEPTIONS = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("Exceptions");
							sap.firefly.ReturnedDataSelection.INPUT_ENABLED = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("InputEnabled");
							sap.firefly.ReturnedDataSelection.INPUT_READINESS_STATES = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("InputReadinessStates");
							sap.firefly.ReturnedDataSelection.NUMERIC_ROUNDING = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("NumericRounding");
							sap.firefly.ReturnedDataSelection.NUMERIC_SHIFT = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("NumericShift");
							sap.firefly.ReturnedDataSelection.TUPLE_DISPLAY_LEVEL = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("TupleDisplayLevel");
							sap.firefly.ReturnedDataSelection.TUPLE_DRILL_STATE = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("TupleDrillState");
							sap.firefly.ReturnedDataSelection.TUPLE_ELEMENT_IDS = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("TupleElementIds");
							sap.firefly.ReturnedDataSelection.TUPLE_ELEMENT_INDEXES = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("TupleElementIndexes");
							sap.firefly.ReturnedDataSelection.TUPLE_LEVEL = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("TupleLevel");
							sap.firefly.ReturnedDataSelection.TUPLE_PARENT_INDEXES = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("TupleParentIndexes");
							sap.firefly.ReturnedDataSelection.UNIT_DESCRIPTIONS = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("UnitDescriptions");
							sap.firefly.ReturnedDataSelection.UNIT_TYPES = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("UnitTypes");
							sap.firefly.ReturnedDataSelection.UNITS = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("Units");
							sap.firefly.ReturnedDataSelection.VALUES = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("Values");
							sap.firefly.ReturnedDataSelection.VALUES_FORMATTED = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("ValuesFormatted");
							sap.firefly.ReturnedDataSelection.VALUES_ROUNDED = sap.firefly.ReturnedDataSelection
									.createReturnedDataSelectionType("ValuesRounded");
						},
						createReturnedDataSelectionType : function(name) {
							var newConstant = new sap.firefly.ReturnedDataSelection();
							newConstant.setName(name);
							sap.firefly.ReturnedDataSelection.s_lookup.put(
									name, newConstant);
							return newConstant;
						},
						lookup : function(name) {
							return sap.firefly.ReturnedDataSelection.s_lookup
									.getByKey(name);
						},
						lookupOrCreate : function(name) {
							var dataSelection;
							if (sap.firefly.XStringUtils.isNullOrEmpty(name)) {
								return null;
							}
							dataSelection = sap.firefly.ReturnedDataSelection
									.lookup(name);
							if (dataSelection === null) {
								dataSelection = sap.firefly.ReturnedDataSelection
										.createReturnedDataSelectionType(name);
							}
							return dataSelection;
						},
						getAllReturnedDataSelections : function() {
							return sap.firefly.ReturnedDataSelection.s_lookup
									.getValuesAsReadOnlyList();
						}
					}
				});
$Firefly.createClass("sap.firefly.SetSign", sap.firefly.XConstant, {
	$statics : {
		INCLUDING : null,
		EXCLUDING : null,
		s_lookup : null,
		staticSetup : function() {
			sap.firefly.SetSign.s_lookup = sap.firefly.XHashMapByString
					.create();
			sap.firefly.SetSign.INCLUDING = sap.firefly.SetSign
					.create("INCLUDING");
			sap.firefly.SetSign.EXCLUDING = sap.firefly.SetSign
					.create("EXCLUDING");
		},
		create : function(name) {
			var newConstant = new sap.firefly.SetSign();
			newConstant.setName(name);
			sap.firefly.SetSign.s_lookup.put(name, newConstant);
			return newConstant;
		},
		lookup : function(name) {
			return sap.firefly.SetSign.s_lookup.getByKey(name);
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.SingleValueCalculation",
				sap.firefly.XConstant,
				{
					$statics : {
						NOT_DEFINED : null,
						MINIMUM : null,
						MAXIMUM : null,
						SUM : null,
						MINIMUM_VALUES_NOT_ZERO_NULL_ERROR : null,
						COUNTER_FOR_ALL_DETAILED_VALUES : null,
						COUNTER_FOR_ALL_DETAILED_VALUES_NZ_NULL_ERROR : null,
						AVERAGE : null,
						AVERAGE_DETAILED_VALUES_NOT_ZERO_NULL_ERROR : null,
						HIDE : null,
						MOVING_MAX_VALUE : null,
						MOVING_MIN_VALUE : null,
						MAX_VALUE_NOT_ZERO_NULL_ERROR : null,
						RANK_NUMBER : null,
						OLYMPIC_RANK_NUMBER : null,
						NORMALIZED_UNRESTRICTED_OVERALL_RESULT : null,
						NORMALIZED_OVERALL_RESULT : null,
						NORMALIZED_NEXT_GROUP_LEVEL_RESULT : null,
						staticSetup : function() {
							sap.firefly.SingleValueCalculation.NOT_DEFINED = sap.firefly.SingleValueCalculation
									.create("NotDefined");
							sap.firefly.SingleValueCalculation.SUM = sap.firefly.SingleValueCalculation
									.create("1");
							sap.firefly.SingleValueCalculation.MAXIMUM = sap.firefly.SingleValueCalculation
									.create("2");
							sap.firefly.SingleValueCalculation.MINIMUM = sap.firefly.SingleValueCalculation
									.create("3");
							sap.firefly.SingleValueCalculation.COUNTER_FOR_ALL_DETAILED_VALUES = sap.firefly.SingleValueCalculation
									.create("4");
							sap.firefly.SingleValueCalculation.COUNTER_FOR_ALL_DETAILED_VALUES_NZ_NULL_ERROR = sap.firefly.SingleValueCalculation
									.create("5");
							sap.firefly.SingleValueCalculation.AVERAGE = sap.firefly.SingleValueCalculation
									.create("6");
							sap.firefly.SingleValueCalculation.AVERAGE_DETAILED_VALUES_NOT_ZERO_NULL_ERROR = sap.firefly.SingleValueCalculation
									.create("7");
							sap.firefly.SingleValueCalculation.MINIMUM_VALUES_NOT_ZERO_NULL_ERROR = sap.firefly.SingleValueCalculation
									.create("E");
							sap.firefly.SingleValueCalculation.MAX_VALUE_NOT_ZERO_NULL_ERROR = sap.firefly.SingleValueCalculation
									.create("D");
							sap.firefly.SingleValueCalculation.MOVING_MIN_VALUE = sap.firefly.SingleValueCalculation
									.create("B");
							sap.firefly.SingleValueCalculation.NORMALIZED_NEXT_GROUP_LEVEL_RESULT = sap.firefly.SingleValueCalculation
									.create("C");
							sap.firefly.SingleValueCalculation.NORMALIZED_OVERALL_RESULT = sap.firefly.SingleValueCalculation
									.create("G");
							sap.firefly.SingleValueCalculation.NORMALIZED_UNRESTRICTED_OVERALL_RESULT = sap.firefly.SingleValueCalculation
									.create("R");
							sap.firefly.SingleValueCalculation.RANK_NUMBER = sap.firefly.SingleValueCalculation
									.create("S");
							sap.firefly.SingleValueCalculation.OLYMPIC_RANK_NUMBER = sap.firefly.SingleValueCalculation
									.create("O");
							sap.firefly.SingleValueCalculation.HIDE = sap.firefly.SingleValueCalculation
									.create("0");
						},
						create : function(name) {
							var svc = new sap.firefly.SingleValueCalculation();
							svc.setName(name);
							return svc;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.UsageShapeType",
				sap.firefly.XConstant,
				{
					$statics : {
						NOT_VISIBLE : null,
						DISPLAY_ONLY : null,
						CHANGE_TO_EXISTING : null,
						ADD_NEW : null,
						staticSetupUsageShapey : function() {
							sap.firefly.UsageShapeType.NOT_VISIBLE = sap.firefly.UsageShapeType
									.createUsageShape("I");
							sap.firefly.UsageShapeType.DISPLAY_ONLY = sap.firefly.UsageShapeType
									.createUsageShape("D");
							sap.firefly.UsageShapeType.CHANGE_TO_EXISTING = sap.firefly.UsageShapeType
									.createUsageShape("C");
							sap.firefly.UsageShapeType.ADD_NEW = sap.firefly.UsageShapeType
									.createUsageShape("A");
						},
						createUsageShape : function(name) {
							var newConstant = new sap.firefly.UsageShapeType();
							newConstant.setName(name);
							return newConstant;
						},
						getUsageShapeType : function(type) {
							if (sap.firefly.XString.isEqual(
									sap.firefly.UsageShapeType.NOT_VISIBLE
											.getName(), type)) {
								return sap.firefly.UsageShapeType.NOT_VISIBLE;
							} else {
								if (sap.firefly.XString.isEqual(
										sap.firefly.UsageShapeType.DISPLAY_ONLY
												.getName(), type)) {
									return sap.firefly.UsageShapeType.DISPLAY_ONLY;
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.UsageShapeType.CHANGE_TO_EXISTING
															.getName(), type)) {
										return sap.firefly.UsageShapeType.CHANGE_TO_EXISTING;
									} else {
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.UsageShapeType.ADD_NEW
																.getName(),
														type)) {
											return sap.firefly.UsageShapeType.ADD_NEW;
										}
									}
								}
							}
							return null;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ValueException",
				sap.firefly.XConstant,
				{
					$statics : {
						NORMAL : null,
						NULL_VALUE : null,
						ZERO : null,
						UNDEFINED : null,
						OVERFLOW : null,
						NO_PRESENTATION : null,
						DIFF0 : null,
						ERROR : null,
						NO_AUTHORITY : null,
						MIXED_CURRENCIES_OR_UNITS : null,
						UNDEFINED_NOP : null,
						s_instances : null,
						staticSetup : function() {
							sap.firefly.ValueException.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.ValueException.NORMAL = sap.firefly.ValueException
									.create("Normal", true, 0);
							sap.firefly.ValueException.NULL_VALUE = sap.firefly.ValueException
									.create("NullValue", true, -1);
							sap.firefly.ValueException.ZERO = sap.firefly.ValueException
									.create("Zero", true, 0);
							sap.firefly.ValueException.UNDEFINED = sap.firefly.ValueException
									.create("Undefined", false, 3);
							sap.firefly.ValueException.OVERFLOW = sap.firefly.ValueException
									.create("Overflow", false, 5);
							sap.firefly.ValueException.NO_PRESENTATION = sap.firefly.ValueException
									.create("NoPresentation", false, 4);
							sap.firefly.ValueException.DIFF0 = sap.firefly.ValueException
									.create("Diff0", false, 6);
							sap.firefly.ValueException.ERROR = sap.firefly.ValueException
									.create("Error", false, 7);
							sap.firefly.ValueException.NO_AUTHORITY = sap.firefly.ValueException
									.create("NoAuthority", false, 2);
							sap.firefly.ValueException.MIXED_CURRENCIES_OR_UNITS = sap.firefly.ValueException
									.create("MixedCurrenciesOrUnits", false, 2);
							sap.firefly.ValueException.UNDEFINED_NOP = sap.firefly.ValueException
									.create("UndefinedNop", false, 2);
						},
						create : function(constant, validValue,
								naturalOrderValue) {
							var sp = new sap.firefly.ValueException();
							sp.setup(constant, validValue, naturalOrderValue);
							sap.firefly.ValueException.s_instances.put(
									constant, sp);
							return sp;
						},
						get : function(name) {
							return sap.firefly.ValueException.s_instances
									.getByKey(name);
						}
					},
					m_valid : false,
					m_naturalOrderValue : 0,
					setup : function(constant, validValue, naturalOrderValue) {
						this.setName(constant);
						this.m_valid = validValue;
						this.m_naturalOrderValue = naturalOrderValue;
					},
					isValidValue : function() {
						return this.m_valid;
					},
					compareTo : function(objectToCompare) {
						return (objectToCompare).m_naturalOrderValue
								- this.m_naturalOrderValue;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.VariableMode",
				sap.firefly.XConstant,
				{
					$statics : {
						SUBMIT_AND_REINIT : null,
						DIRECT_VALUE_TRANSFER : null,
						staticSetup : function() {
							sap.firefly.VariableMode.SUBMIT_AND_REINIT = sap.firefly.VariableMode
									.create("SubmitAndReInit");
							sap.firefly.VariableMode.DIRECT_VALUE_TRANSFER = sap.firefly.VariableMode
									.create("DirectValueTransfer");
						},
						create : function(name) {
							var setting = new sap.firefly.VariableMode();
							setting.setName(name);
							return setting;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.VisibilityType",
				sap.firefly.XConstant,
				{
					$statics : {
						CENTRAL : null,
						CENTRAL_NOT_VISIBLE : null,
						CENTRAL_DISPLAY_ONLY : null,
						CENTRAL_CHANGE_TO_EXISTING : null,
						CENTRAL_ADD_NEW : null,
						LOCAL : null,
						LOCAL_NOT_VISIBLE : null,
						LOCAL_DISPLAY_ONLY : null,
						LOCAL_CHANGE_TO_EXISTING : null,
						LOCAL_ADD_NEW : null,
						staticSetupVisibility : function() {
							sap.firefly.VisibilityType.CENTRAL = sap.firefly.VisibilityType
									.createVisibility("C");
							sap.firefly.VisibilityType.CENTRAL_NOT_VISIBLE = sap.firefly.VisibilityType
									.createVisibility("C/I");
							sap.firefly.VisibilityType.CENTRAL_DISPLAY_ONLY = sap.firefly.VisibilityType
									.createVisibility("C/D");
							sap.firefly.VisibilityType.CENTRAL_CHANGE_TO_EXISTING = sap.firefly.VisibilityType
									.createVisibility("C/C");
							sap.firefly.VisibilityType.CENTRAL_ADD_NEW = sap.firefly.VisibilityType
									.createVisibility("C/A");
							sap.firefly.VisibilityType.LOCAL = sap.firefly.VisibilityType
									.createVisibility("L");
							sap.firefly.VisibilityType.LOCAL_NOT_VISIBLE = sap.firefly.VisibilityType
									.createVisibility("L/I");
							sap.firefly.VisibilityType.LOCAL_DISPLAY_ONLY = sap.firefly.VisibilityType
									.createVisibility("L/D");
							sap.firefly.VisibilityType.LOCAL_CHANGE_TO_EXISTING = sap.firefly.VisibilityType
									.createVisibility("L/C");
							sap.firefly.VisibilityType.LOCAL_ADD_NEW = sap.firefly.VisibilityType
									.createVisibility("L/A");
						},
						createVisibility : function(name) {
							var newConstant = new sap.firefly.VisibilityType();
							newConstant.setName(name);
							return newConstant;
						},
						getLocalityType : function(type) {
							if ((type === null)
									|| (sap.firefly.XString
											.size(type.getName()) < 1)) {
								return null;
							}
							return sap.firefly.LocalityType
									.getLocalityType(sap.firefly.XString
											.substring(type.getName(), 0, 1));
						},
						getUsageShapeType : function(type) {
							if ((type === null)
									|| (sap.firefly.XString
											.size(type.getName()) < 3)) {
								return null;
							}
							return sap.firefly.UsageShapeType
									.getUsageShapeType(sap.firefly.XString
											.substring(type.getName(), 2, 3));
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ZeroSuppressionType",
				sap.firefly.XConstant,
				{
					$statics : {
						NONE : null,
						TOTAL_IS_ZERO : null,
						ALL_CELLS_ARE_ZERO : null,
						create : function(constant, index) {
							var object = new sap.firefly.ZeroSuppressionType();
							object.m_index = index;
							object.setupConstant(constant);
							return object;
						},
						staticSetup : function() {
							sap.firefly.ZeroSuppressionType.NONE = sap.firefly.ZeroSuppressionType
									.create("NONE", 0);
							sap.firefly.ZeroSuppressionType.TOTAL_IS_ZERO = sap.firefly.ZeroSuppressionType
									.create("TOTAL_IS_ZERO", 1);
							sap.firefly.ZeroSuppressionType.ALL_CELLS_ARE_ZERO = sap.firefly.ZeroSuppressionType
									.create("ALl_CELLS_ARE_ZERO", 2);
						}
					},
					m_index : 0,
					getIndex : function() {
						return this.m_index;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DrillOperationType",
				sap.firefly.XConstant,
				{
					$statics : {
						CONTEXT : null,
						ROOT : null,
						staticSetup : function() {
							sap.firefly.DrillOperationType.CONTEXT = sap.firefly.DrillOperationType
									.create("Context");
							sap.firefly.DrillOperationType.ROOT = sap.firefly.DrillOperationType
									.create("Root");
						},
						create : function(name) {
							var object = new sap.firefly.DrillOperationType();
							object.setName(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.HierarchyType",
				sap.firefly.XConstant,
				{
					$statics : {
						UNKNOWN : null,
						FULLY_BALANCED : null,
						RAGGED_BALANCED : null,
						UNBALANCED : null,
						NETWORK : null,
						s_instances : null,
						staticSetup : function() {
							sap.firefly.HierarchyType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.HierarchyType.UNKNOWN = sap.firefly.HierarchyType
									.create("Unknown", false);
							sap.firefly.HierarchyType.FULLY_BALANCED = sap.firefly.HierarchyType
									.create("FullyBalanced", true);
							sap.firefly.HierarchyType.RAGGED_BALANCED = sap.firefly.HierarchyType
									.create("RaggedBalanced", true);
							sap.firefly.HierarchyType.NETWORK = sap.firefly.HierarchyType
									.create("Network", false);
							sap.firefly.HierarchyType.UNBALANCED = sap.firefly.HierarchyType
									.create("Unbalanced", false);
						},
						create : function(camelCaseName, leveledHierarchy) {
							var newConstant = new sap.firefly.HierarchyType();
							newConstant.setName(camelCaseName);
							newConstant.m_leveledHierarchy = leveledHierarchy;
							sap.firefly.HierarchyType.s_instances.put(
									camelCaseName, newConstant);
							return newConstant;
						},
						lookup : function(name) {
							var result = sap.firefly.HierarchyType.s_instances
									.getByKey(name);
							if (result === null) {
								return sap.firefly.HierarchyType.UNKNOWN;
							}
							return result;
						}
					},
					m_leveledHierarchy : false,
					isLeveledHierarchy : function() {
						return this.m_leveledHierarchy;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QueryCloneMode",
				sap.firefly.XConstant,
				{
					$statics : {
						CURRENT_STATE_INA : null,
						CURRENT_STATE : null,
						BASE_STATE : null,
						create : function(constant) {
							var object = new sap.firefly.QueryCloneMode();
							object.setupConstant(constant);
							return object;
						},
						staticSetup : function() {
							sap.firefly.QueryCloneMode.CURRENT_STATE = sap.firefly.QueryCloneMode
									.create("CurrentStateCopyCtor");
							sap.firefly.QueryCloneMode.CURRENT_STATE_INA = sap.firefly.QueryCloneMode
									.create("CurrentState");
							sap.firefly.QueryCloneMode.BASE_STATE = sap.firefly.QueryCloneMode
									.create("BaseState");
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QueryManagerMode",
				sap.firefly.XConstant,
				{
					$statics : {
						DEFAULT : null,
						RAW_QUERY : null,
						BLENDING : null,
						create : function(constant) {
							var object = new sap.firefly.QueryManagerMode();
							object.setupConstant(constant);
							return object;
						},
						staticSetup : function() {
							sap.firefly.QueryManagerMode.DEFAULT = sap.firefly.QueryManagerMode
									.create("Default");
							sap.firefly.QueryManagerMode.RAW_QUERY = sap.firefly.QueryManagerMode
									.create("RawQuery");
							sap.firefly.QueryManagerMode.BLENDING = sap.firefly.QueryManagerMode
									.create("Blending");
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QExtendedDimension",
				sap.firefly.DfNameTextObject,
				{
					$statics : {
						create : function(name, joinFieldName,
								joinFieldNameExternal) {
							var extendedDimension = new sap.firefly.QExtendedDimension();
							extendedDimension.setup(name, joinFieldName,
									joinFieldNameExternal);
							return extendedDimension;
						}
					},
					m_dataSource : null,
					m_joinType : null,
					m_joinFieldName : null,
					m_joinFieldNameExternal : null,
					m_joinParameters : null,
					m_dimensionType : null,
					m_renamingMode : null,
					setup : function(name, joinFieldName, joinFieldNameExternal) {
						this.setName(name);
						this.m_joinFieldName = joinFieldName;
						this.m_joinFieldNameExternal = joinFieldNameExternal;
						this.m_joinParameters = sap.firefly.XListOfString
								.create();
					},
					setJoinType : function(joinType) {
						this.m_joinType = joinType;
						if (this.m_joinType
								.isTypeOf(sap.firefly.JoinType._SPATIAL)) {
							this.m_dimensionType = sap.firefly.DimensionType.GIS_DIMENSION;
						} else {
							if (this.m_dimensionType === null) {
								this.m_dimensionType = sap.firefly.DimensionType.TIME;
							}
						}
					},
					setDimensionType : function(dimensionType) {
						if (dimensionType === null) {
							throw sap.firefly.XException
									.createRuntimeException("The dimension type of an extended dimension must not be null!");
						}
						if ((dimensionType !== sap.firefly.DimensionType.TIME)
								&& (dimensionType !== sap.firefly.DimensionType.DATE)
								&& (dimensionType !== sap.firefly.DimensionType.VERSION)
								&& (dimensionType !== sap.firefly.DimensionType.GIS_DIMENSION)) {
							throw sap.firefly.XException
									.createRuntimeException(sap.firefly.XStringUtils
											.concatenate3("Dimension type '",
													dimensionType.getName(),
													"' is not supported for extended dimensions!"));
						}
						this.m_dimensionType = dimensionType;
					},
					getJoinType : function() {
						return this.m_joinType;
					},
					setDataSource : function(datasource) {
						this.m_dataSource = datasource;
					},
					getDataSource : function() {
						return this.m_dataSource;
					},
					getJoinField : function() {
						return this.m_joinFieldName;
					},
					setJoinFieldNameExternal : function(fieldName) {
						this.m_joinFieldNameExternal = fieldName;
					},
					isEqualTo : function(other) {
						var otherExtDim;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						otherExtDim = other;
						if (sap.firefly.XString.isEqual(this.getName(),
								otherExtDim.getName()) === false) {
							return false;
						}
						if (this.getJoinType() !== otherExtDim.getJoinType()) {
							return false;
						}
						if (this.getDimensionType() !== otherExtDim
								.getDimensionType()) {
							return false;
						}
						if (sap.firefly.XString.isEqual(this
								.getJoinFieldNameExternal(), otherExtDim
								.getJoinFieldNameExternal()) === false) {
							return false;
						}
						if (sap.firefly.XString.isEqual(this.getJoinField(),
								otherExtDim.getJoinField()) === false) {
							return false;
						}
						if (this.getDataSource().isEqualTo(
								otherExtDim.getDataSource()) === false) {
							return false;
						}
						return true;
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						sb.append(this.getName());
						sb.append(" (");
						if (this.getJoinField() !== null) {
							sb.append(this.m_joinFieldName);
						}
						sb.append(" ");
						if (this.m_joinType !== null) {
							sb.append(this.m_joinType.getName());
						}
						if (this.getJoinFieldNameExternal() !== null) {
							sb.append(this.getJoinFieldNameExternal());
						}
						sb.append(")");
						return sb.toString();
					},
					getJoinFieldNameExternal : function() {
						return this.m_joinFieldNameExternal;
					},
					getDimensionType : function() {
						return this.m_dimensionType;
					},
					getJoinParameters : function() {
						return this.m_joinParameters;
					},
					setJoinField : function(fieldName) {
						this.m_joinFieldName = fieldName;
					},
					releaseObject : function() {
						this.m_dataSource = null;
						this.m_joinType = null;
						if (this.m_joinParameters !== null) {
							this.m_joinParameters.releaseObject();
							this.m_joinParameters = null;
						}
						this.m_dimensionType = null;
						this.m_renamingMode = null;
						sap.firefly.QExtendedDimension.$superclass.releaseObject
								.call(this);
					},
					setRenamingMode : function(mode) {
						this.m_renamingMode = mode;
					},
					getRenamingMode : function() {
						return this.m_renamingMode;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ResultSetType",
				sap.firefly.XConstant,
				{
					$statics : {
						CLASSIC : null,
						CURSOR : null,
						s_instances : null,
						staticSetup : function() {
							sap.firefly.ResultSetType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.ResultSetType.CLASSIC = sap.firefly.ResultSetType
									.create("Classic");
							sap.firefly.ResultSetType.CURSOR = sap.firefly.ResultSetType
									.create("Cursor");
						},
						create : function(camelCaseName) {
							var newConstant = new sap.firefly.ResultSetType();
							newConstant.setName(camelCaseName);
							sap.firefly.ResultSetType.s_instances.put(
									camelCaseName, newConstant);
							return newConstant;
						},
						lookup : function(name) {
							return sap.firefly.ResultSetType.s_instances
									.getByKey(name);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QVariableVariant",
				sap.firefly.DfNameTextObject,
				{
					$statics : {
						createVariantWithTypeAndScope : function(name, text,
								variantType, scope) {
							var newVariableVariant = new sap.firefly.QVariableVariant();
							newVariableVariant.setName(name);
							newVariableVariant.setText(text);
							newVariableVariant.m_variantType = variantType;
							newVariableVariant.m_scope = scope;
							return newVariableVariant;
						}
					},
					m_variantType : null,
					m_scope : null,
					clone : function() {
						return sap.firefly.QVariableVariant
								.createVariantWithTypeAndScope(this.getName(),
										this.getText(), this.m_variantType,
										this.m_scope);
					},
					releaseObject : function() {
						this.m_variantType = null;
						this.m_scope = null;
						sap.firefly.QVariableVariant.$superclass.releaseObject
								.call(this);
					},
					getVariableVariantType : function() {
						return this.m_variantType;
					},
					getScope : function() {
						return this.m_scope;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningCommandType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						PLANNING_CONTEXT_COMMAND : null,
						DATA_AREA_COMMAND : null,
						PLANNING_MODEL_COMMAND : null,
						PLANNING_REQUEST : null,
						DATA_AREA_REQUEST : null,
						PLANNING_MODEL_REQUEST : null,
						PLANNING_COMMAND_WITH_ID : null,
						PLANNING_OPERATION : null,
						PLANNING_FUNCTION : null,
						PLANNING_SEQUENCE : null,
						PLANNING_ACTION : null,
						staticSetup : function() {
							sap.firefly.PlanningCommandType.PLANNING_CONTEXT_COMMAND = sap.firefly.PlanningCommandType
									.create("PLANNING_CONTEXT_COMMAND", null);
							sap.firefly.PlanningCommandType.DATA_AREA_COMMAND = sap.firefly.PlanningCommandType
									.create(
											"DATA_AREA_COMMAND",
											sap.firefly.PlanningCommandType.PLANNING_CONTEXT_COMMAND);
							sap.firefly.PlanningCommandType.PLANNING_MODEL_COMMAND = sap.firefly.PlanningCommandType
									.create(
											"PLANNING_MODEL_COMMAND",
											sap.firefly.PlanningCommandType.PLANNING_CONTEXT_COMMAND);
							sap.firefly.PlanningCommandType.PLANNING_REQUEST = sap.firefly.PlanningCommandType
									.create("PLANNING_REQUEST", null);
							sap.firefly.PlanningCommandType.DATA_AREA_REQUEST = sap.firefly.PlanningCommandType
									.create(
											"DATA_AREA_REQUEST",
											sap.firefly.PlanningCommandType.PLANNING_REQUEST);
							sap.firefly.PlanningCommandType.PLANNING_MODEL_REQUEST = sap.firefly.PlanningCommandType
									.create(
											"PLANNING_CONTEXT_COMMAND",
											sap.firefly.PlanningCommandType.PLANNING_REQUEST);
							sap.firefly.PlanningCommandType.PLANNING_COMMAND_WITH_ID = sap.firefly.PlanningCommandType
									.create("PLANNING_COMMAND_WITH_ID", null);
							sap.firefly.PlanningCommandType.PLANNING_OPERATION = sap.firefly.PlanningCommandType
									.create(
											"PLANNING_OPERATION",
											sap.firefly.PlanningCommandType.PLANNING_COMMAND_WITH_ID);
							sap.firefly.PlanningCommandType.PLANNING_FUNCTION = sap.firefly.PlanningCommandType
									.create(
											"PLANNING_FUNCTION",
											sap.firefly.PlanningCommandType.PLANNING_OPERATION);
							sap.firefly.PlanningCommandType.PLANNING_SEQUENCE = sap.firefly.PlanningCommandType
									.create(
											"PLANNING_SEQUENCE",
											sap.firefly.PlanningCommandType.PLANNING_OPERATION);
							sap.firefly.PlanningCommandType.PLANNING_ACTION = sap.firefly.PlanningCommandType
									.create(
											"PLANNING_ACTION",
											sap.firefly.PlanningCommandType.PLANNING_COMMAND_WITH_ID);
						},
						create : function(name, parent) {
							var object = new sap.firefly.PlanningCommandType();
							object.setupConstant(name);
							object.setParent(parent);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningOperationType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						PLANNING_FUNCTION : null,
						PLANNING_SEQUENCE : null,
						staticSetup : function() {
							sap.firefly.PlanningOperationType.PLANNING_FUNCTION = sap.firefly.PlanningOperationType
									.create("PLANNING_FUNCTION", null);
							sap.firefly.PlanningOperationType.PLANNING_SEQUENCE = sap.firefly.PlanningOperationType
									.create("PLANNING_SEQUENCE", null);
						},
						create : function(name, parentType) {
							var object = new sap.firefly.PlanningOperationType();
							object.setupConstant(name);
							object.setParent(parentType);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DataAreaRequestType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						GET_PLANNING_OPERATION_METADATA : null,
						GET_PLANNING_FUNCTION_METADATA : null,
						GET_PLANNING_SEQUENCE_METADATA : null,
						CREATE_PLANNING_OPERATION : null,
						CREATE_PLANNING_FUNCTION : null,
						CREATE_PLANNING_SEQUENCE : null,
						staticSetup : function() {
							sap.firefly.DataAreaRequestType.GET_PLANNING_OPERATION_METADATA = sap.firefly.DataAreaRequestType
									.create("GET_PLANNING_OPERATION_METADATA",
											null);
							sap.firefly.DataAreaRequestType.GET_PLANNING_FUNCTION_METADATA = sap.firefly.DataAreaRequestType
									.create(
											"GET_PLANNING_FUNCTION_METADATA",
											sap.firefly.DataAreaRequestType.GET_PLANNING_OPERATION_METADATA);
							sap.firefly.DataAreaRequestType.GET_PLANNING_SEQUENCE_METADATA = sap.firefly.DataAreaRequestType
									.create(
											"GET_PLANNING_SEQUENCE_METADATA",
											sap.firefly.DataAreaRequestType.GET_PLANNING_OPERATION_METADATA);
							sap.firefly.DataAreaRequestType.CREATE_PLANNING_OPERATION = sap.firefly.DataAreaRequestType
									.create("CREATE_PLANNING_OPERATION", null);
							sap.firefly.DataAreaRequestType.CREATE_PLANNING_FUNCTION = sap.firefly.DataAreaRequestType
									.create(
											"CREATE_PLANNING_FUNCTION",
											sap.firefly.DataAreaRequestType.CREATE_PLANNING_OPERATION);
							sap.firefly.DataAreaRequestType.CREATE_PLANNING_SEQUENCE = sap.firefly.DataAreaRequestType
									.create(
											"CREATE_PLANNING_SEQUENCE",
											sap.firefly.DataAreaRequestType.CREATE_PLANNING_OPERATION);
						},
						create : function(name, parentType) {
							var object = new sap.firefly.DataAreaRequestType();
							object.setupConstant(name);
							object.setParent(parentType);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningActionType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						VERSION_ACTION : null,
						QUERY_ACTION : null,
						DATA_ENTRY : null,
						PUBLISH : null,
						INITIAL_POPULATE : null,
						GENERAL : null,
						QUERY_SINGLE : null,
						UNKNOWN : null,
						staticSetup : function() {
							sap.firefly.PlanningActionType.UNKNOWN = sap.firefly.PlanningActionType
									.create("UNKNOWN", null);
							sap.firefly.PlanningActionType.VERSION_ACTION = sap.firefly.PlanningActionType
									.create("VERSION_ACTION", null);
							sap.firefly.PlanningActionType.QUERY_ACTION = sap.firefly.PlanningActionType
									.create("QUERY_ACTION", null);
							sap.firefly.PlanningActionType.PUBLISH = sap.firefly.PlanningActionType
									.create(
											"PUBLISH",
											sap.firefly.PlanningActionType.VERSION_ACTION);
							sap.firefly.PlanningActionType.INITIAL_POPULATE = sap.firefly.PlanningActionType
									.create(
											"INITIAL_POPULATE",
											sap.firefly.PlanningActionType.VERSION_ACTION);
							sap.firefly.PlanningActionType.GENERAL = sap.firefly.PlanningActionType
									.create(
											"GENERAL",
											sap.firefly.PlanningActionType.VERSION_ACTION);
							sap.firefly.PlanningActionType.DATA_ENTRY = sap.firefly.PlanningActionType
									.create(
											"DATA_ENTRY",
											sap.firefly.PlanningActionType.QUERY_ACTION);
							sap.firefly.PlanningActionType.QUERY_SINGLE = sap.firefly.PlanningActionType
									.create(
											"QUERY_SINGLE",
											sap.firefly.PlanningActionType.QUERY_ACTION);
						},
						create : function(name, parent) {
							var object = new sap.firefly.PlanningActionType();
							object.setupConstant(name);
							object.setParent(parent);
							return object;
						},
						lookup : function(actionTypeId) {
							if (actionTypeId === 0) {
								return sap.firefly.PlanningActionType.DATA_ENTRY;
							}
							if (actionTypeId === 1) {
								return sap.firefly.PlanningActionType.PUBLISH;
							}
							if (actionTypeId === 2) {
								return sap.firefly.PlanningActionType.INITIAL_POPULATE;
							}
							if (actionTypeId === 3) {
								return sap.firefly.PlanningActionType.GENERAL;
							}
							if (actionTypeId === 4) {
								return sap.firefly.PlanningActionType.QUERY_SINGLE;
							}
							return sap.firefly.PlanningActionType.UNKNOWN;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PlanningModelRequestType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						GET_ACTION_PARAMETERS : null,
						CREATE_PLANNING_ACTION : null,
						CREATE_PLANNING_ACTION_BASE : null,
						VERSION_REQUEST : null,
						VERSION_REQUEST_WITH_STATE_UPDATE : null,
						VERSION_REQUEST_WITH_TRY_OPTION : null,
						INIT_VERSION : null,
						SAVE_VERSION : null,
						BACKUP_VERSION : null,
						CLOSE_VERSION : null,
						DROP_VERSION : null,
						SET_TIMEOUT : null,
						RESET_VERSION : null,
						UNDO_VERSION : null,
						REDO_VERSION : null,
						UPDATE_PRIVILEGES : null,
						DELETE_ALL_VERSIONS : null,
						CLEANUP : null,
						UPDATE_PARAMETERS : null,
						REFRESH_VERSIONS : null,
						REFRESH_ACTIONS : null,
						START_ACTION_SEQUENCE : null,
						END_ACTION_SEQUENCE : null,
						KILL_ACTION_SEQUENCE : null,
						SYNCHRONIZE_ACTION_SEQUENCE : null,
						GET_VERSION_STATE_DESCRIPTIONS : null,
						staticSetup : function() {
							sap.firefly.PlanningModelRequestType.GET_ACTION_PARAMETERS = sap.firefly.PlanningModelRequestType
									.create("GET_ACTION_PARAMETERS", false);
							sap.firefly.PlanningModelRequestType.CREATE_PLANNING_ACTION_BASE = sap.firefly.PlanningModelRequestType
									.create("CREATE_PLANNING_ACTION_BASE", true);
							sap.firefly.PlanningModelRequestType.CREATE_PLANNING_ACTION = sap.firefly.PlanningModelRequestType
									.create("CREATE_PLANNING_ACTION", true);
							sap.firefly.PlanningModelRequestType.UPDATE_PRIVILEGES = sap.firefly.PlanningModelRequestType
									.create("UPDATE_VERSION_PRIVILEGES", true);
							sap.firefly.PlanningModelRequestType.DELETE_ALL_VERSIONS = sap.firefly.PlanningModelRequestType
									.create("DELETE_ALL_VERSIONS", true);
							sap.firefly.PlanningModelRequestType.CLEANUP = sap.firefly.PlanningModelRequestType
									.create("CLEANUP", true);
							sap.firefly.PlanningModelRequestType.REFRESH_VERSIONS = sap.firefly.PlanningModelRequestType
									.create("REFRESH_VERSIONS", true);
							sap.firefly.PlanningModelRequestType.REFRESH_ACTIONS = sap.firefly.PlanningModelRequestType
									.create("REFRESH_ACTIONS", true);
							sap.firefly.PlanningModelRequestType.VERSION_REQUEST = sap.firefly.PlanningModelRequestType
									.create("VERSION_REQUEST", true);
							sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"VERSION_REQUEST_WITH_STATE_UPDATE",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST,
											true);
							sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_TRY_OPTION = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"VERSION_REQUEST_WITH_TRY_OPTION",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											true);
							sap.firefly.PlanningModelRequestType.INIT_VERSION = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"init",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											true);
							sap.firefly.PlanningModelRequestType.SAVE_VERSION = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"save",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											false);
							sap.firefly.PlanningModelRequestType.BACKUP_VERSION = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"backup",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											true);
							sap.firefly.PlanningModelRequestType.CLOSE_VERSION = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"close",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_TRY_OPTION,
											true);
							sap.firefly.PlanningModelRequestType.DROP_VERSION = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"drop_version",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											true);
							sap.firefly.PlanningModelRequestType.RESET_VERSION = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"reset_version",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											true);
							sap.firefly.PlanningModelRequestType.UNDO_VERSION = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"undo",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											true);
							sap.firefly.PlanningModelRequestType.REDO_VERSION = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"redo",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											true);
							sap.firefly.PlanningModelRequestType.SET_TIMEOUT = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"set_timeout",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											false);
							sap.firefly.PlanningModelRequestType.UPDATE_PARAMETERS = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"update_parameters",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											true);
							sap.firefly.PlanningModelRequestType.START_ACTION_SEQUENCE = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"start_action_sequence",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_TRY_OPTION,
											false);
							sap.firefly.PlanningModelRequestType.END_ACTION_SEQUENCE = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"end_action_sequence",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_TRY_OPTION,
											true);
							sap.firefly.PlanningModelRequestType.KILL_ACTION_SEQUENCE = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"kill_action_sequence",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											true);
							sap.firefly.PlanningModelRequestType.SYNCHRONIZE_ACTION_SEQUENCE = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"synchronize",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE,
											true);
							sap.firefly.PlanningModelRequestType.GET_VERSION_STATE_DESCRIPTIONS = sap.firefly.PlanningModelRequestType
									.createWithParent(
											"get_version_state_descriptions",
											sap.firefly.PlanningModelRequestType.VERSION_REQUEST,
											true);
						},
						create : function(name, isInvalidatingResultSet) {
							return sap.firefly.PlanningModelRequestType
									.createWithParent(name, null,
											isInvalidatingResultSet);
						},
						createWithParent : function(name, parentType,
								isInvalidatingResultSet) {
							var object = new sap.firefly.PlanningModelRequestType();
							object.setupConstant(name);
							object.setParent(parentType);
							object
									.setInvalidatingResultSet(isInvalidatingResultSet);
							return object;
						}
					},
					m_isInvalidatingResultSet : false,
					isInvalidatingResultSet : function() {
						return this.m_isInvalidatingResultSet;
					},
					setInvalidatingResultSet : function(isInvalidatingResultSet) {
						this.m_isInvalidatingResultSet = isInvalidatingResultSet;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ClusterAlgorithm",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						_SPATIAL : null,
						K_MEANS : null,
						GRID : null,
						DB_SCAN : null,
						staticSetup : function() {
							sap.firefly.ClusterAlgorithm._SPATIAL = sap.firefly.ClusterAlgorithm
									.create("Spatial", null);
							sap.firefly.ClusterAlgorithm.K_MEANS = sap.firefly.ClusterAlgorithm
									.create(
											"K-Means",
											sap.firefly.ClusterAlgorithm._SPATIAL);
							sap.firefly.ClusterAlgorithm.GRID = sap.firefly.ClusterAlgorithm
									.create(
											"Grid",
											sap.firefly.ClusterAlgorithm._SPATIAL);
							sap.firefly.ClusterAlgorithm.DB_SCAN = sap.firefly.ClusterAlgorithm
									.create(
											"DB-Scan",
											sap.firefly.ClusterAlgorithm._SPATIAL);
						},
						create : function(name, parent) {
							var object = new sap.firefly.ClusterAlgorithm();
							object.setParent(parent);
							object.setName(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InactiveCapabilities",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						CUSTOM_DIMENSION_2 : null,
						LOCALE_SORTING : null,
						MEMBER_VISIBILITY : null,
						MEMBER_VALUE_EXCEPTIONS : null,
						UNIFIED_DATACELLS : null,
						CARTESIAN_FILTER_INTERSECT : null,
						RESULT_SET_CELL_FORMAT_TYPE_SPECIFIC : null,
						CALCULATED_DIMENSION : null,
						PLANNING_ON_CALCULATED_DIMENSION : null,
						MDS_CONDITIONS : null,
						SORT_NEW_VALUES : null,
						EXT_DIM_CHNG_DEF_RENAMING_DESC : null,
						FIX_METADATA_HIER_ATTR : null,
						EXT_DIM_COPY_ALL_HIER : null,
						CUBE_BLENDING_N_QUERIES : null,
						DYNAMIC_FILTER_IN_SUBMIT : null,
						s_AllInactiveCapabilities : null,
						staticSetup : function() {
							sap.firefly.InactiveCapabilities.s_AllInactiveCapabilities = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.InactiveCapabilities.CUSTOM_DIMENSION_2 = sap.firefly.InactiveCapabilities
									.create("CustomDimension2", -1, null);
							sap.firefly.InactiveCapabilities.LOCALE_SORTING = sap.firefly.InactiveCapabilities
									.create("LocaleSorting", -1, null);
							sap.firefly.InactiveCapabilities.MEMBER_VISIBILITY = sap.firefly.InactiveCapabilities
									.create("SupportsMemberVisibility", -1,
											null);
							sap.firefly.InactiveCapabilities.MEMBER_VALUE_EXCEPTIONS = sap.firefly.InactiveCapabilities
									.create("SupportsMemberValueExceptions",
											-1, null);
							sap.firefly.InactiveCapabilities.CARTESIAN_FILTER_INTERSECT = sap.firefly.InactiveCapabilities
									.create(
											"CartesianFilterIntersect",
											sap.firefly.XVersion.V81_CARTESIAN_FILTER_INTERSECT,
											null);
							sap.firefly.InactiveCapabilities.UNIFIED_DATACELLS = sap.firefly.InactiveCapabilities
									.create("UnifiedDataCells", -1, null);
							sap.firefly.InactiveCapabilities.RESULT_SET_CELL_FORMAT_TYPE_SPECIFIC = sap.firefly.InactiveCapabilities
									.create("ResultSetCellFormatTypeSpecific",
											-1, null);
							sap.firefly.InactiveCapabilities.CALCULATED_DIMENSION = sap.firefly.InactiveCapabilities
									.create("CalculatedDimension", -1, null);
							sap.firefly.InactiveCapabilities.PLANNING_ON_CALCULATED_DIMENSION = sap.firefly.InactiveCapabilities
									.create("PlanningOnCalculatedDimension",
											-1, null);
							sap.firefly.InactiveCapabilities.MDS_CONDITIONS = sap.firefly.InactiveCapabilities
									.create("Conditions", -1, null);
							sap.firefly.InactiveCapabilities.SORT_NEW_VALUES = sap.firefly.InactiveCapabilities
									.create("SortNewValues", -1, null);
							sap.firefly.InactiveCapabilities.EXT_DIM_CHNG_DEF_RENAMING_DESC = sap.firefly.InactiveCapabilities
									.create(
											"ExtendedDimensionsChangeDefaultRenamingAndDescription",
											-1, null);
							sap.firefly.InactiveCapabilities.FIX_METADATA_HIER_ATTR = sap.firefly.InactiveCapabilities
									.create("FixMetaDataHierarchyAttributes",
											-1, null);
							sap.firefly.InactiveCapabilities.EXT_DIM_COPY_ALL_HIER = sap.firefly.InactiveCapabilities
									.create(
											"ExtendedDimensionsCopyAllHierarchies",
											-1, null);
							sap.firefly.InactiveCapabilities.CUBE_BLENDING_N_QUERIES = sap.firefly.InactiveCapabilities
									.create("CubeBlendingNSubqueries", -1, null);
							sap.firefly.InactiveCapabilities.DYNAMIC_FILTER_IN_SUBMIT = sap.firefly.InactiveCapabilities
									.create("SupportsDynamicFilterInSubmit",
											-1, null);
						},
						getCapabilityByName : function(capabilityName) {
							return sap.firefly.InactiveCapabilities.s_AllInactiveCapabilities
									.getByKey(capabilityName);
						},
						create : function(name, xVersion, collectiveCapability) {
							var object = new sap.firefly.InactiveCapabilities();
							object.setName(name);
							object.m_xVersion = xVersion;
							sap.firefly.InactiveCapabilities.s_AllInactiveCapabilities
									.put(object);
							object.setParent(collectiveCapability);
							return object;
						},
						addDependentCapabilities : function(
								collectiveCapability, dependentCapabilities) {
							var result = dependentCapabilities;
							var allCapabilities;
							var i;
							var capability;
							if (collectiveCapability === null) {
								return result;
							}
							allCapabilities = sap.firefly.InactiveCapabilities.s_AllInactiveCapabilities
									.getValuesAsReadOnlyList();
							for (i = 0; i < allCapabilities.size(); i++) {
								capability = allCapabilities.get(i);
								if (capability === collectiveCapability) {
									continue;
								}
								if (capability.getParent() !== collectiveCapability) {
									continue;
								}
								if (result === null) {
									result = sap.firefly.XSetOfNameObject
											.create();
								} else {
									if (result.contains(capability)) {
										continue;
									}
								}
								result.put(capability);
								result = sap.firefly.InactiveCapabilities
										.addDependentCapabilities(capability,
												result);
							}
							return result;
						}
					},
					m_xVersion : 0,
					getMaxXVersion : function() {
						return this.m_xVersion;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.JoinType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						_TIME : null,
						INNER : null,
						LEFT_OUTER : null,
						RIGHT_OUTER : null,
						_SPATIAL : null,
						EQUALS : null,
						DISJOINT : null,
						INTERSECTS : null,
						TOUCHES : null,
						CROSSES : null,
						WITHIN : null,
						CONTAINS : null,
						OVERLAPS : null,
						COVERS : null,
						COVERED_BY : null,
						WITHIN_DISTANCE : null,
						RELATE : null,
						s_lookup : null,
						staticSetup : function() {
							sap.firefly.JoinType.s_lookup = sap.firefly.XHashMapByString
									.create();
							sap.firefly.JoinType._TIME = sap.firefly.JoinType
									.createJoinType("TIME", null);
							sap.firefly.JoinType.INNER = sap.firefly.JoinType
									.createJoinType("INNER",
											sap.firefly.JoinType._TIME);
							sap.firefly.JoinType.LEFT_OUTER = sap.firefly.JoinType
									.createJoinType("LEFT_OUTER",
											sap.firefly.JoinType._TIME);
							sap.firefly.JoinType.RIGHT_OUTER = sap.firefly.JoinType
									.createJoinType("RIGHT_OUTER",
											sap.firefly.JoinType._TIME);
							sap.firefly.JoinType._SPATIAL = sap.firefly.JoinType
									.createJoinType("SPATIAL", null);
							sap.firefly.JoinType.CONTAINS = sap.firefly.JoinType
									.createJoinType("CONTAINS",
											sap.firefly.JoinType._SPATIAL);
							sap.firefly.JoinType.COVERED_BY = sap.firefly.JoinType
									.createJoinType("COVERED_BY",
											sap.firefly.JoinType._SPATIAL);
							sap.firefly.JoinType.COVERS = sap.firefly.JoinType
									.createJoinType("COVERS",
											sap.firefly.JoinType._SPATIAL);
							sap.firefly.JoinType.CROSSES = sap.firefly.JoinType
									.createJoinType("CROSSES",
											sap.firefly.JoinType._SPATIAL);
							sap.firefly.JoinType.EQUALS = sap.firefly.JoinType
									.createJoinType("EQUALS",
											sap.firefly.JoinType._SPATIAL);
							sap.firefly.JoinType.DISJOINT = sap.firefly.JoinType
									.createJoinType("DISJOINT",
											sap.firefly.JoinType._SPATIAL);
							sap.firefly.JoinType.INTERSECTS = sap.firefly.JoinType
									.createJoinType("INTERSECTS",
											sap.firefly.JoinType._SPATIAL);
							sap.firefly.JoinType.OVERLAPS = sap.firefly.JoinType
									.createJoinType("OVERLAPS",
											sap.firefly.JoinType._SPATIAL);
							sap.firefly.JoinType.RELATE = sap.firefly.JoinType
									.createJoinType("RELATE",
											sap.firefly.JoinType._SPATIAL);
							sap.firefly.JoinType.TOUCHES = sap.firefly.JoinType
									.createJoinType("TOUCHES",
											sap.firefly.JoinType._SPATIAL);
							sap.firefly.JoinType.WITHIN = sap.firefly.JoinType
									.createJoinType("WITHIN",
											sap.firefly.JoinType._SPATIAL);
							sap.firefly.JoinType.WITHIN_DISTANCE = sap.firefly.JoinType
									.createJoinType("WITHIN_DISTANCE",
											sap.firefly.JoinType._SPATIAL);
						},
						createJoinType : function(name, parent) {
							var newConstant = new sap.firefly.JoinType();
							newConstant.setName(name);
							newConstant.setParent(parent);
							sap.firefly.JoinType.s_lookup
									.put(name, newConstant);
							return newConstant;
						},
						lookup : function(name) {
							return sap.firefly.JoinType.s_lookup.getByKey(name);
						}
					}
				});
$Firefly.createClass("sap.firefly.Operator", sap.firefly.XConstantWithParent, {
	$statics : {
		GRAVITY_0 : 0,
		GRAVITY_1 : 1,
		GRAVITY_2 : 2,
		GRAVITY_3 : 3,
		GRAVITY_4 : 4,
		GRAVITY_5 : 5,
		GRAVITY_6 : 6,
		GRAVITY_7 : 7,
		GRAVITY_8 : 8,
		GRAVITY_9 : 9,
		_LOGICAL : null,
		_COMPARISON : null,
		_MATH : null,
		_ASSIGN : null,
		staticSetup : function() {
			sap.firefly.Operator._LOGICAL = new sap.firefly.Operator();
			sap.firefly.Operator._LOGICAL.setupOperator(null, "Logical",
					"Logical", 0, 0);
			sap.firefly.Operator._COMPARISON = new sap.firefly.Operator();
			sap.firefly.Operator._COMPARISON.setupOperator(null, "Comparison",
					"Comparison", 0, 0);
			sap.firefly.Operator._MATH = new sap.firefly.Operator();
			sap.firefly.Operator._MATH
					.setupOperator(null, "Math", "Math", 0, 0);
			sap.firefly.Operator._ASSIGN = new sap.firefly.Operator();
			sap.firefly.Operator._ASSIGN.setupOperator(null, "Assign",
					"Assign", 0, 0);
		}
	},
	m_displayString : null,
	m_hasLeftSideHigherPrioWhenEqual : false,
	m_numberOfParameters : 0,
	m_prio : 0,
	setupOperator : function(parent, name, displayString, numberOfParameters,
			gravity) {
		this.setupOperatorExt(parent, name, displayString, numberOfParameters,
				gravity, true);
	},
	setupOperatorExt : function(parent, name, displayString,
			numberOfParameters, gravity, hasLeftSideHigherPrioWhenEqual) {
		this.setParent(parent);
		this.setName(name);
		this.setDisplayString(displayString);
		this.setNumberOfParameters(numberOfParameters);
		this.m_prio = gravity;
		this.m_hasLeftSideHigherPrioWhenEqual = hasLeftSideHigherPrioWhenEqual;
	},
	getDisplayString : function() {
		return this.m_displayString;
	},
	setDisplayString : function(displayString) {
		this.m_displayString = displayString;
	},
	getNumberOfParameters : function() {
		return this.m_numberOfParameters;
	},
	setNumberOfParameters : function(numberOfParameters) {
		this.m_numberOfParameters = numberOfParameters;
	},
	getPrio : function() {
		return this.m_prio;
	},
	hasLeftSideHigherPrioWhenEqual : function() {
		return this.m_hasLeftSideHigherPrioWhenEqual;
	}
});
$Firefly
		.createClass(
				"sap.firefly.QMemberReadMode",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						DEFAULT_VALUE : null,
						UNDEFINED : null,
						NONE : null,
						MASTER : null,
						MASTER_AND_SPACE : null,
						MASTER_AND_SPACE_AND_STATE : null,
						REL_MASTER : null,
						REL_MASTER_AND_SPACE : null,
						REL_MASTER_AND_SPACE_AND_STATE : null,
						BOOKED : null,
						BOOKED_AND_SPACE : null,
						BOOKED_AND_SPACE_AND_STATE : null,
						REL_BOOKED : null,
						REL_BOOKED_AND_SPACE : null,
						REL_BOOKED_AND_SPACE_AND_STATE : null,
						s_lookup : null,
						s_lookup_c : null,
						staticSetup : function() {
							sap.firefly.QMemberReadMode.s_lookup = sap.firefly.XHashMapByString
									.create();
							sap.firefly.QMemberReadMode.s_lookup_c = sap.firefly.XHashMapByString
									.create();
							sap.firefly.QMemberReadMode.DEFAULT_VALUE = sap.firefly.QMemberReadMode
									.create("Default", null);
							sap.firefly.QMemberReadMode.UNDEFINED = sap.firefly.QMemberReadMode
									.create("Undefined", null);
							sap.firefly.QMemberReadMode.NONE = sap.firefly.QMemberReadMode
									.create("None", null);
							sap.firefly.QMemberReadMode.MASTER = sap.firefly.QMemberReadMode
									.create("Master", null);
							sap.firefly.QMemberReadMode.MASTER_AND_SPACE = sap.firefly.QMemberReadMode
									.create("MasterAndSpace",
											sap.firefly.QMemberReadMode.MASTER);
							sap.firefly.QMemberReadMode.MASTER_AND_SPACE_AND_STATE = sap.firefly.QMemberReadMode
									.create(
											"MasterAndSpaceAndState",
											sap.firefly.QMemberReadMode.MASTER_AND_SPACE);
							sap.firefly.QMemberReadMode.REL_MASTER = sap.firefly.QMemberReadMode
									.create("RelatedMaster", null);
							sap.firefly.QMemberReadMode.REL_MASTER_AND_SPACE = sap.firefly.QMemberReadMode
									.create("RelatedMasterAndSpace",
											sap.firefly.QMemberReadMode.MASTER);
							sap.firefly.QMemberReadMode.REL_MASTER_AND_SPACE_AND_STATE = sap.firefly.QMemberReadMode
									.create(
											"RelatedMasterAndSpaceAndState",
											sap.firefly.QMemberReadMode.REL_MASTER_AND_SPACE);
							sap.firefly.QMemberReadMode.BOOKED = sap.firefly.QMemberReadMode
									.create("Booked", null);
							sap.firefly.QMemberReadMode.BOOKED_AND_SPACE = sap.firefly.QMemberReadMode
									.create("BookedAndSpace",
											sap.firefly.QMemberReadMode.BOOKED);
							sap.firefly.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE = sap.firefly.QMemberReadMode
									.create(
											"BookedAndSpaceAndState",
											sap.firefly.QMemberReadMode.BOOKED_AND_SPACE);
							sap.firefly.QMemberReadMode.REL_BOOKED = sap.firefly.QMemberReadMode
									.create("RelatedBooked", null);
							sap.firefly.QMemberReadMode.REL_BOOKED_AND_SPACE = sap.firefly.QMemberReadMode
									.create(
											"RelatedBookedAndSpace",
											sap.firefly.QMemberReadMode.REL_BOOKED);
							sap.firefly.QMemberReadMode.REL_BOOKED_AND_SPACE_AND_STATE = sap.firefly.QMemberReadMode
									.create(
											"RelatedBookedAndSpaceAndState",
											sap.firefly.QMemberReadMode.REL_BOOKED_AND_SPACE);
							sap.firefly.QMemberReadMode.MASTER
									.setChildAndSibling(
											sap.firefly.QMemberReadMode.MASTER_AND_SPACE,
											sap.firefly.QMemberReadMode.BOOKED);
							sap.firefly.QMemberReadMode.MASTER_AND_SPACE
									.setChildAndSibling(
											sap.firefly.QMemberReadMode.MASTER_AND_SPACE_AND_STATE,
											sap.firefly.QMemberReadMode.BOOKED_AND_SPACE);
							sap.firefly.QMemberReadMode.MASTER_AND_SPACE_AND_STATE
									.setChildAndSibling(
											null,
											sap.firefly.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE);
							sap.firefly.QMemberReadMode.REL_MASTER
									.setChildAndSibling(
											sap.firefly.QMemberReadMode.REL_MASTER_AND_SPACE,
											sap.firefly.QMemberReadMode.MASTER);
							sap.firefly.QMemberReadMode.REL_MASTER_AND_SPACE
									.setChildAndSibling(
											sap.firefly.QMemberReadMode.REL_MASTER_AND_SPACE_AND_STATE,
											sap.firefly.QMemberReadMode.MASTER_AND_SPACE);
							sap.firefly.QMemberReadMode.REL_MASTER_AND_SPACE_AND_STATE
									.setChildAndSibling(
											null,
											sap.firefly.QMemberReadMode.MASTER_AND_SPACE_AND_STATE);
							sap.firefly.QMemberReadMode.BOOKED
									.setChildAndSibling(
											sap.firefly.QMemberReadMode.BOOKED_AND_SPACE,
											sap.firefly.QMemberReadMode.MASTER);
							sap.firefly.QMemberReadMode.BOOKED_AND_SPACE
									.setChildAndSibling(
											sap.firefly.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE,
											sap.firefly.QMemberReadMode.MASTER_AND_SPACE);
							sap.firefly.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE
									.setChildAndSibling(
											null,
											sap.firefly.QMemberReadMode.MASTER_AND_SPACE_AND_STATE);
							sap.firefly.QMemberReadMode.REL_BOOKED
									.setChildAndSibling(
											sap.firefly.QMemberReadMode.REL_BOOKED_AND_SPACE,
											sap.firefly.QMemberReadMode.BOOKED);
							sap.firefly.QMemberReadMode.REL_BOOKED_AND_SPACE
									.setChildAndSibling(
											sap.firefly.QMemberReadMode.REL_BOOKED_AND_SPACE_AND_STATE,
											sap.firefly.QMemberReadMode.BOOKED_AND_SPACE);
							sap.firefly.QMemberReadMode.REL_BOOKED_AND_SPACE_AND_STATE
									.setChildAndSibling(
											null,
											sap.firefly.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE);
						},
						create : function(name, parent) {
							var newConstant = new sap.firefly.QMemberReadMode();
							newConstant.setName(name);
							newConstant.setParent(parent);
							sap.firefly.QMemberReadMode.addToLookupTable(name,
									newConstant);
							return newConstant;
						},
						addToLookupTable : function(name, newConstant) {
							sap.firefly.QMemberReadMode.s_lookup.put(name,
									newConstant);
							sap.firefly.QMemberReadMode.s_lookup_c.put(
									sap.firefly.XString
											.convertToUpperCase(name),
									newConstant);
						},
						lookup : function(name) {
							return sap.firefly.QMemberReadMode.s_lookup
									.getByKey(name);
						},
						lookupCaseInsensitive : function(name) {
							return sap.firefly.QMemberReadMode.s_lookup_c
									.getByKey(sap.firefly.XString
											.convertToUpperCase(name));
						}
					},
					m_child : null,
					m_sibling : null,
					setChildAndSibling : function(child, sibling) {
						this.m_child = child;
						this.m_sibling = sibling;
					},
					getChild : function() {
						return this.m_child;
					},
					getSibling : function() {
						return this.m_sibling;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QModelFormat",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						INA_ABSTRACT_MODEL : null,
						INA_DATA : null,
						INA_DATA_REINIT : null,
						INA_REPOSITORY : null,
						INA_REPOSITORY_NO_VARS : null,
						INA_REPOSITORY_DATA : null,
						INA_METADATA_CORE : null,
						INA_METADATA : null,
						INA_CLONE : null,
						INA_METADATA_BLENDING : null,
						INA_VALUE_HELP : null,
						COMMANDS : null,
						EXPRESSION : null,
						LAYER : null,
						TEXT : null,
						VIZDEF : null,
						s_allFormats : null,
						staticSetup : function() {
							sap.firefly.QModelFormat.s_allFormats = sap.firefly.XList
									.create();
							sap.firefly.QModelFormat.INA_METADATA_CORE = sap.firefly.QModelFormat
									.create("InAMetadataCore", null, true,
											false);
							sap.firefly.QModelFormat.INA_METADATA = sap.firefly.QModelFormat
									.create("InAMetadata", null, true, true);
							sap.firefly.QModelFormat.INA_METADATA_BLENDING = sap.firefly.QModelFormat
									.create("InAMetadataBlending", null, true,
											false);
							sap.firefly.QModelFormat.INA_ABSTRACT_MODEL = sap.firefly.QModelFormat
									.create("InAAbstractModel", null, false,
											true);
							sap.firefly.QModelFormat.INA_REPOSITORY = sap.firefly.QModelFormat
									.create(
											"InARepository",
											sap.firefly.QModelFormat.INA_ABSTRACT_MODEL,
											false, true);
							sap.firefly.QModelFormat.INA_REPOSITORY_NO_VARS = sap.firefly.QModelFormat
									.create(
											"InARepositoryNoVars",
											sap.firefly.QModelFormat.INA_REPOSITORY,
											false, true);
							sap.firefly.QModelFormat.INA_REPOSITORY_DATA = sap.firefly.QModelFormat
									.create(
											"InARepositoryData",
											sap.firefly.QModelFormat.INA_REPOSITORY,
											false, true);
							sap.firefly.QModelFormat.INA_VALUE_HELP = sap.firefly.QModelFormat
									.create(
											"InAValueHelp",
											sap.firefly.QModelFormat.INA_ABSTRACT_MODEL,
											false, true);
							sap.firefly.QModelFormat.INA_DATA = sap.firefly.QModelFormat
									.create(
											"InAData",
											sap.firefly.QModelFormat.INA_ABSTRACT_MODEL,
											false, true);
							sap.firefly.QModelFormat.INA_DATA_REINIT = sap.firefly.QModelFormat
									.create("InADataReinit",
											sap.firefly.QModelFormat.INA_DATA,
											false, true);
							sap.firefly.QModelFormat.INA_METADATA_CORE
									.addUsage(sap.firefly.QModelFormat.INA_METADATA);
							sap.firefly.QModelFormat.INA_DATA
									.addUsage(sap.firefly.QModelFormat.INA_REPOSITORY);
							sap.firefly.QModelFormat.INA_DATA
									.addUsage(sap.firefly.QModelFormat.INA_REPOSITORY_NO_VARS);
							sap.firefly.QModelFormat.INA_DATA
									.addUsage(sap.firefly.QModelFormat.INA_REPOSITORY_DATA);
							sap.firefly.QModelFormat.INA_DATA
									.addUsage(sap.firefly.QModelFormat.INA_VALUE_HELP);
							sap.firefly.QModelFormat.INA_DATA
									.addUsage(sap.firefly.QModelFormat.INA_DATA_REINIT);
							sap.firefly.QModelFormat.INA_CLONE = sap.firefly.QModelFormat
									.create("InAClone", null, true, true);
							sap.firefly.QModelFormat.COMMANDS = sap.firefly.QModelFormat
									.create("Commands", null, false, true);
							sap.firefly.QModelFormat.EXPRESSION = sap.firefly.QModelFormat
									.create("Expression", null, false, true);
							sap.firefly.QModelFormat.LAYER = sap.firefly.QModelFormat
									.create("Layer", null, false, true);
							sap.firefly.QModelFormat.TEXT = sap.firefly.QModelFormat
									.create("Text", null, false, true);
							sap.firefly.QModelFormat.VIZDEF = sap.firefly.QModelFormat
									.create("VizDef", null, false, true);
						},
						create : function(name, parent, containsMetadata,
								containsModel) {
							var modelFormat = new sap.firefly.QModelFormat();
							modelFormat.setupConstant(name);
							modelFormat.setParent(parent);
							modelFormat.m_containsMetadata = containsMetadata;
							modelFormat.m_containsModel = containsModel;
							modelFormat.m_allUsages = sap.firefly.XList
									.create();
							modelFormat.m_allUsages.add(modelFormat);
							sap.firefly.QModelFormat.s_allFormats
									.add(modelFormat);
							return modelFormat;
						},
						getAll : function() {
							return sap.firefly.QModelFormat.s_allFormats;
						}
					},
					m_containsMetadata : false,
					m_containsModel : false,
					m_allUsages : null,
					containsMetadata : function() {
						return this.m_containsMetadata;
					},
					containsModel : function() {
						return this.m_containsModel;
					},
					addUsage : function(modelFormat) {
						this.m_allUsages.add(modelFormat);
					},
					getUsages : function() {
						return this.m_allUsages;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QModelLevel",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						NONE : null,
						QUERY : null,
						AXES : null,
						DIMENSIONS : null,
						staticSetup : function() {
							sap.firefly.QModelLevel.NONE = sap.firefly.QModelLevel
									.create("None", null, 0);
							sap.firefly.QModelLevel.QUERY = sap.firefly.QModelLevel
									.create("Query",
											sap.firefly.QModelLevel.NONE, 1);
							sap.firefly.QModelLevel.AXES = sap.firefly.QModelLevel
									.create("Axes",
											sap.firefly.QModelLevel.QUERY, 2);
							sap.firefly.QModelLevel.DIMENSIONS = sap.firefly.QModelLevel
									.create("Dimensions",
											sap.firefly.QModelLevel.AXES, 3);
						},
						create : function(name, parent, level) {
							var object = new sap.firefly.QModelLevel();
							object.setParent(parent);
							object.setName(name);
							object.m_level = level;
							return object;
						}
					},
					m_level : 0,
					getLevel : function() {
						return this.m_level;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ResultSetState",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						INITIAL : null,
						FETCHING : null,
						TERMINATED : null,
						DATA_AVAILABLE : null,
						SIZE_LIMIT_EXCEEDED : null,
						SUCCESSFUL_PERSISTED : null,
						NO_DATA_AVAILABLE : null,
						USER_NOT_AUTHORIZED : null,
						ERROR : null,
						INVALID_VARIABLE_VALUES : null,
						UNSUBMITTED_VARIABLES : null,
						DATA_ACCESS_PROBLEMS : null,
						INVALID_QUERY_VIEW_STATE : null,
						EMPTY_JSON : null,
						staticSetup : function() {
							sap.firefly.ResultSetState.INITIAL = sap.firefly.ResultSetState
									.create("INITIAL", null);
							sap.firefly.ResultSetState.FETCHING = sap.firefly.ResultSetState
									.create("FETCHING", null);
							sap.firefly.ResultSetState.TERMINATED = sap.firefly.ResultSetState
									.create("TERMINATED", null);
							sap.firefly.ResultSetState.DATA_AVAILABLE = sap.firefly.ResultSetState
									.create("DATA_AVAILABLE", null);
							sap.firefly.ResultSetState.SIZE_LIMIT_EXCEEDED = sap.firefly.ResultSetState
									.create("SIZE_LIMIT_EXCEEDED", null);
							sap.firefly.ResultSetState.NO_DATA_AVAILABLE = sap.firefly.ResultSetState
									.create("NO_DATA_AVAILABLE", null);
							sap.firefly.ResultSetState.USER_NOT_AUTHORIZED = sap.firefly.ResultSetState
									.create("USER_NOT_AUTHORIZED", null);
							sap.firefly.ResultSetState.SUCCESSFUL_PERSISTED = sap.firefly.ResultSetState
									.create("SUCCESSFUL_PERSISTED", null);
							sap.firefly.ResultSetState.EMPTY_JSON = sap.firefly.ResultSetState
									.create("EMPTY_JSON", null);
							sap.firefly.ResultSetState.ERROR = sap.firefly.ResultSetState
									.create("ERROR", null);
							sap.firefly.ResultSetState.INVALID_VARIABLE_VALUES = sap.firefly.ResultSetState
									.create("INVALID_VARIABLE_VALUES",
											sap.firefly.ResultSetState.ERROR);
							sap.firefly.ResultSetState.UNSUBMITTED_VARIABLES = sap.firefly.ResultSetState
									.create("UNSUBMITTED_VARIABLES",
											sap.firefly.ResultSetState.ERROR);
							sap.firefly.ResultSetState.DATA_ACCESS_PROBLEMS = sap.firefly.ResultSetState
									.create("DATA_ACCESS_PROBLEMS",
											sap.firefly.ResultSetState.ERROR);
							sap.firefly.ResultSetState.INVALID_QUERY_VIEW_STATE = sap.firefly.ResultSetState
									.create("INVALID_QUERY_VIEW_STATE",
											sap.firefly.ResultSetState.ERROR);
						},
						create : function(name, parent) {
							var state = new sap.firefly.ResultSetState();
							state.setName(name);
							state.setParent(parent);
							return state;
						}
					},
					hasData : function() {
						return this === sap.firefly.ResultSetState.DATA_AVAILABLE;
					},
					isErrorState : function() {
						return this.isTypeOf(sap.firefly.ResultSetState.ERROR);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.SortType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						ABSTRACT_DIMENSION_SORT : null,
						MEMBER_KEY : null,
						MEMBER_TEXT : null,
						FILTER : null,
						HIERARCHY : null,
						DATA_CELL_VALUE : null,
						FIELD : null,
						MEASURE : null,
						COMPLEX : null,
						s_all : null,
						staticSetup : function() {
							sap.firefly.SortType.s_all = sap.firefly.XList
									.create();
							sap.firefly.SortType.ABSTRACT_DIMENSION_SORT = sap.firefly.SortType
									.create("AbstractDimensionSort", null);
							sap.firefly.SortType.MEMBER_KEY = sap.firefly.SortType
									.create(
											"MemberKey",
											sap.firefly.SortType.ABSTRACT_DIMENSION_SORT);
							sap.firefly.SortType.MEMBER_TEXT = sap.firefly.SortType
									.create(
											"MemberText",
											sap.firefly.SortType.ABSTRACT_DIMENSION_SORT);
							sap.firefly.SortType.FILTER = sap.firefly.SortType
									.create(
											"Filter",
											sap.firefly.SortType.ABSTRACT_DIMENSION_SORT);
							sap.firefly.SortType.HIERARCHY = sap.firefly.SortType
									.create(
											"Hierarchy",
											sap.firefly.SortType.ABSTRACT_DIMENSION_SORT);
							sap.firefly.SortType.FIELD = sap.firefly.SortType
									.create(
											"Field",
											sap.firefly.SortType.ABSTRACT_DIMENSION_SORT);
							sap.firefly.SortType.DATA_CELL_VALUE = sap.firefly.SortType
									.create("DataCellValue", null);
							sap.firefly.SortType.MEASURE = sap.firefly.SortType
									.create("Measure", null);
							sap.firefly.SortType.COMPLEX = sap.firefly.SortType
									.create("Complex", null);
						},
						create : function(name, parent) {
							var newConstant = new sap.firefly.SortType();
							newConstant.setName(name);
							newConstant.setParent(parent);
							sap.firefly.SortType.s_all.add(newConstant);
							return newConstant;
						},
						getAllSortTypes : function() {
							return sap.firefly.SortType.s_all;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.TextTransformationType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						STRING_TRANSFORMATION : null,
						SPATIAL_TRANSFORMATION : null,
						UPPERCASE : null,
						LOWERCASE : null,
						CAPITALIZE : null,
						SPATIAL_AS_BINARY : null,
						SPATIAL_AS_EWKB : null,
						SPATIAL_AS_EWKT : null,
						SPATIAL_AS_GEOJSON : null,
						SPATIAL_AS_TEXT : null,
						SPATIAL_AS_WKB : null,
						SPATIAL_AS_WKT : null,
						SPATIAL_AS_SVG : null,
						s_lookupNames : null,
						staticSetup : function() {
							sap.firefly.TextTransformationType.s_lookupNames = sap.firefly.XHashMapByString
									.create();
							sap.firefly.TextTransformationType.STRING_TRANSFORMATION = sap.firefly.TextTransformationType
									.create("StringTransformation", null);
							sap.firefly.TextTransformationType.UPPERCASE = sap.firefly.TextTransformationType
									.create(
											"Uppercase",
											sap.firefly.TextTransformationType.STRING_TRANSFORMATION);
							sap.firefly.TextTransformationType.LOWERCASE = sap.firefly.TextTransformationType
									.create(
											"Lowercase",
											sap.firefly.TextTransformationType.STRING_TRANSFORMATION);
							sap.firefly.TextTransformationType.CAPITALIZE = sap.firefly.TextTransformationType
									.create(
											"Capitalize",
											sap.firefly.TextTransformationType.STRING_TRANSFORMATION);
							sap.firefly.TextTransformationType.SPATIAL_TRANSFORMATION = sap.firefly.TextTransformationType
									.create("SpatialTransformation", null);
							sap.firefly.TextTransformationType.SPATIAL_AS_BINARY = sap.firefly.TextTransformationType
									.create(
											"SpatialAsBinary",
											sap.firefly.TextTransformationType.SPATIAL_TRANSFORMATION);
							sap.firefly.TextTransformationType.SPATIAL_AS_EWKB = sap.firefly.TextTransformationType
									.create(
											"SpatialAsEWKB",
											sap.firefly.TextTransformationType.SPATIAL_TRANSFORMATION);
							sap.firefly.TextTransformationType.SPATIAL_AS_EWKT = sap.firefly.TextTransformationType
									.create(
											"SpatialAsEWKT",
											sap.firefly.TextTransformationType.SPATIAL_TRANSFORMATION);
							sap.firefly.TextTransformationType.SPATIAL_AS_GEOJSON = sap.firefly.TextTransformationType
									.create(
											"SpatialAsGeoJSON",
											sap.firefly.TextTransformationType.SPATIAL_TRANSFORMATION);
							sap.firefly.TextTransformationType.SPATIAL_AS_TEXT = sap.firefly.TextTransformationType
									.create(
											"SpatialAsText",
											sap.firefly.TextTransformationType.SPATIAL_TRANSFORMATION);
							sap.firefly.TextTransformationType.SPATIAL_AS_WKB = sap.firefly.TextTransformationType
									.create(
											"SpatialAsWKB",
											sap.firefly.TextTransformationType.SPATIAL_TRANSFORMATION);
							sap.firefly.TextTransformationType.SPATIAL_AS_WKT = sap.firefly.TextTransformationType
									.create(
											"SpatialAsWKT",
											sap.firefly.TextTransformationType.SPATIAL_TRANSFORMATION);
							sap.firefly.TextTransformationType.SPATIAL_AS_SVG = sap.firefly.TextTransformationType
									.create(
											"SpatialAsSVG",
											sap.firefly.TextTransformationType.SPATIAL_TRANSFORMATION);
						},
						create : function(name, parent) {
							var newObj = new sap.firefly.TextTransformationType();
							newObj.setupConstant(name);
							newObj.setParent(parent);
							sap.firefly.TextTransformationType.s_lookupNames
									.put(name, newObj);
							return newObj;
						},
						lookupName : function(name) {
							return sap.firefly.TextTransformationType.s_lookupNames
									.getByKey(name);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.VariableProcessorState",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						INITIAL : null,
						MIXED : null,
						CHANGEABLE : null,
						CHANGEABLE_DIRECT_VALUE_TRANSFER : null,
						CHANGEABLE_STATEFUL : null,
						CHANGEABLE_STARTUP : null,
						CHANGEABLE_REINIT : null,
						SUBMITTED : null,
						VALUE_HELP : null,
						PROCESSING : null,
						PROCESSING_DEFINITION : null,
						PROCESSING_UPDATE_VALUES : null,
						PROCESSING_CHECK : null,
						PROCESSING_SUBMIT : null,
						PROCESSING_SUBMIT_AFTER_REINIT : null,
						PROCESSING_CANCEL : null,
						PROCESSING_REINIT : null,
						staticSetup : function() {
							sap.firefly.VariableProcessorState.INITIAL = sap.firefly.VariableProcessorState
									.create("Initial", null, null);
							sap.firefly.VariableProcessorState.MIXED = sap.firefly.VariableProcessorState
									.create("Mixed", null, null);
							sap.firefly.VariableProcessorState.CHANGEABLE = sap.firefly.VariableProcessorState
									.create("Changeable", null, null);
							sap.firefly.VariableProcessorState.CHANGEABLE_DIRECT_VALUE_TRANSFER = sap.firefly.VariableProcessorState
									.create(
											"ChangeableDirectValueTransfer",
											sap.firefly.VariableProcessorState.CHANGEABLE,
											null);
							sap.firefly.VariableProcessorState.CHANGEABLE_STATEFUL = sap.firefly.VariableProcessorState
									.create(
											"ChangeableStateful",
											sap.firefly.VariableProcessorState.CHANGEABLE,
											null);
							sap.firefly.VariableProcessorState.CHANGEABLE_STARTUP = sap.firefly.VariableProcessorState
									.create(
											"ChangeableStartup",
											sap.firefly.VariableProcessorState.CHANGEABLE_STATEFUL,
											null);
							sap.firefly.VariableProcessorState.CHANGEABLE_REINIT = sap.firefly.VariableProcessorState
									.create(
											"ChangeableReinit",
											sap.firefly.VariableProcessorState.CHANGEABLE_STATEFUL,
											null);
							sap.firefly.VariableProcessorState.SUBMITTED = sap.firefly.VariableProcessorState
									.create("Submitted", null, null);
							sap.firefly.VariableProcessorState.VALUE_HELP = sap.firefly.VariableProcessorState
									.create(
											"ValueHelp",
											sap.firefly.VariableProcessorState.SUBMITTED,
											null);
							sap.firefly.VariableProcessorState.PROCESSING = sap.firefly.VariableProcessorState
									.create("Processing", null, null);
							sap.firefly.VariableProcessorState.PROCESSING_DEFINITION = sap.firefly.VariableProcessorState
									.create(
											"ProcessingDefinition",
											sap.firefly.VariableProcessorState.PROCESSING,
											sap.firefly.VariableProcessorState.CHANGEABLE_STARTUP);
							sap.firefly.VariableProcessorState.PROCESSING_SUBMIT = sap.firefly.VariableProcessorState
									.create(
											"ProcessingSubmit",
											sap.firefly.VariableProcessorState.PROCESSING,
											sap.firefly.VariableProcessorState.SUBMITTED);
							sap.firefly.VariableProcessorState.PROCESSING_SUBMIT_AFTER_REINIT = sap.firefly.VariableProcessorState
									.create(
											"ProcessingSubmitAfterReinit",
											sap.firefly.VariableProcessorState.PROCESSING_SUBMIT,
											sap.firefly.VariableProcessorState.SUBMITTED);
							sap.firefly.VariableProcessorState.PROCESSING_CANCEL = sap.firefly.VariableProcessorState
									.create(
											"ProcessingCancel",
											sap.firefly.VariableProcessorState.PROCESSING,
											sap.firefly.VariableProcessorState.SUBMITTED);
							sap.firefly.VariableProcessorState.PROCESSING_REINIT = sap.firefly.VariableProcessorState
									.create(
											"ProcessingReinit",
											sap.firefly.VariableProcessorState.PROCESSING,
											sap.firefly.VariableProcessorState.CHANGEABLE_REINIT);
							sap.firefly.VariableProcessorState.PROCESSING_UPDATE_VALUES = sap.firefly.VariableProcessorState
									.create(
											"ProcessingUpdateValues",
											sap.firefly.VariableProcessorState.PROCESSING,
											null);
							sap.firefly.VariableProcessorState.PROCESSING_CHECK = sap.firefly.VariableProcessorState
									.create(
											"ProcessingCheck",
											sap.firefly.VariableProcessorState.PROCESSING,
											null);
						},
						create : function(name, parent, nextState) {
							var newConstant = new sap.firefly.VariableProcessorState();
							newConstant.setupConstant(name);
							newConstant.setParent(parent);
							newConstant.m_nextState = nextState;
							return newConstant;
						}
					},
					m_nextState : null,
					getNextState : function() {
						return this.m_nextState;
					},
					isSubmitNeeded : function() {
						return this
								.isTypeOf(sap.firefly.VariableProcessorState.CHANGEABLE_STATEFUL);
					},
					isReinitNeeded : function() {
						return this === sap.firefly.VariableProcessorState.SUBMITTED;
					},
					isCancelNeeded : function() {
						return this === sap.firefly.VariableProcessorState.CHANGEABLE_REINIT;
					}
				});
$Firefly.createClass("sap.firefly.AssignOperator", sap.firefly.Operator, {
	$statics : {
		ASSIGN : null,
		ASSIGN_DEF : null,
		ASSIGN_PROP : null,
		staticSetupAssignOps : function() {
			sap.firefly.AssignOperator.ASSIGN_PROP = sap.firefly.AssignOperator
					.createAssign("AssignProp", "=>", 0,
							sap.firefly.Operator.GRAVITY_3);
			sap.firefly.AssignOperator.ASSIGN_DEF = sap.firefly.AssignOperator
					.createAssign("AssignDef", "=:", 0,
							sap.firefly.Operator.GRAVITY_9);
			sap.firefly.AssignOperator.ASSIGN = sap.firefly.AssignOperator
					.createAssign("Assign", "=", 0,
							sap.firefly.Operator.GRAVITY_9);
		},
		createAssign : function(name, displayString, numberOfParameters,
				gravity) {
			var newConstant = new sap.firefly.AssignOperator();
			newConstant.setupOperator(sap.firefly.Operator._MATH, name,
					displayString, numberOfParameters, gravity);
			return newConstant;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.ComparisonOperator",
				sap.firefly.Operator,
				{
					$statics : {
						UNDEFINED : null,
						IS_NULL : null,
						LIKE : null,
						MATCH : null,
						NOT_MATCH : null,
						EQUAL : null,
						NOT_EQUAL : null,
						GREATER_THAN : null,
						GREATER_EQUAL : null,
						LESS_THAN : null,
						LESS_EQUAL : null,
						BETWEEN : null,
						NOT_BETWEEN : null,
						BETWEEN_EXCLUDING : null,
						NOT_BETWEEN_EXCLUDING : null,
						FUZZY : null,
						SEARCH : null,
						IN : null,
						ALL : null,
						AGGREGATED : null,
						NON_AGGREGATED : null,
						s_lookup : null,
						staticSetupComparisonOps : function() {
							sap.firefly.ComparisonOperator.s_lookup = sap.firefly.XHashMapByString
									.create();
							sap.firefly.ComparisonOperator.UNDEFINED = sap.firefly.ComparisonOperator
									.createComparison("UNDEFINED", "?", 0,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.IS_NULL = sap.firefly.ComparisonOperator
									.createComparison("IS_NULL", "IS_NULL", 0,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.EQUAL = sap.firefly.ComparisonOperator
									.createComparison("EQUAL", "==", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.NOT_EQUAL = sap.firefly.ComparisonOperator
									.createComparison("NOT_EQUAL", "!=", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.GREATER_THAN = sap.firefly.ComparisonOperator
									.createComparison("GREATER_THAN", ">", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.GREATER_EQUAL = sap.firefly.ComparisonOperator
									.createComparison("GREATER_EQUAL", ">=", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.LESS_THAN = sap.firefly.ComparisonOperator
									.createComparison("LESS_THAN", "<", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.LESS_EQUAL = sap.firefly.ComparisonOperator
									.createComparison("LESS_EQUAL", "<=", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.LIKE = sap.firefly.ComparisonOperator
									.createComparison("LIKE", "like", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.MATCH = sap.firefly.ComparisonOperator
									.createComparison("MATCH", "match", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.NOT_MATCH = sap.firefly.ComparisonOperator
									.createComparison("NOT_MATCH", "notMatch",
											1, sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.BETWEEN = sap.firefly.ComparisonOperator
									.createComparison("BETWEEN", "between", 2,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.NOT_BETWEEN = sap.firefly.ComparisonOperator
									.createComparison("NOT_BETWEEN",
											"notBetween", 2,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.BETWEEN_EXCLUDING = sap.firefly.ComparisonOperator
									.createComparison("BETWEEN_EXCLUDING",
											"betweenExcluding", 2,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.NOT_BETWEEN_EXCLUDING = sap.firefly.ComparisonOperator
									.createComparison("NOT_BETWEEN_EXCLUDING",
											"notBetweenExcluding", 2,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.FUZZY = sap.firefly.ComparisonOperator
									.createComparison("FUZZY", "fuzzy", 2,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.SEARCH = sap.firefly.ComparisonOperator
									.createComparison("SEARCH", "search", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.IN = sap.firefly.ComparisonOperator
									.createComparison("IN", "in", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.ALL = sap.firefly.ComparisonOperator
									.createComparison("ALL", "all", 0,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.AGGREGATED = sap.firefly.ComparisonOperator
									.createComparison("AGGREGATED",
											"aggregated", 0,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ComparisonOperator.NON_AGGREGATED = sap.firefly.ComparisonOperator
									.createComparison("NON-AGGREGATED",
											"NON-AGGREGATED", 0,
											sap.firefly.Operator.GRAVITY_3);
						},
						createComparison : function(name, displayString,
								numberOfParameters, gravity) {
							var newConstant = new sap.firefly.ComparisonOperator();
							newConstant.setupOperator(
									sap.firefly.Operator._COMPARISON, name,
									displayString, numberOfParameters, gravity);
							sap.firefly.ComparisonOperator.s_lookup.put(name,
									newConstant);
							return newConstant;
						},
						lookup : function(name) {
							return sap.firefly.ComparisonOperator.s_lookup
									.getByKey(name);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ConditionComparisonOperator",
				sap.firefly.Operator,
				{
					$statics : {
						EQUAL : null,
						NOT_EQUAL : null,
						GREATER_THAN : null,
						GREATER_EQUAL : null,
						LESS_THAN : null,
						LESS_EQUAL : null,
						BETWEEN : null,
						NOT_BETWEEN : null,
						TOP_N : null,
						BOTTOM_N : null,
						TOP_PERCENT : null,
						BOTTOM_PERCENT : null,
						TOP_SUM : null,
						BOTTOM_SUM : null,
						s_lookupNames : null,
						staticSetupComparisonOps : function() {
							sap.firefly.ConditionComparisonOperator.s_lookupNames = sap.firefly.XHashMapByString
									.create();
							sap.firefly.ConditionComparisonOperator.EQUAL = sap.firefly.ConditionComparisonOperator
									.createComparison("=", "==", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.NOT_EQUAL = sap.firefly.ConditionComparisonOperator
									.createComparison("<>", "<>", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.GREATER_THAN = sap.firefly.ConditionComparisonOperator
									.createComparison(">", ">", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.GREATER_EQUAL = sap.firefly.ConditionComparisonOperator
									.createComparison(">=", ">=", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.LESS_THAN = sap.firefly.ConditionComparisonOperator
									.createComparison("<", "<", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.LESS_EQUAL = sap.firefly.ConditionComparisonOperator
									.createComparison("<=", "<=", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.BETWEEN = sap.firefly.ConditionComparisonOperator
									.createComparison("BETWEEN", "BETWEEN", 2,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.NOT_BETWEEN = sap.firefly.ConditionComparisonOperator
									.createComparison("NOTBETWEEN",
											"NOTBETWEEN", 2,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.TOP_N = sap.firefly.ConditionComparisonOperator
									.createComparison("TOP_N", "TOP_N", 2,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.BOTTOM_N = sap.firefly.ConditionComparisonOperator
									.createComparison("BOTTOM_N", "BOTTOM_N",
											2, sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.TOP_PERCENT = sap.firefly.ConditionComparisonOperator
									.createComparison("TOP_PERCENT",
											"TOP_PERCENT", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.BOTTOM_PERCENT = sap.firefly.ConditionComparisonOperator
									.createComparison("BOTTOM_PERCENT",
											"BOTTOM_PERCENT", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.TOP_SUM = sap.firefly.ConditionComparisonOperator
									.createComparison("TOP_SUM", "TOP_SUM", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.ConditionComparisonOperator.BOTTOM_SUM = sap.firefly.ConditionComparisonOperator
									.createComparison("BOTTOM_SUM",
											"BOTTOM_SUM", 1,
											sap.firefly.Operator.GRAVITY_3);
						},
						createComparison : function(name, displayString,
								numberOfParameters, gravity) {
							var newConstant = new sap.firefly.ConditionComparisonOperator();
							newConstant.setupOperator(
									sap.firefly.Operator._COMPARISON, name,
									displayString, numberOfParameters, gravity);
							sap.firefly.ConditionComparisonOperator.s_lookupNames
									.put(displayString, newConstant);
							return newConstant;
						},
						lookupName : function(name) {
							return sap.firefly.ConditionComparisonOperator.s_lookupNames
									.getByKey(name);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.LogicalBoolOperator",
				sap.firefly.Operator,
				{
					$statics : {
						AND : null,
						OR : null,
						NOT : null,
						staticSetupLogicalOps : function() {
							sap.firefly.LogicalBoolOperator.AND = sap.firefly.LogicalBoolOperator
									.create("AND", "&&", 2,
											sap.firefly.Operator.GRAVITY_6);
							sap.firefly.LogicalBoolOperator.OR = sap.firefly.LogicalBoolOperator
									.create("OR", "||", 2,
											sap.firefly.Operator.GRAVITY_5);
							sap.firefly.LogicalBoolOperator.NOT = sap.firefly.LogicalBoolOperator
									.create("NOT", "!", 1,
											sap.firefly.Operator.GRAVITY_5);
						},
						create : function(name, displayString,
								numberOfParameters, gravity) {
							var newConstant = new sap.firefly.LogicalBoolOperator();
							newConstant.setupOperatorExt(
									sap.firefly.Operator._LOGICAL, name,
									displayString, numberOfParameters, gravity,
									false);
							return newConstant;
						}
					}
				});
$Firefly.createClass("sap.firefly.MathOperator", sap.firefly.Operator, {
	$statics : {
		MULT : null,
		DIV : null,
		PLUS : null,
		MINUS : null,
		MODULO : null,
		POWER : null,
		staticSetupMathOps : function() {
			sap.firefly.MathOperator.MULT = sap.firefly.MathOperator.create(
					"Mult", "*", 0, sap.firefly.Operator.GRAVITY_1);
			sap.firefly.MathOperator.DIV = sap.firefly.MathOperator.create(
					"Div", "/", 0, sap.firefly.Operator.GRAVITY_1);
			sap.firefly.MathOperator.PLUS = sap.firefly.MathOperator.create(
					"Plus", "+", 0, sap.firefly.Operator.GRAVITY_2);
			sap.firefly.MathOperator.MINUS = sap.firefly.MathOperator.create(
					"Minus", "-", 0, sap.firefly.Operator.GRAVITY_2);
			sap.firefly.MathOperator.POWER = sap.firefly.MathOperator.create(
					"Power", "**", 0, sap.firefly.Operator.GRAVITY_1);
		},
		create : function(name, displayString, numberOfParameters, gravity) {
			var newConstant = new sap.firefly.MathOperator();
			newConstant.setupOperator(sap.firefly.Operator._MATH, name,
					displayString, numberOfParameters, gravity);
			return newConstant;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.OlapComponentType",
				sap.firefly.XComponentType,
				{
					$statics : {
						OLAP_ENVIRONMENT : null,
						OLAP_DATA_PROVIDER : null,
						CHART_DATA_PROVIDER : null,
						CONVENIENCE_CMDS : null,
						OLAP : null,
						QUERY_MANAGER : null,
						DATA_SOURCE : null,
						SELECTOR : null,
						ATTRIBUTE_CONTAINER : null,
						ATTRIBUTE : null,
						FILTER_EXPRESSION : null,
						FILTER_LITERAL : null,
						FILTER_FIXED : null,
						FILTER_DYNAMIC : null,
						FILTER_VISIBILITY : null,
						FILTER_ELEMENT : null,
						FILTER_CELL_VALUE_OPERAND : null,
						QUERY_CONTEXT : null,
						DIMENSION_CONTEXT : null,
						DIMENSIONS : null,
						EXCEPTION_MANAGER : null,
						QUERY_MODEL : null,
						AXES_MANAGER : null,
						QUERY_SETTINGS : null,
						HIERARCHY : null,
						HIERARCHY_MANAGER : null,
						DIMENSION_MANAGER : null,
						DRILL_MANAGER : null,
						DRILL_OPERATION : null,
						SORT_MANAGER : null,
						VIZ_MANAGER : null,
						COMPONENT_LIST : null,
						AXIS : null,
						AXES_SETTINGS : null,
						FIELD_CONTAINER : null,
						FIELD_LIST : null,
						FIELD : null,
						PROPERTY : null,
						VARIABLE_CONTEXT : null,
						VARIABLE_CONTAINER : null,
						VARIABLE_LIST : null,
						FORMULA_CONSTANT : null,
						FORMULA_ITEM_MEMBER : null,
						FORMULA_ITEM_ATTRIBUTE : null,
						FORMULA_OPERATION : null,
						FORMULA_FUNCTION : null,
						PLANNING_COMMAND : null,
						GENERIC_SORTING : null,
						DIMENSION_SORTING : null,
						FIELD_SORTING : null,
						DATA_CELL_SORTING : null,
						COMPLEX_SORTING : null,
						MEASURE_SORTING : null,
						RESULT_STRUCTURE : null,
						VARIABLE_MANAGER : null,
						ABSTRACT_LAYER_MODEL : null,
						LAYER_MODEL : null,
						LAYER : null,
						LAYER_SYNC_DEFINITION : null,
						LAYER_REFERENCE_DEFINITION : null,
						FILTER_CAPABILITY : null,
						FILTER_CAPABILITY_GROUP : null,
						CONDITIONS : null,
						CONDITIONS_THRESHOLD : null,
						CONDITIONS_MANAGER : null,
						CONDITION : null,
						DATA_CELL : null,
						DATA_CELLS : null,
						TOTALS : null,
						MEMBERS : null,
						ABSTRACT_DIMENSION : null,
						ATTRIBUTE_LIST : null,
						CATALOG_SPACE : null,
						GROUP_BY_NODE : null,
						CATALOG_TYPE : null,
						CATALOG_SCHEMA : null,
						CATALOG_PACKAGE : null,
						CATALOG_OBJECT : null,
						RD_DATA_CELL : null,
						OLAP_METADATA_MODEL : null,
						staticSetupOlapType : function() {
							sap.firefly.OlapComponentType.OLAP_DATA_PROVIDER = sap.firefly.OlapComponentType
									.createOlapType(
											"OlapDataProvider",
											sap.firefly.RuntimeComponentType.DATA_PROVIDER);
							sap.firefly.OlapComponentType.CHART_DATA_PROVIDER = sap.firefly.OlapComponentType
									.createOlapType(
											"ChartDataProvider",
											sap.firefly.RuntimeComponentType.DATA_PROVIDER);
							sap.firefly.OlapComponentType.CONVENIENCE_CMDS = sap.firefly.OlapComponentType
									.createOlapType("OlapCmds", null);
							sap.firefly.OlapComponentType.OLAP = sap.firefly.OlapComponentType
									.createOlapType("Olap", null);
							sap.firefly.OlapComponentType.OLAP_ENVIRONMENT = sap.firefly.OlapComponentType
									.createOlapType("OlapEnvironment",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.QUERY_MANAGER = sap.firefly.OlapComponentType
									.createOlapType("QueryManager",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.QUERY_CONTEXT = sap.firefly.OlapComponentType
									.createOlapType("QueryContext",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.COMPONENT_LIST = sap.firefly.OlapComponentType
									.createOlapType(
											"ComponentList",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.DATA_SOURCE = sap.firefly.OlapComponentType
									.createOlapType("DataSource",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.SELECTOR = sap.firefly.OlapComponentType
									.createOlapType(
											"Selector",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.FILTER_EXPRESSION = sap.firefly.OlapComponentType
									.createOlapType(
											"FilterExpression",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.FILTER_LITERAL = sap.firefly.OlapComponentType
									.createOlapType(
											"FilterLiteral",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.FILTER_FIXED = sap.firefly.OlapComponentType
									.createOlapType(
											"FilterFixed",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.FILTER_DYNAMIC = sap.firefly.OlapComponentType
									.createOlapType(
											"FilterDynamic",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.FILTER_VISIBILITY = sap.firefly.OlapComponentType
									.createOlapType(
											"FilterVisibility",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.FILTER_ELEMENT = sap.firefly.OlapComponentType
									.createOlapType(
											"FilterElement",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.QUERY_MODEL = sap.firefly.OlapComponentType
									.createOlapType(
											"QueryModel",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.QUERY_SETTINGS = sap.firefly.OlapComponentType
									.createOlapType(
											"QuerySettings",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.DIMENSION_MANAGER = sap.firefly.OlapComponentType
									.createOlapType(
											"DimensionManager",
											sap.firefly.OlapComponentType.COMPONENT_LIST);
							sap.firefly.OlapComponentType.DRILL_MANAGER = sap.firefly.OlapComponentType
									.createOlapType(
											"DrillManager",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.DRILL_OPERATION = sap.firefly.OlapComponentType
									.createOlapType(
											"DrillOperation",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.AXES_MANAGER = sap.firefly.OlapComponentType
									.createOlapType(
											"AxesManager",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.AXIS = sap.firefly.OlapComponentType
									.createOlapType(
											"Axis",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.AXES_SETTINGS = sap.firefly.OlapComponentType
									.createOlapType(
											"AxesSettings",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.ATTRIBUTE_CONTAINER = sap.firefly.OlapComponentType
									.createOlapType(
											"AttributeContainer",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.ATTRIBUTE = sap.firefly.OlapComponentType
									.createOlapType(
											"Attribute",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.PLANNING_COMMAND = sap.firefly.OlapComponentType
									.createOlapType("PlanningCommand",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.GENERIC_SORTING = sap.firefly.OlapComponentType
									.createOlapType(
											"GenericSorting",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.DIMENSION_SORTING = sap.firefly.OlapComponentType
									.createOlapType(
											"DimensionSorting",
											sap.firefly.OlapComponentType.GENERIC_SORTING);
							sap.firefly.OlapComponentType.FIELD_SORTING = sap.firefly.OlapComponentType
									.createOlapType(
											"FieldSorting",
											sap.firefly.OlapComponentType.GENERIC_SORTING);
							sap.firefly.OlapComponentType.DATA_CELL_SORTING = sap.firefly.OlapComponentType
									.createOlapType(
											"DataCellSorting",
											sap.firefly.OlapComponentType.GENERIC_SORTING);
							sap.firefly.OlapComponentType.COMPLEX_SORTING = sap.firefly.OlapComponentType
									.createOlapType(
											"ComplexSorting",
											sap.firefly.OlapComponentType.GENERIC_SORTING);
							sap.firefly.OlapComponentType.MEASURE_SORTING = sap.firefly.OlapComponentType
									.createOlapType(
											"MeasureSorting",
											sap.firefly.OlapComponentType.GENERIC_SORTING);
							sap.firefly.OlapComponentType.RESULT_STRUCTURE = sap.firefly.OlapComponentType
									.createOlapType(
											"ResultStructure",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.DIMENSION_CONTEXT = sap.firefly.OlapComponentType
									.createOlapType(
											"DimensionContext",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.DIMENSIONS = sap.firefly.OlapComponentType
									.createOlapType(
											"Dimensions",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.FIELD_CONTAINER = sap.firefly.OlapComponentType
									.createOlapType(
											"FieldContainer",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.FIELD_LIST = sap.firefly.OlapComponentType
									.createOlapType(
											"FieldList",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.FIELD = sap.firefly.OlapComponentType
									.createOlapType(
											"Field",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.VARIABLE_CONTEXT = sap.firefly.OlapComponentType
									.createOlapType(
											"VariableContext",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.PROPERTY = sap.firefly.OlapComponentType
									.createOlapType("Property",
											sap.firefly.XComponentType._VALUE);
							sap.firefly.OlapComponentType.FORMULA_CONSTANT = sap.firefly.OlapComponentType
									.createOlapType("FormulaConstant",
											sap.firefly.XComponentType._MODEL);
							sap.firefly.OlapComponentType.FORMULA_ITEM_MEMBER = sap.firefly.OlapComponentType
									.createOlapType("FormulaItemMember",
											sap.firefly.XComponentType._MODEL);
							sap.firefly.OlapComponentType.FORMULA_ITEM_ATTRIBUTE = sap.firefly.OlapComponentType
									.createOlapType("FormulaItemAttribute",
											sap.firefly.XComponentType._MODEL);
							sap.firefly.OlapComponentType.FORMULA_OPERATION = sap.firefly.OlapComponentType
									.createOlapType("FormulaOperation",
											sap.firefly.XComponentType._MODEL);
							sap.firefly.OlapComponentType.FORMULA_FUNCTION = sap.firefly.OlapComponentType
									.createOlapType("FormulaFunction",
											sap.firefly.XComponentType._MODEL);
							sap.firefly.OlapComponentType.SORT_MANAGER = sap.firefly.OlapComponentType
									.createOlapType(
											"SortManager",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.VIZ_MANAGER = sap.firefly.OlapComponentType
									.createOlapType(
											"VizManager",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.VARIABLE_CONTAINER = sap.firefly.OlapComponentType
									.createOlapType(
											"VariableContainer",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.VARIABLE_LIST = sap.firefly.OlapComponentType
									.createOlapType(
											"VariableList",
											sap.firefly.OlapComponentType.QUERY_CONTEXT);
							sap.firefly.OlapComponentType.VARIABLE_MANAGER = sap.firefly.OlapComponentType
									.createOlapType(
											"VariableManager",
											sap.firefly.OlapComponentType.VARIABLE_CONTAINER);
							sap.firefly.OlapComponentType.ABSTRACT_LAYER_MODEL = sap.firefly.OlapComponentType
									.createOlapType("AbstractLayerModel",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.LAYER_MODEL = sap.firefly.OlapComponentType
									.createOlapType(
											"LayerModel",
											sap.firefly.OlapComponentType.ABSTRACT_LAYER_MODEL);
							sap.firefly.OlapComponentType.LAYER = sap.firefly.OlapComponentType
									.createOlapType(
											"Layer",
											sap.firefly.OlapComponentType.ABSTRACT_LAYER_MODEL);
							sap.firefly.OlapComponentType.LAYER_SYNC_DEFINITION = sap.firefly.OlapComponentType
									.createOlapType(
											"LayerSyncDefinition",
											sap.firefly.OlapComponentType.ABSTRACT_LAYER_MODEL);
							sap.firefly.OlapComponentType.LAYER_REFERENCE_DEFINITION = sap.firefly.OlapComponentType
									.createOlapType(
											"LayerReferenceDefinition",
											sap.firefly.OlapComponentType.ABSTRACT_LAYER_MODEL);
							sap.firefly.OlapComponentType.FILTER_CAPABILITY = sap.firefly.OlapComponentType
									.createOlapType("FilterCapability",
											sap.firefly.XComponentType._MODEL);
							sap.firefly.OlapComponentType.FILTER_CAPABILITY_GROUP = sap.firefly.OlapComponentType
									.createOlapType(
											"FilterCapabilityGroup",
											sap.firefly.OlapComponentType.FILTER_CAPABILITY);
							sap.firefly.OlapComponentType.CONDITIONS = sap.firefly.OlapComponentType
									.createOlapType("Conditions",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.CONDITIONS_MANAGER = sap.firefly.OlapComponentType
									.createOlapType(
											"ConditionManager",
											sap.firefly.OlapComponentType.CONDITIONS);
							sap.firefly.OlapComponentType.CONDITION = sap.firefly.OlapComponentType
									.createOlapType("Condition",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.CONDITIONS_THRESHOLD = sap.firefly.OlapComponentType
									.createOlapType("ConditionThreshold",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.DATA_CELL = sap.firefly.OlapComponentType
									.createOlapType("DataCell",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.DATA_CELLS = sap.firefly.OlapComponentType
									.createOlapType("DataCells",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.FILTER_CELL_VALUE_OPERAND = sap.firefly.OlapComponentType
									.createOlapType("FilterCellValueOperand",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.TOTALS = sap.firefly.OlapComponentType
									.createOlapType("Totals",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.MEMBERS = sap.firefly.OlapComponentType
									.createOlapType("Members",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.HIERARCHY = sap.firefly.OlapComponentType
									.createOlapType("Hierarchy",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.HIERARCHY_MANAGER = sap.firefly.OlapComponentType
									.createOlapType("HierarchyManager",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.EXCEPTION_MANAGER = sap.firefly.OlapComponentType
									.createOlapType("Exceptions",
											sap.firefly.OlapComponentType.OLAP);
							sap.firefly.OlapComponentType.ABSTRACT_DIMENSION = sap.firefly.OlapComponentType
									.createOlapType("AbstractDimension",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.OlapComponentType.ATTRIBUTE_LIST = sap.firefly.OlapComponentType
									.createOlapType(
											"AttributeList",
											sap.firefly.OlapComponentType.COMPONENT_LIST);
							sap.firefly.OlapComponentType.CATALOG_SPACE = sap.firefly.OlapComponentType
									.createOlapType("CatalogSpace",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.OlapComponentType.GROUP_BY_NODE = sap.firefly.OlapComponentType
									.createOlapType("GroupByNode",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.OlapComponentType.CATALOG_TYPE = sap.firefly.OlapComponentType
									.createOlapType("CatalogType",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.OlapComponentType.CATALOG_SCHEMA = sap.firefly.OlapComponentType
									.createOlapType("CatalogSchema",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.OlapComponentType.CATALOG_PACKAGE = sap.firefly.OlapComponentType
									.createOlapType("CatalogPackage",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.OlapComponentType.CATALOG_OBJECT = sap.firefly.OlapComponentType
									.createOlapType("CatalogObject",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.OlapComponentType.RD_DATA_CELL = sap.firefly.OlapComponentType
									.createOlapType("RS_DATA_CELL",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.OlapComponentType.OLAP_METADATA_MODEL = sap.firefly.OlapComponentType
									.createOlapType("OlapMetadataModel",
											sap.firefly.XComponentType._ROOT);
						},
						createOlapType : function(constant, parent) {
							var mt = new sap.firefly.OlapComponentType();
							if (parent === null) {
								mt.setup(constant,
										sap.firefly.XComponentType._ROOT);
							} else {
								mt.setup(constant, parent);
							}
							return mt;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PresentationType",
				sap.firefly.XComponentType,
				{
					$statics : {
						UNDEFINED : null,
						SELF : null,
						DEFAULT_CONTENT : null,
						VALUE : null,
						ABSTRACT_KEY : null,
						ABSTRACT_TEXT : null,
						ACTIVE_KEY : null,
						ACTIVE_DISPLAY_KEY : null,
						ACTIVE_TEXT : null,
						KEY : null,
						ID : null,
						KEY_NOT_COMPOUND : null,
						DISPLAY_KEY : null,
						DISPLAY_KEY_MIXED_COMPOUNDMENT : null,
						DISPLAY_KEY_NOT_COMPOUND : null,
						SHORT_TEXT : null,
						MEDIUM_TEXT : null,
						LONG_TEXT : null,
						XL_LONG_TEXT : null,
						TEXT : null,
						DOCUMENT_LINK : null,
						BUSINESS_OBJECT_NODE_IDENTIFIER : null,
						WHY_FOUND : null,
						RELATED_ACTIONS : null,
						HIERARCHY_KEY : null,
						HIERARCHY_TEXT : null,
						HIERARCHY_DISPLAY_KEY : null,
						staticSetupPresentation : function() {
							sap.firefly.PresentationType.SELF = sap.firefly.PresentationType
									.createPresentation("SELF", null);
							sap.firefly.PresentationType.UNDEFINED = sap.firefly.PresentationType
									.createPresentation("UNDEFINED", null);
							sap.firefly.PresentationType.DEFAULT_CONTENT = sap.firefly.PresentationType
									.createPresentation("DEFAULT_CONTENT", null);
							sap.firefly.PresentationType.VALUE = sap.firefly.PresentationType
									.createPresentation("VALUE", null);
							sap.firefly.PresentationType.ID = sap.firefly.PresentationType
									.createPresentation("ID", null);
							sap.firefly.PresentationType.ABSTRACT_KEY = sap.firefly.PresentationType
									.createPresentation("ABSTRACT_KEY", null);
							sap.firefly.PresentationType.ABSTRACT_TEXT = sap.firefly.PresentationType
									.createPresentation("ABSTRACT_TEXT", null);
							sap.firefly.PresentationType.ACTIVE_KEY = sap.firefly.PresentationType
									.createPresentation(
											"ACTIVE_KEY",
											sap.firefly.PresentationType.ABSTRACT_KEY);
							sap.firefly.PresentationType.ACTIVE_DISPLAY_KEY = sap.firefly.PresentationType
									.createPresentation(
											"ACTIVE_DISPLAY_KEY",
											sap.firefly.PresentationType.ABSTRACT_KEY);
							sap.firefly.PresentationType.ACTIVE_TEXT = sap.firefly.PresentationType
									.createPresentation(
											"ACTIVE_TEXT",
											sap.firefly.PresentationType.ABSTRACT_TEXT);
							sap.firefly.PresentationType.KEY = sap.firefly.PresentationType
									.createPresentation(
											"KEY",
											sap.firefly.PresentationType.ABSTRACT_KEY);
							sap.firefly.PresentationType.KEY_NOT_COMPOUND = sap.firefly.PresentationType
									.createPresentation(
											"KEY_NOT_COMPOUND",
											sap.firefly.PresentationType.ABSTRACT_KEY);
							sap.firefly.PresentationType.DISPLAY_KEY = sap.firefly.PresentationType
									.createPresentation(
											"DISPLAY_KEY",
											sap.firefly.PresentationType.ABSTRACT_KEY);
							sap.firefly.PresentationType.DISPLAY_KEY_MIXED_COMPOUNDMENT = sap.firefly.PresentationType
									.createPresentation(
											"DISPLAY_KEY_MIXED_COMPOUNDMENT",
											sap.firefly.PresentationType.DISPLAY_KEY);
							sap.firefly.PresentationType.DISPLAY_KEY_NOT_COMPOUND = sap.firefly.PresentationType
									.createPresentation(
											"DISPLAY_KEY_NC",
											sap.firefly.PresentationType.DISPLAY_KEY);
							sap.firefly.PresentationType.TEXT = sap.firefly.PresentationType
									.createPresentation(
											"TEXT",
											sap.firefly.PresentationType.ABSTRACT_TEXT);
							sap.firefly.PresentationType.SHORT_TEXT = sap.firefly.PresentationType
									.createPresentation("SHORT_TEXT",
											sap.firefly.PresentationType.TEXT);
							sap.firefly.PresentationType.MEDIUM_TEXT = sap.firefly.PresentationType
									.createPresentation("MIDDLE_TEXT",
											sap.firefly.PresentationType.TEXT);
							sap.firefly.PresentationType.LONG_TEXT = sap.firefly.PresentationType
									.createPresentation("LONG_TEXT",
											sap.firefly.PresentationType.TEXT);
							sap.firefly.PresentationType.XL_LONG_TEXT = sap.firefly.PresentationType
									.createPresentation("XL_LONG_TEXT",
											sap.firefly.PresentationType.TEXT);
							sap.firefly.PresentationType.HIERARCHY_KEY = sap.firefly.PresentationType
									.createPresentation(
											"HIERARCHY_KEY",
											sap.firefly.PresentationType.ABSTRACT_KEY);
							sap.firefly.PresentationType.HIERARCHY_DISPLAY_KEY = sap.firefly.PresentationType
									.createPresentation(
											"HIERARCHY_DISPLAY_KEY",
											sap.firefly.PresentationType.ABSTRACT_KEY);
							sap.firefly.PresentationType.HIERARCHY_TEXT = sap.firefly.PresentationType
									.createPresentation(
											"HIERARCHY_TEXT",
											sap.firefly.PresentationType.ABSTRACT_TEXT);
							sap.firefly.PresentationType.DOCUMENT_LINK = sap.firefly.PresentationType
									.createPresentation("DOCUMENT_LINK", null);
							sap.firefly.PresentationType.BUSINESS_OBJECT_NODE_IDENTIFIER = sap.firefly.PresentationType
									.createPresentation(
											"BUSINESS_OBJECT_NODE_IDENTIFIER",
											null);
							sap.firefly.PresentationType.WHY_FOUND = sap.firefly.PresentationType
									.createPresentation("WHY_FOUND", null);
							sap.firefly.PresentationType.RELATED_ACTIONS = sap.firefly.PresentationType
									.createPresentation("RELATED_ACTIONS", null);
						},
						createPresentation : function(name, parent) {
							var newConstant = new sap.firefly.PresentationType();
							newConstant.setName(name);
							newConstant.setParent(parent);
							return newConstant;
						},
						isTextPresentation : function(presentationType) {
							if (presentationType === null) {
								return false;
							}
							return presentationType
									.isTypeOf(sap.firefly.PresentationType.TEXT)
									|| (presentationType === sap.firefly.PresentationType.HIERARCHY_TEXT);
						},
						isKeyPresentation : function(presentationType) {
							if (presentationType === null) {
								return false;
							}
							return presentationType
									.isTypeOf(sap.firefly.PresentationType.ABSTRACT_KEY)
									|| (presentationType === sap.firefly.PresentationType.HIERARCHY_KEY)
									|| (presentationType === sap.firefly.PresentationType.HIERARCHY_DISPLAY_KEY);
						}
					}
				});
$Firefly.createClass("sap.firefly.Scope", sap.firefly.XComponentType, {
	$statics : {
		GLOBAL : null,
		USER : null,
		s_allScopes : null,
		staticSetup : function() {
			sap.firefly.Scope.s_allScopes = sap.firefly.XHashMapByString
					.create();
			sap.firefly.Scope.GLOBAL = sap.firefly.Scope.create("Global");
			sap.firefly.Scope.USER = sap.firefly.Scope.create("User");
		},
		create : function(name) {
			var newVariant = new sap.firefly.Scope();
			newVariant.setName(name);
			sap.firefly.Scope.s_allScopes.put(name, newVariant);
			return newVariant;
		},
		lookupByName : function(name) {
			return sap.firefly.Scope.s_allScopes.getByKey(name);
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.VariableVariantType",
				sap.firefly.XComponentType,
				{
					$statics : {
						AO_VARIABLE_DEFAULTS : null,
						s_allVariants : null,
						staticSetup : function() {
							sap.firefly.VariableVariantType.s_allVariants = sap.firefly.XHashMapByString
									.create();
							sap.firefly.VariableVariantType.AO_VARIABLE_DEFAULTS = sap.firefly.VariableVariantType
									.create("analysisOfficeVariableDefaults");
						},
						create : function(name) {
							var newVariant = new sap.firefly.VariableVariantType();
							newVariant.setName(name);
							sap.firefly.VariableVariantType.s_allVariants.put(
									name, newVariant);
							return newVariant;
						},
						lookupByName : function(name) {
							return sap.firefly.VariableVariantType.s_allVariants
									.getByKey(name);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.OlapCatalogServiceConfig",
				sap.firefly.DfServiceConfig,
				{
					$statics : {
						CLAZZ : null,
						staticSetup : function() {
							sap.firefly.OlapCatalogServiceConfig.CLAZZ = sap.firefly.XClass
									.create(sap.firefly.OlapCatalogServiceConfig);
						}
					},
					processOlapCatalogManagerCreation : function(syncType,
							listener, customIdentifier) {
						return this.processSyncAction(syncType, listener,
								customIdentifier);
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onOlapCatalogManagerCreated(extResult, data,
								customIdentifier);
					},
					setDataFromService : function(service) {
						this.setData(service.getCatalogManager());
					}
				});
$Firefly.createClass("sap.firefly.AxisType", sap.firefly.OlapComponentType, {
	$statics : {
		COLUMNS : null,
		ROWS : null,
		FREE : null,
		DYNAMIC : null,
		REPOSITORY : null,
		FILTER : null,
		s_all : null,
		staticSetup : function() {
			sap.firefly.AxisType.s_all = sap.firefly.XSetOfNameObject.create();
			sap.firefly.AxisType.REPOSITORY = sap.firefly.AxisType.create(
					"Repository", 3, null, false);
			sap.firefly.AxisType.FREE = sap.firefly.AxisType.create("Free", 2,
					sap.firefly.AxisType.REPOSITORY, false);
			sap.firefly.AxisType.COLUMNS = sap.firefly.AxisType.create(
					"Columns", 0, sap.firefly.AxisType.FREE, true);
			sap.firefly.AxisType.ROWS = sap.firefly.AxisType.create("Rows", 1,
					sap.firefly.AxisType.FREE, true);
			sap.firefly.AxisType.DYNAMIC = sap.firefly.AxisType.create(
					"Dynamic", 4, sap.firefly.AxisType.FREE, false);
			sap.firefly.AxisType.FILTER = sap.firefly.AxisType.create("Filter",
					4, sap.firefly.AxisType.REPOSITORY, false);
		},
		create : function(name, index, fallback, isVisible) {
			var newConstant = new sap.firefly.AxisType();
			newConstant.setupAxis(name, index, fallback, isVisible);
			sap.firefly.AxisType.s_all.put(newConstant);
			return newConstant;
		},
		getAll : function() {
			return sap.firefly.AxisType.s_all.getValuesAsReadOnlyList();
		},
		lookup : function(name) {
			return sap.firefly.AxisType.s_all.getByKey(name);
		}
	},
	m_index : 0,
	m_fallbackAxis : null,
	m_isVisible : false,
	setupAxis : function(name, index, fallback, isVisible) {
		sap.firefly.AxisType.$superclass.setup.call(this, name,
				sap.firefly.OlapComponentType.AXIS);
		this.m_index = index;
		this.m_fallbackAxis = fallback;
		this.m_isVisible = isVisible;
	},
	getIndex : function() {
		return this.m_index;
	},
	getFallbackAxis : function() {
		return this.m_fallbackAxis;
	},
	isVisible : function() {
		return this.m_isVisible;
	}
});
$Firefly
		.createClass(
				"sap.firefly.DimensionType",
				sap.firefly.OlapComponentType,
				{
					$statics : {
						ATTRIBUTE_DIM : null,
						PRESENTATION : null,
						CONTAINER : null,
						CURRENCY : null,
						UNIT : null,
						DIMENSION : null,
						TIME : null,
						DATE : null,
						HIERARCHY_VERSION : null,
						HIERARCHY_NAME : null,
						SEARCH_DIMENSION : null,
						VERSION : null,
						ACCOUNT : null,
						GIS_DIMENSION : null,
						SEARCH_RESULT : null,
						SUGGEST_TERM : null,
						SUGGEST_SCOPE : null,
						SUGGEST_ATTRIBUTE : null,
						ABSTRACT_STRUCTURE : null,
						MEASURE_STRUCTURE : null,
						SECONDARY_STRUCTURE : null,
						CALCULATED_DIMENSION : null,
						staticSetupDimensionType : function() {
							sap.firefly.DimensionType.DIMENSION = sap.firefly.DimensionType
									.createDimensionType(
											"Dimension",
											sap.firefly.OlapComponentType.ABSTRACT_DIMENSION,
											true);
							sap.firefly.DimensionType.SEARCH_DIMENSION = sap.firefly.DimensionType
									.createDimensionType(
											"SearchDimension",
											sap.firefly.DimensionType.DIMENSION,
											false);
							sap.firefly.DimensionType.GIS_DIMENSION = sap.firefly.DimensionType
									.createDimensionType(
											"GisDimension",
											sap.firefly.DimensionType.DIMENSION,
											false);
							sap.firefly.DimensionType.ABSTRACT_STRUCTURE = sap.firefly.DimensionType
									.createDimensionType(
											"AbstractStructure",
											sap.firefly.OlapComponentType.ABSTRACT_DIMENSION,
											false);
							sap.firefly.DimensionType.MEASURE_STRUCTURE = sap.firefly.DimensionType
									.createDimensionType(
											"MeasureStructure",
											sap.firefly.DimensionType.ABSTRACT_STRUCTURE,
											true);
							sap.firefly.DimensionType.SECONDARY_STRUCTURE = sap.firefly.DimensionType
									.createDimensionType(
											"SecondaryStructure",
											sap.firefly.DimensionType.ABSTRACT_STRUCTURE,
											true);
							sap.firefly.DimensionType.CURRENCY = sap.firefly.DimensionType
									.createDimensionType(
											"CurrencyDimension",
											sap.firefly.DimensionType.DIMENSION,
											true);
							sap.firefly.DimensionType.UNIT = sap.firefly.DimensionType
									.createDimensionType(
											"UnitDimension",
											sap.firefly.DimensionType.DIMENSION,
											true);
							sap.firefly.DimensionType.TIME = sap.firefly.DimensionType
									.createDimensionType(
											"TimeDimension",
											sap.firefly.DimensionType.DIMENSION,
											true);
							sap.firefly.DimensionType.DATE = sap.firefly.DimensionType
									.createDimensionType(
											"DateDimension",
											sap.firefly.DimensionType.DIMENSION,
											false);
							sap.firefly.DimensionType.HIERARCHY_VERSION = sap.firefly.DimensionType
									.createDimensionType(
											"HierarchyVersionDimension",
											sap.firefly.DimensionType.DIMENSION,
											false);
							sap.firefly.DimensionType.HIERARCHY_NAME = sap.firefly.DimensionType
									.createDimensionType(
											"HierarchyNameDimension",
											sap.firefly.DimensionType.DIMENSION,
											false);
							sap.firefly.DimensionType.SEARCH_RESULT = sap.firefly.DimensionType
									.createDimensionType(
											"SearchResultDimension",
											sap.firefly.DimensionType.DIMENSION,
											false);
							sap.firefly.DimensionType.SUGGEST_TERM = sap.firefly.DimensionType
									.createDimensionType(
											"SuggestTermDimension",
											sap.firefly.DimensionType.DIMENSION,
											false);
							sap.firefly.DimensionType.SUGGEST_SCOPE = sap.firefly.DimensionType
									.createDimensionType(
											"SuggestScopeDimension",
											sap.firefly.DimensionType.DIMENSION,
											false);
							sap.firefly.DimensionType.SUGGEST_ATTRIBUTE = sap.firefly.DimensionType
									.createDimensionType(
											"SuggestAttributeDimension",
											sap.firefly.DimensionType.DIMENSION,
											false);
							sap.firefly.DimensionType.ACCOUNT = sap.firefly.DimensionType
									.createDimensionType(
											"AccountDimension",
											sap.firefly.DimensionType.DIMENSION,
											true);
							sap.firefly.DimensionType.VERSION = sap.firefly.DimensionType
									.createDimensionType(
											"VersionDimension",
											sap.firefly.DimensionType.DIMENSION,
											true);
							sap.firefly.DimensionType.ATTRIBUTE_DIM = sap.firefly.DimensionType
									.createDimensionType(
											"AttributeDimension",
											sap.firefly.OlapComponentType.ABSTRACT_DIMENSION,
											false);
							sap.firefly.DimensionType.PRESENTATION = sap.firefly.DimensionType
									.createDimensionType(
											"PresentationDimension",
											sap.firefly.DimensionType.ATTRIBUTE_DIM,
											false);
							sap.firefly.DimensionType.CONTAINER = sap.firefly.DimensionType
									.createDimensionType(
											"ContainerDimension",
											sap.firefly.DimensionType.ATTRIBUTE_DIM,
											false);
							sap.firefly.DimensionType.CALCULATED_DIMENSION = sap.firefly.DimensionType
									.createDimensionType(
											"CalculatedDimension",
											sap.firefly.DimensionType.DIMENSION,
											true);
						},
						createDimensionType : function(name, parent,
								isValidForBlending) {
							var newConstant = new sap.firefly.DimensionType();
							newConstant.setup(name, parent);
							newConstant.m_isValidForBlending = isValidForBlending;
							return newConstant;
						}
					},
					m_isValidForBlending : false,
					isValidForBlending : function() {
						return this.m_isValidForBlending;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.FilterComponentType",
				sap.firefly.OlapComponentType,
				{
					$statics : {
						BOOLEAN_ALGEBRA : null,
						AND : null,
						TUPLE : null,
						OR : null,
						NOT : null,
						OPERATION : null,
						CARTESIAN_LIST : null,
						CARTESIAN_SPATIAL_LIST : null,
						CARTESIAN_PRODUCT : null,
						SPATIAL_FILTER : null,
						MEMBER_OPERAND : null,
						staticSetup : function() {
							sap.firefly.FilterComponentType.OPERATION = sap.firefly.FilterComponentType
									.create(
											"Operation",
											sap.firefly.OlapComponentType.FILTER_ELEMENT);
							sap.firefly.FilterComponentType.BOOLEAN_ALGEBRA = sap.firefly.FilterComponentType
									.create(
											"BooleanAlgebra",
											sap.firefly.OlapComponentType.FILTER_ELEMENT);
							sap.firefly.FilterComponentType.OR = sap.firefly.FilterComponentType
									.create(
											"Or",
											sap.firefly.FilterComponentType.BOOLEAN_ALGEBRA);
							sap.firefly.FilterComponentType.AND = sap.firefly.FilterComponentType
									.create(
											"And",
											sap.firefly.FilterComponentType.BOOLEAN_ALGEBRA);
							sap.firefly.FilterComponentType.NOT = sap.firefly.FilterComponentType
									.create(
											"Not",
											sap.firefly.FilterComponentType.BOOLEAN_ALGEBRA);
							sap.firefly.FilterComponentType.TUPLE = sap.firefly.FilterComponentType
									.create(
											"Tuple",
											sap.firefly.OlapComponentType.FILTER_ELEMENT);
							sap.firefly.FilterComponentType.CARTESIAN_PRODUCT = sap.firefly.FilterComponentType
									.create("CartesianProduct",
											sap.firefly.FilterComponentType.AND);
							sap.firefly.FilterComponentType.CARTESIAN_LIST = sap.firefly.FilterComponentType
									.create("CartesianList",
											sap.firefly.FilterComponentType.OR);
							sap.firefly.FilterComponentType.CARTESIAN_SPATIAL_LIST = sap.firefly.FilterComponentType
									.create(
											"CartesianSpatialList",
											sap.firefly.FilterComponentType.CARTESIAN_LIST);
							sap.firefly.FilterComponentType.SPATIAL_FILTER = sap.firefly.FilterComponentType
									.create(
											"Spatial",
											sap.firefly.OlapComponentType.FILTER_ELEMENT);
							sap.firefly.FilterComponentType.MEMBER_OPERAND = sap.firefly.FilterComponentType
									.create(
											"MemberOperand",
											sap.firefly.OlapComponentType.FILTER_ELEMENT);
						},
						create : function(name, parent) {
							var newConstant = new sap.firefly.FilterComponentType();
							newConstant.setName(name);
							newConstant.setParent(parent);
							return newConstant;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.FormulaOperator",
				sap.firefly.OlapComponentType,
				{
					$statics : {
						MULTIPLICATION : null,
						POWER_OF : null,
						ADDITION : null,
						SUBTRACTION : null,
						DIVISION : null,
						ABS : null,
						AND : null,
						CEIL : null,
						EXP : null,
						FLOOR : null,
						LOG : null,
						LOG_10 : null,
						MIN : null,
						MAX : null,
						NOT : null,
						OR : null,
						ROUND : null,
						SQRT : null,
						NE : null,
						LT : null,
						LE : null,
						EQ : null,
						GT : null,
						GE : null,
						IF : null,
						IN : null,
						ISNULL : null,
						MOD_MDS : null,
						CELL_VALUE : null,
						DECFLOAT : null,
						DOUBLE : null,
						FLOAT : null,
						HIERARCHYAGGREGATE : null,
						INT : null,
						MEMBERINDEX : null,
						TRUNCATE : null,
						MOD_BW : null,
						NODIM : null,
						SIN : null,
						COS : null,
						TAN : null,
						ASIN : null,
						ACOS : null,
						ATAN : null,
						SINH : null,
						COSH : null,
						TANH : null,
						DIV : null,
						FRAC : null,
						MAX0 : null,
						MIN0 : null,
						TRUNC : null,
						SIGN : null,
						DATE : null,
						TIME : null,
						NOERR : null,
						NDIV0 : null,
						PERCENT : null,
						PERCENT_A : null,
						XOR : null,
						GROUP_BINARY : "Binary",
						GROUP_COMPARE : "Comparison",
						GROUP_CONVERSION : "Conversion",
						GROUP_MATH : "Mathematical",
						GROUP_MISCELLANEOUS : "Miscellaneous",
						MDS_OPERATOR : null,
						BW_OPERATOR : null,
						staticSetup : function() {
							sap.firefly.FormulaOperator.MDS_OPERATOR = sap.firefly.XList
									.create();
							sap.firefly.FormulaOperator.BW_OPERATOR = sap.firefly.XList
									.create();
							sap.firefly.FormulaOperator.MULTIPLICATION = sap.firefly.FormulaOperator
									.create(
											"*",
											"Multiplication",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.POWER_OF = sap.firefly.FormulaOperator
									.create(
											"**",
											"Power of",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.ADDITION = sap.firefly.FormulaOperator
									.create(
											"+",
											"Addition",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.SUBTRACTION = sap.firefly.FormulaOperator
									.create(
											"-",
											"Subtraction / Negation",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.DIVISION = sap.firefly.FormulaOperator
									.create(
											"/",
											"Division",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.ABS = sap.firefly.FormulaOperator
									.create(
											"ABS",
											"Absolute Value",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.AND = sap.firefly.FormulaOperator
									.create(
											"AND",
											"Binary AND",
											sap.firefly.FormulaOperator.GROUP_BINARY,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.CEIL = sap.firefly.FormulaOperator
									.create(
											"CEIL",
											"Round up",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.EXP = sap.firefly.FormulaOperator
									.create(
											"EXP",
											"Base-E exponential function",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.FLOOR = sap.firefly.FormulaOperator
									.create(
											"FLOOR",
											"Round down",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.LOG = sap.firefly.FormulaOperator
									.create(
											"LOG",
											"Natural Logarithm",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.LOG_10 = sap.firefly.FormulaOperator
									.create(
											"LOG10",
											"Common Logarithm",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.MIN = sap.firefly.FormulaOperator
									.create(
											"MIN",
											"Minimum",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.MAX = sap.firefly.FormulaOperator
									.create(
											"MAX",
											"Maximum",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.NOT = sap.firefly.FormulaOperator
									.create(
											"NOT",
											"Binary Negation",
											sap.firefly.FormulaOperator.GROUP_BINARY,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.OR = sap.firefly.FormulaOperator
									.create(
											"OR",
											"Binary OR",
											sap.firefly.FormulaOperator.GROUP_BINARY,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.ROUND = sap.firefly.FormulaOperator
									.create(
											"ROUND",
											"Round",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.SQRT = sap.firefly.FormulaOperator
									.create(
											"SQRT",
											"Square root",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._DEFAULT);
							sap.firefly.FormulaOperator.NE = sap.firefly.FormulaOperator
									.create(
											"!=",
											"Not equal",
											sap.firefly.FormulaOperator.GROUP_COMPARE,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.LT = sap.firefly.FormulaOperator
									.create(
											"<",
											"Less than",
											sap.firefly.FormulaOperator.GROUP_COMPARE,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.LE = sap.firefly.FormulaOperator
									.create(
											"<=",
											"Less or equal than",
											sap.firefly.FormulaOperator.GROUP_COMPARE,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.EQ = sap.firefly.FormulaOperator
									.create(
											"==",
											"Equal to",
											sap.firefly.FormulaOperator.GROUP_COMPARE,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.GT = sap.firefly.FormulaOperator
									.create(
											">",
											"Greater than",
											sap.firefly.FormulaOperator.GROUP_COMPARE,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.GE = sap.firefly.FormulaOperator
									.create(
											">=",
											"Greater or equal to",
											sap.firefly.FormulaOperator.GROUP_COMPARE,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.IF = sap.firefly.FormulaOperator
									.create(
											"IF",
											"if-then-else",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.IN = sap.firefly.FormulaOperator
									.create(
											"IN",
											"Contained in list",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.ISNULL = sap.firefly.FormulaOperator
									.create(
											"ISNULL",
											"Checks for NULL value",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.MOD_MDS = sap.firefly.FormulaOperator
									.create(
											"%",
											"Modulo",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.CELL_VALUE = sap.firefly.FormulaOperator
									.create(
											"CELLVALUE",
											"Cell value lookup",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.DECFLOAT = sap.firefly.FormulaOperator
									.create(
											"DECFLOAT",
											"Conversion to decfloat",
											sap.firefly.FormulaOperator.GROUP_CONVERSION,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.DOUBLE = sap.firefly.FormulaOperator
									.create(
											"DOUBLE",
											"Conversion to double",
											sap.firefly.FormulaOperator.GROUP_CONVERSION,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.FLOAT = sap.firefly.FormulaOperator
									.create(
											"FLOAT",
											"Conversion to float",
											sap.firefly.FormulaOperator.GROUP_CONVERSION,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.HIERARCHYAGGREGATE = sap.firefly.FormulaOperator
									.create(
											"HIERARCHYAGGREGATE",
											"Member aggregation",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.INT = sap.firefly.FormulaOperator
									.create(
											"INT",
											"Conversion to int",
											sap.firefly.FormulaOperator.GROUP_CONVERSION,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.MEMBERINDEX = sap.firefly.FormulaOperator
									.create(
											"MEMBERINDEX",
											"Member index",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.TRUNCATE = sap.firefly.FormulaOperator
									.create(
											"TRUNCATE",
											"Truncate",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._FALSE);
							sap.firefly.FormulaOperator.MOD_BW = sap.firefly.FormulaOperator
									.create(
											"MOD",
											"Modulo",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.NODIM = sap.firefly.FormulaOperator
									.create(
											"NODIM",
											"Values Without Dimensions / Units",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.SIN = sap.firefly.FormulaOperator
									.create(
											"SIN",
											"Sine",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.COS = sap.firefly.FormulaOperator
									.create(
											"COS",
											"Cosine",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.TAN = sap.firefly.FormulaOperator
									.create(
											"TAN",
											"Tangent",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.ASIN = sap.firefly.FormulaOperator
									.create(
											"ASIN",
											"Inverse Sine",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.ACOS = sap.firefly.FormulaOperator
									.create(
											"ACOS",
											"Inverse Cosine",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.ATAN = sap.firefly.FormulaOperator
									.create(
											"ATAN",
											"Inverse Tangent",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.SINH = sap.firefly.FormulaOperator
									.create(
											"SINH",
											"Hyperbolic Sine",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.COSH = sap.firefly.FormulaOperator
									.create(
											"COSH",
											"Hyperbolic Cosine",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.TANH = sap.firefly.FormulaOperator
									.create(
											"TANH",
											"Hyperbolic Tangent",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.DIV = sap.firefly.FormulaOperator
									.create(
											"DIV",
											"Division",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.FRAC = sap.firefly.FormulaOperator
									.create(
											"FRAC",
											"Keep only decimal places",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.MAX0 = sap.firefly.FormulaOperator
									.create(
											"MAX0",
											"Maximum or 0 if negativ",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.MIN0 = sap.firefly.FormulaOperator
									.create(
											"MIN1",
											"Minimum or 0 if negativ",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.TRUNC = sap.firefly.FormulaOperator
									.create(
											"TRUNC",
											"Truncate decimal places",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.SIGN = sap.firefly.FormulaOperator
									.create(
											"SIGN",
											"Int representation of sign",
											sap.firefly.FormulaOperator.GROUP_MATH,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.DATE = sap.firefly.FormulaOperator
									.create(
											"DATE",
											"Conversion to date",
											sap.firefly.FormulaOperator.GROUP_CONVERSION,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.TIME = sap.firefly.FormulaOperator
									.create(
											"TIME",
											"Conversion to time",
											sap.firefly.FormulaOperator.GROUP_CONVERSION,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.NOERR = sap.firefly.FormulaOperator
									.create(
											"NOERR",
											"Equal to 0 for undefined calculations, otherwise x",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.NDIV0 = sap.firefly.FormulaOperator
									.create(
											"NDIV0",
											"Equals 0 when divided by 0, otherwise x",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.PERCENT = sap.firefly.FormulaOperator
									.create(
											"%",
											"Percentage Deviation",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.PERCENT_A = sap.firefly.FormulaOperator
									.create(
											"%_A",
											"Percentage Amount with Signed Base Value",
											sap.firefly.FormulaOperator.GROUP_MISCELLANEOUS,
											sap.firefly.TriStateBool._TRUE);
							sap.firefly.FormulaOperator.XOR = sap.firefly.FormulaOperator
									.create(
											"XOR",
											"Exlusive binary OR",
											sap.firefly.FormulaOperator.GROUP_BINARY,
											sap.firefly.TriStateBool._TRUE);
						},
						create : function(name, description, group,
								supportedOnlyByBw) {
							var newOperator = new sap.firefly.FormulaOperator();
							newOperator.setName(name);
							newOperator.m_group = group;
							newOperator.m_description = description;
							if (supportedOnlyByBw === sap.firefly.TriStateBool._TRUE) {
								sap.firefly.FormulaOperator.BW_OPERATOR
										.add(newOperator);
							} else {
								if (supportedOnlyByBw === sap.firefly.TriStateBool._FALSE) {
									sap.firefly.FormulaOperator.MDS_OPERATOR
											.add(newOperator);
								} else {
									sap.firefly.FormulaOperator.BW_OPERATOR
											.add(newOperator);
									sap.firefly.FormulaOperator.MDS_OPERATOR
											.add(newOperator);
								}
							}
							return newOperator;
						},
						getSupportedFormulaOperator : function(systemType) {
							if (systemType.isTypeOf(sap.firefly.SystemType.BW)) {
								return sap.firefly.FormulaOperator.BW_OPERATOR;
							} else {
								if (systemType
										.isTypeOf(sap.firefly.SystemType.HANA)) {
									return sap.firefly.FormulaOperator.MDS_OPERATOR;
								} else {
									return sap.firefly.XList.create();
								}
							}
						}
					},
					m_group : null,
					m_description : null,
					getGroup : function() {
						return this.m_group;
					},
					getDescription : function() {
						return this.m_description;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.MemberType",
				sap.firefly.OlapComponentType,
				{
					$statics : {
						ABSTRACT_MEMBER : null,
						MEMBER : null,
						SINGLE_MEMBER_EXIT : null,
						MEMBER_EXITS : null,
						LITERAL_MEMBER : null,
						MEASURE : null,
						BASIC_MEASURE : null,
						FORMULA : null,
						SERVER_BASED_FORMULA : null,
						RESTRICTED_MEASURE : null,
						HIERARCHY_NODE : null,
						RESULT : null,
						CONDITION_RESULT : null,
						CONDITION_OTHERS_RESULT : null,
						DRILL_PATH_ELEMENT : null,
						SELECT_VALUE : null,
						FIELD_VALUE : null,
						VALUE_HELP_ELEMENT : null,
						VALUE_HELP_NODE : null,
						VALUE_HELP_SPLITTER_NODE : null,
						VALUE_HELP_WINDOW_SPLITTER_NODE : null,
						VALUE_HELP_ROOT_NODE : null,
						VALUE_HELP_LEAF : null,
						TUPLE_ELEMENT : null,
						TUPLE_ELEMENT_AS_MEMBER : null,
						TUPLE_ELEMENT_AS_NODE : null,
						s_instances : null,
						_IS_NODE : true,
						_IS_LEAF : false,
						staticSetupMemberType : function() {
							sap.firefly.MemberType.ABSTRACT_MEMBER = sap.firefly.MemberType
									.createMemberType("AbstractMember", null,
											false,
											sap.firefly.MemberType._IS_LEAF,
											true, 3);
							sap.firefly.MemberType.MEMBER = sap.firefly.MemberType
									.createMemberType(
											"Member",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											false,
											sap.firefly.MemberType._IS_LEAF,
											true, 3);
							sap.firefly.MemberType.SINGLE_MEMBER_EXIT = sap.firefly.MemberType
									.createMemberType(
											"SingleMemberExit",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											false,
											sap.firefly.MemberType._IS_LEAF,
											true, 1);
							sap.firefly.MemberType.MEMBER_EXITS = sap.firefly.MemberType
									.createMemberType(
											"MembersExit",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											false,
											sap.firefly.MemberType._IS_LEAF,
											false, 2);
							sap.firefly.MemberType.LITERAL_MEMBER = sap.firefly.MemberType
									.createMemberType(
											"LiteralMember",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											false,
											sap.firefly.MemberType._IS_LEAF,
											false, 5);
							sap.firefly.MemberType.MEASURE = sap.firefly.MemberType
									.createMemberType(
											"Measure",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											false,
											sap.firefly.MemberType._IS_LEAF,
											true, 4);
							sap.firefly.MemberType.BASIC_MEASURE = sap.firefly.MemberType
									.createMemberType("BasicMeasure",
											sap.firefly.MemberType.MEASURE,
											false,
											sap.firefly.MemberType._IS_LEAF,
											true, 4);
							sap.firefly.MemberType.FORMULA = sap.firefly.MemberType
									.createMemberType("FormulaMember",
											sap.firefly.MemberType.MEASURE,
											false,
											sap.firefly.MemberType._IS_LEAF,
											true, 4);
							sap.firefly.MemberType.SERVER_BASED_FORMULA = sap.firefly.MemberType
									.createMemberType(
											"ServerBasedFormula",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											false,
											sap.firefly.MemberType._IS_LEAF,
											true, 4);
							sap.firefly.MemberType.RESTRICTED_MEASURE = sap.firefly.MemberType
									.createMemberType("RestrictedMeasure",
											sap.firefly.MemberType.MEASURE,
											false,
											sap.firefly.MemberType._IS_LEAF,
											true, 4);
							sap.firefly.MemberType.HIERARCHY_NODE = sap.firefly.MemberType
									.createMemberType(
											"HierarchyNode",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											false,
											sap.firefly.MemberType._IS_NODE,
											false, 6);
							sap.firefly.MemberType.RESULT = sap.firefly.MemberType
									.createMemberType(
											"ResultMember",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											true,
											sap.firefly.MemberType._IS_LEAF,
											false, 12);
							sap.firefly.MemberType.CONDITION_RESULT = sap.firefly.MemberType
									.createMemberType("ConditionResult",
											sap.firefly.MemberType.RESULT,
											true,
											sap.firefly.MemberType._IS_LEAF,
											false, 10);
							sap.firefly.MemberType.CONDITION_OTHERS_RESULT = sap.firefly.MemberType
									.createMemberType("ConditionOthersResult",
											sap.firefly.MemberType.RESULT,
											true,
											sap.firefly.MemberType._IS_LEAF,
											false, 11);
							sap.firefly.MemberType.DRILL_PATH_ELEMENT = sap.firefly.MemberType
									.createMemberType(
											"DrillPathElement",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											false,
											sap.firefly.MemberType._IS_LEAF,
											true, 0);
							sap.firefly.MemberType.SELECT_VALUE = sap.firefly.MemberType
									.createMemberType(
											"SelectValue",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											false,
											sap.firefly.MemberType._IS_LEAF,
											false, 0);
							sap.firefly.MemberType.FIELD_VALUE = sap.firefly.MemberType
									.createMemberType("FieldValue",
											sap.firefly.MemberType.FIELD_VALUE,
											false,
											sap.firefly.MemberType._IS_LEAF,
											false, 0);
							sap.firefly.MemberType.VALUE_HELP_ELEMENT = sap.firefly.MemberType
									.createMemberType(
											"ValueHelpElement",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											false,
											sap.firefly.MemberType._IS_NODE,
											true, 0);
							sap.firefly.MemberType.VALUE_HELP_NODE = sap.firefly.MemberType
									.createMemberType(
											"ValueHelpNode",
											sap.firefly.MemberType.VALUE_HELP_ELEMENT,
											false,
											sap.firefly.MemberType._IS_NODE,
											true, 0);
							sap.firefly.MemberType.VALUE_HELP_SPLITTER_NODE = sap.firefly.MemberType
									.createMemberType(
											"ValueHelpSplitterNode",
											sap.firefly.MemberType.VALUE_HELP_NODE,
											false,
											sap.firefly.MemberType._IS_NODE,
											true, 0);
							sap.firefly.MemberType.VALUE_HELP_WINDOW_SPLITTER_NODE = sap.firefly.MemberType
									.createMemberType(
											"ValueHelpWindowSplitterNode",
											sap.firefly.MemberType.VALUE_HELP_SPLITTER_NODE,
											false,
											sap.firefly.MemberType._IS_NODE,
											true, 0);
							sap.firefly.MemberType.VALUE_HELP_ROOT_NODE = sap.firefly.MemberType
									.createMemberType(
											"ValueHelpRootNode",
											sap.firefly.MemberType.VALUE_HELP_NODE,
											false,
											sap.firefly.MemberType._IS_NODE,
											true, 0);
							sap.firefly.MemberType.VALUE_HELP_LEAF = sap.firefly.MemberType
									.createMemberType(
											"ValueHelpLeaf",
											sap.firefly.MemberType.VALUE_HELP_ELEMENT,
											false,
											sap.firefly.MemberType._IS_LEAF,
											true, 0);
							sap.firefly.MemberType.TUPLE_ELEMENT = sap.firefly.MemberType
									.createMemberType(
											"TupleElement",
											sap.firefly.MemberType.ABSTRACT_MEMBER,
											false,
											sap.firefly.MemberType._IS_LEAF,
											true, 0);
							sap.firefly.MemberType.TUPLE_ELEMENT_AS_MEMBER = sap.firefly.MemberType
									.createMemberType(
											"TupleElementAsMember",
											sap.firefly.MemberType.TUPLE_ELEMENT,
											true,
											sap.firefly.MemberType._IS_LEAF,
											true, 0);
							sap.firefly.MemberType.TUPLE_ELEMENT_AS_NODE = sap.firefly.MemberType
									.createMemberType(
											"TupleElementAsNode",
											sap.firefly.MemberType.TUPLE_ELEMENT,
											true,
											sap.firefly.MemberType._IS_NODE,
											true, 0);
						},
						createMemberType : function(constant, parentType,
								result, node, singleMember, sortOrder) {
							var mt = new sap.firefly.MemberType();
							if (parentType === null) {
								mt
										.setup(
												constant,
												sap.firefly.OlapComponentType.DIMENSION_CONTEXT);
							} else {
								mt.setup(constant, parentType);
							}
							mt.m_isNode = node;
							mt.m_isResult = result;
							mt.m_sortOrder = sortOrder;
							mt.m_singleMember = singleMember;
							if (sap.firefly.MemberType.s_instances === null) {
								sap.firefly.MemberType.s_instances = sap.firefly.XHashMapByString
										.create();
							}
							sap.firefly.MemberType.s_instances
									.put(constant, mt);
							return mt;
						},
						get : function(name) {
							return sap.firefly.MemberType.s_instances
									.getByKey(name);
						}
					},
					m_isNode : false,
					m_singleMember : false,
					m_isResult : false,
					m_sortOrder : 0,
					isNode : function() {
						return this.m_isNode;
					},
					isLeaf : function() {
						return !this.m_isNode;
					},
					isSingleMember : function() {
						return this.m_singleMember;
					},
					isResult : function() {
						return this.m_isResult;
					},
					isArtificial : function() {
						return !(this.m_isNode || ((this === sap.firefly.MemberType.MEMBER) || (this === sap.firefly.MemberType.SERVER_BASED_FORMULA)));
					},
					getSortOrder : function() {
						return this.m_sortOrder;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.OlapProperty",
				sap.firefly.OlapComponentType,
				{
					$statics : {
						NAME : null,
						TEXT : null,
						DATASOURCE : null,
						SIGN_PRESENTATION : null,
						RESULT_ALIGNMENT : null,
						LOWER_LEVEL_NODE_ALIGNMENT : null,
						staticSetup : function() {
							sap.firefly.OlapProperty.NAME = sap.firefly.OlapProperty
									.create("Name");
							sap.firefly.OlapProperty.TEXT = sap.firefly.OlapProperty
									.create("Text");
							sap.firefly.OlapProperty.DATASOURCE = sap.firefly.OlapProperty
									.create("Datasource");
							sap.firefly.OlapProperty.SIGN_PRESENTATION = sap.firefly.OlapProperty
									.create("SignPresentation");
							sap.firefly.OlapProperty.RESULT_ALIGNMENT = sap.firefly.OlapProperty
									.create("ResultAlignment");
							sap.firefly.OlapProperty.LOWER_LEVEL_NODE_ALIGNMENT = sap.firefly.OlapProperty
									.create("LowerLevelNodeAlignment");
						},
						create : function(name) {
							var newConstant = new sap.firefly.OlapProperty();
							newConstant.setup(name,
									sap.firefly.OlapComponentType.PROPERTY);
							return newConstant;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.SpatialComparisonOperator",
				sap.firefly.ComparisonOperator,
				{
					$statics : {
						CONTAINS : null,
						INTERSECTS : null,
						INTERSECTS_RECT : null,
						COVERS : null,
						CROSSES : null,
						DISJOINT : null,
						OVERLAPS : null,
						TOUCHES : null,
						WITHIN : null,
						WITHIN_DISTANCE : null,
						SPATIAL : null,
						staticSetupSpatialComparisonOps : function() {
							sap.firefly.SpatialComparisonOperator.SPATIAL = sap.firefly.SpatialComparisonOperator
									.createSpatialComparison("SPATIAL",
											"SPATIAL", 0,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.SpatialComparisonOperator.CONTAINS = sap.firefly.SpatialComparisonOperator
									.createSpatialComparison("CONTAINS",
											"contains", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.SpatialComparisonOperator.INTERSECTS = sap.firefly.SpatialComparisonOperator
									.createSpatialComparison("INTERSECTS",
											"intersects", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.SpatialComparisonOperator.INTERSECTS_RECT = sap.firefly.SpatialComparisonOperator
									.createSpatialComparison("INTERSECTS_RECT",
											"intersectsRect", 2,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.SpatialComparisonOperator.COVERS = sap.firefly.SpatialComparisonOperator
									.createSpatialComparison("COVERS",
											"covers", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.SpatialComparisonOperator.CROSSES = sap.firefly.SpatialComparisonOperator
									.createSpatialComparison("CROSSES",
											"crosses", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.SpatialComparisonOperator.DISJOINT = sap.firefly.SpatialComparisonOperator
									.createSpatialComparison("DISJOINT",
											"disjoint", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.SpatialComparisonOperator.OVERLAPS = sap.firefly.SpatialComparisonOperator
									.createSpatialComparison("OVERLAPS",
											"overlaps", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.SpatialComparisonOperator.TOUCHES = sap.firefly.SpatialComparisonOperator
									.createSpatialComparison("TOUCHES",
											"touches", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.SpatialComparisonOperator.WITHIN = sap.firefly.SpatialComparisonOperator
									.createSpatialComparison("WITHIN",
											"within", 1,
											sap.firefly.Operator.GRAVITY_3);
							sap.firefly.SpatialComparisonOperator.WITHIN_DISTANCE = sap.firefly.SpatialComparisonOperator
									.createSpatialComparison("WITHIN_DISTANCE",
											"withinDistance", 3,
											sap.firefly.Operator.GRAVITY_3);
						},
						createSpatialComparison : function(name, displayString,
								numberOfParameters, gravity) {
							var newConstant = new sap.firefly.SpatialComparisonOperator();
							newConstant.setupOperator(
									sap.firefly.Operator._COMPARISON, name,
									displayString, numberOfParameters, gravity);
							newConstant
									.setParent(sap.firefly.SpatialComparisonOperator.SPATIAL);
							return newConstant;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.VariableType",
				sap.firefly.OlapComponentType,
				{
					$statics : {
						SIMPLE_TYPE_VARIABLE : null,
						TEXT_VARIABLE : null,
						FORMULA_VARIABLE : null,
						DIMENSION_MEMBER_VARIABLE : null,
						HIERARCHY_NODE_VARIABLE : null,
						HIERARCHY_NAME_VARIABLE : null,
						OPTION_LIST_VARIABLE : null,
						HIERARCHY_VARIABLE : null,
						ANY_VARIABLE : null,
						staticSetup : function() {
							sap.firefly.VariableType.ANY_VARIABLE = sap.firefly.VariableType
									.create("AnyVariable", null);
							sap.firefly.VariableType.SIMPLE_TYPE_VARIABLE = sap.firefly.VariableType
									.create(
											"SimpleTypeVariable",
											sap.firefly.VariableType.ANY_VARIABLE);
							sap.firefly.VariableType.TEXT_VARIABLE = sap.firefly.VariableType
									.create(
											"TextVariable",
											sap.firefly.VariableType.SIMPLE_TYPE_VARIABLE);
							sap.firefly.VariableType.FORMULA_VARIABLE = sap.firefly.VariableType
									.create(
											"FormulaVariable",
											sap.firefly.VariableType.SIMPLE_TYPE_VARIABLE);
							sap.firefly.VariableType.DIMENSION_MEMBER_VARIABLE = sap.firefly.VariableType
									.create(
											"DimensionMemberVariable",
											sap.firefly.VariableType.ANY_VARIABLE);
							sap.firefly.VariableType.HIERARCHY_NODE_VARIABLE = sap.firefly.VariableType
									.create(
											"HierarchyNodeVariable",
											sap.firefly.VariableType.DIMENSION_MEMBER_VARIABLE);
							sap.firefly.VariableType.HIERARCHY_NAME_VARIABLE = sap.firefly.VariableType
									.create(
											"HierarchyNameVariable",
											sap.firefly.VariableType.DIMENSION_MEMBER_VARIABLE);
							sap.firefly.VariableType.OPTION_LIST_VARIABLE = sap.firefly.VariableType
									.create(
											"OptionListVariable",
											sap.firefly.VariableType.ANY_VARIABLE);
							sap.firefly.VariableType.HIERARCHY_VARIABLE = sap.firefly.VariableType
									.create(
											"HierarchyVariable",
											sap.firefly.VariableType.OPTION_LIST_VARIABLE);
						},
						create : function(name, parentType) {
							var object = new sap.firefly.VariableType();
							object.setName(name);
							if (parentType !== null) {
								object.setParent(parentType);
							} else {
								object
										.setParent(sap.firefly.OlapComponentType.VARIABLE_CONTEXT);
							}
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QueryServiceConfig",
				sap.firefly.DfServiceConfig,
				{
					$statics : {
						CLAZZ : null,
						staticSetup : function() {
							sap.firefly.QueryServiceConfig.CLAZZ = sap.firefly.XClass
									.create(sap.firefly.QueryServiceConfig);
						},
						create : function(application) {
							var object = new sap.firefly.QueryServiceConfig();
							object.setupConfig(application);
							return object;
						},
						createWithDataSourceName : function(application,
								systemName, datasource) {
							var object = new sap.firefly.QueryServiceConfig();
							object.setupConfig(application);
							object.setSystemName(systemName);
							object.setDataSourceByName(datasource);
							return object;
						},
						createWithDataSource : function(application,
								systemName, datasource) {
							var object = new sap.firefly.QueryServiceConfig();
							object.setupConfig(application);
							object.setSystemName(systemName);
							object.setDataSource(datasource);
							return object;
						},
						createWithBlendingDefinition : function(application,
								blendingDefinition) {
							var object;
							var systemName;
							if (blendingDefinition.getSources().get(0)
									.getQueryModel().supportsCubeBlending() === false) {
								throw sap.firefly.XException
										.createRuntimeException("The backend is not capable of blending!");
							}
							sap.firefly.BlendingValidation
									.assertBlendingDefinitionIsValid(blendingDefinition);
							object = new sap.firefly.QueryServiceConfig();
							object.setupConfig(application);
							systemName = blendingDefinition.getSources().get(0)
									.getQueryModel().getQueryManager()
									.getSystemDescription().getName();
							object.setSystemName(systemName);
							object.setBlendingDefinition(blendingDefinition);
							return object;
						}
					},
					m_providerType : null,
					m_openForEdit : false,
					m_datasource : null,
					m_instanceId : null,
					m_definitionType : null,
					m_definitionContentJson : null,
					m_definitionContentNative : null,
					m_definitionContentStructure : null,
					m_serverCustomization : null,
					m_mode : null,
					m_blendingDefinition : null,
					m_experimentalFeatues : null,
					m_isLoadingDefaultQuery : false,
					m_request : null,
					m_stateChangedListener : null,
					setupConfig : function(application) {
						sap.firefly.QueryServiceConfig.$superclass.setupConfig
								.call(this, application);
						this.m_openForEdit = false;
						this.m_serverCustomization = sap.firefly.XHashSetOfString
								.create();
						this.m_providerType = sap.firefly.ProviderType.ANALYTICS;
						this.m_mode = sap.firefly.QueryManagerMode.DEFAULT;
						this.setInstanceId(application.createNextInstanceId());
						this.m_isLoadingDefaultQuery = true;
						this.m_stateChangedListener = sap.firefly.XSimpleMap
								.create();
					},
					getComponentType : function() {
						return this.getOlapComponentType();
					},
					getOlapComponentType : function() {
						return sap.firefly.OlapComponentType.OLAP_DATA_PROVIDER;
					},
					clone : function() {
						var cloneObject = sap.firefly.QueryServiceConfig
								.create(this.getApplication());
						var dataSource = this.getDataSource();
						var myTagging;
						var cloneTagging;
						var iterator;
						var key;
						var value;
						if (dataSource !== null) {
							cloneObject.setDataSource(dataSource
									.cloneOlapComponent(null, null));
						}
						cloneObject.setProviderType(this.getProviderType());
						cloneObject.setIsOpenForEdit(this.isOpenForEdit());
						myTagging = this.getTagging();
						cloneTagging = cloneObject.getTagging();
						iterator = myTagging.getKeysAsIteratorOfString();
						while (iterator.hasNext()) {
							key = iterator.next();
							value = myTagging.getByKey(key);
							cloneTagging.put(key, value);
						}
						cloneObject.activateExperimentalFeatureSet(this
								.getExperimentalFeatureSet());
						cloneObject.setMode(this.getMode());
						return cloneObject;
					},
					releaseObject : function() {
						this.m_serverCustomization = sap.firefly.XObject
								.releaseIfNotNull(this.m_serverCustomization);
						this.m_providerType = null;
						this.m_mode = null;
						this.m_blendingDefinition = null;
						this.m_definitionContentStructure = null;
						this.m_definitionContentNative = null;
						this.m_definitionType = null;
						this.m_datasource = null;
						this.m_experimentalFeatues = sap.firefly.XObject
								.releaseIfNotNull(this.m_experimentalFeatues);
						sap.firefly.QueryServiceConfig.$superclass.releaseObject
								.call(this);
					},
					getServiceTypeInfo : function() {
						return sap.firefly.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER;
					},
					processQueryManagerCreation : function(syncType, listener,
							customIdentifier) {
						return this.processSyncAction(syncType, listener,
								customIdentifier);
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onQueryManagerCreated(extResult, data,
								customIdentifier);
					},
					setDataFromService : function(service) {
						this.setData(service);
					},
					setProviderType : function(type) {
						this.m_providerType = type;
					},
					getProviderType : function() {
						return this.m_providerType;
					},
					getDataSource : function() {
						return this.m_datasource;
					},
					getDataSourceBase : function() {
						return this.getDataSource();
					},
					setDataSource : function(datasource) {
						this.m_datasource = datasource;
					},
					setDataSourceByName : function(name) {
						var identifierBase = sap.firefly.QFactory2
								.newDataSourceExt(this);
						identifierBase.setFullQualifiedName(name);
						this.m_datasource = identifierBase;
						return identifierBase;
					},
					isOpenForEdit : function() {
						return this.m_openForEdit;
					},
					setIsOpenForEdit : function(openForEdit) {
						this.m_openForEdit = openForEdit;
					},
					setDefinitionByJson : function(type, definitionContent) {
						this.m_definitionType = type;
						this.m_definitionContentJson = definitionContent;
						this.m_definitionContentNative = null;
						this.m_definitionContentStructure = null;
					},
					setDefinitionByNative : function(type, definitionContent) {
						this.m_definitionType = type;
						this.m_definitionContentNative = definitionContent;
						this.m_definitionContentJson = null;
						this.m_definitionContentStructure = null;
					},
					setDefinitionByStructure : function(type, definitionContent) {
						this.m_definitionType = type;
						this.m_definitionContentStructure = definitionContent;
						this.m_definitionContentJson = null;
						this.m_definitionContentNative = null;
					},
					getDefinitionType : function() {
						return this.m_definitionType;
					},
					getDefinitionAsJson : function() {
						return this.m_definitionContentJson;
					},
					getDefinitionAsNative : function() {
						return this.m_definitionContentNative;
					},
					getDefinitionAsStructure : function() {
						var parser;
						var rootElement;
						if (this.m_definitionContentStructure === null) {
							if (this.m_definitionContentJson !== null) {
								parser = sap.firefly.JsonParserFactory
										.newInstance();
								rootElement = parser
										.parse(this.m_definitionContentJson);
								if (rootElement !== null) {
									this.m_definitionContentStructure = rootElement;
								}
							}
						}
						return this.m_definitionContentStructure;
					},
					setResultSetAccessMode : function(accessMode) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getResultSetAccessMode : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getServerCustomizations : function() {
						return this.m_serverCustomization;
					},
					addServerCustomizations : function(name) {
						this.m_serverCustomization.put(name);
					},
					setInstanceId : function(instanceId) {
						this.m_instanceId = instanceId;
					},
					getInstanceId : function() {
						return this.m_instanceId;
					},
					setMode : function(mode) {
						if (mode !== null) {
							this.m_mode = mode;
						}
					},
					getMode : function() {
						return this.m_mode;
					},
					setBlendingDefinition : function(blendingDefinition) {
						this.m_blendingDefinition = blendingDefinition;
						this.setMode(sap.firefly.QueryManagerMode.BLENDING);
					},
					getBlendingDefinition : function() {
						return this.m_blendingDefinition;
					},
					parseDataSourceDefinition : function() {
						var parser;
						var element;
						var dataSource;
						var systemName;
						if (this.m_definitionType === sap.firefly.QModelFormat.INA_REPOSITORY) {
							if (this.m_definitionContentStructure === null) {
								parser = sap.firefly.JsonParserFactory
										.newInstance();
								element = parser
										.parse(this.m_definitionContentJson);
								this.addAllMessages(parser);
								if ((parser.hasErrors() === false)
										&& element.isStructure()) {
									this.m_definitionContentStructure = element;
									dataSource = sap.firefly.QFactory2
											.newDataSource();
									dataSource.setByJson(element);
									this.setDataSource(dataSource);
									systemName = dataSource.getSystemName();
									if (systemName !== null) {
										this.setSystemName(systemName);
									}
								}
							}
						}
					},
					getFieldAccessorSingle : function() {
						return null;
					},
					getQueryModel : function() {
						return null;
					},
					getModelCapabilities : function() {
						return null;
					},
					getVariableContainer : function() {
						return null;
					},
					getDimensionAccessor : function() {
						return null;
					},
					getDrillManager : function() {
						return null;
					},
					setLoadDefaultQuery : function(isLoadingDefaultQuery) {
						this.m_isLoadingDefaultQuery = isLoadingDefaultQuery;
					},
					isLoadingDefaultQuery : function() {
						return this.m_isLoadingDefaultQuery;
					},
					activateExperimentalFeature : function(experimentalFeature) {
						var maxXVersion = experimentalFeature.getMaxXVersion();
						var message;
						var dependentCapabilites;
						var dependentCapabilitiesList;
						var i;
						if ((maxXVersion > -1)
								&& (maxXVersion < this.getApplication()
										.getVersion())) {
							message = sap.firefly.XStringBuffer.create();
							message
									.append("The capability '")
									.append(experimentalFeature.getName())
									.append(
											"' is already released in the currently active XVersion!");
							message.append("\nActive XVersion: ").appendInt(
									this.getApplication().getVersion());
							message.append("\nWas released in XVersion: ")
									.appendInt(
											experimentalFeature
													.getMaxXVersion());
							throw sap.firefly.XException
									.createIllegalArgumentException(message
											.toString());
						}
						if (this.m_experimentalFeatues === null) {
							this.m_experimentalFeatues = sap.firefly.XSetOfNameObject
									.create();
						}
						this.m_experimentalFeatues.put(experimentalFeature);
						dependentCapabilites = sap.firefly.InactiveCapabilities
								.addDependentCapabilities(experimentalFeature,
										null);
						if (sap.firefly.XCollectionUtils
								.hasElements(dependentCapabilites)) {
							dependentCapabilitiesList = dependentCapabilites
									.getValuesAsReadOnlyList();
							for (i = 0; i < dependentCapabilitiesList.size(); i++) {
								this
										.activateExperimentalFeature(dependentCapabilitiesList
												.get(i));
							}
						}
					},
					activateExperimentalFeatureSet : function(
							experimentalFeatures) {
						var iterator;
						if (experimentalFeatures !== null) {
							iterator = experimentalFeatures.getIterator();
							while (iterator.hasNext()) {
								this.activateExperimentalFeature(iterator
										.next());
							}
						}
					},
					getExperimentalFeatureSet : function() {
						return this.m_experimentalFeatues;
					},
					activateExperimentalFeatures : function(
							experimentalFeatures) {
						var capabilityByName;
						var listOfExperimentalFeatures;
						var size;
						var i;
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(experimentalFeatures)) {
							if (sap.firefly.XString.containsString(
									experimentalFeatures, ",")) {
								listOfExperimentalFeatures = sap.firefly.XStringTokenizer
										.splitString(experimentalFeatures, ",");
								size = listOfExperimentalFeatures.size();
								for (i = 0; i < size; i++) {
									capabilityByName = sap.firefly.InactiveCapabilities
											.getCapabilityByName(listOfExperimentalFeatures
													.get(i));
									if (capabilityByName === null) {
										throw sap.firefly.XException
												.createIllegalArgumentException(sap.firefly.XStringUtils
														.concatenate3(
																"No experimental capability with the name '",
																listOfExperimentalFeatures
																		.get(i),
																"' was found!"));
									}
									this
											.activateExperimentalFeature(capabilityByName);
								}
							} else {
								capabilityByName = sap.firefly.InactiveCapabilities
										.getCapabilityByName(experimentalFeatures);
								if (capabilityByName === null) {
									throw sap.firefly.XException
											.createIllegalArgumentException(sap.firefly.XStringUtils
													.concatenate3(
															"No experimental capability with the name '",
															experimentalFeatures,
															"' was found!"));
								}
								this
										.activateExperimentalFeature(capabilityByName);
							}
						}
					},
					getExperimentalFeatures : function() {
						var buffer;
						var keysAsIteratorOfString;
						var firstEntry;
						if (this.m_experimentalFeatues === null) {
							return null;
						}
						buffer = sap.firefly.XStringBuffer.create();
						keysAsIteratorOfString = this.m_experimentalFeatues
								.getKeysAsIteratorOfString();
						firstEntry = true;
						while (keysAsIteratorOfString.hasNext()) {
							if (firstEntry === false) {
								buffer.append(",");
							}
							buffer.append(keysAsIteratorOfString.next());
							firstEntry = false;
						}
						return buffer.toString();
					},
					activateProductiveFeatures : function(productiveFeatures) {
						this.activateExperimentalFeatures(productiveFeatures);
					},
					setDataRequest : function(request) {
						this.m_request = request;
					},
					setDataRequestAsString : function(request) {
						var element = sap.firefly.JsonParserFactory
								.createFromString(request);
						if ((element !== null) && element.isStructure()) {
							this.m_request = element;
						}
					},
					getDataRequest : function() {
						return this.m_request;
					},
					getDataRequestAsString : function() {
						if (this.m_request === null) {
							return null;
						}
						return this.m_request.toString();
					},
					getQueryManager : function() {
						return this.getData();
					},
					registerChangedListener : function(listener,
							customIdentifier) {
						this.m_stateChangedListener.put(listener,
								sap.firefly.XPair.create(listener,
										customIdentifier));
						return null;
					},
					unregisterChangedListener : function(listener) {
						this.m_stateChangedListener.remove(listener);
						return null;
					},
					beforeListenerCall : function() {
						var values = this.m_stateChangedListener
								.getValuesAsReadOnlyList();
						var i;
						var pair;
						for (i = 0; i < values.size(); i++) {
							pair = values.get(i);
							this
									.attachListener(
											pair.getFirstObject(),
											sap.firefly.ListenerType.OLAP_COMPONENT_CHANGED,
											pair.getSecondObject());
						}
					},
					callTypedListener : function(extResult, type, listener,
							data, customIdentifier) {
						if (type === sap.firefly.ListenerType.OLAP_COMPONENT_CHANGED) {
							(listener).onModelComponentChanged(this,
									customIdentifier);
						} else {
							sap.firefly.QueryServiceConfig.$superclass.callTypedListener
									.call(this, extResult, type, listener,
											data, customIdentifier);
						}
					},
					getOlapEnv : function() {
						return this.getApplication().getOlapEnvironment();
					},
					cloneOlapComponent : function(context, parent) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					queueEventing : function() {
					},
					stopEventing : function() {
					},
					isEventingStopped : function() {
						return false;
					},
					resumeEventing : function() {
					}
				});
$Firefly
		.createClass(
				"sap.firefly.OlapApiModule",
				sap.firefly.DfModule,
				{
					$statics : {
						AGGREGATION_LEVEL_FACTORY : "AGGREGATION_LEVEL_FACTORY",
						XS_QUERY_CONSUMER : "QUERY_CONSUMER",
						SERVICE_TYPE_QUERY_CONSUMER : null,
						XS_OLAP_CATALOG : "OLAP_CATALOG",
						SERVICE_TYPE_OLAP_CATALOG : null,
						XS_PLANNING_CATALOG : "PLANNING_CATALOG",
						SERVICE_TYPE_PLANNING_CATALOG : null,
						XS_HIERARCHY_CATALOG : "HIERARCHY_CATALOG",
						SERVICE_TYPE_HIERARCHY_CATALOG : null,
						XS_PLANNING_MODEL_CATALOG : "PLANNING_MODEL_CATALOG",
						SERVICE_TYPE_PLANNING_MODEL_CATALOG : null,
						XS_PLANNING : "PLANNING",
						SERVICE_TYPE_PLANNING : null,
						s_module : null,
						getInstance : function() {
							return sap.firefly.OlapApiModule
									.initVersion(sap.firefly.XVersion.API_DEFAULT);
						},
						initVersion : function(version) {
							var registrationService;
							if (sap.firefly.OlapApiModule.s_module === null) {
								if (sap.firefly.RuntimeModule
										.initVersion(version) === null) {
									throw sap.firefly.XException
											.createInitializationException();
								}
								sap.firefly.OlapApiModule.s_module = new sap.firefly.OlapApiModule();
								registrationService = sap.firefly.RegistrationService
										.getInstance();
								sap.firefly.OlapComponentType
										.staticSetupOlapType();
								sap.firefly.Operator.staticSetup();
								sap.firefly.FormulaOperator.staticSetup();
								sap.firefly.OlapProperty.staticSetup();
								sap.firefly.AlertCategory.staticSetup();
								sap.firefly.AlertLevel.staticSetup();
								sap.firefly.AxisType.staticSetup();
								sap.firefly.ClusterAlgorithm.staticSetup();
								sap.firefly.JoinType.staticSetup();
								sap.firefly.ZeroSuppressionType.staticSetup();
								sap.firefly.DrillState.staticSetup();
								sap.firefly.ResultSetType.staticSetup();
								sap.firefly.DimensionType
										.staticSetupDimensionType();
								sap.firefly.ExceptionSetting.staticSetup();
								sap.firefly.ExecutionEngine.staticSetup();
								sap.firefly.PresentationType
										.staticSetupPresentation();
								sap.firefly.PresentationSelect.staticSetup();
								sap.firefly.InfoObjectType
										.staticSetupInfoObject();
								sap.firefly.VisibilityType
										.staticSetupVisibility();
								sap.firefly.InactiveCapabilities.staticSetup();
								sap.firefly.LocalityType.staticSetupLocality();
								sap.firefly.UsageShapeType
										.staticSetupUsageShapey();
								sap.firefly.HierarchyLevelType.staticSetup();
								sap.firefly.CurrentMemberFunction.staticSetup();
								sap.firefly.AggregationType.staticSetup();
								sap.firefly.ActionChoice.staticSetup();
								sap.firefly.TextTransformationType
										.staticSetup();
								sap.firefly.QExceptionEvalType.staticSetup();
								sap.firefly.QExceptionHeaderSettings
										.staticSetup();
								sap.firefly.MemberType.staticSetupMemberType();
								sap.firefly.QContextType.staticSetup();
								sap.firefly.ProviderType.staticSetup();
								sap.firefly.MetaObjectType.staticSetup();
								sap.firefly.AssignOperator
										.staticSetupAssignOps();
								sap.firefly.ComparisonOperator
										.staticSetupComparisonOps();
								sap.firefly.SpatialComparisonOperator
										.staticSetupSpatialComparisonOps();
								sap.firefly.LogicalBoolOperator
										.staticSetupLogicalOps();
								sap.firefly.MathOperator.staticSetupMathOps();
								sap.firefly.SetSign.staticSetup();
								sap.firefly.ResultSetState.staticSetup();
								sap.firefly.SingleValueCalculation
										.staticSetup();
								sap.firefly.ResultCalculation.staticSetup();
								sap.firefly.QMemberReadMode.staticSetup();
								sap.firefly.FilterComponentType.staticSetup();
								sap.firefly.XSortDirection.staticSetup();
								sap.firefly.ValueException.staticSetup();
								sap.firefly.SortType.staticSetup();
								sap.firefly.ResultSetEncoding.staticSetup();
								sap.firefly.ReorderingCapability.staticSetup();
								sap.firefly.QModelLevel.staticSetup();
								sap.firefly.DrillOperationType.staticSetup();
								sap.firefly.QSetSignComparisonOperatorGroup
										.staticSetup();
								sap.firefly.FieldLayoutType.staticSetup();
								sap.firefly.Alignment.staticSetup();
								sap.firefly.DisaggregationMode.staticSetup();
								sap.firefly.QModelFormat.staticSetup();
								sap.firefly.QueryFilterUsage.staticSetup();
								sap.firefly.FieldUsageType.staticSetup();
								sap.firefly.QueryManagerMode.staticSetup();
								sap.firefly.QueryCloneMode.staticSetup();
								sap.firefly.VariableMode.staticSetup();
								sap.firefly.InputReadinessType.staticSetup();
								sap.firefly.DataEntryProcessingType
										.staticSetup();
								sap.firefly.FilterLayer.staticSetup();
								sap.firefly.FilterScopeVariables.staticSetup();
								sap.firefly.VariableType.staticSetup();
								sap.firefly.Scope.staticSetup();
								sap.firefly.VariableVariantType.staticSetup();
								sap.firefly.VariableProcessorState
										.staticSetup();
								sap.firefly.ResultVisibility.staticSetup();
								sap.firefly.ResultAlignment.staticSetup();
								sap.firefly.ResultStructureElement
										.staticSetup();
								sap.firefly.RestoreAction.staticSetup();
								sap.firefly.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER = sap.firefly.ServiceType
										.createType(sap.firefly.OlapApiModule.XS_QUERY_CONSUMER);
								sap.firefly.QueryServiceConfig.staticSetup();
								registrationService
										.addServiceConfig(
												sap.firefly.OlapApiModule.XS_QUERY_CONSUMER,
												sap.firefly.QueryServiceConfig.CLAZZ);
								sap.firefly.OlapApiModule.SERVICE_TYPE_OLAP_CATALOG = sap.firefly.ServiceType
										.createType(sap.firefly.OlapApiModule.XS_OLAP_CATALOG);
								sap.firefly.OlapCatalogServiceConfig
										.staticSetup();
								registrationService
										.addServiceConfig(
												sap.firefly.OlapApiModule.XS_OLAP_CATALOG,
												sap.firefly.OlapCatalogServiceConfig.CLAZZ);
								sap.firefly.OlapApiModule.SERVICE_TYPE_PLANNING = sap.firefly.ServiceType
										.createType(sap.firefly.OlapApiModule.XS_PLANNING);
								sap.firefly.PlanningOperationType.staticSetup();
								sap.firefly.PlanningSequenceStepType
										.staticSetup();
								sap.firefly.CellLockingType.staticSetup();
								sap.firefly.PlanningMode.staticSetup();
								sap.firefly.PlanningVersionRestrictionType
										.staticSetup();
								sap.firefly.PlanningVersionSettingsMode
										.staticSetup();
								sap.firefly.PlanningContextType.staticSetup();
								sap.firefly.PlanningCommandType.staticSetup();
								sap.firefly.PlanningContextCommandType
										.staticSetup();
								sap.firefly.PlanningModelRequestType
										.staticSetup();
								sap.firefly.DataAreaRequestType.staticSetup();
								sap.firefly.PlanningModelBehaviour
										.staticSetup();
								sap.firefly.RestoreBackupType.staticSetup();
								sap.firefly.PlanningActionType.staticSetup();
								sap.firefly.PlanningVersionState.staticSetup();
								sap.firefly.PlanningPrivilege.staticSetup();
								sap.firefly.PlanningPrivilegeState
										.staticSetup();
								sap.firefly.PlanningPersistenceType
										.staticSetup();
								sap.firefly.CloseModeType.staticSetup();
								sap.firefly.StartActionSequenceModeType
										.staticSetup();
								sap.firefly.OlapApiModule.SERVICE_TYPE_PLANNING_CATALOG = sap.firefly.ServiceType
										.createType(sap.firefly.OlapApiModule.XS_PLANNING_CATALOG);
								sap.firefly.OlapApiModule.SERVICE_TYPE_HIERARCHY_CATALOG = sap.firefly.ServiceType
										.createType(sap.firefly.OlapApiModule.XS_HIERARCHY_CATALOG);
								sap.firefly.OlapApiModule.SERVICE_TYPE_PLANNING_MODEL_CATALOG = sap.firefly.ServiceType
										.createType(sap.firefly.OlapApiModule.XS_PLANNING_MODEL_CATALOG);
								sap.firefly.BlendingLinkType.staticSetup();
								sap.firefly.BlendingMappingDefinitionType
										.staticSetup();
								sap.firefly.HierarchyType.staticSetup();
								sap.firefly.XCommandType.staticSetup();
								sap.firefly.XCommandFollowUpType.staticSetup();
								sap.firefly.ConditionDimensionEvaluationType
										.staticSetup();
								sap.firefly.ConditionComparisonOperator
										.staticSetupComparisonOps();
								sap.firefly.ReturnedDataSelection.staticSetup();
							}
							return sap.firefly.OlapApiModule.s_module;
						}
					}
				});
sap.firefly.OlapApiModule.getInstance();