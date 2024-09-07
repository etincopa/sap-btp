$Firefly
		.createClass(
				"sap.firefly.ApplicationFactory",
				sap.firefly.XObject,
				{
					$statics : {
						s_applicationFactory : null,
						s_applicationList : null,
						staticSetup : function() {
							sap.firefly.ApplicationFactory.s_applicationFactory = new sap.firefly.ApplicationFactory();
							sap.firefly.ApplicationFactory.s_applicationList = sap.firefly.XList
									.create();
						},
						createDefaultApplication : function() {
							return sap.firefly.ApplicationFactory
									.createApplicationExt(
											sap.firefly.SyncType.BLOCKING,
											null, null, null, 0, null, null,
											null, null, null).getData();
						},
						createDefaultApplicationWithVersion : function(version) {
							return sap.firefly.ApplicationFactory
									.createApplicationExt(
											sap.firefly.SyncType.BLOCKING,
											null, null, null, version, null,
											null, null, null, null).getData();
						},
						createApplicationWithUri : function(uri) {
							var sysUri = sap.firefly.XUri.createFromUri(uri);
							return sap.firefly.ApplicationFactory
									.createApplicationExt(
											sap.firefly.SyncType.BLOCKING,
											null, null, null, 0, null, null,
											sysUri, null, null).getData();
						},
						createApplicationWithUriAndVersion : function(uri,
								version) {
							var sysUri = sap.firefly.XUri.createFromUri(uri);
							return sap.firefly.ApplicationFactory
									.createApplicationExt(
											sap.firefly.SyncType.BLOCKING,
											null, null, null, version, null,
											null, sysUri, null, null).getData();
						},
						createApplication : function(session) {
							return sap.firefly.ApplicationFactory
									.createApplicationExt(
											sap.firefly.SyncType.BLOCKING,
											null, null, session, 0, null, null,
											null, null, null).getData();
						},
						createApplicationWithLandscapeBlocking : function(
								session, systemLandscapeUrl) {
							return sap.firefly.ApplicationFactory
									.createApplicationExt(
											sap.firefly.SyncType.BLOCKING,
											null, null, session, 0, null, null,
											null, systemLandscapeUrl, null);
						},
						createApplicationWithVersionAndLandscape : function(
								session, version, systemLandscapeUrl) {
							return sap.firefly.ApplicationFactory
									.createApplicationExt(
											sap.firefly.SyncType.BLOCKING,
											null, null, session, version, null,
											null, null, systemLandscapeUrl,
											null);
						},
						createApplicationWithLandscapeStringBlocking : function(
								session, systemLandscapeJson) {
							return sap.firefly.ApplicationFactory
									.createApplicationExt(
											sap.firefly.SyncType.BLOCKING,
											null, null, session, 0, null, null,
											null, null, systemLandscapeJson);
						},
						createApplicationWithDefaultSystem : function(session,
								systemType, systemName) {
							return sap.firefly.ApplicationFactory
									.createApplicationExt(
											sap.firefly.SyncType.BLOCKING,
											null, null, session, 0, systemType,
											systemName, null, null, null)
									.getData();
						},
						createApplicationWithVersionAndDefaultSystem : function(
								session, version, systemType, systemName) {
							return sap.firefly.ApplicationFactory
									.createApplicationExt(
											sap.firefly.SyncType.BLOCKING,
											null, null, session, version,
											systemType, systemName, null, null,
											null).getData();
						},
						createApplicationFull : function(session, version,
								systemType, systemName, systemUri,
								systemLandscapeUrl, systemLandscapeJson,
								syncType, listener) {
							return sap.firefly.ApplicationFactory
									.createApplicationExt(syncType, listener,
											null, session, version, systemType,
											systemName, systemUri,
											systemLandscapeUrl,
											systemLandscapeJson);
						},
						createApplicationExt : function(syncType, listener,
								customIdentifier, session, version, systemType,
								systemName, systemUri, systemLandscapeUrl,
								systemLandscapeJson) {
							var mySession = session;
							var usingVersion = version;
							var xversionValue;
							var location;
							var application;
							var systemLandscape;
							var usingSystemLandscapeUrl;
							var uri;
							var relative;
							var sequence;
							var landscapeLoadAction;
							var action;
							var action2;
							if (version <= 0) {
								xversionValue = sap.firefly.XEnvironment
										.getVariable(sap.firefly.XEnvironmentConstants.XVERSION);
								if (sap.firefly.XStringUtils
										.isNotNullAndNotEmpty(xversionValue)) {
									try {
										usingVersion = sap.firefly.XInteger
												.convertStringToInteger(xversionValue);
									} catch (e) {
										sap.firefly.XLogger
												.println(sap.firefly.XString
														.concatenate2(
																"Cannot parse XVersion from environment: ",
																xversionValue));
										usingVersion = sap.firefly.XVersion.DEFAULT_VALUE;
									}
								} else {
									usingVersion = sap.firefly.XVersion.DEFAULT_VALUE;
								}
							}
							if (mySession === null) {
								mySession = sap.firefly.DefaultSession
										.createWithVersion(null, usingVersion);
							}
							location = sap.firefly.NetworkEnv.getLocation();
							application = sap.firefly.ApplicationFactory.s_applicationFactory
									.newApplication(mySession, version);
							systemLandscape = sap.firefly.StandaloneSystemLandscape
									.create(application);
							application.setLandscape(systemLandscape);
							if (systemLandscapeUrl === null) {
								usingSystemLandscapeUrl = sap.firefly.XEnvironment
										.getVariable(sap.firefly.XEnvironmentConstants.SYSTEM_LANDSCAPE_URI);
							} else {
								usingSystemLandscapeUrl = systemLandscapeUrl;
							}
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(usingSystemLandscapeUrl)) {
								uri = sap.firefly.XUri
										.createFromUri(usingSystemLandscapeUrl);
								if (uri.isRelativeUri()) {
									relative = uri.getUriString();
									uri = sap.firefly.XUri
											.createFromUriWithParent(relative,
													location, false);
								}
								sequence = sap.firefly.SyncActionSequence
										.create(application);
								landscapeLoadAction = sap.firefly.SystemLandscapeLoadAction
										.createAndRun(
												sap.firefly.SyncType.DELAYED,
												null, null, application, uri);
								sequence.addAction(landscapeLoadAction);
								action = sap.firefly.ApplicationPostprocAction
										.createAndRun(
												sap.firefly.SyncType.DELAYED,
												null, null, application,
												systemName, systemUri,
												systemType, location);
								sequence.setMainAction(action);
								sequence.processSyncAction(syncType, listener,
										customIdentifier);
								return sequence;
							}
							action2 = sap.firefly.ApplicationPostprocAction
									.createAndRun(syncType, listener,
											customIdentifier, application,
											systemName, systemUri, systemType,
											location);
							return action2;
						},
						_register : function(application) {
							sap.firefly.ApplicationFactory.s_applicationList
									.add(application);
						},
						_unregister : function(application) {
							sap.firefly.ApplicationFactory.s_applicationList
									.removeElement(application);
						},
						getMasterApplication : function() {
							if (sap.firefly.ApplicationFactory.s_applicationList
									.size() > 0) {
								return sap.firefly.ApplicationFactory.s_applicationList
										.get(0);
							}
							return null;
						}
					},
					newApplication : function(session, version) {
						return sap.firefly.Application.create(session, version);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.BatchRequestDecoratorFactory",
				sap.firefly.XObject,
				{
					$statics : {
						BATCH_REQUEST_DECORATOR_PROVIDER : "BATCH_REQUEST_DECORATOR_PROVIDER.IMPLEMENTATION",
						getBatchRequestDecorator : function(session,
								requestStructure) {
							var sessionSingletons = session
									.getSessionSingletons();
							var factoryObject = sessionSingletons
									.getByKey(sap.firefly.BatchRequestDecoratorFactory.BATCH_REQUEST_DECORATOR_PROVIDER);
							var factory;
							if (factoryObject === null) {
								factory = new sap.firefly.BatchRequestDecoratorFactory();
								factory.initProviders();
								sessionSingletons
										.put(
												sap.firefly.BatchRequestDecoratorFactory.BATCH_REQUEST_DECORATOR_PROVIDER,
												factory);
							} else {
								factory = factoryObject;
							}
							return factory
									.getBatchRequestDecoratorInternal(requestStructure);
						}
					},
					m_providers : null,
					getBatchRequestDecoratorInternal : function(
							requestStructure) {
						var result = null;
						var i;
						var provider;
						var decorator;
						for (i = 0; i < this.m_providers.size(); i++) {
							provider = this.m_providers.get(i);
							decorator = provider
									.getBatchRequestDecorator(requestStructure);
							if (decorator === null) {
								continue;
							}
							if (result !== null) {
								throw sap.firefly.XException
										.createIllegalStateException("duplicate decorator");
							}
							result = decorator;
						}
						return result;
					},
					initProviders : function() {
						var registrationService;
						var clazzes;
						var i;
						var clazz;
						var provider;
						if (this.m_providers !== null) {
							return;
						}
						this.m_providers = sap.firefly.XList.create();
						registrationService = sap.firefly.RegistrationService
								.getInstance();
						if (registrationService !== null) {
							clazzes = registrationService
									.getReferences(sap.firefly.BatchRequestDecoratorFactory.BATCH_REQUEST_DECORATOR_PROVIDER);
							if (clazzes !== null) {
								for (i = 0; i < clazzes.size(); i++) {
									clazz = clazzes.get(i);
									provider = clazz.newInstance(this);
									if (provider === null) {
										continue;
									}
									this.m_providers.add(provider);
								}
							}
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ConnectionConstants",
				sap.firefly.XObject,
				{
					$statics : {
						FAST_PATH : "FastPath",
						PATH_SERVICE_HANA : "/sap/bc/ina/service/v2/GetServerInfo",
						PATH_INA_HANA : "/sap/bc/ina/service/v2/GetResponse",
						PATH_EPM_HANA : "/sap/epm/app/services/InA.xsjs",
						PATH_LOGOFF_HANA : "/sap/hana/xs/formLogin/logout.xscfunc",
						PATH_SERVICE_BW : "/sap/bw/ina/GetServerInfo",
						PATH_INA_BW : "/sap/bw/ina/GetResponse",
						PATH_LOGOFF_BW : "/sap/bw/ina/Logoff",
						PATH_SERVICE_BPCS : "/sap/bpc/ina/GetServerInfo",
						PATH_INA_BPCS : "/sap/bpc/ina/GetResponse",
						PATH_LOGOFF_BPCS : "/sap/bpc/ina/Logoff",
						PATH_SERVICE_UNV : "/sap/boc/ina/GetServerInfo",
						PATH_INA_UNV : "/sap/boc/ina/GetResponse",
						PATH_LOGOFF_UNV : "/sap/boc/ina/Logoff",
						SAP_CLIENT : "sap-client",
						SAP_LANGUAGE : "sap-language",
						INA_CAPABILITY_SUPPORTS_BATCH : "SupportsBatch",
						INA_BATCH : "Batch",
						staticSetup : function() {
						},
						getServerInfoPath : function(systemType) {
							if (systemType.isTypeOf(sap.firefly.SystemType.BW)) {
								return sap.firefly.ConnectionConstants.PATH_SERVICE_BW;
							} else {
								if (systemType
										.isTypeOf(sap.firefly.SystemType.BPCS)) {
									return sap.firefly.ConnectionConstants.PATH_SERVICE_BPCS;
								} else {
									if (systemType
											.isTypeOf(sap.firefly.SystemType.HANA)) {
										return sap.firefly.ConnectionConstants.PATH_SERVICE_HANA;
									} else {
										if (systemType
												.isTypeOf(sap.firefly.SystemType.UNV)) {
											return sap.firefly.ConnectionConstants.PATH_SERVICE_UNV;
										}
									}
								}
							}
							return null;
						},
						getLogoffPath : function(systemType) {
							if (systemType.isTypeOf(sap.firefly.SystemType.BW)) {
								return sap.firefly.ConnectionConstants.PATH_LOGOFF_BW;
							} else {
								if (systemType
										.isTypeOf(sap.firefly.SystemType.BPCS)) {
									return sap.firefly.ConnectionConstants.PATH_LOGOFF_BPCS;
								} else {
									if (systemType
											.isTypeOf(sap.firefly.SystemType.HANA)) {
										return sap.firefly.ConnectionConstants.PATH_LOGOFF_HANA;
									} else {
										if (systemType
												.isTypeOf(sap.firefly.SystemType.UNV)) {
											return sap.firefly.ConnectionConstants.PATH_LOGOFF_UNV;
										}
									}
								}
							}
							return null;
						},
						getInAPath : function(systemType) {
							if (systemType.isTypeOf(sap.firefly.SystemType.BW)) {
								return sap.firefly.ConnectionConstants.PATH_INA_BW;
							} else {
								if (systemType
										.isTypeOf(sap.firefly.SystemType.BPCS)) {
									return sap.firefly.ConnectionConstants.PATH_INA_BPCS;
								} else {
									if (systemType
											.isTypeOf(sap.firefly.SystemType.HANA)) {
										return sap.firefly.ConnectionConstants.PATH_INA_HANA;
									} else {
										if (systemType
												.isTypeOf(sap.firefly.SystemType.UNV)) {
											return sap.firefly.ConnectionConstants.PATH_INA_UNV;
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
				"sap.firefly.RpcHttpFunctionFactory",
				sap.firefly.XObject,
				{
					$statics : {
						USE_NEW_RPC : true,
						create : function(connectionContainer) {
							var manager = new sap.firefly.RpcHttpFunctionFactory();
							manager.setup(connectionContainer);
							return manager;
						}
					},
					m_connectionContainer : null,
					releaseObject : function() {
						this.m_connectionContainer = null;
						sap.firefly.RpcHttpFunctionFactory.$superclass.releaseObject
								.call(this);
					},
					setup : function(connectionContainer) {
						this.m_connectionContainer = sap.firefly.XWeakReferenceUtil
								.getWeakRef(connectionContainer);
					},
					newRpcFunction : function(relativeUri) {
						var connectionContainer = this.getConnectionContainer();
						var session = connectionContainer.getApplication()
								.getSession();
						var systemDescription = connectionContainer
								.getSystemDescription();
						var protocolType = systemDescription.getProtocolType();
						var name = relativeUri.getPath();
						var rpcFunction = sap.firefly.RpcFunctionFactory
								.newInstance(session, systemDescription, name,
										protocolType);
						if (rpcFunction === null) {
							rpcFunction = sap.firefly.RpcHttpFunction.create(
									connectionContainer, relativeUri);
						}
						rpcFunction.setTraceInfo(connectionContainer
								.getTraceInfo());
						return rpcFunction;
					},
					getConnectionContainer : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_connectionContainer);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.NestedBatchRequestDecorator",
				sap.firefly.XObject,
				{
					$statics : {
						getBatchRequestDecorator : function(requestStructure) {
							var batchList;
							var requestItems;
							var i;
							var requestStructureElement;
							var decorator;
							if (requestStructure === null) {
								return null;
							}
							batchList = sap.firefly.PrUtils.getListProperty(
									requestStructure,
									sap.firefly.ConnectionConstants.INA_BATCH);
							if (batchList === null) {
								return null;
							}
							requestItems = sap.firefly.XList.create();
							for (i = 0; i < batchList.size(); i++) {
								requestStructureElement = sap.firefly.PrUtils
										.getStructureElement(batchList, i);
								if (requestStructureElement === null) {
									throw sap.firefly.XException
											.createIllegalStateException("illegal nested batch syntax");
								}
								requestItems.add(requestStructureElement);
							}
							decorator = new sap.firefly.NestedBatchRequestDecorator();
							decorator.m_requestItems = requestItems;
							return decorator;
						}
					},
					m_requestItems : null,
					getItemsSize : function() {
						return this.m_requestItems.size();
					},
					getRequestItems : function() {
						return this.m_requestItems;
					},
					buildResponse : function(responseItems) {
						var result;
						var batchList;
						var i;
						var responseStructure;
						if (responseItems.size() !== this.getItemsSize()) {
							throw sap.firefly.XException
									.createIllegalStateException("illegal planning batch response structure");
						}
						result = sap.firefly.PrStructure.create();
						batchList = result
								.setNewListByName(sap.firefly.ConnectionConstants.INA_BATCH);
						for (i = 0; i < responseItems.size(); i++) {
							responseStructure = responseItems.get(i);
							if (responseStructure === null) {
								throw sap.firefly.XException
										.createIllegalStateException("illegal nested batch response structure");
							}
							batchList.add(responseStructure);
						}
						return result;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.NestedBatchRequestDecoratorProvider",
				sap.firefly.XObject,
				{
					$statics : {
						CLAZZ : null,
						staticSetup : function() {
							sap.firefly.NestedBatchRequestDecoratorProvider.CLAZZ = sap.firefly.XClass
									.create(sap.firefly.NestedBatchRequestDecoratorProvider);
						}
					},
					getBatchRequestDecorator : function(requestStructure) {
						return sap.firefly.NestedBatchRequestDecorator
								.getBatchRequestDecorator(requestStructure);
					}
				});
$Firefly.createClass("sap.firefly.ConnectionParameters", sap.firefly.XObject, {
	$statics : {
		AUTHENTICATION_TYPE : "AUTHENTICATION_TYPE",
		AUTHENTICATION_TYPE__BASIC : "BASIC",
		AUTHENTICATION_TYPE__NONE : "NONE",
		AUTHENTICATION_TYPE__BEARER : "BEARER",
		PROTOCOL : "PROTOCOL",
		PROTOCOL_HTTP : "HTTP",
		PROTOCOL_HTTPS : "HTTPS",
		PROTOCOL_FILE : "FILE",
		APP_PROTOCOL_CIP : "CIP",
		APP_PROTOCOL_INA : "INA",
		APP_PROTOCOL_RSR : "RSR",
		APP_PROTOCOL_INA2 : "INA2",
		APP_PROTOCOL_SQL : "SQL",
		HOST : "HOST",
		PASSWORD : "PASSWORD",
		TOKEN_VALUE : "TOKEN_VALUE",
		PORT : "PORT",
		CLIENT : "CLIENT",
		SERVICE_PATH : "SERVICE_URI",
		WEBDISPATCHER_URI : "WEBDISPATCHER_URI",
		PREFIX : "PREFIX",
		CAPABILITIES_PATH : "CAPABILITIES_URI",
		USER : "USER",
		SYSTEM_TYPE : "SYSTEM_TYPE",
		SYSTYPE : "SYSTYPE",
		NAME : "NAME",
		TIMEOUT : "TIMEOUT",
		LANGUAGE : "LANGUAGE",
		TAGS : "TAGS",
		ENABLE_TESTS : "ENABLE_TESTS",
		ENFORCE_TESTS : "ENFORCE_TESTS",
		X509CERTIFICATE : "X509CERTIFICATE",
		SECURE_LOGIN_PROFILE : "SECURE_LOGIN_PROFILE",
		SQL_DRIVER_JAVA : "SQL_DRIVER_JAVA",
		SQL_CONNECT_JAVA : "SQL_CONNECT_JAVA",
		MAPPING_SYSTEM_NAME : "MAPPING_SYSTEM_NAME",
		MAPPINGS : "MAPPINGS",
		MAPPING_SERIALIZATION_TABLE : "MAPPING_SERIALIZE_TABLE",
		MAPPING_SERIALIZATION_SCHEMA : "MAPPING_SERIALIZE_SCHEMA",
		MAPPING_DESERIALIZATION_TABLE : "MAPPING_DESERIALIZE_TABLE",
		MAPPING_DESERIALIZATION_SCHEMA : "MAPPING_DESERIALIZE_SCHEMA"
	}
});
$Firefly.createClass("sap.firefly.ServerService", sap.firefly.XObject, {
	$statics : {
		ANALYTIC : "Analytics",
		BWMASTERDATA : "BWMasterData",
		MASTERDATA : "Masterdata",
		MODEL_PERSISTENCY : "ModelPersistence",
		PLANNING : "Planning",
		VALUE_HELP : "ValueHelp",
		WORKSPACE : "Workspace",
		HIERARCHY_MEMBER : "HierarchyMember",
		CATALOG : "Catalog",
		INA : "InA",
		LIST_REPORTING : "ListReporting"
	}
});
$Firefly
		.createClass(
				"sap.firefly.OlapEnvironmentFactory",
				sap.firefly.XObject,
				{
					$statics : {
						s_olapEnvironmentFactory : null,
						staticSetup : function() {
							var defaultFactory = new sap.firefly.OlapEnvironmentFactory();
							sap.firefly.OlapEnvironmentFactory
									.setOlapEnvironmentFactory(defaultFactory);
						},
						newInstance : function(application) {
							return sap.firefly.OlapEnvironmentFactory.s_olapEnvironmentFactory
									.newOlapEnvironmentInstance(application);
						},
						setOlapEnvironmentFactory : function(jsonParserFactory) {
							sap.firefly.OlapEnvironmentFactory.s_olapEnvironmentFactory = jsonParserFactory;
						}
					},
					newOlapEnvironmentInstance : function(application) {
						return null;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.SharedMimes",
				sap.firefly.XObject,
				{
					$statics : {
						TYPE_CSS : null,
						TYPE_PORTAL_MIME : null,
						TYPE_BI_MIME : null,
						TYPE_ABAP_MIME : null,
						TYPE_UR : null,
						ACTIVITY_ICONS : null,
						ELEMENT_ICONS : null,
						GENERIC_ICONS : null,
						OPERATORS_ICONS : null,
						TEMPLATE_IMAGES : null,
						SUBITEM_ICONS : null,
						CHART_ICONS : null,
						SORT_ICONS : null,
						HIERARCHY_ICONS : null,
						VARSCREEN_ICONS : null,
						OPERATORS_ICONS_INCLUDE : null,
						OPERATORS_ICONS_EXCLUDE : null,
						EXCEPTIONS_ICONS : null,
						PATTERNS : null,
						HIERARCHY_LEAF : null,
						HIERARCHY_TOP : null,
						HIERARCHY_BOTTOM : null,
						HIERARCHY_LEFT : null,
						HIERARCHY_RIGHT : null,
						HIERARCHY_UNIVERSAL_TOP : null,
						HIERARCHY_UNIVERSAL_BOTTOM : null,
						HIERARCHY_UNIVERSAL_LEFT : null,
						HIERARCHY_UNIVERSAL_RIGHT : null,
						HIERARCHY_NO_DEFAULT_TOP : null,
						HIERARCHY_NO_DEFAULT_BOTTOM : null,
						HIERARCHY_NO_DEFAULT_LEFT : null,
						HIERARCHY_NO_DEFAULT_RIGHT : null,
						LOADING_ANI : null,
						PIXEL : null,
						VLINE : null,
						PDF_HIERARCHY_DISTANCE : null,
						DROP_OUT : null,
						WINDOW_SHRINK : null,
						WINDOW_ENLARGE : null,
						WINDOW_CLOSE : null,
						SETTINGS : null,
						HELP : null,
						UNDO : null,
						REDO : null,
						OPEN : null,
						CLOSE : null,
						SAVE : null,
						SAVE_FANCY_48x48 : null,
						SAVE_AS : null,
						FULLSIZE_FANCY_48x48 : null,
						PRINT : null,
						CLIPBOARD : null,
						CLIPBOARD_EMPTY : null,
						DOCUMENT_KM : null,
						DOCUMENT_KM_14x14 : null,
						LOCKED : null,
						BROKEN_DOCUMENT_KM : null,
						BROKEN_DOCUMENT_KM_14x14 : null,
						TECHNAMES : null,
						EDIT : null,
						DELETE_CROSS : null,
						F4 : null,
						FILTER : null,
						ACTIVE_FILTER : null,
						CUT : null,
						COPY : null,
						PASTE : null,
						RUN : null,
						QUERY : null,
						ADHOC : null,
						NEW : null,
						HEADMENU : null,
						WEB : null,
						TRASHBIN : null,
						TRASHBIN_SMALL : null,
						BROADCASTING : null,
						CHART : null,
						BOOKMARK : null,
						EXCEL : null,
						CSV : null,
						EXCEPTIONS : null,
						CONDITIONS : null,
						VARIABLES : null,
						QUERYPROPERTIES : null,
						ERROR_RED : null,
						ERROR_YELLOW : null,
						LAMP : null,
						HISTORY : null,
						INFOAREA : null,
						PDF : null,
						QUERY_VIEW : null,
						CHARACTERISTIC : null,
						QUERYSTRUCTURE : null,
						MEMBER : null,
						FOLDER_CLOSE : null,
						FOLDER_OPEN : null,
						FOLDER_UP : null,
						FOLDER_UP_DISABLED : null,
						EXTERNAL_CUBE : null,
						DOCUMENT : null,
						DOCUMENT_HTML : null,
						REL_CATALOG : null,
						REL_SCHEMA : null,
						REL_TABLE : null,
						PLANNING_FUNCTION : null,
						PLANNING_SEQUENCE : null,
						AGGR : null,
						INFOCUBE : null,
						INFOOBJECT : null,
						INFOSET : null,
						MULTIPROVIDER : null,
						ODSO : null,
						CAL_MONTH_PREVIOUS : null,
						CAL_MONTH_NEXT : null,
						CAL_YEAR_PREVIOUS : null,
						CAL_YEAR_NEXT : null,
						SEL_INCLUDE : null,
						SEL_EXCLUDE : null,
						MICRODOT : null,
						DRAG_AREA : null,
						HORIZONTAL_BAR : null,
						HORIZONTAL_SEPARATOR : null,
						VERTICAL_BAR : null,
						ARROW_LEFT : null,
						ARROW_RIGHT : null,
						ARROW_TOP : null,
						ARROW_BOTTOM : null,
						SORT_UNDEFINED : null,
						SORT_UNDEFINED_NY : null,
						SORT_ASCENDING : null,
						SORT_DESCENDING : null,
						SMART_HOVER_LEFT : null,
						SMART_HOVER_RIGHT : null,
						SMART_HOVER_TOP : null,
						SMART_HOVER_BOTTOM : null,
						SMART_HOVER_VERTICAL_LINE : null,
						SMART_HOVER_HORIZONTAL_LINE : null,
						OPERATOR_EQUAL_INCLUDING : null,
						OPERATOR_EQUAL_EXCLUDING : null,
						OPERATOR_NOT_EQUAL_INCLUDING : null,
						OPERATOR_NOT_EQUAL_EXCLUDING : null,
						OPERATOR_GREATER_INCLUDE : null,
						OPERATOR_GREATER_EXCLUDING : null,
						OPERATOR_GREATER_OR_EQUAL_INCLUDING : null,
						OPERATOR_NODE_EQUAL_INCLUDING : null,
						OPERATOR_NODE_EQUAL_EXCLUDING : null,
						OPERATOR_GREATER_OR_EQUAL_EXCLUDING : null,
						OPERATOR_LOWER_INCLUDE : null,
						OPERATOR_LOWER_EXCLUDING : null,
						OPERATOR_LOWER_OR_EQUAL_INCLUDING : null,
						OPERATOR_LOWER_OR_EQUAL_EXCLUDING : null,
						OPERATOR_BETWEEN_INCLUDING : null,
						OPERATOR_BETWEEN_EXCLUDING : null,
						OPERATOR_BETWEEN_PATTERN_INCLUDING : null,
						OPERATOR_BETWEEN_PATTERN_EXCLUDING : null,
						OPERATOR_NOT_BETWEEN_INCLUDING : null,
						OPERATOR_NOT_BETWEEN_EXCLUDING : null,
						ALERT_GOOD : null,
						ALERT_CRITICAL : null,
						ALERT_BAD : null,
						TREND_UP : null,
						TREND_DOWN : null,
						TREND_CONSTANT : null,
						TREND_INCREASING : null,
						TREND_DECREASING : null,
						MOVE_UP : null,
						MOVE_UP_DISABLED : null,
						MOVE_DOWN : null,
						MOVE_DOWN_DISABLED : null,
						TAB_CLOSE : null,
						LAYOUT_1ROW : null,
						LAYOUT_2ROWS : null,
						LAYOUT_3ROWS : null,
						LAYOUT_4ROWS : null,
						LAYOUT_1COL : null,
						LAYOUT_2COLS : null,
						LAYOUT_3COLS : null,
						LAYOUT_4COLS : null,
						LAYOUT_2COLS_WITH_HEADER : null,
						LAYOUT_2COLS_WITH_FOOTER : null,
						LAYOUT_3COLS_WITH_HEADER : null,
						LAYOUT_3COLS_WITH_FOOTER : null,
						LAYOUT_2ROWS_WITH_LEFT_BAR : null,
						LAYOUT_2ROWS_WITH_RIGHT_BAR : null,
						LAYOUT_3ROWS_WITH_LEFT_BAR : null,
						LAYOUT_3ROWS_WITH_RIGHT_BAR : null,
						LAYOUT_QUADRAT : null,
						LAYOUT_QUADRAT_WITH_HEADER : null,
						LAYOUT_QUADRAT_WITH_FOOTER : null,
						LAYOUT_QUADRAT_WITH_LEFT_BAR : null,
						LAYOUT_QUADRAT_WITH_RIGHT_BAR : null,
						LAYOUT_QUADRAT_WITH_HEADER_LEFT_BAR : null,
						LAYOUT_QUADRAT_WITH_HEADER_RIGHT_BAR : null,
						LAYOUT_SIXPACK : null,
						LAYOUT_FLOATING_ROWS : null,
						LAYOUT_FLOATING_COLUMNS : null,
						WEB_ANALYZER : null,
						LAYOUT_FULL_WIDTH : null,
						LAYOUT_DETAILNAV_FULL_WIDTH : null,
						SUBITEM_FLOATING_COLUMNS_ICON : null,
						SUBITEM_FLOATING_ROWS_ICON : null,
						SUBITEM_FLEX_ICON : null,
						SUBITEM_GROUP_PRIMARY_COLOR : null,
						SUBITEM_GROUP_SAP_COLOR : null,
						SUBITEM_GROUP_MODERN : null,
						ITEM_GROUP_UICONTROLS : null,
						ITEM_GROUP_CONTAINER : null,
						ITEM_GROUP_DATA : null,
						ITEM_GROUP_FILTER : null,
						ITEM_GROUP_MISC : null,
						ITEM_GROUP_CHARTS : null,
						ITEM_GROUP_DOCS : null,
						CHART_AREA : null,
						CHART_BAR : null,
						CHART_COLUMNS : null,
						CHART_DELTA : null,
						CHART_DOUGHNUT : null,
						CHART_GANTT : null,
						CHART_HEATMAP : null,
						CHART_HISTOGRAM : null,
						CHART_LINES : null,
						CHART_MTA : null,
						CHART_PIE : null,
						CHART_POLAR : null,
						CHART_PORTFOLIO : null,
						CHART_PROFILE_AREA : null,
						CHART_PROFILES : null,
						CHART_RADAR : null,
						CHART_SCATTER : null,
						CHART_SPEEDOMETER : null,
						CHART_SPLIT_PIE : null,
						CHART_TIME_SCATTER : null,
						CHARTCUSTOMIZING : null,
						CHARTCUSTOMIZING_DEFAULT : null,
						MAP_ICONS : null,
						MAP_WEST_LEFT : null,
						MAP_EAST_RIGHT : null,
						MAP_NORTH_UP : null,
						MAP_SOUTH_DOWN : null,
						MAP_ZOOM_IN : null,
						MAP_ZOOM_OUT : null,
						MAP_FULL_EXTENT : null,
						MAP_PAN : null,
						MAP_SELECT : null,
						PATTERN_MODERN : null,
						PATTERN_MODERN_BACKGROUND : null,
						PATTERN_MODERN_CORNER_TOP_LEFT : null,
						PATTERN_MODERN_CORNER_TOP_RIGHT : null,
						PATTERN_MODERN_CORNER_BOTTOM_LEFT : null,
						PATTERN_MODERN_CORNER_BOTTOM_RIGHT : null,
						PATTERN_MODERN_LINE_TOP : null,
						PATTERN_MODERN_LINE_BOTTOM : null,
						PATTERN_MODERN_LINE_LEFT : null,
						PATTERN_MODERN_LINE_RIGHT : null,
						PERSONALIZE_ICON : null,
						UNPERSONALIZE_ICON : null,
						PERSONALIZE_ALL_ICON : null,
						UNPERSONALIZE_ALL_ICON : null,
						UR_UNSORTED : null,
						UR_SORT_ASCENDING : null,
						UR_SORT_DESCENDING : null,
						UR_FILTER : null,
						UR_HIERARCHY_LEAF : null,
						UR_HIERARCHY_TOP : null,
						UR_HIERARCHY_BOTTOM : null,
						UR_HIERARCHY_LEFT : null,
						UR_HIERARCHY_RIGHT : null,
						UR_DROP : null,
						UR_NO_DROP : null,
						UR_FIRST_PAGE : null,
						UR_LAST_PAGE : null,
						UR_PREV_ITEM : null,
						UR_NEXT_ITEM : null,
						staticSetup : function() {
							sap.firefly.SharedMimes.TYPE_CSS = "css://";
							sap.firefly.SharedMimes.TYPE_PORTAL_MIME = "portalmime:///";
							sap.firefly.SharedMimes.TYPE_BI_MIME = sap.firefly.SharedMimes.TYPE_PORTAL_MIME;
							sap.firefly.SharedMimes.TYPE_ABAP_MIME = "bwmimerep://";
							sap.firefly.SharedMimes.TYPE_UR = "ur://";
							sap.firefly.SharedMimes.ACTIVITY_ICONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/activities/");
							sap.firefly.SharedMimes.ELEMENT_ICONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/elements/");
							sap.firefly.SharedMimes.GENERIC_ICONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/generic/");
							sap.firefly.SharedMimes.OPERATORS_ICONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/operators/");
							sap.firefly.SharedMimes.TEMPLATE_IMAGES = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/templates/");
							sap.firefly.SharedMimes.SUBITEM_ICONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/subitems/");
							sap.firefly.SharedMimes.CHART_ICONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/chart/");
							sap.firefly.SharedMimes.SORT_ICONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/sort/");
							sap.firefly.SharedMimes.HIERARCHY_ICONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/hierarchy/");
							sap.firefly.SharedMimes.VARSCREEN_ICONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"web.ui.dialogs.variablescreen/resources/images/");
							sap.firefly.SharedMimes.OPERATORS_ICONS_INCLUDE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS,
											"blue/");
							sap.firefly.SharedMimes.OPERATORS_ICONS_EXCLUDE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS,
											"red/");
							sap.firefly.SharedMimes.EXCEPTIONS_ICONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/exceptions/");
							sap.firefly.SharedMimes.PATTERNS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/patterns/");
							sap.firefly.SharedMimes.HIERARCHY_LEAF = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hierarchy_leaf.gif");
							sap.firefly.SharedMimes.HIERARCHY_TOP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hierarchy_top.gif");
							sap.firefly.SharedMimes.HIERARCHY_BOTTOM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hierarchy_bottom.gif");
							sap.firefly.SharedMimes.HIERARCHY_LEFT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hierarchy_left.gif");
							sap.firefly.SharedMimes.HIERARCHY_RIGHT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hierarchy_right.gif");
							sap.firefly.SharedMimes.HIERARCHY_UNIVERSAL_TOP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hieruni_top.gif");
							sap.firefly.SharedMimes.HIERARCHY_UNIVERSAL_BOTTOM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hieruni_bottom.gif");
							sap.firefly.SharedMimes.HIERARCHY_UNIVERSAL_LEFT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hieruni_left.gif");
							sap.firefly.SharedMimes.HIERARCHY_UNIVERSAL_RIGHT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hieruni_right.gif");
							sap.firefly.SharedMimes.HIERARCHY_NO_DEFAULT_TOP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hiernodefault_top.gif");
							sap.firefly.SharedMimes.HIERARCHY_NO_DEFAULT_BOTTOM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hiernodefault_bottom.gif");
							sap.firefly.SharedMimes.HIERARCHY_NO_DEFAULT_LEFT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hiernodefault_left.gif");
							sap.firefly.SharedMimes.HIERARCHY_NO_DEFAULT_RIGHT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.HIERARCHY_ICONS,
											"hiernodefault_right.gif");
							sap.firefly.SharedMimes.LOADING_ANI = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"loading_ani.gif");
							sap.firefly.SharedMimes.PIXEL = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"pixel.gif");
							sap.firefly.SharedMimes.VLINE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"vline.gif");
							sap.firefly.SharedMimes.PDF_HIERARCHY_DISTANCE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"pdfhierarchydist.gif");
							sap.firefly.SharedMimes.DROP_OUT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"dropout.gif");
							sap.firefly.SharedMimes.WINDOW_SHRINK = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"window_shrink.gif");
							sap.firefly.SharedMimes.WINDOW_ENLARGE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"window_enlarge.gif");
							sap.firefly.SharedMimes.WINDOW_CLOSE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"window_close.gif");
							sap.firefly.SharedMimes.SETTINGS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"settings.gif");
							sap.firefly.SharedMimes.HELP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"help.gif");
							sap.firefly.SharedMimes.UNDO = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"undo.gif");
							sap.firefly.SharedMimes.REDO = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"redo.gif");
							sap.firefly.SharedMimes.OPEN = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"open.gif");
							sap.firefly.SharedMimes.CLOSE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"close.gif");
							sap.firefly.SharedMimes.SAVE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"save.gif");
							sap.firefly.SharedMimes.SAVE_FANCY_48x48 = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"save_fancy_48x48.gif");
							sap.firefly.SharedMimes.SAVE_AS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"saveas.gif");
							sap.firefly.SharedMimes.FULLSIZE_FANCY_48x48 = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"fullsize_fancy_48x48.gif");
							sap.firefly.SharedMimes.PRINT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"print.gif");
							sap.firefly.SharedMimes.CLIPBOARD = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"clipboard.gif");
							sap.firefly.SharedMimes.CLIPBOARD_EMPTY = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"clipboard_empty.gif");
							sap.firefly.SharedMimes.DOCUMENT_KM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"document_km.gif");
							sap.firefly.SharedMimes.DOCUMENT_KM_14x14 = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"document_km_14x14.gif");
							sap.firefly.SharedMimes.LOCKED = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"locked.gif");
							sap.firefly.SharedMimes.BROKEN_DOCUMENT_KM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"broken_document_km.gif");
							sap.firefly.SharedMimes.BROKEN_DOCUMENT_KM_14x14 = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"broken_document_km_14x14.gif");
							sap.firefly.SharedMimes.TECHNAMES = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"techname_on.gif");
							sap.firefly.SharedMimes.EDIT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"edit_readwrite.gif");
							sap.firefly.SharedMimes.DELETE_CROSS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"delete_cross.gif");
							sap.firefly.SharedMimes.F4 = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"f4.gif");
							sap.firefly.SharedMimes.FILTER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"filter.gif");
							sap.firefly.SharedMimes.ACTIVE_FILTER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"active_filter.gif");
							sap.firefly.SharedMimes.CUT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"cut.gif");
							sap.firefly.SharedMimes.COPY = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"copy.gif");
							sap.firefly.SharedMimes.PASTE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"paste.gif");
							sap.firefly.SharedMimes.RUN = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"run.gif");
							sap.firefly.SharedMimes.QUERY = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"newquery.gif");
							sap.firefly.SharedMimes.ADHOC = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"adhoc.gif");
							sap.firefly.SharedMimes.NEW = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"new.gif");
							sap.firefly.SharedMimes.HEADMENU = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"headmenu.gif");
							sap.firefly.SharedMimes.WEB = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"web.gif");
							sap.firefly.SharedMimes.TRASHBIN = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"trashbin_large.gif");
							sap.firefly.SharedMimes.TRASHBIN_SMALL = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"trashbin_small.gif");
							sap.firefly.SharedMimes.BROADCASTING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"broadcasting.gif");
							sap.firefly.SharedMimes.CHART = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"chart.gif");
							sap.firefly.SharedMimes.BOOKMARK = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"bookmark.gif");
							sap.firefly.SharedMimes.EXCEL = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"excel.gif");
							sap.firefly.SharedMimes.CSV = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"csv.gif");
							sap.firefly.SharedMimes.EXCEPTIONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"exceptions.gif");
							sap.firefly.SharedMimes.CONDITIONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"conditions.gif");
							sap.firefly.SharedMimes.VARIABLES = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"variables.gif");
							sap.firefly.SharedMimes.QUERYPROPERTIES = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"queryprop.gif");
							sap.firefly.SharedMimes.ERROR_RED = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"ErrorRed.gif");
							sap.firefly.SharedMimes.ERROR_YELLOW = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"ErrorYellow.gif");
							sap.firefly.SharedMimes.LAMP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"EdisonLamp.gif");
							sap.firefly.SharedMimes.HISTORY = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"History.gif");
							sap.firefly.SharedMimes.INFOAREA = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"InfoArea.gif");
							sap.firefly.SharedMimes.PDF = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"pdf.gif");
							sap.firefly.SharedMimes.QUERY_VIEW = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"QueryView.gif");
							sap.firefly.SharedMimes.CHARACTERISTIC = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"Characteristic.gif");
							sap.firefly.SharedMimes.QUERYSTRUCTURE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"QueryStructure.gif");
							sap.firefly.SharedMimes.MEMBER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"KeyfigureMetadata.gif");
							sap.firefly.SharedMimes.FOLDER_CLOSE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"FolderClose.gif");
							sap.firefly.SharedMimes.FOLDER_OPEN = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"FolderOpen.gif");
							sap.firefly.SharedMimes.FOLDER_UP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"folderUp.gif");
							sap.firefly.SharedMimes.FOLDER_UP_DISABLED = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"folderUp_disabled.gif");
							sap.firefly.SharedMimes.EXTERNAL_CUBE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"VirtualCube.gif");
							sap.firefly.SharedMimes.DOCUMENT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"Document.gif");
							sap.firefly.SharedMimes.DOCUMENT_HTML = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"DocumentHTML.gif");
							sap.firefly.SharedMimes.REL_CATALOG = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"RelationalCatalog.gif");
							sap.firefly.SharedMimes.REL_SCHEMA = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"RelationalSchema.gif");
							sap.firefly.SharedMimes.REL_TABLE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"RelationalTable.gif");
							sap.firefly.SharedMimes.PLANNING_FUNCTION = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"plse.gif");
							sap.firefly.SharedMimes.PLANNING_SEQUENCE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"plsq.gif");
							sap.firefly.SharedMimes.AGGR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"aggr.gif");
							sap.firefly.SharedMimes.INFOCUBE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"InfoCubeBasic.gif");
							sap.firefly.SharedMimes.INFOOBJECT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"InfoObjectCHA.gif");
							sap.firefly.SharedMimes.INFOSET = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"InfoSet.gif");
							sap.firefly.SharedMimes.MULTIPROVIDER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"MultiProvider.gif");
							sap.firefly.SharedMimes.ODSO = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"ODS.gif");
							sap.firefly.SharedMimes.CAL_MONTH_PREVIOUS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"dn_prev_item.gif");
							sap.firefly.SharedMimes.CAL_MONTH_NEXT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"dn_next_item.gif");
							sap.firefly.SharedMimes.CAL_YEAR_PREVIOUS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"dn_prev_year.gif");
							sap.firefly.SharedMimes.CAL_YEAR_NEXT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"dn_next_year.gif");
							sap.firefly.SharedMimes.SEL_INCLUDE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"sel_include.gif");
							sap.firefly.SharedMimes.SEL_EXCLUDE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ELEMENT_ICONS,
											"sel_exclude.gif");
							sap.firefly.SharedMimes.MICRODOT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"microdot.gif");
							sap.firefly.SharedMimes.DRAG_AREA = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"dragarea.gif");
							sap.firefly.SharedMimes.HORIZONTAL_BAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"horizontalbar.gif");
							sap.firefly.SharedMimes.HORIZONTAL_SEPARATOR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"horizontal_separator1x2.gif");
							sap.firefly.SharedMimes.VERTICAL_BAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"verticalbar.gif");
							sap.firefly.SharedMimes.ARROW_LEFT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"hoverarrowleft.gif");
							sap.firefly.SharedMimes.ARROW_RIGHT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"hoverarrowright.gif");
							sap.firefly.SharedMimes.ARROW_TOP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"hoverarrowtop.gif");
							sap.firefly.SharedMimes.ARROW_BOTTOM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"hoverarrowbottom.gif");
							sap.firefly.SharedMimes.SORT_UNDEFINED = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SORT_ICONS,
											"unsorted.gif");
							sap.firefly.SharedMimes.SORT_UNDEFINED_NY = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SORT_ICONS,
											"unsortedNY.gif");
							sap.firefly.SharedMimes.SORT_ASCENDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SORT_ICONS,
											"sort_asc.gif");
							sap.firefly.SharedMimes.SORT_DESCENDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SORT_ICONS,
											"sort_desc.gif");
							sap.firefly.SharedMimes.SMART_HOVER_LEFT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"smart_hover_left.gif");
							sap.firefly.SharedMimes.SMART_HOVER_RIGHT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"smart_hover_right.gif");
							sap.firefly.SharedMimes.SMART_HOVER_TOP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"smart_hover_top.gif");
							sap.firefly.SharedMimes.SMART_HOVER_BOTTOM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"smart_hover_bottom.gif");
							sap.firefly.SharedMimes.SMART_HOVER_VERTICAL_LINE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"smart_hover_vline.gif");
							sap.firefly.SharedMimes.SMART_HOVER_HORIZONTAL_LINE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.GENERIC_ICONS,
											"smart_hover_hline.gif");
							sap.firefly.SharedMimes.OPERATOR_EQUAL_INCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_INCLUDE,
											"S_B_EQUA.gif");
							sap.firefly.SharedMimes.OPERATOR_EQUAL_EXCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_EXCLUDE,
											"S_BREQUA.gif");
							sap.firefly.SharedMimes.OPERATOR_NOT_EQUAL_INCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_INCLUDE,
											"S_B_NEQU.gif");
							sap.firefly.SharedMimes.OPERATOR_NOT_EQUAL_EXCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_EXCLUDE,
											"S_BRNEQU.gif");
							sap.firefly.SharedMimes.OPERATOR_GREATER_INCLUDE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_INCLUDE,
											"S_B_GREA.gif");
							sap.firefly.SharedMimes.OPERATOR_GREATER_EXCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_EXCLUDE,
											"S_BRGREA.gif");
							sap.firefly.SharedMimes.OPERATOR_GREATER_OR_EQUAL_INCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_INCLUDE,
											"S_B_GREQ.gif");
							sap.firefly.SharedMimes.OPERATOR_NODE_EQUAL_INCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_INCLUDE,
											"ST_NODE_FIX_EQ_IN2.gif");
							sap.firefly.SharedMimes.OPERATOR_NODE_EQUAL_EXCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_EXCLUDE,
											"ST_NODE_FIX_EQ_EX.gif");
							sap.firefly.SharedMimes.OPERATOR_GREATER_OR_EQUAL_EXCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_EXCLUDE,
											"S_BRGREQ.gif");
							sap.firefly.SharedMimes.OPERATOR_LOWER_INCLUDE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_INCLUDE,
											"S_B_LESS.gif");
							sap.firefly.SharedMimes.OPERATOR_LOWER_EXCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_EXCLUDE,
											"S_BRLESS.gif");
							sap.firefly.SharedMimes.OPERATOR_LOWER_OR_EQUAL_INCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_INCLUDE,
											"S_B_LEEQ.gif");
							sap.firefly.SharedMimes.OPERATOR_LOWER_OR_EQUAL_EXCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_EXCLUDE,
											"S_BRLEEQ.gif");
							sap.firefly.SharedMimes.OPERATOR_BETWEEN_INCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_INCLUDE,
											"S_B_IVIN.gif");
							sap.firefly.SharedMimes.OPERATOR_BETWEEN_EXCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_EXCLUDE,
											"S_BRIVIN.gif");
							sap.firefly.SharedMimes.OPERATOR_BETWEEN_PATTERN_INCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_INCLUDE,
											"S_B_PATT.gif");
							sap.firefly.SharedMimes.OPERATOR_BETWEEN_PATTERN_EXCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_EXCLUDE,
											"S_BRPATT.gif");
							sap.firefly.SharedMimes.OPERATOR_NOT_BETWEEN_INCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_INCLUDE,
											"S_B_IVEX.gif");
							sap.firefly.SharedMimes.OPERATOR_NOT_BETWEEN_EXCLUDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.OPERATORS_ICONS_EXCLUDE,
											"S_BRIVEX.gif");
							sap.firefly.SharedMimes.ALERT_GOOD = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.EXCEPTIONS_ICONS,
											"led_green.gif");
							sap.firefly.SharedMimes.ALERT_CRITICAL = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.EXCEPTIONS_ICONS,
											"led_yellow.gif");
							sap.firefly.SharedMimes.ALERT_BAD = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.EXCEPTIONS_ICONS,
											"led_red.gif");
							sap.firefly.SharedMimes.TREND_UP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.EXCEPTIONS_ICONS,
											"trend_up.gif");
							sap.firefly.SharedMimes.TREND_DOWN = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.EXCEPTIONS_ICONS,
											"trend_down.gif");
							sap.firefly.SharedMimes.TREND_CONSTANT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.EXCEPTIONS_ICONS,
											"trend_constant.gif");
							sap.firefly.SharedMimes.TREND_INCREASING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.EXCEPTIONS_ICONS,
											"trend_increasing");
							sap.firefly.SharedMimes.TREND_DECREASING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.EXCEPTIONS_ICONS,
											"trend_decreasing.gif");
							sap.firefly.SharedMimes.MOVE_UP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"move_up_12.gif");
							sap.firefly.SharedMimes.MOVE_UP_DISABLED = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"move_up_12_disabled.gif");
							sap.firefly.SharedMimes.MOVE_DOWN = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"move_down_12.gif");
							sap.firefly.SharedMimes.MOVE_DOWN_DISABLED = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.ACTIVITY_ICONS,
											"move_down_12_disabled.gif");
							sap.firefly.SharedMimes.TAB_CLOSE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/tab/close.gif");
							sap.firefly.SharedMimes.LAYOUT_1ROW = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout1Row.gif");
							sap.firefly.SharedMimes.LAYOUT_2ROWS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout2Rows.gif");
							sap.firefly.SharedMimes.LAYOUT_3ROWS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout3Rows.gif");
							sap.firefly.SharedMimes.LAYOUT_4ROWS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout4Rows.gif");
							sap.firefly.SharedMimes.LAYOUT_1COL = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout1Col.gif");
							sap.firefly.SharedMimes.LAYOUT_2COLS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout2Cols.gif");
							sap.firefly.SharedMimes.LAYOUT_3COLS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout3Cols.gif");
							sap.firefly.SharedMimes.LAYOUT_4COLS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout4Cols.gif");
							sap.firefly.SharedMimes.LAYOUT_2COLS_WITH_HEADER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout2ColsWithHeader.gif");
							sap.firefly.SharedMimes.LAYOUT_2COLS_WITH_FOOTER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout2ColsWithFooter.gif");
							sap.firefly.SharedMimes.LAYOUT_3COLS_WITH_HEADER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout3ColsWithHeader.gif");
							sap.firefly.SharedMimes.LAYOUT_3COLS_WITH_FOOTER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout3ColsWithFooter.gif");
							sap.firefly.SharedMimes.LAYOUT_2ROWS_WITH_LEFT_BAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout2RowsWithLeftBar.gif");
							sap.firefly.SharedMimes.LAYOUT_2ROWS_WITH_RIGHT_BAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout2RowsWithRightBar.gif");
							sap.firefly.SharedMimes.LAYOUT_3ROWS_WITH_LEFT_BAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout3RowsWithLeftBar.gif");
							sap.firefly.SharedMimes.LAYOUT_3ROWS_WITH_RIGHT_BAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"Layout3RowsWithRightBar.gif");
							sap.firefly.SharedMimes.LAYOUT_QUADRAT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutQuadrat.gif");
							sap.firefly.SharedMimes.LAYOUT_QUADRAT_WITH_HEADER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutQuadratWithHeader.gif");
							sap.firefly.SharedMimes.LAYOUT_QUADRAT_WITH_FOOTER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutQuadratWithFooter.gif");
							sap.firefly.SharedMimes.LAYOUT_QUADRAT_WITH_LEFT_BAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutQuadratWithLeftBar.gif");
							sap.firefly.SharedMimes.LAYOUT_QUADRAT_WITH_RIGHT_BAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutQuadratWithRightBar.gif");
							sap.firefly.SharedMimes.LAYOUT_QUADRAT_WITH_HEADER_LEFT_BAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutQuadratWithHeaderLeftBar.gif");
							sap.firefly.SharedMimes.LAYOUT_QUADRAT_WITH_HEADER_RIGHT_BAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutQuadratWithHeaderRightBar.gif");
							sap.firefly.SharedMimes.LAYOUT_SIXPACK = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutSixpack.gif");
							sap.firefly.SharedMimes.LAYOUT_FLOATING_ROWS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutFloatingRows.gif");
							sap.firefly.SharedMimes.LAYOUT_FLOATING_COLUMNS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutFloatingCols.gif");
							sap.firefly.SharedMimes.WEB_ANALYZER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"WebAnalyzer.gif");
							sap.firefly.SharedMimes.LAYOUT_FULL_WIDTH = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutFullWidth.gif");
							sap.firefly.SharedMimes.LAYOUT_DETAILNAV_FULL_WIDTH = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TEMPLATE_IMAGES,
											"LayoutDetailNavFullWidth.gif");
							sap.firefly.SharedMimes.SUBITEM_FLOATING_COLUMNS_ICON = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"LayoutFloatingColsIcon.gif");
							sap.firefly.SharedMimes.SUBITEM_FLOATING_ROWS_ICON = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"LayoutFloatingRowsIcon.gif");
							sap.firefly.SharedMimes.SUBITEM_FLEX_ICON = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"FlexIcon.gif");
							sap.firefly.SharedMimes.SUBITEM_GROUP_PRIMARY_COLOR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"GroupPrimary.gif");
							sap.firefly.SharedMimes.SUBITEM_GROUP_SAP_COLOR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"GroupSapColor.gif");
							sap.firefly.SharedMimes.SUBITEM_GROUP_MODERN = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"GroupModern.gif");
							sap.firefly.SharedMimes.ITEM_GROUP_UICONTROLS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"ImageGroupControls.gif");
							sap.firefly.SharedMimes.ITEM_GROUP_CONTAINER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"ImageGroupContainer.gif");
							sap.firefly.SharedMimes.ITEM_GROUP_DATA = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"ImageGroupTable.gif");
							sap.firefly.SharedMimes.ITEM_GROUP_FILTER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"ImageGroupFilter.gif");
							sap.firefly.SharedMimes.ITEM_GROUP_MISC = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"ImageGroupMisc.gif");
							sap.firefly.SharedMimes.ITEM_GROUP_CHARTS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"ImageGroupChart.gif");
							sap.firefly.SharedMimes.ITEM_GROUP_DOCS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.SUBITEM_ICONS,
											"ImageGroupDocs.gif");
							sap.firefly.SharedMimes.CHART_AREA = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Area.gif");
							sap.firefly.SharedMimes.CHART_BAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Bar.gif");
							sap.firefly.SharedMimes.CHART_COLUMNS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Columns.gif");
							sap.firefly.SharedMimes.CHART_DELTA = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"DeltaChart.gif");
							sap.firefly.SharedMimes.CHART_DOUGHNUT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Doughnut.gif");
							sap.firefly.SharedMimes.CHART_GANTT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Gantt.gif");
							sap.firefly.SharedMimes.CHART_HEATMAP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"HeatMap.gif");
							sap.firefly.SharedMimes.CHART_HISTOGRAM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Histogram.gif");
							sap.firefly.SharedMimes.CHART_LINES = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Lines.gif");
							sap.firefly.SharedMimes.CHART_MTA = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"MTA.gif");
							sap.firefly.SharedMimes.CHART_PIE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Pie.gif");
							sap.firefly.SharedMimes.CHART_POLAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Polar.gif");
							sap.firefly.SharedMimes.CHART_PORTFOLIO = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Portfolio.gif");
							sap.firefly.SharedMimes.CHART_PROFILE_AREA = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"ProfileArea.gif");
							sap.firefly.SharedMimes.CHART_PROFILES = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Profiles.gif");
							sap.firefly.SharedMimes.CHART_RADAR = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Radar.gif");
							sap.firefly.SharedMimes.CHART_SCATTER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Scatter.gif");
							sap.firefly.SharedMimes.CHART_SPEEDOMETER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"Speedometer.gif");
							sap.firefly.SharedMimes.CHART_SPLIT_PIE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"SplitPie.gif");
							sap.firefly.SharedMimes.CHART_TIME_SCATTER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHART_ICONS,
											"TimeScatter.gif");
							sap.firefly.SharedMimes.CHARTCUSTOMIZING = "web.ui.items.chartitem/resources/xml/";
							sap.firefly.SharedMimes.CHARTCUSTOMIZING_DEFAULT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.CHARTCUSTOMIZING,
											"default.xml");
							sap.firefly.SharedMimes.MAP_ICONS = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_BI_MIME,
											"base/images/map/");
							sap.firefly.SharedMimes.MAP_WEST_LEFT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.MAP_ICONS,
											"s_geo_west.gif");
							sap.firefly.SharedMimes.MAP_EAST_RIGHT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.MAP_ICONS,
											"s_geo_east.gif");
							sap.firefly.SharedMimes.MAP_NORTH_UP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.MAP_ICONS,
											"s_geo_north.gif");
							sap.firefly.SharedMimes.MAP_SOUTH_DOWN = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.MAP_ICONS,
											"s_geo_south.gif");
							sap.firefly.SharedMimes.MAP_ZOOM_IN = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.MAP_ICONS,
											"s_geo_zoin.gif");
							sap.firefly.SharedMimes.MAP_ZOOM_OUT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.MAP_ICONS,
											"s_geo_zout.gif");
							sap.firefly.SharedMimes.MAP_FULL_EXTENT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.MAP_ICONS,
											"s_geo_full_extent.gif");
							sap.firefly.SharedMimes.MAP_PAN = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.MAP_ICONS,
											"s_geo_pan.gif");
							sap.firefly.SharedMimes.MAP_SELECT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.MAP_ICONS,
											"s_geo_select.gif");
							sap.firefly.SharedMimes.PATTERN_MODERN = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.PATTERNS,
											"modern/");
							sap.firefly.SharedMimes.PATTERN_MODERN_BACKGROUND = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.PATTERN_MODERN,
											"background_top.jpg");
							sap.firefly.SharedMimes.PATTERN_MODERN_CORNER_TOP_LEFT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.PATTERN_MODERN,
											"corner_top_left.gif");
							sap.firefly.SharedMimes.PATTERN_MODERN_CORNER_TOP_RIGHT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.PATTERN_MODERN,
											"corner_top_right.gif");
							sap.firefly.SharedMimes.PATTERN_MODERN_CORNER_BOTTOM_LEFT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.PATTERN_MODERN,
											"corner_bottom_left.gif");
							sap.firefly.SharedMimes.PATTERN_MODERN_CORNER_BOTTOM_RIGHT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.PATTERN_MODERN,
											"corner_bottom_right.gif");
							sap.firefly.SharedMimes.PATTERN_MODERN_LINE_TOP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.PATTERN_MODERN,
											"line_top.gif");
							sap.firefly.SharedMimes.PATTERN_MODERN_LINE_BOTTOM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.PATTERN_MODERN,
											"line_bottom.gif");
							sap.firefly.SharedMimes.PATTERN_MODERN_LINE_LEFT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.PATTERN_MODERN,
											"line_left.gif");
							sap.firefly.SharedMimes.PATTERN_MODERN_LINE_RIGHT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.PATTERN_MODERN,
											"line_right.gif");
							sap.firefly.SharedMimes.PERSONALIZE_ICON = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.VARSCREEN_ICONS,
											"h_add.gif");
							sap.firefly.SharedMimes.UNPERSONALIZE_ICON = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.VARSCREEN_ICONS,
											"h_remove.gif");
							sap.firefly.SharedMimes.PERSONALIZE_ALL_ICON = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.VARSCREEN_ICONS,
											"h_add_all.gif");
							sap.firefly.SharedMimes.UNPERSONALIZE_ALL_ICON = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.VARSCREEN_ICONS,
											"h_remove_all.gif");
							sap.firefly.SharedMimes.UR_UNSORTED = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_CSS,
											"urSTIconUnsorted");
							sap.firefly.SharedMimes.UR_SORT_ASCENDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_CSS,
											"urSTIconSortAsc");
							sap.firefly.SharedMimes.UR_SORT_DESCENDING = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_CSS,
											"urSTIconSortDesc");
							sap.firefly.SharedMimes.UR_FILTER = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_CSS,
											"urSTFltIcon");
							sap.firefly.SharedMimes.UR_HIERARCHY_LEAF = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_UR,
											"/treeview/ico12_treeleaf.gif");
							sap.firefly.SharedMimes.UR_HIERARCHY_TOP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_UR,
											"/saptable/ico12_open_top.gif");
							sap.firefly.SharedMimes.UR_HIERARCHY_BOTTOM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_UR,
											"/treeview/ico12_treebranch_open.gif");
							sap.firefly.SharedMimes.UR_HIERARCHY_LEFT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_UR,
											"/geomap/ico12_west.gif");
							sap.firefly.SharedMimes.UR_HIERARCHY_RIGHT = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_UR,
											"/treeview/ico12_treebranch_closed.gif");
							sap.firefly.SharedMimes.UR_DROP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_UR,
											"/dragdrop/drop.gif");
							sap.firefly.SharedMimes.UR_NO_DROP = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_UR,
											"/dragdrop/nodrop.gif");
							sap.firefly.SharedMimes.UR_FIRST_PAGE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_UR,
											"/tableview/ico12_v_pag_first_page.gif");
							sap.firefly.SharedMimes.UR_LAST_PAGE = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_UR,
											"/tableview/ico12_v_pag_last_page.gif");
							sap.firefly.SharedMimes.UR_PREV_ITEM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_UR,
											"/tableview/ico12_v_pag_prev_item.gif");
							sap.firefly.SharedMimes.UR_NEXT_ITEM = sap.firefly.XString
									.concatenate2(
											sap.firefly.SharedMimes.TYPE_UR,
											"/tableview/ico12_v_pag_next_item.gif");
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ServiceTypeInfo",
				sap.firefly.XObject,
				{
					createServiceConfigInternal : function(application) {
						var serviceConfigReferenceName = this
								.getServiceConfigReferenceName();
						var regService = sap.firefly.RegistrationService
								.getInstance();
						var references = regService
								.getReferences(serviceConfigReferenceName);
						var registeredClass;
						var serviceConfig;
						if (references.size() === 1) {
							registeredClass = references.get(0);
							serviceConfig = registeredClass
									.newInstance(application);
							serviceConfig.setServiceTypeInfo(this);
							serviceConfig.setupConfig(application);
							return serviceConfig;
						}
						throw sap.firefly.XException
								.createIllegalStateException("more than one reference for service config");
					},
					getServiceReferenceName : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getServiceConfigReferenceName : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.SigSelParser",
				sap.firefly.XObject,
				{
					$statics : {
						create : function() {
							var newObj = new sap.firefly.SigSelParser();
							newObj.setup();
							return newObj;
						}
					},
					m_defaultComponentType : null,
					setup : function() {
						this.m_defaultComponentType = null;
					},
					setDefaultComponentType : function(type) {
						this.m_defaultComponentType = type;
					},
					parse : function(sigSelExpression) {
						var ops = sap.firefly.XList.create();
						var messages = sap.firefly.MessageManager
								.createMessageManager();
						var splitString;
						var i;
						var segment;
						var folderString;
						var parent;
						var j;
						var op;
						var element;
						var typeSel;
						var end;
						var isId;
						var opType;
						var propIndex;
						var property;
						var arrayStart;
						var arrayEnd;
						var arrayContent;
						var firstChar;
						var number;
						if (sigSelExpression !== null) {
							splitString = sap.firefly.XStringTokenizer
									.splitString(sigSelExpression, ",");
							for (i = 0; i < splitString.size(); i++) {
								segment = splitString.get(i);
								folderString = sap.firefly.XStringTokenizer
										.splitString(segment, "/");
								parent = null;
								for (j = 0; j < folderString.size(); j++) {
									op = sap.firefly.SigSelOperation.create();
									if (j === 0) {
										ops.add(op);
									} else {
										if (parent !== null) {
											parent.setChild(op);
										}
									}
									element = folderString.get(j);
									if (sap.firefly.XString.startsWith(element,
											"#")) {
										op
												.setDomain(sap.firefly.SigSelDomain.UI);
										element = sap.firefly.XString
												.substring(element, 1, -1);
									} else {
										if (sap.firefly.XString.startsWith(
												element, "%")) {
											op
													.setDomain(sap.firefly.SigSelDomain.DATA);
											element = sap.firefly.XString
													.substring(element, 1, -1);
										}
									}
									if (sap.firefly.XString.startsWith(element,
											"?")) {
										typeSel = null;
										end = sap.firefly.XString.indexOf(
												element, ":");
										if (end !== -1) {
											typeSel = sap.firefly.XString
													.substring(element, 1, end);
											element = sap.firefly.XString
													.substring(element,
															end + 1, -1);
										} else {
											typeSel = sap.firefly.XString
													.substring(element, 1, -1);
											element = null;
										}
										op
												.setSelectedComponentType(sap.firefly.XComponentType
														.lookupComponentType(typeSel));
									} else {
										op
												.setSelectedComponentType(this.m_defaultComponentType);
									}
									isId = false;
									if (sap.firefly.XStringUtils
											.isNotNullAndNotEmpty(element)) {
										if (sap.firefly.XString.startsWith(
												element, "~")) {
											element = sap.firefly.XString
													.substring(element, 1, -1);
											isId = true;
										}
									}
									opType = sap.firefly.SigSelType.MATCH;
									if (element !== null) {
										propIndex = sap.firefly.XString
												.indexOf(element, ".");
										if (propIndex !== -1) {
											property = sap.firefly.XString
													.substring(element,
															propIndex + 1, -1);
											op.setSelectedProperty(property);
											element = sap.firefly.XString
													.substring(element, 0,
															propIndex);
										}
										arrayStart = sap.firefly.XString
												.indexOf(element, "[");
										if (arrayStart !== -1) {
											arrayEnd = sap.firefly.XString
													.indexOfFrom(element, "]",
															arrayStart);
											if (arrayEnd === -1) {
												messages.addError(0,
														"Array end not found");
											} else {
												arrayContent = sap.firefly.XString
														.substring(element,
																arrayStart + 1,
																arrayEnd);
												arrayContent = sap.firefly.XString
														.trim(arrayContent);
												if (sap.firefly.XString
														.size(arrayContent) > 0) {
													firstChar = sap.firefly.XString
															.getCharAt(
																	arrayContent,
																	0);
													if ((firstChar >= 48)
															&& (firstChar <= 57)) {
														number = sap.firefly.XInteger
																.convertStringToIntegerWithDefault(
																		arrayContent,
																		-1);
														if (number >= 0) {
															op
																	.setIndexType(sap.firefly.SigSelIndexType.POSITION);
															op
																	.setIndexPosition(number);
														} else {
															messages
																	.addError(
																			0,
																			"Not a valid index");
														}
													} else {
														op
																.setIndexType(sap.firefly.SigSelIndexType.NAME);
														op
																.setIndexName(arrayContent);
													}
												}
											}
											element = sap.firefly.XString
													.substring(element, 0,
															arrayStart);
										}
										if (sap.firefly.XString.isEqual(
												element, "*")) {
											opType = sap.firefly.SigSelType.WILDCARD;
										} else {
											if (isId) {
												op.setId(element);
												opType = sap.firefly.SigSelType.MATCH_ID;
											} else {
												op.setName(element);
												opType = sap.firefly.SigSelType.MATCH_NAME;
											}
										}
									}
									op.setOperationType(opType);
									parent = op;
								}
							}
						}
						return sap.firefly.ExtResult.create(ops, messages);
					}
				});
$Firefly.createClass("sap.firefly.UiManagerFactory", sap.firefly.XObject, {
	$statics : {
		s_uiManagerFactory : null,
		staticSetup : function() {
			var defaultFactory = new sap.firefly.UiManagerFactory();
			sap.firefly.UiManagerFactory.setUiManagerFactory(defaultFactory);
		},
		newInstance : function(application) {
			return sap.firefly.UiManagerFactory.s_uiManagerFactory
					.newUiManagerInstance(application);
		},
		setUiManagerFactory : function(factory) {
			sap.firefly.UiManagerFactory.s_uiManagerFactory = factory;
		}
	},
	newUiManagerInstance : function(application) {
		return null;
	}
});
$Firefly.createClass("sap.firefly.DpBindingInteger", sap.firefly.XObject,
		{
			$statics : {
				create : function() {
					return new sap.firefly.DpBindingInteger();
				}
			},
			m_sender : null,
			m_receiver : null,
			getComponentType : function() {
				return sap.firefly.RuntimeComponentType.BINDING_ADAPTER_INT;
			},
			releaseObject : function() {
				if (this.m_sender !== null) {
					this.m_sender.unregisterValueChangedListener(this);
					this.m_sender.releaseObject();
					this.m_sender = null;
				}
				this.m_receiver = sap.firefly.XObject
						.releaseIfNotNull(this.m_receiver);
				sap.firefly.DpBindingInteger.$superclass.releaseObject
						.call(this);
			},
			bind : function(sender, receiver) {
				this.m_sender = sender;
				this.m_receiver = receiver;
				if (this.m_sender !== null) {
					this.m_sender.registerValueChangedListener(this, null);
				}
				this.transport();
			},
			onBindingValueChanged : function(sender, customIdentifier) {
				this.transport();
			},
			transport : function() {
				var intValue;
				if ((this.m_sender !== null)
						&& (this.m_sender.isSenderValueReady())) {
					intValue = this.m_sender.getIntegerValue();
					this.m_receiver.setIntegerValue(intValue);
				}
			},
			getSender : function() {
				return this.m_sender;
			},
			getReceiver : function() {
				return this.m_receiver;
			}
		});
$Firefly.createClass("sap.firefly.DpBindingJson", sap.firefly.XObject,
		{
			$statics : {
				create : function() {
					return new sap.firefly.DpBindingJson();
				}
			},
			m_sender : null,
			m_receiver : null,
			releaseObject : function() {
				if (this.m_sender !== null) {
					this.m_sender.unregisterValueChangedListener(this);
					this.m_sender.releaseObject();
					this.m_sender = null;
				}
				this.m_receiver = sap.firefly.XObject
						.releaseIfNotNull(this.m_receiver);
				sap.firefly.DpBindingJson.$superclass.releaseObject.call(this);
			},
			getComponentType : function() {
				return sap.firefly.RuntimeComponentType.BINDING_ADAPTER_JSON;
			},
			bind : function(sender, receiver) {
				this.m_sender = sender;
				this.m_receiver = receiver;
				if (this.m_sender !== null) {
					this.m_sender.registerValueChangedListener(this, null);
				}
				this.transport();
			},
			onBindingValueChanged : function(sender, customIdentifier) {
				this.transport();
			},
			transport : function() {
				var element;
				if ((this.m_sender !== null) && (this.m_receiver !== null)
						&& (this.m_sender.isSenderValueReady())) {
					element = this.m_sender.getElement();
					this.m_receiver.setElement(element);
				}
			},
			getSender : function() {
				return this.m_sender;
			},
			getReceiver : function() {
				return this.m_receiver;
			}
		});
$Firefly.createClass("sap.firefly.DpBindingString", sap.firefly.XObject,
		{
			$statics : {
				create : function() {
					return new sap.firefly.DpBindingString();
				}
			},
			m_sender : null,
			m_receiver : null,
			releaseObject : function() {
				if (this.m_sender !== null) {
					this.m_sender.unregisterValueChangedListener(this);
					this.m_sender.releaseObject();
					this.m_sender = null;
				}
				this.m_receiver = sap.firefly.XObject
						.releaseIfNotNull(this.m_receiver);
				sap.firefly.DpBindingString.$superclass.releaseObject
						.call(this);
			},
			getComponentType : function() {
				return sap.firefly.RuntimeComponentType.BINDING_ADAPTER_STRING;
			},
			bind : function(sender, receiver) {
				this.m_sender = sender;
				this.m_receiver = receiver;
				if (this.m_sender !== null) {
					this.m_sender.registerValueChangedListener(this, null);
				}
				this.transport();
			},
			onBindingValueChanged : function(sender, customIdentifier) {
				this.transport();
			},
			transport : function() {
				var stringValue;
				if ((this.m_sender !== null)
						&& (this.m_sender.isSenderValueReady())) {
					stringValue = this.m_sender.getStringValue();
					this.m_receiver.setStringValue(stringValue);
				}
			},
			getSender : function() {
				return this.m_sender;
			},
			getReceiver : function() {
				return this.m_receiver;
			}
		});
$Firefly
		.createClass(
				"sap.firefly.ServerMetadata",
				sap.firefly.XObject,
				{
					$statics : {
						PR_CAPABILITIES : "Capabilities",
						PR_CAPABILITIESDEV : "CapabilitiesDev",
						PR_SERVICES : "Services",
						PR_SERVICE : "Service",
						PR_SERVER_INFO : "ServerInfo",
						PR_SETTINGS : "Settings",
						PR_SI_REENTRANCE_TICKET : "ReentranceTicket",
						PR_SI_SERVER_TYPE : "ServerType",
						PR_SI_SYSTEM_ID : "SystemId",
						PR_SI_CLIENT : "Client",
						PR_SI_VERSION : "Version",
						PR_SI_BUILD_TIME : "BuildTime",
						PR_SI_LANGUAGE : "UserLanguageCode",
						create : function(session, rootElement) {
							var object = new sap.firefly.ServerMetadata();
							object.setup(session, rootElement);
							return object;
						},
						createBetaCapabilitiesContainer : function(
								currentService) {
							var name = currentService
									.getStringByName(sap.firefly.ServerMetadata.PR_SERVICE);
							var container = sap.firefly.CapabilityContainer
									.create(name);
							var capabilitiesList = currentService
									.getListByName(sap.firefly.ServerMetadata.PR_CAPABILITIESDEV);
							var capabilitiesSize;
							var idxCapability;
							var structureByIndex;
							var capabilityName;
							var value;
							if (capabilitiesList !== null) {
								capabilitiesSize = capabilitiesList.size();
								for (idxCapability = 0; idxCapability < capabilitiesSize; idxCapability++) {
									structureByIndex = capabilitiesList
											.getStructureByIndex(idxCapability);
									capabilityName = structureByIndex
											.getStringByName(sap.firefly.CapabilityContainer.PR_CAPABILITY);
									value = structureByIndex
											.getStringByName(sap.firefly.CapabilityContainer.PR_VALUE);
									container
											.addCapabilityInfo(sap.firefly.Capability
													.createCapabilityInfo(
															capabilityName,
															value));
								}
							}
							return container;
						},
						createCapabilitiesContainer : function(currentService) {
							var name = currentService
									.getStringByName(sap.firefly.ServerMetadata.PR_SERVICE);
							var container = sap.firefly.CapabilityContainer
									.create(name);
							var capabilitiesList = currentService
									.getListByName(sap.firefly.ServerMetadata.PR_CAPABILITIES);
							var capabilitiesSize;
							var idxCapability;
							var structureByIndex;
							var capabilityName;
							var msg;
							var value;
							if (capabilitiesList !== null) {
								capabilitiesSize = capabilitiesList.size();
								for (idxCapability = 0; idxCapability < capabilitiesSize; idxCapability++) {
									structureByIndex = capabilitiesList
											.getStructureByIndex(idxCapability);
									capabilityName = structureByIndex
											.getStringByName(sap.firefly.CapabilityContainer.PR_CAPABILITY);
									if (capabilityName === null) {
										msg = sap.firefly.XStringBuffer
												.create();
										msg
												.append("WARNING: found capability with empty (NULL) name.");
										msg
												.append("This capability will be ignored. The current service is: ");
										msg.append(name);
										sap.firefly.XLogger.println(msg
												.toString());
										msg.releaseObject();
										continue;
									}
									value = structureByIndex
											.getStringByName(sap.firefly.CapabilityContainer.PR_VALUE);
									container
											.addCapabilityInfo(sap.firefly.Capability
													.createCapabilityInfo(
															capabilityName,
															value));
								}
							}
							return container;
						}
					},
					m_session : null,
					m_rootStructure : null,
					m_serverServiceMetadata : null,
					m_serverBetaServiceMetadata : null,
					m_properties : null,
					releaseObject : function() {
						this.m_properties = sap.firefly.XObject
								.releaseIfNotNull(this.m_properties);
						this.m_serverServiceMetadata = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_serverServiceMetadata);
						this.m_serverBetaServiceMetadata = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_serverBetaServiceMetadata);
						this.m_rootStructure = null;
						this.m_session = null;
						sap.firefly.ServerMetadata.$superclass.releaseObject
								.call(this);
					},
					setup : function(session, rootElement) {
						var services;
						var size;
						var i;
						var capabilitiesContainer;
						this.m_session = session;
						this.m_properties = sap.firefly.XProperties.create();
						this.m_serverServiceMetadata = sap.firefly.XHashMapByString
								.create();
						this.m_serverBetaServiceMetadata = sap.firefly.XHashMapByString
								.create();
						this.m_rootStructure = rootElement;
						if (this.m_rootStructure !== null) {
							if (this.m_rootStructure
									.hasValueByName(sap.firefly.ServerMetadata.PR_SERVICES)) {
								services = this.m_rootStructure
										.getListByName(sap.firefly.ServerMetadata.PR_SERVICES);
								size = services.size();
								for (i = 0; i < size; i++) {
									capabilitiesContainer = sap.firefly.ServerMetadata
											.createCapabilitiesContainer(services
													.getStructureByIndex(i));
									this.m_serverServiceMetadata.putIfNotNull(
											capabilitiesContainer.getName(),
											capabilitiesContainer);
									if (sap.firefly.XString.isEqual(
											capabilitiesContainer.getName(),
											sap.firefly.ServerService.ANALYTIC)) {
										this.m_serverBetaServiceMetadata
												.putIfNotNull(
														sap.firefly.ServerService.ANALYTIC,
														sap.firefly.ServerMetadata
																.createBetaCapabilitiesContainer(services
																		.getStructureByIndex(i)));
									}
								}
							}
							this
									.readProperties(sap.firefly.ServerMetadata.PR_SETTINGS);
							this
									.readProperties(sap.firefly.ServerMetadata.PR_SERVER_INFO);
						} else {
							this.m_serverBetaServiceMetadata.put(
									sap.firefly.ServerService.ANALYTIC,
									sap.firefly.CapabilityContainer
											.create(null));
							this.m_serverServiceMetadata.put(
									sap.firefly.ServerService.ANALYTIC,
									sap.firefly.CapabilityContainer
											.create(null));
						}
					},
					readProperties : function(name) {
						var serverInfo;
						var structureElementNames;
						var j;
						var key;
						var value;
						if ((this.m_rootStructure.hasValueByName(name))
								&& (this.m_rootStructure
										.getElementTypeByName(name) === sap.firefly.PrElementType.STRUCTURE)) {
							serverInfo = this.m_rootStructure
									.getStructureByName(name);
							structureElementNames = serverInfo
									.getStructureElementNames();
							for (j = 0; j < structureElementNames.size(); j++) {
								key = structureElementNames.get(j);
								if (serverInfo.getElementTypeByName(key) !== sap.firefly.PrElementType.STRING) {
									continue;
								}
								value = serverInfo.getStringByName(key);
								this.m_properties.put(key, value);
							}
						}
					},
					getBetaMetadataForAnalytic : function() {
						return this.m_serverBetaServiceMetadata
								.getByKey(sap.firefly.ServerService.ANALYTIC);
					},
					getMetadataForService : function(name) {
						return this.m_serverServiceMetadata.getByKey(name);
					},
					getProperties : function() {
						return this.m_properties;
					},
					getType : function() {
						return this.m_properties
								.getByKey(sap.firefly.ServerMetadata.PR_SI_SERVER_TYPE);
					},
					getVersion : function() {
						return this.m_properties
								.getByKey(sap.firefly.ServerMetadata.PR_SI_VERSION);
					},
					getId : function() {
						return this.m_properties
								.getByKey(sap.firefly.ServerMetadata.PR_SI_SYSTEM_ID);
					},
					getBuildTime : function() {
						return this.m_properties
								.getByKey(sap.firefly.ServerMetadata.PR_SI_BUILD_TIME);
					},
					getClient : function() {
						return this.m_properties
								.getByKey(sap.firefly.ServerMetadata.PR_SI_CLIENT);
					},
					getUserLanguage : function() {
						return this.m_properties
								.getByKey(sap.firefly.ServerMetadata.PR_SI_LANGUAGE);
					},
					getReentranceTicket : function() {
						return this.m_properties
								.getByKey(sap.firefly.ServerMetadata.PR_SI_REENTRANCE_TICKET);
					},
					getServices : function() {
						return this.m_serverServiceMetadata
								.getKeysAsReadOnlyListOfString();
					},
					getSession : function() {
						return this.m_session;
					},
					toString : function() {
						return this.m_rootStructure.toString();
					},
					systemSupportsAnalyticCapability : function(capabilityName) {
						var capabilityContainer;
						if (!sap.firefly.XStringUtils
								.isNullOrEmpty(capabilityName)) {
							capabilityContainer = this
									.getMetadataForService(sap.firefly.ServerService.ANALYTIC);
							if ((capabilityContainer !== null)
									&& capabilityContainer
											.containsKey(capabilityName)) {
								return true;
							}
							capabilityContainer = this
									.getBetaMetadataForAnalytic();
							return (capabilityContainer !== null)
									&& capabilityContainer
											.containsKey(capabilityName);
						}
						return false;
					}
				});
$Firefly.createClass("sap.firefly.ServiceType", sap.firefly.ServiceTypeInfo, {
	$statics : {
		create : function(serviceReferenceName, serviceSetupReferenceName) {
			var st = new sap.firefly.ServiceType();
			st.setup(serviceSetupReferenceName, serviceReferenceName);
			return st;
		},
		createType : function(serviceName) {
			var st = new sap.firefly.ServiceType();
			var serviceSetupReferenceName = sap.firefly.XStringUtils
					.concatenate3(
							sap.firefly.RegistrationService.SERVICE_CONFIG,
							".", serviceName);
			var serviceReferenceName = sap.firefly.XStringUtils.concatenate3(
					sap.firefly.RegistrationService.SERVICE, ".", serviceName);
			st.setup(serviceSetupReferenceName, serviceReferenceName);
			return st;
		}
	},
	m_srvConfigReferenceName : null,
	m_serviceReferenceName : null,
	setup : function(serviceConfigReferenceName, serviceReferenceName) {
		this.m_srvConfigReferenceName = serviceConfigReferenceName;
		this.m_serviceReferenceName = serviceReferenceName;
	},
	createServiceConfig : function(application) {
		return this.createServiceConfigInternal(application);
	},
	getServiceReferenceName : function() {
		return this.m_serviceReferenceName;
	},
	getServiceConfigReferenceName : function() {
		return this.m_srvConfigReferenceName;
	},
	toString : function() {
		var sb = sap.firefly.XStringBuffer.create();
		if (this.m_srvConfigReferenceName !== null) {
			sb.append(this.m_srvConfigReferenceName);
			sb.appendNewLine();
		}
		if (this.m_serviceReferenceName !== null) {
			sb.append(this.m_serviceReferenceName);
			sb.appendNewLine();
		}
		return sb.toString();
	}
});
$Firefly.createClass("sap.firefly.DfApplicationContext", sap.firefly.XObject, {
	m_application : null,
	setupApplicationContext : function(application) {
		this.setApplication(application);
	},
	releaseObject : function() {
		this.m_application = null;
		sap.firefly.DfApplicationContext.$superclass.releaseObject.call(this);
	},
	getSession : function() {
		return this.getApplication();
	},
	getApplication : function() {
		return sap.firefly.XWeakReferenceUtil.getHardRef(this.m_application);
	},
	getApplicationBase : function() {
		return sap.firefly.XWeakReferenceUtil.getHardRef(this.m_application);
	},
	setApplication : function(application) {
		this.m_application = sap.firefly.XWeakReferenceUtil
				.getWeakRef(application);
	},
	toString : function() {
		var sb = sap.firefly.XStringBuffer.create();
		if (this.m_application !== null) {
			sb.append(this.m_application.toString());
		}
		return sb.toString();
	}
});
$Firefly.createClass("sap.firefly.ConnectionCacheItem",
		sap.firefly.DfNameObject, {
			$statics : {
				create : function(name, element) {
					var item = new sap.firefly.ConnectionCacheItem();
					item.setName(name);
					item.m_value = element;
					item.m_timestamp = sap.firefly.XSystemUtils
							.getCurrentTimeInMilliseconds();
					return item;
				}
			},
			m_value : null,
			m_timestamp : 0,
			releaseObject : function() {
				this.m_value = null;
				sap.firefly.ConnectionCacheItem.$superclass.releaseObject
						.call(this);
			},
			getItem : function() {
				return this.m_value;
			},
			getTimestamp : function() {
				return this.m_timestamp;
			}
		});
$Firefly
		.createClass(
				"sap.firefly.SystemConnect",
				sap.firefly.DfNameObject,
				{
					$statics : {
						create : function(connectionPool, systemName,
								systemDescription) {
							var newObj = new sap.firefly.SystemConnect();
							newObj._setupSystemConnect(connectionPool,
									systemName, systemDescription);
							return newObj;
						},
						_checkList : function(list) {
							var i;
							for (i = 0; i < list.size();) {
								if (list.get(i).isReleased()) {
									list.removeAt(i);
								} else {
									i++;
								}
							}
						},
						clearConnectionsFromList : function(connections) {
							if (connections !== null) {
								while (connections.size() > 0) {
									connections.get(0).releaseObject();
								}
							}
						}
					},
					m_connectionPool : null,
					m_traceInfo : null,
					m_cache : null,
					m_isBatchEnabled : false,
					m_reentranceTicket : null,
					m_dirtyConnections : null,
					m_sharedConnections : null,
					m_privateConnections : null,
					m_systemDescription : null,
					m_maximumSharedConnections : 0,
					m_currentSharedIndex : 0,
					m_internalConnectionCounter : 0,
					m_authenticationToken : null,
					_setupSystemConnect : function(connectionPool, systemName,
							systemDescription) {
						this.m_connectionPool = sap.firefly.XWeakReferenceUtil
								.getWeakRef(connectionPool);
						this.setName(systemName);
						this.m_sharedConnections = sap.firefly.XList.create();
						this.m_privateConnections = sap.firefly.XList.create();
						this.m_dirtyConnections = sap.firefly.XList.create();
						this.m_systemDescription = systemDescription;
						this.m_maximumSharedConnections = 1;
					},
					releaseObject : function() {
						this.clearConnections();
						this.m_cache = sap.firefly.XObject
								.releaseIfNotNull(this.m_cache);
						this.m_connectionPool = null;
						this.m_dirtyConnections = sap.firefly.XObject
								.releaseIfNotNull(this.m_dirtyConnections);
						this.m_privateConnections = sap.firefly.XObject
								.releaseIfNotNull(this.m_privateConnections);
						this.m_sharedConnections = sap.firefly.XObject
								.releaseIfNotNull(this.m_sharedConnections);
						this.m_reentranceTicket = null;
						this.m_systemDescription = null;
						this.m_traceInfo = null;
						sap.firefly.SystemConnect.$superclass.releaseObject
								.call(this);
					},
					_checkReleasedConnections : function() {
						sap.firefly.SystemConnect
								._checkList(this.m_sharedConnections);
						sap.firefly.SystemConnect
								._checkList(this.m_privateConnections);
						sap.firefly.SystemConnect
								._checkList(this.m_dirtyConnections);
					},
					getConnectionExt : function(isPrivate, name) {
						var sysConnections;
						var connectionContainer = null;
						var functionFactory;
						var value;
						if (isPrivate) {
							sysConnections = this.getPrivateConnections();
						} else {
							sysConnections = this.getSharedConnections();
							connectionContainer = this
									.getNextSharedConnection(name);
						}
						if (connectionContainer === null) {
							connectionContainer = sap.firefly.ConnectionContainer
									.create(this, this.getSystemName(),
											isPrivate,
											this.m_internalConnectionCounter);
							this.m_internalConnectionCounter++;
							functionFactory = sap.firefly.RpcHttpFunctionFactory
									.create(connectionContainer);
							connectionContainer
									.setFunctionFactory(functionFactory);
							connectionContainer.setReentranceTicket(this
									.getReentranceTicket());
							connectionContainer.setName(name);
							if (this.m_systemDescription.getSystemType() === sap.firefly.SystemType.BW) {
								value = sap.firefly.XEnvironment
										.getVariable(sap.firefly.XEnvironmentConstants.HTTP_ALLOW_URI_SESSION);
								if ((value === null)
										|| sap.firefly.XString.isEqual("true",
												value)
										|| sap.firefly.XString.isEqual("TRUE",
												value)) {
									connectionContainer
											.setUseUrlSessionId(true);
								}
							}
							sysConnections.add(connectionContainer);
						}
						return connectionContainer;
					},
					getNextSharedConnection : function(name) {
						var connection = null;
						var i;
						var j;
						for (i = 0; i < this.m_sharedConnections.size();) {
							connection = this.m_sharedConnections.get(i);
							if (connection.isDirty()) {
								this.m_dirtyConnections.add(connection);
								this.m_sharedConnections.removeAt(i);
							} else {
								i++;
							}
						}
						if (name !== null) {
							for (j = 0; j < this.m_sharedConnections.size(); j++) {
								connection = this.m_sharedConnections.get(j);
								if (sap.firefly.XString.isEqual(name,
										connection.getName())) {
									return connection;
								}
							}
						}
						if (this.m_sharedConnections.size() >= this.m_maximumSharedConnections) {
							if (this.m_currentSharedIndex >= this.m_sharedConnections
									.size()) {
								this.m_currentSharedIndex = 0;
							}
							connection = this.m_sharedConnections
									.get(this.m_currentSharedIndex);
							if ((connection.getName() === null)
									&& (name !== null)) {
								connection.setName(name);
							}
							this.m_currentSharedIndex++;
							return connection;
						}
						return null;
					},
					getTraceInfo : function() {
						return this.m_traceInfo;
					},
					setTraceInfo : function(traceInfo) {
						this.m_traceInfo = traceInfo;
					},
					getCache : function() {
						return this.m_cache;
					},
					setCache : function(cache) {
						this.m_cache = cache;
					},
					isBatchEnabled : function() {
						return this.m_isBatchEnabled;
					},
					setIsBatchEnabled : function(isBatchEnabled) {
						this.m_isBatchEnabled = isBatchEnabled;
					},
					getReentranceTicket : function() {
						return this.m_reentranceTicket;
					},
					setReentranceTicket : function(reentranceTicket) {
						this.m_reentranceTicket = reentranceTicket;
					},
					getAllOpenConnections : function(allOpenConnections) {
						var i;
						var k;
						for (i = 0; i < this.m_sharedConnections.size(); i++) {
							allOpenConnections.add(this.m_sharedConnections
									.get(i));
						}
						for (k = 0; k < this.m_privateConnections.size(); k++) {
							allOpenConnections.add(this.m_privateConnections
									.get(k));
						}
						return allOpenConnections;
					},
					getSharedConnections : function() {
						return this.m_sharedConnections;
					},
					getPrivateConnections : function() {
						return this.m_privateConnections;
					},
					clearConnections : function() {
						sap.firefly.SystemConnect
								.clearConnectionsFromList(this.m_sharedConnections);
						sap.firefly.SystemConnect
								.clearConnectionsFromList(this.m_privateConnections);
					},
					getSystemName : function() {
						return this.getName();
					},
					getSystemDescription : function() {
						return this.m_systemDescription;
					},
					setMaximumSharedConnections : function(
							maximumSharedConnections) {
						this.m_maximumSharedConnections = maximumSharedConnections;
					},
					getMaximumSharedConnections : function() {
						return this.m_maximumSharedConnections;
					},
					getConnectionPoolBase : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_connectionPool);
					},
					getAuthenticationToken : function() {
						return this.m_authenticationToken;
					},
					setAuthenticationToken : function(token) {
						this.m_authenticationToken = token;
					}
				});
$Firefly.createClass("sap.firefly.SigSelOperation", sap.firefly.DfNameObject, {
	$statics : {
		create : function() {
			var newObj = new sap.firefly.SigSelOperation();
			newObj.m_arrayAccess = sap.firefly.SigSelIndexType.NONE;
			newObj.m_domain = sap.firefly.SigSelDomain.NONE;
			return newObj;
		}
	},
	m_domain : null,
	m_identifier : null,
	m_selectedComponentType : null,
	m_property : null,
	m_operationType : null,
	m_child : null,
	m_arrayAccess : null,
	m_indexName : null,
	m_indexNumber : 0,
	setId : function(identifier) {
		this.m_identifier = identifier;
	},
	getId : function() {
		return this.m_identifier;
	},
	getDomain : function() {
		return this.m_domain;
	},
	setDomain : function(domain) {
		this.m_domain = domain;
	},
	setSelectedComponentType : function(type) {
		this.m_selectedComponentType = type;
	},
	getSelectedComponentType : function() {
		return this.m_selectedComponentType;
	},
	getSelectedProperty : function() {
		return this.m_property;
	},
	setSelectedProperty : function(property) {
		this.m_property = property;
	},
	getOperationType : function() {
		return this.m_operationType;
	},
	setOperationType : function(type) {
		this.m_operationType = type;
	},
	getChild : function() {
		return this.m_child;
	},
	setChild : function(op) {
		this.m_child = op;
	},
	getIndexType : function() {
		return this.m_arrayAccess;
	},
	setIndexType : function(type) {
		this.m_arrayAccess = type;
	},
	getIndexName : function() {
		return this.m_indexName;
	},
	setIndexName : function(name) {
		this.m_indexName = name;
	},
	getIndexPosition : function() {
		return this.m_indexNumber;
	},
	setIndexPosition : function(position) {
		this.m_indexNumber = position;
	},
	toString : function() {
		var buffer = sap.firefly.XStringBuffer.create();
		if (this.m_operationType !== null) {
			buffer.append("OpType: ");
			buffer.append(this.m_operationType.getName());
			buffer.appendNewLine();
		}
		if (this.getName() !== null) {
			buffer.append("Name: ");
			buffer.append(this.getName());
			buffer.appendNewLine();
		}
		if (this.m_identifier !== null) {
			buffer.append("Id: ");
			buffer.append(this.m_identifier);
			buffer.appendNewLine();
		}
		if (this.m_selectedComponentType !== null) {
			buffer.append("ComponentType: ");
			buffer.append(this.m_selectedComponentType.getName());
			buffer.appendNewLine();
		}
		if (this.m_property !== null) {
			buffer.append("Property: ");
			buffer.append(this.m_property);
			buffer.appendNewLine();
		}
		return buffer.toString();
	}
});
$Firefly
		.createClass(
				"sap.firefly.Application",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(session, version) {
							var application = new sap.firefly.Application();
							application.setup(session, version);
							return application;
						}
					},
					m_session : null,
					m_releaseSession : false,
					m_messageManager : null,
					m_connectionPool : null,
					m_systemLandscape : null,
					m_uiManager : null,
					m_olapEnvironment : null,
					m_sapStatisticsEnabled : false,
					m_serviceRegistry : null,
					m_dataProviders : null,
					m_applicationName : null,
					m_logger : null,
					m_structureCache : null,
					m_referenceCounter : null,
					m_extendedContext : null,
					setup : function(session, version) {
						if (session === null) {
							this.m_session = sap.firefly.DefaultSession
									.createWithVersion(null, version);
							this.m_releaseSession = true;
						} else {
							this.m_session = session;
							this.m_releaseSession = false;
						}
						this.m_structureCache = sap.firefly.XHashMapByString
								.create();
						this.m_referenceCounter = sap.firefly.XHashMapByString
								.create();
						this.setErrorManager(sap.firefly.MessageManager
								.createMessageManager());
						this.m_connectionPool = sap.firefly.ConnectionPool
								.create(this);
						this.m_logger = sap.firefly.XLogger.getLogger();
						this.m_dataProviders = sap.firefly.XList.create();
						this.m_sapStatisticsEnabled = false;
						sap.firefly.ApplicationFactory._register(this);
					},
					releaseObject : function() {
						if (this.m_session !== null) {
							this.releaseDataProviders();
							this.releaseServices();
							sap.firefly.ApplicationFactory._unregister(this);
							this.m_extendedContext = sap.firefly.XObject
									.releaseIfNotNull(this.m_extendedContext);
							this.m_logger = null;
							this.m_connectionPool = sap.firefly.XObject
									.releaseIfNotNull(this.m_connectionPool);
							this.m_messageManager = sap.firefly.XObject
									.releaseIfNotNull(this.m_messageManager);
							if (this.m_releaseSession) {
								this.m_session.releaseObject();
							}
							this.m_systemLandscape = sap.firefly.XObject
									.releaseIfNotNull(this.m_systemLandscape);
							this.m_uiManager = sap.firefly.XObject
									.releaseIfNotNull(this.m_uiManager);
							this.m_olapEnvironment = sap.firefly.XObject
									.releaseIfNotNull(this.m_olapEnvironment);
							this.m_structureCache = sap.firefly.XCollectionUtils
									.releaseEntriesAndCollectionIfNotNull(this.m_structureCache);
							this.m_referenceCounter = sap.firefly.XCollectionUtils
									.releaseEntriesAndCollectionIfNotNull(this.m_referenceCounter);
							this.m_applicationName = null;
							this.m_session = null;
						}
						sap.firefly.Application.$superclass.releaseObject
								.call(this);
					},
					releaseDataProviders : function() {
						var count;
						var dataProvider;
						if (this.m_dataProviders !== null) {
							while (this.m_dataProviders.size() > 0) {
								count = this.m_dataProviders.size();
								dataProvider = this.m_dataProviders.get(0);
								if (dataProvider.isReleased() === false) {
									dataProvider.releaseObject();
								}
								if (count === this.m_dataProviders.size()) {
									throw sap.firefly.XException
											.createIllegalStateException("DataProvider was not correctly released from storage");
								}
							}
						}
					},
					releaseServices : function() {
						var keys;
						var idxKey;
						var key;
						var services;
						var idxService;
						var service;
						if (this.m_serviceRegistry !== null) {
							keys = this.m_serviceRegistry
									.getKeysAsReadOnlyListOfString();
							for (idxKey = 0; idxKey < keys.size(); idxKey++) {
								key = keys.get(idxKey);
								services = this.m_serviceRegistry.getByKey(key);
								if ((services !== null)
										&& (services.isReleased() !== true)) {
									for (idxService = 0; idxService < services
											.size(); idxService++) {
										service = services.get(idxService);
										if ((service !== null)
												&& (service.isReleased() === false)) {
											service.releaseObject();
										}
									}
									services.clear();
									services.releaseObject();
								}
							}
							this.m_serviceRegistry.releaseObject();
							this.m_serviceRegistry = null;
						}
					},
					getApplication : function() {
						return this;
					},
					getErrorManager : function() {
						return this.m_messageManager;
					},
					setErrorManager : function(errorManager) {
						this.m_messageManager = errorManager;
					},
					getSystemLandscape : function() {
						return this.m_systemLandscape;
					},
					setLandscape : function(systemLandscape) {
						this.m_systemLandscape = systemLandscape;
					},
					getConnectionPool : function() {
						return this.m_connectionPool;
					},
					createFileObject : function(path) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						sb.append("Application");
						sb.appendNewLine();
						if (this.m_messageManager !== null) {
							sb.appendNewLine();
							sb.append(this.m_messageManager.toString());
						}
						return sb.toString();
					},
					getUiManager : function() {
						if (this.m_uiManager === null) {
							this.m_uiManager = sap.firefly.UiManagerFactory
									.newInstance(this);
						}
						return this.m_uiManager;
					},
					getOlapEnvironment : function() {
						if (this.m_olapEnvironment === null) {
							this.m_olapEnvironment = sap.firefly.OlapEnvironmentFactory
									.newInstance(this);
						}
						return this.m_olapEnvironment;
					},
					getWorkingTaskManager : function() {
						return this.m_session.getWorkingTaskManager();
					},
					getDataProviders : function() {
						return this.m_dataProviders;
					},
					registerDataProvider : function(dataProvider) {
						if (dataProvider !== null) {
							this.m_dataProviders.add(dataProvider);
						}
					},
					unregisterDataProvider : function(dataProvider) {
						if (dataProvider !== null) {
							this.m_dataProviders.removeElement(dataProvider);
						}
					},
					registerService : function(service) {
						var serviceConfig;
						var serviceTypeInfo;
						var serviceName;
						var services;
						var i;
						var existingService;
						if (service === null) {
							return;
						}
						serviceConfig = service.getServiceConfig();
						if (serviceConfig === null) {
							return;
						}
						serviceTypeInfo = serviceConfig.getServiceTypeInfo();
						if (serviceTypeInfo === null) {
							return;
						}
						serviceName = serviceTypeInfo.getServiceReferenceName();
						if (serviceName === null) {
							return;
						}
						if (this.m_serviceRegistry === null) {
							this.m_serviceRegistry = sap.firefly.XHashMapByString
									.create();
						}
						services = this.m_serviceRegistry.getByKey(serviceName);
						if (services === null) {
							services = sap.firefly.XList.create();
							this.m_serviceRegistry.put(serviceName, services);
						}
						for (i = 0; i < services.size(); i++) {
							existingService = services.get(i);
							if (service === existingService) {
								return;
							}
						}
						services.add(service);
					},
					unregisterService : function(service) {
						var serviceConfig;
						var serviceTypeInfo;
						var serviceName;
						var services;
						var i;
						var existingService;
						if (service !== null) {
							serviceConfig = service.getServiceConfig();
							if (serviceConfig !== null) {
								serviceTypeInfo = serviceConfig
										.getServiceTypeInfo();
								if (serviceTypeInfo !== null) {
									serviceName = serviceTypeInfo
											.getServiceReferenceName();
									if (serviceName !== null) {
										if (this.m_serviceRegistry !== null) {
											services = this.m_serviceRegistry
													.getByKey(serviceName);
											if (services !== null) {
												for (i = 0; i < services.size(); i++) {
													existingService = services
															.get(i);
													if (service === existingService) {
														services.removeAt(i);
														break;
													}
												}
											}
										}
									}
								}
							}
						}
					},
					getServices : function(serviceType) {
						var serviceName;
						var services;
						if (serviceType !== null) {
							serviceName = serviceType.getServiceReferenceName();
							if (serviceName !== null) {
								if (this.m_serviceRegistry !== null) {
									services = this.m_serviceRegistry
											.getByKey(serviceName);
									if ((services !== null)
											&& (services.size() > 0)) {
										return services;
									}
								}
							}
						}
						return null;
					},
					getApplicationName : function() {
						return this.m_applicationName;
					},
					setApplicationName : function(name) {
						this.m_applicationName = name;
					},
					createNextInstanceId : function() {
						return sap.firefly.XGuid.getGuid();
					},
					getMemoryManager : function() {
						return this.getSession().getMemoryManager();
					},
					addWarning : function(warning) {
						this.getSession().addMessage(warning);
					},
					addMessage : function(message) {
						this.getSession().addMessage(message);
					},
					getNextSid : function() {
						return this.m_session.getNextSid();
					},
					getAppSessionId : function() {
						return this.getSession().getAppSessionId();
					},
					setAppSessionId : function(appSessionId) {
						this.getSession().setAppSessionId(appSessionId);
					},
					getSessionSingletons : function() {
						return this.getSession().getSessionSingletons();
					},
					setDefaultSyncType : function(syncType) {
						this.m_session.setDefaultSyncType(syncType);
					},
					getSession : function() {
						return this.m_session;
					},
					writelog : function(logline) {
						this.m_logger.writelog(logline);
					},
					setLogger : function(logger) {
						this.m_logger = logger;
					},
					getDefaultSyncType : function() {
						return this.m_session.getDefaultSyncType();
					},
					getListenerProcessor : function() {
						return this.m_session.getListenerProcessor();
					},
					setListenerProcessor : function(processor) {
						this.m_session.setListenerProcessor(processor);
					},
					getVersion : function() {
						return this.m_session.getVersion();
					},
					increaseCounter : function(identifier) {
						var counter;
						if (this.m_referenceCounter.containsKey(identifier)) {
							counter = this.m_referenceCounter
									.getByKey(identifier);
							counter
									.setIntegerValue(counter.getIntegerValue() + 1);
						} else {
							this.m_referenceCounter.put(identifier,
									sap.firefly.XIntegerValue.create(1));
						}
					},
					setStructureCacheEntry : function(key, entry) {
						if ((key !== null) && (entry !== null)) {
							this.increaseCounter(key);
							if (this.m_structureCache.containsKey(key) === false) {
								this.m_structureCache.put(key, entry);
							}
						}
					},
					getStructureCacheEntry : function(key) {
						return this.m_structureCache.getByKey(key);
					},
					_setExtendedContext : function(context) {
						this.m_extendedContext = context;
					},
					_getExtendedContext : function() {
						return this.m_extendedContext;
					},
					deleteStructureCacheEntry : function(key) {
						var counter;
						if (this.m_referenceCounter.containsKey(key)) {
							counter = this.m_referenceCounter.getByKey(key);
							if (counter.getIntegerValue() === 1) {
								counter.releaseObject();
								this.m_referenceCounter.remove(key);
								this.m_structureCache.remove(key);
							} else {
								counter.setIntegerValue(counter
										.getIntegerValue() - 1);
							}
						}
					},
					isSapStatisticsEnabled : function() {
						return this.m_sapStatisticsEnabled;
					},
					setSapStatisticsEnabled : function(enabled) {
						this.m_sapStatisticsEnabled = enabled;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.Capability",
				sap.firefly.XNameValuePair,
				{
					$statics : {
						createCapabilityInfo : function(name, value) {
							var object;
							if (name === null) {
								throw sap.firefly.XException
										.createIllegalArgumentException("'Name' of a capability may not be NULL");
							}
							object = new sap.firefly.Capability();
							object.setName(name);
							object.setValue(value);
							return object;
						}
					}
				});
$Firefly.createClass("sap.firefly.ConnectionCache", sap.firefly.XObject, {
	$statics : {
		create : function() {
			var obj = new sap.firefly.ConnectionCache();
			obj.m_entries = sap.firefly.XListOfNameObject.create();
			obj.m_isEnabled = false;
			obj.m_hitCount = 0;
			obj.m_maxCount = 1000;
			obj.m_timeout = 10000;
			return obj;
		}
	},
	m_entries : null,
	m_isEnabled : false,
	m_maxCount : 0,
	m_timeout : 0,
	m_hitCount : 0,
	releaseObject : function() {
		if (this.m_entries !== null) {
			this.m_entries.clear();
			this.m_entries.releaseObject();
			this.m_entries = null;
		}
		sap.firefly.ConnectionCache.$superclass.releaseObject.call(this);
	},
	isEnabled : function() {
		return this.m_isEnabled;
	},
	setEnabled : function(isEnabled) {
		this.m_isEnabled = isEnabled;
	},
	clear : function() {
		this.m_entries.clear();
	},
	size : function() {
		return this.m_entries.size();
	},
	isEmpty : function() {
		return this.m_entries.isEmpty();
	},
	hasElements : function() {
		return this.m_entries.hasElements();
	},
	put : function(key, element, debugHint) {
		var hasChanged = false;
		var current;
		var firstItem;
		var point;
		var pair;
		if (this.m_timeout !== -1) {
			current = sap.firefly.XSystemUtils.getCurrentTimeInMilliseconds();
			while (this.m_entries.size() > 0) {
				firstItem = this.m_entries.get(0);
				point = firstItem.getTimestamp() + this.m_timeout;
				if (point < current) {
					this.m_entries.removeAt(0);
					hasChanged = true;
				} else {
					break;
				}
			}
		}
		if (hasChanged === false) {
			if (this.m_entries.size() > this.m_maxCount) {
				this.m_entries.removeAt(0);
			}
		}
		pair = sap.firefly.ConnectionCacheItem.create(key, element);
		this.m_entries.add(pair);
	},
	getByKey : function(key) {
		var pair = this.m_entries.getByKey(key);
		if (pair !== null) {
			this.m_hitCount++;
			return pair.getItem();
		}
		return null;
	},
	setTimeout : function(timeout) {
		this.m_timeout = timeout;
	},
	getTimeout : function() {
		return this.m_timeout;
	},
	setMaxCount : function(maxCount) {
		this.m_maxCount = maxCount;
	},
	getMaxCount : function() {
		return this.m_maxCount;
	},
	getHitCount : function() {
		return this.m_hitCount;
	}
});
$Firefly
		.createClass(
				"sap.firefly.ConnectionContainer",
				sap.firefly.MessageManager,
				{
					$statics : {
						create : function(systemConnect, systemName, isPrivate,
								internalCounter) {
							var connectionContainer = new sap.firefly.ConnectionContainer();
							connectionContainer.setupContainer(systemConnect,
									systemName, isPrivate, internalCounter);
							return connectionContainer;
						},
						createFailedConnectionContainer : function(
								systemConnect, systemName, message) {
							var connectionContainer = new sap.firefly.ConnectionContainer();
							connectionContainer.setupContainer(systemConnect,
									systemName, true, 0);
							connectionContainer
									.addError(
											sap.firefly.ErrorCodes.OTHER_ERROR,
											message);
							return connectionContainer;
						},
						checkSecondaryServerMetadata : function(primary,
								secondary) {
							var resultPrimary = primary;
							if (resultPrimary === null) {
								if ((secondary !== null)
										&& (secondary.getSyncState() === sap.firefly.SyncState.IN_SYNC)
										&& (secondary.isValid())) {
									resultPrimary = secondary;
								}
							}
							if ((resultPrimary !== null)
									&& (resultPrimary.hasErrors())) {
								resultPrimary.releaseObject();
								resultPrimary = null;
							}
							return resultPrimary;
						}
					},
					m_name : null,
					m_systemName : null,
					m_systemConnect : null,
					m_traceInfo : null,
					m_batchModePath : null,
					m_batchFunctions : null,
					m_cache : null,
					m_functionFactory : null,
					m_systemDescription : null,
					m_internalCounter : 0,
					m_sysModCounter : 0,
					m_isBatchModeEnabled : false,
					m_supportsBatchMode : false,
					m_isPrivate : false,
					m_reentranceTicket : null,
					m_useSessionUrlRewrite : false,
					m_sessionUrlRewrite : null,
					m_logoffSent : false,
					m_crossSiteForgeryToken : null,
					m_boeSessionToken : null,
					m_serverMetadataFetcherBlocking : null,
					m_serverMetadataFetcherNonBlocking : null,
					setupContainer : function(systemConnect, systemName,
							isPrivate, internalCounter) {
						var connectionPool;
						var systemDescription;
						this.setup();
						this.m_systemConnect = sap.firefly.XWeakReferenceUtil
								.getWeakRef(systemConnect);
						this.m_systemName = systemName;
						this.m_isPrivate = isPrivate;
						if (systemConnect !== null) {
							connectionPool = systemConnect
									.getConnectionPoolBase();
							systemDescription = connectionPool
									.getSystemLandscape().getSystemDescription(
											this.m_systemName);
							this.m_systemDescription = sap.firefly.XWeakReferenceUtil
									.getWeakRef(systemDescription);
							this.m_sysModCounter = systemDescription
									.getSysModCounter();
							this.m_internalCounter = internalCounter;
							if (systemName !== null) {
								this.m_traceInfo = connectionPool
										.getTraceInfo(systemName);
								this.m_cache = connectionPool
										.getCache(systemName);
							}
						}
					},
					getDefaultMessageLayer : function() {
						return sap.firefly.OriginLayer.IOLAYER;
					},
					releaseObject : function() {
						var systemConnect;
						if (this.m_serverMetadataFetcherBlocking !== null) {
							this.m_serverMetadataFetcherBlocking
									.releaseObject();
							this.m_serverMetadataFetcherBlocking = null;
						}
						if (this.m_serverMetadataFetcherNonBlocking !== null) {
							this.m_serverMetadataFetcherNonBlocking
									.releaseObject();
							this.m_serverMetadataFetcherNonBlocking = null;
						}
						this.logoff();
						systemConnect = sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_systemConnect);
						this.m_systemConnect = null;
						this.m_batchFunctions = null;
						this.m_batchModePath = null;
						this.m_cache = null;
						this.m_crossSiteForgeryToken = null;
						this.m_functionFactory = null;
						this.m_name = null;
						this.m_reentranceTicket = null;
						if (this.m_systemDescription !== null) {
							this.m_systemDescription.releaseObject();
							this.m_systemDescription = null;
						}
						this.m_systemName = null;
						this.m_traceInfo = null;
						this.m_sessionUrlRewrite = null;
						sap.firefly.ConnectionContainer.$superclass.releaseObject
								.call(this);
						if (systemConnect !== null) {
							systemConnect._checkReleasedConnections();
						}
					},
					getComponentName : function() {
						return "ConnectionContainer";
					},
					logoff : function() {
						var systemType;
						var logoffPath;
						var closeFunction;
						var request;
						if (this.m_logoffSent === false) {
							systemType = this.getSystemDescription()
									.getSystemType();
							logoffPath = sap.firefly.ConnectionConstants
									.getLogoffPath(systemType);
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(logoffPath)) {
								this.m_logoffSent = true;
								this.removePendingBatchFunctions();
								closeFunction = this.newRpcFunction(logoffPath);
								request = closeFunction.getRequest();
								request
										.setMethod(sap.firefly.HttpRequestMethod.HTTP_GET);
								closeFunction.processFunctionExecution(
										sap.firefly.SyncType.BLOCKING, null,
										null);
							}
						}
					},
					removePendingBatchFunctions : function() {
						if (this.isBatchModeEnabled() === false) {
							return;
						}
						this.m_isBatchModeEnabled = false;
						this.m_batchFunctions = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_batchFunctions);
					},
					getSystemDescription : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_systemDescription);
					},
					getCookiesForPath : function(path) {
						var connectionPool = this.getConnectionPool();
						var cookiesMasterStore = connectionPool
								.getCookiesMasterStore();
						var domain = this.getSystemDescription().getHost();
						var cookies = null;
						if (domain !== null) {
							cookies = cookiesMasterStore.getCookies(domain,
									path);
						}
						return cookies;
					},
					mergeCookies : function(path, responseCookies) {
						var connectionPool = this.getConnectionPool();
						var cookiesMasterStore = connectionPool
								.getCookiesMasterStore();
						var domain = this.getSystemDescription().getHost();
						cookiesMasterStore.applyCookies(domain, path,
								responseCookies);
					},
					getReentranceTicket : function() {
						var tmp = this.m_reentranceTicket;
						this.m_reentranceTicket = null;
						return tmp;
					},
					setReentranceTicket : function(ticket) {
						this.m_reentranceTicket = ticket;
					},
					getCsrfToken : function() {
						return this.m_crossSiteForgeryToken;
					},
					setCsrfToken : function(csrfToken) {
						this.m_crossSiteForgeryToken = csrfToken;
					},
					getBoeSessionToken : function() {
						return this.m_boeSessionToken;
					},
					setBoeSessionToken : function(boeSessionToken) {
						this.m_boeSessionToken = boeSessionToken;
					},
					getServerMetadata : function() {
						var extResult = this.getServerMetadataExt(
								sap.firefly.SyncType.BLOCKING, null, null,
								false);
						return extResult.getData();
					},
					getServerMetadataExt : function(syncType, listener,
							customIdentifier, revalidate) {
						var myServerMetadataFetcher;
						if (revalidate) {
							if (this.m_serverMetadataFetcherBlocking === this.m_serverMetadataFetcherNonBlocking) {
								if ((this.m_serverMetadataFetcherBlocking !== null)
										&& (this.m_serverMetadataFetcherBlocking
												.getSyncState() === sap.firefly.SyncState.IN_SYNC)) {
									this.m_serverMetadataFetcherBlocking
											.releaseObject();
									this.m_serverMetadataFetcherBlocking = null;
									this.m_serverMetadataFetcherNonBlocking
											.releaseObject();
									this.m_serverMetadataFetcherNonBlocking = null;
								}
							} else {
								if ((this.m_serverMetadataFetcherBlocking !== null)
										&& (this.m_serverMetadataFetcherBlocking
												.getSyncState() === sap.firefly.SyncState.IN_SYNC)) {
									this.m_serverMetadataFetcherBlocking
											.releaseObject();
									this.m_serverMetadataFetcherBlocking = null;
								}
								if ((this.m_serverMetadataFetcherNonBlocking !== null)
										&& (this.m_serverMetadataFetcherNonBlocking
												.getSyncState() === sap.firefly.SyncState.IN_SYNC)) {
									this.m_serverMetadataFetcherNonBlocking
											.releaseObject();
									this.m_serverMetadataFetcherNonBlocking = null;
								}
							}
						}
						myServerMetadataFetcher = null;
						if (syncType === sap.firefly.SyncType.BLOCKING) {
							this.m_serverMetadataFetcherBlocking = sap.firefly.ConnectionContainer
									.checkSecondaryServerMetadata(
											this.m_serverMetadataFetcherBlocking,
											this.m_serverMetadataFetcherNonBlocking);
							myServerMetadataFetcher = this.m_serverMetadataFetcherBlocking;
						} else {
							this.m_serverMetadataFetcherNonBlocking = sap.firefly.ConnectionContainer
									.checkSecondaryServerMetadata(
											this.m_serverMetadataFetcherNonBlocking,
											this.m_serverMetadataFetcherBlocking);
							myServerMetadataFetcher = this.m_serverMetadataFetcherNonBlocking;
						}
						if (myServerMetadataFetcher === null) {
							myServerMetadataFetcher = sap.firefly.ServerMetadataAction
									.createAndRun(syncType, this, listener,
											customIdentifier);
							if (syncType === sap.firefly.SyncType.BLOCKING) {
								this.m_serverMetadataFetcherBlocking = myServerMetadataFetcher;
							} else {
								this.m_serverMetadataFetcherNonBlocking = myServerMetadataFetcher;
							}
						} else {
							myServerMetadataFetcher.attachListener(listener,
									sap.firefly.ListenerType.SPECIFIC,
									customIdentifier);
						}
						return myServerMetadataFetcher;
					},
					newRpcFunction : function(name) {
						var relativeUri = sap.firefly.XUri.createFromUri(name);
						return this.newRpcFunctionByUri(relativeUri);
					},
					newRpcFunctionByService : function(serviceName) {
						var serverMetadata = this.getServerMetadata();
						var capabilities = serverMetadata
								.getMetadataForService(serviceName);
						var fastPath = capabilities
								.getByKey(sap.firefly.ConnectionConstants.FAST_PATH);
						var path;
						var systemDesc;
						var systemType;
						if (fastPath !== null) {
							path = fastPath.getValue();
						} else {
							systemDesc = this.getSystemDescription();
							systemType = systemDesc.getSystemType();
							path = sap.firefly.ConnectionConstants
									.getInAPath(systemType);
						}
						return this.newRpcFunction(path);
					},
					newRpcFunctionByUri : function(relativeUri) {
						var batchFunction;
						if (this.isBatchModeEnabled()) {
							batchFunction = sap.firefly.RpcBatchFunction
									.create(this, relativeUri);
							this.m_batchFunctions.add(batchFunction);
							return batchFunction;
						}
						return this.m_functionFactory
								.newRpcFunction(relativeUri);
					},
					setFunctionFactory : function(functionFactory) {
						this.m_functionFactory = functionFactory;
					},
					getApplication : function() {
						return this.getSystemConnect().getConnectionPoolBase()
								.getApplication();
					},
					getSession : function() {
						return this.getSystemConnect().getConnectionPoolBase()
								.getSession();
					},
					getTraceInfo : function() {
						return this.m_traceInfo;
					},
					isBatchModeEnabled : function() {
						return this.m_isBatchModeEnabled;
					},
					getBatchFunctions : function() {
						return this.m_batchFunctions;
					},
					getBatchQueueSize : function() {
						if (this.m_batchFunctions === null) {
							return 0;
						}
						return this.m_batchFunctions.size();
					},
					setBatchModeEnabled : function(syncType, enable) {
						var batchStructure;
						var requestList;
						var batchSize;
						var i;
						var rpcBatchFunction;
						var syncState;
						var request;
						var requestStructure;
						var decorator;
						var requestStructureFlat;
						var flatIndex;
						var batchExecutionRpcFunction;
						var batchRequest;
						if (this.m_supportsBatchMode) {
							if (this.m_isBatchModeEnabled !== enable) {
								this.m_isBatchModeEnabled = enable;
								if (enable) {
									this.m_batchFunctions = sap.firefly.XList
											.create();
								} else {
									if (this.m_batchFunctions.hasElements()) {
										batchStructure = sap.firefly.PrStructure
												.create();
										requestList = batchStructure
												.setNewListByName(sap.firefly.ConnectionConstants.INA_BATCH);
										batchSize = this.m_batchFunctions
												.size();
										for (i = 0; i < batchSize;) {
											rpcBatchFunction = this.m_batchFunctions
													.get(i);
											syncState = rpcBatchFunction
													.getSyncState();
											if (syncState !== sap.firefly.SyncState.PROCESSING) {
												this.m_batchFunctions
														.removeAt(i);
												continue;
											}
											i++;
											request = rpcBatchFunction
													.getRequest();
											requestStructure = request
													.getRequestStructure();
											decorator = sap.firefly.BatchRequestDecoratorFactory
													.getBatchRequestDecorator(
															this.getSession(),
															requestStructure);
											if (decorator === null) {
												requestList
														.add(requestStructure);
											} else {
												rpcBatchFunction
														.setDecorator(decorator);
												requestStructureFlat = decorator
														.getRequestItems();
												if (requestStructureFlat !== null) {
													for (flatIndex = 0; flatIndex < requestStructureFlat
															.size(); flatIndex++) {
														requestList
																.add(requestStructureFlat
																		.get(flatIndex));
													}
												}
											}
										}
										batchExecutionRpcFunction = this.m_functionFactory
												.newRpcFunction(this.m_batchModePath);
										batchRequest = batchExecutionRpcFunction
												.getRequest();
										batchRequest
												.setMethod(sap.firefly.HttpRequestMethod.HTTP_POST);
										batchRequest
												.setAcceptContentType(sap.firefly.HttpContentType.APPLICATION_JSON);
										batchRequest
												.setRequestStructure(batchStructure);
										batchExecutionRpcFunction
												.processFunctionExecution(
														syncType, this,
														this.m_batchFunctions);
										batchStructure.releaseObject();
									}
									this.m_batchFunctions = null;
								}
							}
						}
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var batchFunctions = customIdentifier;
						var batchFunctionSize;
						var idxBatchFunction;
						var rootElement;
						var batchList;
						var flattenOffset;
						var k;
						var batchFunction;
						var batchFunctionResponse;
						var decorator;
						var batchRootElement;
						var flatSize;
						var responseStructureFlat;
						var flatIndex;
						var batchRootElementFlat;
						var responseStructureDeep;
						if (batchFunctions.isReleased()) {
							throw sap.firefly.XException
									.createRuntimeException("Fatal error: Batch functions object is not valid anymore");
						}
						batchFunctionSize = batchFunctions.size();
						for (idxBatchFunction = 0; idxBatchFunction < batchFunctionSize; idxBatchFunction++) {
							batchFunctions.get(idxBatchFunction)
									.addAllMessages(extResult);
						}
						if (extResult.isValid()) {
							rootElement = response.getRootElement();
							batchList = rootElement
									.getListByName(sap.firefly.ConnectionConstants.INA_BATCH);
							if (batchList !== null) {
								flattenOffset = 0;
								for (k = 0; k < batchFunctions.size(); k++) {
									batchFunction = batchFunctions.get(k);
									batchFunctionResponse = batchFunction
											.getResponse();
									decorator = batchFunction.getDecorator();
									if (decorator === null) {
										batchRootElement = batchList
												.getStructureByIndex(flattenOffset);
										batchFunctionResponse.setRootElement(
												batchRootElement, null);
										flattenOffset++;
									} else {
										flatSize = decorator.getItemsSize();
										responseStructureFlat = sap.firefly.XList
												.create();
										for (flatIndex = 0; flatIndex < flatSize; flatIndex++) {
											batchRootElementFlat = batchList
													.getStructureByIndex(flattenOffset
															+ flatIndex);
											responseStructureFlat
													.add(batchRootElementFlat);
										}
										responseStructureDeep = decorator
												.buildResponse(responseStructureFlat);
										batchFunctionResponse.setRootElement(
												responseStructureDeep, null);
										flattenOffset = flattenOffset
												+ flatSize;
									}
								}
							} else {
								for (idxBatchFunction = 0; idxBatchFunction < batchFunctionSize; idxBatchFunction++) {
									batchFunctions.get(idxBatchFunction)
											.getResponse().setRootElement(
													rootElement, null);
								}
							}
						}
						for (idxBatchFunction = 0; idxBatchFunction < batchFunctionSize; idxBatchFunction++) {
							batchFunctions.get(idxBatchFunction).endSync();
						}
						batchFunctions.releaseObject();
					},
					supportsBatchMode : function() {
						return this.m_supportsBatchMode;
					},
					setSupportsBatchMode : function(supportsBatchMode, path) {
						var systemName;
						this.m_supportsBatchMode = supportsBatchMode;
						this.m_batchModePath = sap.firefly.XUri
								.createFromUri(path);
						if (supportsBatchMode) {
							systemName = this.m_systemName;
							if (this.getConnectionPool().isBatchModeEnabled(
									systemName)) {
								this.setBatchModeEnabled(
										sap.firefly.SyncType.BLOCKING, true);
							}
						}
					},
					getConnectionPool : function() {
						return this.getSystemConnect().getConnectionPoolBase();
					},
					getCache : function() {
						return this.m_cache;
					},
					isDirty : function() {
						return ((this.m_systemDescription === null) || (this
								.getSystemDescription().getSysModCounter() !== this.m_sysModCounter));
					},
					setName : function(name) {
						this.m_name = name;
					},
					getName : function() {
						return this.m_name;
					},
					isShared : function() {
						return !this.m_isPrivate;
					},
					isPrivate : function() {
						return this.m_isPrivate;
					},
					isLogoffSent : function() {
						return this.m_logoffSent;
					},
					useSessionUrlRewrite : function() {
						return this.m_useSessionUrlRewrite;
					},
					setUseUrlSessionId : function(useUrlSessionId) {
						this.m_useSessionUrlRewrite = useUrlSessionId;
					},
					getSessionUrlRewrite : function() {
						return this.m_sessionUrlRewrite;
					},
					setSessionUrlRewrite : function(sessionUrlRewrite) {
						var beginIndex;
						var endIndex;
						if (sessionUrlRewrite !== null) {
							beginIndex = sap.firefly.XString.indexOf(
									sessionUrlRewrite, "(");
							endIndex = sap.firefly.XString.indexOf(
									sessionUrlRewrite, ")");
							if ((beginIndex !== -1) && (endIndex !== -1)) {
								this.m_sessionUrlRewrite = sap.firefly.XString
										.substring(sessionUrlRewrite,
												beginIndex, endIndex + 1);
							}
						}
					},
					getSysModCounter : function() {
						return this.m_sysModCounter;
					},
					getSystemConnect : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_systemConnect);
					},
					getAuthenticationToken : function() {
						return this.getSystemConnect().getAuthenticationToken();
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						buffer.append("#");
						buffer.appendInt(this.m_internalCounter);
						buffer.append(": ");
						buffer.append(this.getSystemDescription().toString());
						return buffer.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ConnectionPool",
				sap.firefly.DfApplicationContext,
				{
					$statics : {
						create : function(application) {
							var pool = new sap.firefly.ConnectionPool();
							pool.setupApplicationContext(application);
							return pool;
						}
					},
					m_systemConnectSet : null,
					m_cookiesMasterStore : null,
					setupApplicationContext : function(application) {
						sap.firefly.ConnectionPool.$superclass.setupApplicationContext
								.call(this, application);
						this.m_systemConnectSet = sap.firefly.XSetOfNameObject
								.create();
						this.m_cookiesMasterStore = sap.firefly.HttpCookiesMasterStore
								.create();
					},
					releaseObject : function() {
						this.m_systemConnectSet = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_systemConnectSet);
						sap.firefly.ConnectionPool.$superclass.releaseObject
								.call(this);
					},
					clearConnectionsForSystem : function(systemName) {
						this.getSystemConnect(systemName).clearConnections();
					},
					clearConnections : function() {
						var sci = this.m_systemConnectSet.getIterator();
						var systemConnect;
						while (sci.hasNext()) {
							systemConnect = sci.next();
							systemConnect.clearConnections();
						}
						sci.releaseObject();
					},
					getAllOpenConnections : function() {
						var allOpenConnections = sap.firefly.XList.create();
						var sci = this.m_systemConnectSet.getIterator();
						var systemConnect;
						while (sci.hasNext()) {
							systemConnect = sci.next();
							systemConnect
									.getAllOpenConnections(allOpenConnections);
						}
						sci.releaseObject();
						return allOpenConnections;
					},
					getOpenConnections : function(systemName) {
						var allOpenConnections = sap.firefly.XList.create();
						return this.getSystemConnect(systemName)
								.getAllOpenConnections(allOpenConnections);
					},
					getConnection : function(systemName) {
						return this.getConnectionExt(systemName, false, null);
					},
					getConnectionExt : function(systemName, isPrivate, name) {
						var systemConnect = this.getSystemConnect(systemName);
						var warning;
						if (systemConnect === null) {
							warning = sap.firefly.XStringUtils
									.concatenate3(
											"Could not get system description for alias '",
											systemName, "'");
							this.getSession().addWarning(warning);
							return sap.firefly.ConnectionContainer
									.createFailedConnectionContainer(null,
											null, warning);
						}
						return systemConnect.getConnectionExt(isPrivate, name);
					},
					getSystemLandscape : function() {
						return this.getApplication().getSystemLandscape();
					},
					getSession : function() {
						return this.getApplication().getSession();
					},
					getTraceInfo : function(systemName) {
						var systemConnect = this.getSystemConnect(systemName);
						var traceInfo = systemConnect.getTraceInfo();
						var enableValue = sap.firefly.XEnvironment
								.getVariable(sap.firefly.XEnvironmentConstants.ENABLE_HTTP_FILE_TRACING);
						var enableTracing = sap.firefly.XBoolean
								.convertStringToBooleanWithDefault(enableValue,
										false);
						var tracingFolder;
						var tracingFolderFile;
						if (enableTracing) {
							if ((traceInfo === null)
									|| (traceInfo.getTraceType() !== sap.firefly.TraceType.FILE)) {
								tracingFolder = sap.firefly.XEnvironment
										.getVariable(sap.firefly.XEnvironmentConstants.HTTP_FILE_TRACING_FOLDER);
								if (tracingFolder !== null) {
									tracingFolderFile = sap.firefly.XFile
											.createByNativePath(tracingFolder);
									if (tracingFolderFile.isExisting()
											&& tracingFolderFile.isDirectory()) {
										traceInfo = sap.firefly.TraceInfo
												.create();
										traceInfo
												.setTraceFolderPath(tracingFolder);
										traceInfo
												.setTraceType(sap.firefly.TraceType.FILE);
										traceInfo.setTraceName(this
												.getApplication()
												.getApplicationName());
										systemConnect.setTraceInfo(traceInfo);
										sap.firefly.XLogger
												.println(sap.firefly.XString
														.concatenate2(
																"Enabling file tracing: ",
																tracingFolder));
									}
								}
							}
						}
						return traceInfo;
					},
					getCache : function(systemName) {
						var systemConnect = this.getSystemConnect(systemName);
						var cache = systemConnect.getCache();
						if (cache === null) {
							cache = sap.firefly.ConnectionCache.create();
							systemConnect.setCache(cache);
						}
						return cache;
					},
					setTraceInfo : function(systemName, traceInfo) {
						var systemConnect = this.getSystemConnect(systemName);
						systemConnect.setTraceInfo(traceInfo);
					},
					setAuthenticationToken : function(systemName, token) {
						var systemConnect = this.getSystemConnect(systemName);
						systemConnect.setAuthenticationToken(token);
					},
					getReentranceTicket : function(systemName) {
						return this.getSystemConnect(systemName)
								.getReentranceTicket();
					},
					setReentranceTicket : function(systemName, reentranceTicket) {
						this.getSystemConnect(systemName).setReentranceTicket(
								reentranceTicket);
					},
					enableBatchMode : function(systemName) {
						var sysName = this.resolveSystemName(systemName);
						this.setBatchMode(null, sysName, true);
					},
					executeBatchQueue : function(syncType, systemName) {
						var systemConnect = this.getSystemConnect(systemName);
						var sysName;
						if (systemConnect.isBatchEnabled()) {
							sysName = this.resolveSystemName(systemName);
							this.setBatchMode(syncType, sysName, false);
							this.setBatchMode(syncType, sysName, true);
						}
					},
					getBatchQueueSize : function(systemName) {
						var systemConnect = this.getSystemConnect(systemName);
						var sysConnections = systemConnect
								.getSharedConnections();
						var size = 0;
						var i;
						var connection;
						if (sysConnections !== null) {
							for (i = 0; i < sysConnections.size(); i++) {
								connection = sysConnections.get(i);
								size = size + connection.getBatchQueueSize();
							}
						}
						return size;
					},
					disableBatchMode : function(syncType, systemName) {
						var sysName = this.resolveSystemName(systemName);
						this.setBatchMode(syncType, sysName, false);
					},
					setBatchMode : function(syncType, systemName,
							isBatchEnabled) {
						var systemConnect = this.getSystemConnect(systemName);
						var sysConnections = systemConnect
								.getSharedConnections();
						var i;
						var connection;
						for (i = 0; i < sysConnections.size(); i++) {
							connection = sysConnections.get(i);
							connection.setBatchModeEnabled(syncType,
									isBatchEnabled);
						}
						systemConnect.setIsBatchEnabled(isBatchEnabled);
					},
					isBatchModeEnabled : function(systemName) {
						var systemConnect = this.getSystemConnect(systemName);
						return systemConnect.isBatchEnabled();
					},
					resolveSystemName : function(systemName) {
						if (systemName === null) {
							return this.getSystemLandscape()
									.getMasterSystemName();
						}
						return systemName;
					},
					getMaximumSharedConnections : function(systemName) {
						return this.getSystemConnect(systemName)
								.getMaximumSharedConnections();
					},
					setMaximumSharedConnections : function(systemName,
							maximumSharedConnections) {
						var systemConnect = this.getSystemConnect(systemName);
						if (systemConnect !== null) {
							systemConnect
									.setMaximumSharedConnections(maximumSharedConnections);
						}
					},
					getSystemConnect : function(systemName) {
						var sysName = this.resolveSystemName(systemName);
						var systemConnect = this.m_systemConnectSet
								.getByKey(sysName);
						var connectorLandscape;
						var systemDescription;
						if (systemConnect === null) {
							connectorLandscape = this.getSystemLandscape();
							systemDescription = connectorLandscape
									.getSystemDescription(sysName);
							if (systemDescription === null) {
								throw sap.firefly.XException
										.createIllegalArgumentException(sap.firefly.XString
												.concatenate2(
														"System cannot be resolved: ",
														systemName));
							}
							systemConnect = sap.firefly.SystemConnect.create(
									this, sysName, systemDescription);
							this.m_systemConnectSet.put(systemConnect);
						}
						return systemConnect;
					},
					getCookiesMasterStore : function() {
						return this.m_cookiesMasterStore;
					}
				});
$Firefly.createClass("sap.firefly.SystemRole", sap.firefly.XConstant, {
	$statics : {
		MASTER : null,
		DATA_PROVIDER : null,
		REPOSITORY : null,
		USER_MANAGEMENT : null,
		SYSTEM_LANDSCAPE : null,
		s_roles : null,
		s_lookup : null,
		staticSetup : function() {
			sap.firefly.SystemRole.s_roles = sap.firefly.XList.create();
			sap.firefly.SystemRole.s_lookup = sap.firefly.XHashMapByString
					.create();
			sap.firefly.SystemRole.MASTER = sap.firefly.SystemRole
					.create("Master");
			sap.firefly.SystemRole.DATA_PROVIDER = sap.firefly.SystemRole
					.create("DataProvider");
			sap.firefly.SystemRole.REPOSITORY = sap.firefly.SystemRole
					.create("Repository");
			sap.firefly.SystemRole.USER_MANAGEMENT = sap.firefly.SystemRole
					.create("UserManagement");
			sap.firefly.SystemRole.SYSTEM_LANDSCAPE = sap.firefly.SystemRole
					.create("SystemLandscape");
		},
		create : function(name) {
			var newConstant = new sap.firefly.SystemRole();
			newConstant.setName(name);
			sap.firefly.SystemRole.s_roles.add(newConstant);
			sap.firefly.SystemRole.s_lookup.put(name, newConstant);
			return newConstant;
		},
		getAllRoles : function() {
			return sap.firefly.SystemRole.s_roles;
		},
		lookup : function(name) {
			return sap.firefly.SystemRole.s_lookup.getByKey(name);
		}
	}
});
$Firefly.createClass("sap.firefly.SigSelDomain", sap.firefly.XConstant,
		{
			$statics : {
				UI : null,
				DATA : null,
				NONE : null,
				staticSetup : function() {
					sap.firefly.SigSelDomain.UI = sap.firefly.SigSelDomain
							.create("Ui");
					sap.firefly.SigSelDomain.DATA = sap.firefly.SigSelDomain
							.create("DataProvider");
					sap.firefly.SigSelDomain.NONE = sap.firefly.SigSelDomain
							.create("None");
				},
				create : function(name) {
					var drillState = new sap.firefly.SigSelDomain();
					drillState.setName(name);
					return drillState;
				}
			}
		});
$Firefly.createClass("sap.firefly.SigSelIndexType", sap.firefly.XConstant, {
	$statics : {
		NONE : null,
		NAME : null,
		POSITION : null,
		staticSetup : function() {
			sap.firefly.SigSelIndexType.NONE = sap.firefly.SigSelIndexType
					.create("None");
			sap.firefly.SigSelIndexType.NAME = sap.firefly.SigSelIndexType
					.create("Name");
			sap.firefly.SigSelIndexType.POSITION = sap.firefly.SigSelIndexType
					.create("Position");
		},
		create : function(name) {
			var drillState = new sap.firefly.SigSelIndexType();
			drillState.setName(name);
			return drillState;
		}
	}
});
$Firefly.createClass("sap.firefly.SigSelType", sap.firefly.XConstant, {
	$statics : {
		MATCH : null,
		MATCH_NAME : null,
		MATCH_ID : null,
		WILDCARD : null,
		staticSetup : function() {
			sap.firefly.SigSelType.MATCH = sap.firefly.SigSelType
					.create("Match");
			sap.firefly.SigSelType.MATCH_ID = sap.firefly.SigSelType
					.create("MatchId");
			sap.firefly.SigSelType.MATCH_NAME = sap.firefly.SigSelType
					.create("MatchName");
			sap.firefly.SigSelType.WILDCARD = sap.firefly.SigSelType
					.create("Wildcard");
		},
		create : function(name) {
			var drillState = new sap.firefly.SigSelType();
			drillState.setName(name);
			return drillState;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.DataBindingType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						STRING : null,
						INTEGER : null,
						JSON : null,
						SINGLE : null,
						MULTI : null,
						GRID : null,
						TABLE : null,
						CHART : null,
						COLUMN : null,
						BAR : null,
						LINE : null,
						PIE : null,
						VARIABLEPIE : null,
						BELLCURVE : null,
						AREA : null,
						SPLINE : null,
						WORDCLOUD : null,
						SCATTER : null,
						BUBBLE : null,
						HEATMAP : null,
						TREEMAP : null,
						s_instances : null,
						create : function(name, parent) {
							var newConstant = new sap.firefly.DataBindingType();
							newConstant.setName(name);
							newConstant.setParent(parent);
							sap.firefly.DataBindingType.s_instances.put(name,
									newConstant);
							return newConstant;
						},
						lookup : function(name) {
							var type = sap.firefly.DataBindingType.s_instances
									.getByKey(name);
							return type;
						},
						staticSetup : function() {
							sap.firefly.DataBindingType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.DataBindingType.STRING = sap.firefly.DataBindingType
									.create("String", null);
							sap.firefly.DataBindingType.INTEGER = sap.firefly.DataBindingType
									.create("Integer", null);
							sap.firefly.DataBindingType.JSON = sap.firefly.DataBindingType
									.create("Json", null);
							sap.firefly.DataBindingType.SINGLE = sap.firefly.DataBindingType
									.create("Single",
											sap.firefly.DataBindingType.JSON);
							sap.firefly.DataBindingType.MULTI = sap.firefly.DataBindingType
									.create("Multi",
											sap.firefly.DataBindingType.JSON);
							sap.firefly.DataBindingType.TABLE = sap.firefly.DataBindingType
									.create("Table",
											sap.firefly.DataBindingType.SINGLE);
							sap.firefly.DataBindingType.GRID = sap.firefly.DataBindingType
									.create("Grid",
											sap.firefly.DataBindingType.SINGLE);
							sap.firefly.DataBindingType.CHART = sap.firefly.DataBindingType
									.create("Chart",
											sap.firefly.DataBindingType.SINGLE);
							sap.firefly.DataBindingType.COLUMN = sap.firefly.DataBindingType
									.create("Column",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.BAR = sap.firefly.DataBindingType
									.create("Bar",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.LINE = sap.firefly.DataBindingType
									.create("Line",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.PIE = sap.firefly.DataBindingType
									.create("Pie",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.WORDCLOUD = sap.firefly.DataBindingType
									.create("WordCloud",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.BELLCURVE = sap.firefly.DataBindingType
									.create("BellCurve",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.AREA = sap.firefly.DataBindingType
									.create("Area",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.SCATTER = sap.firefly.DataBindingType
									.create("Scatter",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.SPLINE = sap.firefly.DataBindingType
									.create("Spline",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.VARIABLEPIE = sap.firefly.DataBindingType
									.create("VariablePie",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.BUBBLE = sap.firefly.DataBindingType
									.create("Bubble",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.HEATMAP = sap.firefly.DataBindingType
									.create("Heatmap",
											sap.firefly.DataBindingType.CHART);
							sap.firefly.DataBindingType.TREEMAP = sap.firefly.DataBindingType
									.create("Treemap",
											sap.firefly.DataBindingType.CHART);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.CapabilityContainer",
				sap.firefly.DfNameObject,
				{
					$statics : {
						PR_VALUE : "Value",
						PR_CAPABILITY : "Capability",
						create : function(name) {
							var object = new sap.firefly.CapabilityContainer();
							object.setup(name);
							return object;
						}
					},
					m_capabilities : null,
					clone : function() {
						var clone = sap.firefly.CapabilityContainer.create(this
								.getName());
						clone.m_capabilities = this.m_capabilities
								.createMapByStringCopy();
						return clone;
					},
					setup : function(name) {
						this.setName(name);
						this.m_capabilities = sap.firefly.XHashMapByString
								.create();
					},
					releaseObject : function() {
						this.m_capabilities = sap.firefly.XObject
								.releaseIfNotNull(this.m_capabilities);
						sap.firefly.CapabilityContainer.$superclass.releaseObject
								.call(this);
					},
					addCapabilityInfo : function(capability) {
						this.m_capabilities.put(capability.getName(),
								capability);
					},
					addCapability : function(name) {
						this.m_capabilities.put(name, sap.firefly.Capability
								.createCapabilityInfo(name, null));
					},
					getSortedCapabilityNames : function() {
						var sortedList = sap.firefly.XListOfString.create();
						var iterator = this.m_capabilities
								.getKeysAsIteratorOfString();
						while (iterator.hasNext()) {
							sortedList.add(iterator.next());
						}
						sortedList
								.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
						return sortedList;
					},
					intersect : function(otherCapabilitySelection) {
						var newContainer = sap.firefly.CapabilityContainer
								.create(this.getName());
						var iterator;
						var key;
						var capability;
						if (otherCapabilitySelection !== null) {
							iterator = otherCapabilitySelection
									.getKeysAsIteratorOfString();
							while (iterator.hasNext()) {
								key = iterator.next();
								capability = this.m_capabilities.getByKey(key);
								if (capability !== null) {
									newContainer.addCapabilityInfo(capability);
								}
							}
						}
						return newContainer;
					},
					containsKey : function(key) {
						return this.m_capabilities.containsKey(key);
					},
					getByKey : function(key) {
						return this.m_capabilities.getByKey(key);
					},
					getKeysAsReadOnlyListOfString : function() {
						return this.m_capabilities
								.getKeysAsReadOnlyListOfString();
					},
					getKeysAsIteratorOfString : function() {
						return this.m_capabilities.getKeysAsIteratorOfString();
					},
					getValuesAsReadOnlyList : function() {
						return this.m_capabilities.getValuesAsReadOnlyList();
					},
					getIterator : function() {
						return this.m_capabilities.getIterator();
					},
					contains : function(element) {
						return this.m_capabilities.contains(element);
					},
					remove : function(name) {
						this.m_capabilities.remove(name);
					},
					size : function() {
						return this.m_capabilities.size();
					},
					isEmpty : function() {
						return this.m_capabilities.isEmpty();
					},
					hasElements : function() {
						return this.m_capabilities.hasElements();
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						var capabilities;
						var isFirst;
						buffer
								.append(sap.firefly.CapabilityContainer.$superclass.toString
										.call(this));
						buffer.append(" Capabilities:");
						buffer.appendNewLine();
						buffer.append("{");
						buffer.appendNewLine();
						capabilities = this.m_capabilities.getIterator();
						isFirst = true;
						while (capabilities.hasNext()) {
							if (isFirst === false) {
								buffer.append(", ");
								buffer.appendNewLine();
							} else {
								isFirst = false;
							}
							buffer.append(capabilities.next().toString());
						}
						capabilities.releaseObject();
						buffer.appendNewLine();
						buffer.append("}");
						return buffer.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.SystemDescription",
				sap.firefly.DfApplicationContext,
				{
					$statics : {
						create : function(systemLandscape, name, properties) {
							var systemDescription = new sap.firefly.SystemDescription();
							systemDescription.setup(systemLandscape, name,
									properties);
							return systemDescription;
						},
						createByUri : function(systemLandscape, name, uri) {
							var properties = sap.firefly.XProperties.create();
							var authenticationType;
							var queryElements;
							var size;
							var i;
							var nameValuePair;
							var key;
							var systemDescription;
							properties.put(
									sap.firefly.ConnectionParameters.PROTOCOL,
									uri.getScheme());
							properties.put(
									sap.firefly.ConnectionParameters.HOST, uri
											.getHost());
							properties.setIntegerByName(
									sap.firefly.ConnectionParameters.PORT, uri
											.getPort());
							authenticationType = uri.getAuthenticationType();
							if (authenticationType !== null) {
								properties
										.put(
												sap.firefly.ConnectionParameters.AUTHENTICATION_TYPE,
												authenticationType.getName());
							}
							if (uri.getUser() !== null) {
								properties.put(
										sap.firefly.ConnectionParameters.USER,
										uri.getUser());
							}
							if (uri.getPassword() !== null) {
								properties
										.put(
												sap.firefly.ConnectionParameters.PASSWORD,
												uri.getPassword());
							}
							queryElements = uri.getQueryElements();
							size = queryElements.size();
							for (i = 0; i < size; i++) {
								nameValuePair = queryElements.get(i);
								key = sap.firefly.XString
										.convertToUpperCase(nameValuePair
												.getName());
								properties.put(key, nameValuePair.getValue());
							}
							systemDescription = new sap.firefly.SystemDescription();
							systemDescription.setup(systemLandscape, name,
									properties);
							return systemDescription;
						}
					},
					m_landscape : null,
					m_connectionProperties : null,
					m_systemMappings : null,
					m_systemType : null,
					m_text : null,
					m_name : null,
					m_sysModCounter : 0,
					setup : function(systemLandscape, name, properties) {
						var application = null;
						var prop;
						var propertyIterator;
						var propertyKey;
						var mappingId;
						var serializeTable;
						var serializeSchema;
						var deserializeTable;
						var deserializeSchema;
						if (systemLandscape !== null) {
							application = systemLandscape.getApplication();
						}
						this.setApplication(application);
						this.setLandscape(systemLandscape);
						if (properties === null) {
							this
									.setProperties(sap.firefly.XProperties
											.create());
						} else {
							this.setProperties(properties);
						}
						if (name !== null) {
							this.setName(name);
						}
						this.m_systemMappings = sap.firefly.XHashMapByString
								.create();
						prop = this.getProperties();
						propertyIterator = prop.getKeysAsIteratorOfString();
						while (propertyIterator.hasNext()) {
							propertyKey = propertyIterator.next();
							if (sap.firefly.XString
									.startsWith(
											propertyKey,
											sap.firefly.ConnectionParameters.MAPPING_SYSTEM_NAME)) {
								mappingId = sap.firefly.XString
										.replace(
												propertyKey,
												sap.firefly.ConnectionParameters.MAPPING_SYSTEM_NAME,
												"");
								serializeTable = prop
										.getByKey(sap.firefly.XString
												.concatenate2(
														sap.firefly.ConnectionParameters.MAPPING_SERIALIZATION_TABLE,
														mappingId));
								serializeSchema = prop
										.getByKey(sap.firefly.XString
												.concatenate2(
														sap.firefly.ConnectionParameters.MAPPING_SERIALIZATION_SCHEMA,
														mappingId));
								deserializeTable = prop
										.getByKey(sap.firefly.XString
												.concatenate2(
														sap.firefly.ConnectionParameters.MAPPING_DESERIALIZATION_TABLE,
														mappingId));
								deserializeSchema = prop
										.getByKey(sap.firefly.XString
												.concatenate2(
														sap.firefly.ConnectionParameters.MAPPING_DESERIALIZATION_SCHEMA,
														mappingId));
								this.m_systemMappings.put(prop
										.getByKey(propertyKey),
										sap.firefly.SystemMapping.create(
												serializeTable,
												serializeSchema,
												deserializeTable,
												deserializeSchema));
							}
						}
						this.m_sysModCounter = 1;
					},
					releaseObject : function() {
						this.m_sysModCounter = 0;
						this.m_landscape = sap.firefly.XObject
								.releaseIfNotNull(this.m_landscape);
						this.m_systemMappings = sap.firefly.XObject
								.releaseIfNotNull(this.m_systemMappings);
						this.m_connectionProperties = null;
						sap.firefly.SystemDescription.$superclass.releaseObject
								.call(this);
					},
					getComponentType : function() {
						return sap.firefly.RuntimeComponentType.SYSTEM_DESCRIPTION;
					},
					isNode : function() {
						return false;
					},
					isLeaf : function() {
						return true;
					},
					getHost : function() {
						return this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.HOST);
					},
					getLandscape : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_landscape);
					},
					setLandscape : function(landscape) {
						if (landscape !== null) {
							this.m_landscape = sap.firefly.XWeakReferenceUtil
									.getWeakRef(landscape);
						}
					},
					getPassword : function() {
						return this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.PASSWORD);
					},
					getUser : function() {
						return this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.USER);
					},
					getX509Certificate : function() {
						return this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.X509CERTIFICATE);
					},
					setX509Certificate : function(x509Certificate) {
						this
								.setProperty(
										sap.firefly.ConnectionParameters.X509CERTIFICATE,
										x509Certificate);
					},
					getSecureLoginProfile : function() {
						return this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.SECURE_LOGIN_PROFILE);
					},
					setSecureLoginProfile : function(secureLoginProfile) {
						this
								.setProperty(
										sap.firefly.ConnectionParameters.SECURE_LOGIN_PROFILE,
										secureLoginProfile);
					},
					getLanguage : function() {
						return this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.LANGUAGE);
					},
					setLanguage : function(language) {
						this.setProperty(
								sap.firefly.ConnectionParameters.LANGUAGE,
								language);
					},
					getAuthenticationType : function() {
						var value = this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.AUTHENTICATION_TYPE);
						var type;
						if (value === null) {
							return sap.firefly.AuthenticationType.NONE;
						}
						type = sap.firefly.AuthenticationType.lookup(value);
						return type;
					},
					setAuthenticationType : function(type) {
						this
								.setProperty(
										sap.firefly.ConnectionParameters.AUTHENTICATION_TYPE,
										type.getName());
					},
					setAuthentication : function(type) {
						this
								.setProperty(
										sap.firefly.ConnectionParameters.AUTHENTICATION_TYPE,
										type.getName());
					},
					setHost : function(host) {
						this.setProperty(sap.firefly.ConnectionParameters.HOST,
								host);
					},
					setPassword : function(password) {
						this.setProperty(
								sap.firefly.ConnectionParameters.PASSWORD,
								password);
					},
					setAuthenticationToken : function(token) {
						this.setProperty(
								sap.firefly.ConnectionParameters.TOKEN_VALUE,
								token.getAccessToken());
					},
					getAuthenticationToken : function() {
						var value = this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.TOKEN_VALUE);
						return sap.firefly.XAuthenticationToken.create(value);
					},
					setPort : function(port) {
						var value = sap.firefly.XInteger
								.convertIntegerToString(port);
						this.setProperty(sap.firefly.ConnectionParameters.PORT,
								value);
					},
					getPort : function() {
						var value = this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.PORT);
						var defaultPort = 0;
						var internetProtocolType = this.getProtocolType();
						if (sap.firefly.ProtocolType.HTTP === internetProtocolType) {
							defaultPort = 80;
						} else {
							if (sap.firefly.ProtocolType.HTTPS === internetProtocolType) {
								defaultPort = 443;
							}
						}
						return sap.firefly.XInteger
								.convertStringToIntegerWithDefault(value,
										defaultPort);
					},
					getClient : function() {
						return this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.CLIENT);
					},
					setClient : function(client) {
						this
								.setProperty(
										sap.firefly.ConnectionParameters.CLIENT,
										client);
					},
					setUser : function(user) {
						this.setProperty(sap.firefly.ConnectionParameters.USER,
								user);
					},
					getTimeout : function() {
						return this.m_connectionProperties
								.getIntegerByNameWithDefault(
										sap.firefly.ConnectionParameters.TIMEOUT,
										-1);
					},
					setTimeout : function(milliseconds) {
						this.m_connectionProperties.setIntegerByName(
								sap.firefly.ConnectionParameters.TIMEOUT,
								milliseconds);
					},
					getScheme : function() {
						return this.getProtocolType().getName();
					},
					getProtocolType : function() {
						var typeValue = this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.PROTOCOL);
						if (typeValue !== null) {
							return sap.firefly.ProtocolType.lookup(typeValue);
						}
						return sap.firefly.ProtocolType.HTTP;
					},
					setScheme : function(scheme) {
						this.setProperty(
								sap.firefly.ConnectionParameters.PROTOCOL,
								scheme);
					},
					setProtocolType : function(type) {
						if (type !== null) {
							this.setProperty(
									sap.firefly.ConnectionParameters.PROTOCOL,
									type.getName());
						}
					},
					isMasterSystem : function() {
						var landscape = this.getLandscape();
						if (landscape !== null) {
							return sap.firefly.XString.isEqual(landscape
									.getMasterSystemName(), this.getName());
						}
						return false;
					},
					getServicePath : function() {
						return this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.SERVICE_PATH);
					},
					setServicePath : function(path) {
						this.setProperty(
								sap.firefly.ConnectionParameters.SERVICE_PATH,
								path);
					},
					getPrefix : function() {
						return this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.PREFIX);
					},
					setPrefix : function(prefix) {
						this
								.setProperty(
										sap.firefly.ConnectionParameters.PREFIX,
										prefix);
					},
					getWebdispatcherUri : function() {
						return this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.WEBDISPATCHER_URI);
					},
					setWebdispatcherUri : function(webdispatcherUri) {
						this
								.setProperty(
										sap.firefly.ConnectionParameters.WEBDISPATCHER_URI,
										webdispatcherUri);
					},
					setTags : function(tags) {
						this.setProperty(sap.firefly.ConnectionParameters.TAGS,
								tags);
					},
					getTags : function() {
						var tags = this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.TAGS);
						if (tags !== null) {
							return sap.firefly.XStringTokenizer.splitString(
									tags, ",");
						}
						return sap.firefly.XHashSetOfString.create();
					},
					getRoles : function() {
						var tags = this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.TAGS);
						var roles = sap.firefly.XList.create();
						var roleList;
						var i;
						var roleValue;
						var role;
						if (tags !== null) {
							roleList = sap.firefly.XStringTokenizer
									.splitString(tags, ",");
							for (i = 0; i < roleList.size(); i++) {
								roleValue = roleList.get(i);
								role = sap.firefly.SystemRole.lookup(roleValue);
								if (role !== null) {
									roles.add(role);
								}
							}
						}
						return roles;
					},
					getCapabilitiesPath : function() {
						return this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.CAPABILITIES_PATH);
					},
					setCapabilitiesPath : function(path) {
						this
								.setProperty(
										sap.firefly.ConnectionParameters.CAPABILITIES_PATH,
										path);
					},
					getSystemMapping : function(systemName) {
						return this.m_systemMappings.getByKey(systemName);
					},
					addSystemMapping : function(systemName, serializeTable,
							serializeSchema, deserializeTable,
							deserializeSchema) {
						this.m_systemMappings.put(systemName,
								sap.firefly.SystemMapping.create(
										serializeTable, serializeSchema,
										deserializeTable, deserializeSchema));
						this.m_sysModCounter++;
					},
					getProperties : function() {
						var systemType = this.getSystemType();
						if (systemType !== null) {
							this.m_connectionProperties
									.put(
											sap.firefly.ConnectionParameters.SYSTEM_TYPE,
											systemType.getName());
						}
						this.m_connectionProperties.put(
								sap.firefly.ConnectionParameters.NAME, this
										.getName());
						return this.m_connectionProperties;
					},
					setProperties : function(properties) {
						var sysName;
						var sysType;
						var sysTypeValue;
						this.m_connectionProperties = properties;
						sysName = this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.NAME);
						if (sysName !== null) {
							this.setName(sysName);
						}
						sysType = this.m_connectionProperties
								.getByKey(sap.firefly.ConnectionParameters.SYSTEM_TYPE);
						if (sysType === null) {
							sysType = this.m_connectionProperties
									.getByKey(sap.firefly.ConnectionParameters.SYSTYPE);
						}
						sysTypeValue = null;
						if (sysType !== null) {
							sysTypeValue = sap.firefly.SystemType
									.lookup(sysType);
						}
						if (sysTypeValue === null) {
							sysTypeValue = sap.firefly.SystemType.GENERIC;
						}
						this.setSystemType(sysTypeValue);
						this.m_sysModCounter++;
					},
					setProperty : function(name, value) {
						this.m_connectionProperties.put(name, value);
						if (sap.firefly.XString.isEqual(name,
								sap.firefly.ConnectionParameters.SYSTEM_TYPE)) {
							if (value === null) {
								this
										.setSystemType(sap.firefly.SystemType.GENERIC);
							} else {
								this.setSystemType(sap.firefly.SystemType
										.lookup(value));
							}
						}
						this.m_sysModCounter++;
					},
					getName : function() {
						return this.m_name;
					},
					setName : function(name) {
						this.m_name = name;
					},
					getText : function() {
						return this.m_text;
					},
					setText : function(text) {
						this.m_text = text;
					},
					getSystemType : function() {
						return this.m_systemType;
					},
					setSystemType : function(systemType) {
						this.m_systemType = systemType;
					},
					setFromConnectionInfo : function(origin) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setFromConnection : function(connection) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSysModCounter : function() {
						return this.m_sysModCounter;
					},
					getUriString : function() {
						return sap.firefly.XUri.getUriStringStatic(this, null,
								true, true, true, true, true, true, true);
					},
					getUriStringWithoutAuthentication : function() {
						return sap.firefly.XUri.getUriStringStatic(this, null,
								true, false, false, true, true, true, true);
					},
					getUriStringExt : function(withSchema, withUserPwd,
							withAuthenticationType, withHostPort, withPath,
							withQuery, withFragment) {
						return sap.firefly.XUri.getUriStringStatic(this, null,
								withSchema, withUserPwd,
								withAuthenticationType, withHostPort, withPath,
								withQuery, withFragment);
					},
					getTagValue : function(tagName) {
						return this.m_connectionProperties.getByKey(tagName);
					},
					getContentElement : function() {
						return this;
					},
					getContentConstant : function() {
						return null;
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						var name;
						var text;
						var properties;
						var propertyNames;
						var i;
						var propertyName;
						var propertyValue;
						sb.append("System:");
						name = this.getName();
						if (name !== null) {
							sb.append(" ");
							sb.append(name);
						}
						text = this.getText();
						if (text !== null) {
							sb.append(" - ");
							sb.append(text);
						}
						sb.appendNewLine();
						properties = this.getProperties();
						if (sap.firefly.XCollectionUtils
								.hasElements(properties)) {
							propertyNames = sap.firefly.XListOfString
									.createFromReadOnlyList(properties
											.getKeysAsReadOnlyListOfString());
							propertyNames
									.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
							for (i = 0; i < propertyNames.size(); i++) {
								propertyName = propertyNames.get(i);
								if (propertyName === null) {
									continue;
								}
								sb.append(propertyName);
								sb.append("=");
								if (sap.firefly.XString
										.isEqual(
												propertyName,
												sap.firefly.ConnectionParameters.PASSWORD)) {
									sb.append("**********");
								} else {
									propertyValue = properties
											.getByKey(propertyName);
									if (propertyValue !== null) {
										sb.append(propertyValue);
									}
								}
								sb.appendNewLine();
							}
						}
						return sb.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DjPropertyType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						ROOT : null,
						COMPLEX : null,
						PRIMITIVE : null,
						BOOLEAN : null,
						INTEGER : null,
						DOUBLE : null,
						STRING : null,
						XOBJECT : null,
						CONSTANT : null,
						COMPONENT : null,
						COMPONENT_LIST : null,
						NAMED_COMPONENT_LIST : null,
						NAME : null,
						MAX_LENGTH : null,
						ID : null,
						IS_ENABLED : null,
						ENABLE_LIST_SUGGEST : null,
						IS_OPEN : null,
						IS_FOLDER : null,
						TEXT : null,
						INDEX : null,
						DESCRIPTION : null,
						CUSTOM_OBJECT : null,
						ROW : null,
						COLUMN : null,
						ROW_SPAN : null,
						COLUMN_SPAN : null,
						COLUMN_COUNT : null,
						LENGTH : null,
						SELECT : null,
						CTYPE_TARGET : null,
						SYS_TYPE : null,
						DATAPROVIDERS : null,
						SYNC_STATE : null,
						REGISTER_ACTION : null,
						ON_ATTRIBUTE_CHANGE : null,
						TRIGGER : null,
						SYSTEM_NAME : null,
						DATA_SOURCE_ID : null,
						TOSTRING : null,
						CLIPBOARD_CONTENT : null,
						s_lookup : null,
						create : function(name, parent) {
							var newConstant = new sap.firefly.DjPropertyType();
							newConstant.setup(name, parent);
							return newConstant;
						},
						staticSetup : function() {
							sap.firefly.DjPropertyType.s_lookup = sap.firefly.XHashMapByString
									.create();
							sap.firefly.DjPropertyType.ROOT = sap.firefly.DjPropertyType
									.create("root", null);
							sap.firefly.DjPropertyType.COMPLEX = sap.firefly.DjPropertyType
									.create("primitive",
											sap.firefly.DjPropertyType.ROOT);
							sap.firefly.DjPropertyType.PRIMITIVE = sap.firefly.DjPropertyType
									.create("complex", null);
							sap.firefly.DjPropertyType.BOOLEAN = sap.firefly.DjPropertyType
									.create(
											"bool",
											sap.firefly.DjPropertyType.PRIMITIVE);
							sap.firefly.DjPropertyType.INTEGER = sap.firefly.DjPropertyType
									.create(
											"integer",
											sap.firefly.DjPropertyType.PRIMITIVE);
							sap.firefly.DjPropertyType.DOUBLE = sap.firefly.DjPropertyType
									.create(
											"double",
											sap.firefly.DjPropertyType.PRIMITIVE);
							sap.firefly.DjPropertyType.STRING = sap.firefly.DjPropertyType
									.create(
											"string",
											sap.firefly.DjPropertyType.PRIMITIVE);
							sap.firefly.DjPropertyType.XOBJECT = sap.firefly.DjPropertyType
									.create(
											"xobject",
											sap.firefly.DjPropertyType.PRIMITIVE);
							sap.firefly.DjPropertyType.CONSTANT = sap.firefly.DjPropertyType
									.create(
											"constant",
											sap.firefly.DjPropertyType.PRIMITIVE);
							sap.firefly.DjPropertyType.COMPONENT = sap.firefly.DjPropertyType
									.create("component",
											sap.firefly.DjPropertyType.COMPLEX);
							sap.firefly.DjPropertyType.COMPONENT_LIST = sap.firefly.DjPropertyType
									.create("componentList",
											sap.firefly.DjPropertyType.COMPLEX);
							sap.firefly.DjPropertyType.NAMED_COMPONENT_LIST = sap.firefly.DjPropertyType
									.create(
											"namedComponentList",
											sap.firefly.DjPropertyType.COMPONENT_LIST);
							sap.firefly.DjPropertyType.ID = sap.firefly.DjPropertyType
									.create("id",
											sap.firefly.DjPropertyType.STRING);
							sap.firefly.DjPropertyType.IS_ENABLED = sap.firefly.DjPropertyType
									.create("isEnabled",
											sap.firefly.DjPropertyType.BOOLEAN);
							sap.firefly.DjPropertyType.IS_OPEN = sap.firefly.DjPropertyType
									.create("isOpen",
											sap.firefly.DjPropertyType.BOOLEAN);
							sap.firefly.DjPropertyType.IS_FOLDER = sap.firefly.DjPropertyType
									.create("isFolder",
											sap.firefly.DjPropertyType.BOOLEAN);
							sap.firefly.DjPropertyType.INDEX = sap.firefly.DjPropertyType
									.create("index",
											sap.firefly.DjPropertyType.INTEGER);
							sap.firefly.DjPropertyType.NAME = sap.firefly.DjPropertyType
									.create("name",
											sap.firefly.DjPropertyType.STRING);
							sap.firefly.DjPropertyType.MAX_LENGTH = sap.firefly.DjPropertyType
									.create("maxLength",
											sap.firefly.DjPropertyType.INTEGER);
							sap.firefly.DjPropertyType.CUSTOM_OBJECT = sap.firefly.DjPropertyType
									.create(
											"customObject",
											sap.firefly.DjPropertyType.PRIMITIVE);
							sap.firefly.DjPropertyType.DESCRIPTION = sap.firefly.DjPropertyType
									.create("description",
											sap.firefly.DjPropertyType.STRING);
							sap.firefly.DjPropertyType.TEXT = sap.firefly.DjPropertyType
									.create("text",
											sap.firefly.DjPropertyType.STRING);
							sap.firefly.DjPropertyType.COLUMN = sap.firefly.DjPropertyType
									.create("column",
											sap.firefly.DjPropertyType.INTEGER);
							sap.firefly.DjPropertyType.COLUMN_SPAN = sap.firefly.DjPropertyType
									.create("columnSpan",
											sap.firefly.DjPropertyType.INTEGER);
							sap.firefly.DjPropertyType.COLUMN_COUNT = sap.firefly.DjPropertyType
									.create("columnCount",
											sap.firefly.DjPropertyType.INTEGER);
							sap.firefly.DjPropertyType.ROW = sap.firefly.DjPropertyType
									.create("row",
											sap.firefly.DjPropertyType.INTEGER);
							sap.firefly.DjPropertyType.ROW_SPAN = sap.firefly.DjPropertyType
									.create("rowSpan",
											sap.firefly.DjPropertyType.INTEGER);
							sap.firefly.DjPropertyType.LENGTH = sap.firefly.DjPropertyType
									.create("length",
											sap.firefly.DjPropertyType.INTEGER);
							sap.firefly.DjPropertyType.SELECT = sap.firefly.DjPropertyType
									.create("select",
											sap.firefly.DjPropertyType.STRING);
							sap.firefly.DjPropertyType.CTYPE_TARGET = sap.firefly.DjPropertyType
									.create("ctypeTarget",
											sap.firefly.DjPropertyType.STRING);
							sap.firefly.DjPropertyType.SYS_TYPE = sap.firefly.DjPropertyType
									.create("sysType",
											sap.firefly.DjPropertyType.CONSTANT);
							sap.firefly.DjPropertyType.DATAPROVIDERS = sap.firefly.DjPropertyType
									.create(
											"dataproviders",
											sap.firefly.DjPropertyType.NAMED_COMPONENT_LIST);
							sap.firefly.DjPropertyType.SYNC_STATE = sap.firefly.DjPropertyType
									.create("syncState",
											sap.firefly.DjPropertyType.CONSTANT);
							sap.firefly.DjPropertyType.REGISTER_ACTION = sap.firefly.DjPropertyType
									.create(
											"registerAction",
											sap.firefly.DjPropertyType.COMPONENT);
							sap.firefly.DjPropertyType.ON_ATTRIBUTE_CHANGE = sap.firefly.DjPropertyType
									.create(
											"onAttributeChange",
											sap.firefly.DjPropertyType.REGISTER_ACTION);
							sap.firefly.DjPropertyType.TRIGGER = sap.firefly.DjPropertyType
									.create("trigger",
											sap.firefly.DjPropertyType.STRING);
							sap.firefly.DjPropertyType.SYSTEM_NAME = sap.firefly.DjPropertyType
									.create("systemName",
											sap.firefly.DjPropertyType.STRING);
							sap.firefly.DjPropertyType.DATA_SOURCE_ID = sap.firefly.DjPropertyType
									.create("dataSourceId",
											sap.firefly.DjPropertyType.STRING);
							sap.firefly.DjPropertyType.TOSTRING = sap.firefly.DjPropertyType
									.create("toString",
											sap.firefly.DjPropertyType.STRING);
							sap.firefly.DjPropertyType.CLIPBOARD_CONTENT = sap.firefly.DjPropertyType
									.create("clipboardContent",
											sap.firefly.DjPropertyType.XOBJECT);
						},
						lookup : function(name) {
							return sap.firefly.DjPropertyType.s_lookup
									.getByKey(name);
						}
					},
					setup : function(name, parent) {
						this.setParent(parent);
						this.setName(name);
						sap.firefly.DjPropertyType.s_lookup.put(name, this);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ApplicationPostprocAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, application,
								masterSystemName, systemUri, systemType,
								location) {
							var object = new sap.firefly.ApplicationPostprocAction();
							object.m_applicationHardPointer = application;
							object.m_masterSystemName = masterSystemName;
							object.m_systemUri = systemUri;
							object.m_systemType = systemType;
							object.m_location = location;
							object.setupActionAndRun(syncType, application,
									listener, customIdentifier);
							return object;
						}
					},
					m_masterSystemName : null,
					m_systemUri : null,
					m_systemType : null,
					m_location : null,
					m_applicationHardPointer : null,
					processSynchronization : function(syncType) {
						var systemLandscape = this.m_applicationHardPointer
								.getSystemLandscape();
						var usingMasterName;
						var system;
						var scheme;
						var systemNames;
						if (systemLandscape.getMasterSystemName() === null) {
							usingMasterName = this.m_masterSystemName;
							if (usingMasterName === null) {
								usingMasterName = "master";
							}
							if (this.m_systemUri !== null) {
								systemLandscape.setSystemByUri(usingMasterName,
										this.m_systemUri, null);
							} else {
								if ((this.m_location !== null)
										&& (this.m_systemType !== null)) {
									system = systemLandscape.createSystem();
									system.setSystemType(this.m_systemType);
									scheme = this.m_location.getScheme();
									if (scheme !== null) {
										if (sap.firefly.XString.startsWith(
												scheme, "https")) {
											system
													.setProtocolType(sap.firefly.ProtocolType.HTTPS);
										} else {
											system
													.setProtocolType(sap.firefly.ProtocolType.HTTP);
										}
									}
									system.setName(usingMasterName);
									system.setText(usingMasterName);
									system.setHost(this.m_location.getHost());
									system.setPort(this.m_location.getPort());
									systemLandscape
											.setSystemByDescription(system);
								} else {
									systemNames = systemLandscape
											.getSystemNames();
									if (systemNames.size() === 1) {
										usingMasterName = systemNames.get(0);
									} else {
										usingMasterName = null;
									}
								}
							}
							if (usingMasterName !== null) {
								systemLandscape
										.setMasterSystemName(usingMasterName);
							}
						}
						this.setData(this.m_applicationHardPointer);
						return false;
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onApplicationReady(extResult, data,
								customIdentifier);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.RuntimeComponentType",
				sap.firefly.XComponentType,
				{
					$statics : {
						SYSTEM_LANDSCAPE : null,
						SYSTEM_DESCRIPTION : null,
						DATA_PROVIDER : null,
						SERVICE_DATA_PROVIDER : null,
						BINDING_ADAPTER : null,
						BINDING_ADAPTER_INT : null,
						BINDING_ADAPTER_STRING : null,
						BINDING_ADAPTER_JSON : null,
						BINDING_SENDER : null,
						BINDING_RECEIVER : null,
						staticSetupRuntimeComponentTypes : function() {
							sap.firefly.RuntimeComponentType.SYSTEM_LANDSCAPE = sap.firefly.RuntimeComponentType
									.createRuntimeType("SystemLandscape",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.RuntimeComponentType.SYSTEM_DESCRIPTION = sap.firefly.RuntimeComponentType
									.createRuntimeType("SystemDescription",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.RuntimeComponentType.DATA_PROVIDER = sap.firefly.RuntimeComponentType
									.createRuntimeType(
											"DataProvider",
											sap.firefly.XComponentType._DATASOURCE);
							sap.firefly.RuntimeComponentType.SERVICE_DATA_PROVIDER = sap.firefly.RuntimeComponentType
									.createRuntimeType(
											"ServiceDataProvider",
											sap.firefly.RuntimeComponentType.DATA_PROVIDER);
							sap.firefly.RuntimeComponentType.BINDING_ADAPTER = sap.firefly.RuntimeComponentType
									.createRuntimeType("BindingAdapter",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.RuntimeComponentType.BINDING_ADAPTER_INT = sap.firefly.RuntimeComponentType
									.createRuntimeType(
											"BindingAdapterInt",
											sap.firefly.RuntimeComponentType.BINDING_ADAPTER);
							sap.firefly.RuntimeComponentType.BINDING_ADAPTER_STRING = sap.firefly.RuntimeComponentType
									.createRuntimeType(
											"BindingAdapterString",
											sap.firefly.RuntimeComponentType.BINDING_ADAPTER);
							sap.firefly.RuntimeComponentType.BINDING_ADAPTER_JSON = sap.firefly.RuntimeComponentType
									.createRuntimeType(
											"BindingAdapterJson",
											sap.firefly.RuntimeComponentType.BINDING_ADAPTER);
							sap.firefly.RuntimeComponentType.BINDING_SENDER = sap.firefly.RuntimeComponentType
									.createRuntimeType(
											"BindingSender",
											sap.firefly.RuntimeComponentType.BINDING_SENDER);
							sap.firefly.RuntimeComponentType.BINDING_RECEIVER = sap.firefly.RuntimeComponentType
									.createRuntimeType(
											"BindingReceiver",
											sap.firefly.RuntimeComponentType.BINDING_RECEIVER);
						},
						createRuntimeType : function(constant, parent) {
							var mt = new sap.firefly.RuntimeComponentType();
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
				"sap.firefly.ServerMetadataAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, connectionContainer,
								listener, customIdentifier) {
							var object = new sap.firefly.ServerMetadataAction();
							object.setupActionAndRun(syncType,
									connectionContainer, listener,
									customIdentifier);
							return object;
						}
					},
					m_ocpFunction : null,
					m_serverMetadata : null,
					releaseObject : function() {
						this.m_ocpFunction = null;
						if (this.m_serverMetadata !== null) {
							this.m_serverMetadata.releaseObject();
							this.m_serverMetadata = null;
						}
						sap.firefly.ServerMetadataAction.$superclass.releaseObject
								.call(this);
					},
					getComponentName : function() {
						return "ServerMetadataAction";
					},
					processSynchronization : function(syncType) {
						var connection = this.getActionContext();
						var systemDescription = connection
								.getSystemDescription();
						var protocolType = systemDescription.getProtocolType();
						var systemType = systemDescription.getSystemType();
						var path;
						var request;
						if (protocolType !== sap.firefly.ProtocolType.FILE) {
							path = systemDescription.getCapabilitiesPath();
							if (path === null) {
								path = sap.firefly.ConnectionConstants
										.getServerInfoPath(systemType);
							}
							if (path !== null) {
								this.m_ocpFunction = connection
										.newRpcFunction(path);
								request = this.m_ocpFunction.getRequest();
								request
										.setMethod(sap.firefly.HttpRequestMethod.HTTP_GET);
								this.m_ocpFunction.processFunctionExecution(
										syncType, this, null);
								return true;
							}
						}
						this.m_serverMetadata = sap.firefly.ServerMetadata
								.create(this.getSession(), null);
						this.setData(this.m_serverMetadata);
						return false;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var rootStructure;
						var connection;
						var inaMetadata;
						var capability;
						this.addAllMessages(extResult);
						rootStructure = response.getRootElement();
						if (extResult.isValid()) {
							connection = this.getActionContext();
							this.m_serverMetadata = sap.firefly.ServerMetadata
									.create(this.getSession(), rootStructure);
							connection
									.setReentranceTicket(this.m_serverMetadata
											.getReentranceTicket());
							inaMetadata = this.m_serverMetadata
									.getMetadataForService(sap.firefly.ServerService.INA);
							if (inaMetadata !== null) {
								capability = inaMetadata
										.getByKey(sap.firefly.ConnectionConstants.INA_CAPABILITY_SUPPORTS_BATCH);
								if (capability !== null) {
									connection.setSupportsBatchMode(true,
											capability.getValue());
								}
							}
							this.setData(this.m_serverMetadata);
						} else {
							if (rootStructure !== null) {
								this.importInaMessages(rootStructure);
							}
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onServerMetadataLoaded(extResult, data,
								customIdentifier);
					},
					importInaMessages : function(inaStructure) {
						var inaMessages = inaStructure
								.getListByName("Messages");
						var hasErrors = false;
						var messageSize;
						var i;
						var inaMessage;
						var type;
						var text;
						var messageClass;
						var code;
						if (inaMessages !== null) {
							messageSize = inaMessages.size();
							for (i = 0; i < messageSize; i++) {
								inaMessage = inaMessages.getStructureByIndex(i);
								type = inaMessage.getIntegerByNameWithDefault(
										"Type", 0);
								text = sap.firefly.XStringBuffer.create();
								text.append(inaMessage.getStringByName("Text"));
								messageClass = inaMessage
										.getStringByName("MessageClass");
								if (messageClass !== null) {
									text.append("; MsgClass: ");
									text.append(messageClass);
								}
								code = inaMessage.getIntegerByNameWithDefault(
										"Number", 0);
								if (type === 0) {
									this.addInfoExt(
											sap.firefly.OriginLayer.SERVER,
											code, text.toString());
								} else {
									if (type === 1) {
										this.addWarningExt(
												sap.firefly.OriginLayer.SERVER,
												code, text.toString());
									} else {
										if (type === 2) {
											this
													.addErrorExt(
															sap.firefly.OriginLayer.SERVER,
															code,
															text.toString(),
															null);
											hasErrors = true;
										} else {
											if (type === 3) {
												this
														.addSemanticalError(
																sap.firefly.OriginLayer.SERVER,
																code,
																text.toString());
												hasErrors = hasErrors || false;
											}
										}
									}
								}
							}
						}
						return hasErrors;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.StandaloneSystemLandscape",
				sap.firefly.DfApplicationContext,
				{
					$statics : {
						s_masterSystemDescription : null,
						getStaticMasterSystemDescription : function() {
							return sap.firefly.StandaloneSystemLandscape.s_masterSystemDescription;
						},
						setStaticMasterSystemDescription : function(
								masterSystem) {
							sap.firefly.StandaloneSystemLandscape.s_masterSystemDescription = masterSystem;
						},
						create : function(application) {
							var landscape = new sap.firefly.StandaloneSystemLandscape();
							landscape.setupLandscape(application);
							return landscape;
						}
					},
					m_roleMap : null,
					m_systemMap : null,
					setupLandscape : function(application) {
						var properties;
						var systems;
						var sysDesc;
						this.setApplication(application);
						this.m_systemMap = sap.firefly.XHashMapByString
								.create();
						this.m_roleMap = sap.firefly.XHashMapOfStringByString
								.create();
						if (sap.firefly.StandaloneSystemLandscape.s_masterSystemDescription !== null) {
							properties = sap.firefly.XProperties
									.createPropertiesCopy(sap.firefly.StandaloneSystemLandscape.s_masterSystemDescription
											.getProperties());
							this
									.setSystem(
											sap.firefly.StandaloneSystemLandscape.s_masterSystemDescription
													.getName(), properties);
							this
									.setMasterSystemName(sap.firefly.StandaloneSystemLandscape.s_masterSystemDescription
											.getName());
						}
						systems = this.m_systemMap.getIterator();
						while (systems.hasNext()) {
							sysDesc = systems.next();
							sysDesc.setApplication(application);
						}
						systems.releaseObject();
					},
					releaseObject : function() {
						this.m_systemMap = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_systemMap);
						sap.firefly.StandaloneSystemLandscape.$superclass.releaseObject
								.call(this);
					},
					getComponentType : function() {
						return sap.firefly.RuntimeComponentType.SYSTEM_LANDSCAPE;
					},
					getChildElements : function() {
						return sap.firefly.XReadOnlyListWrapper
								.create(this.m_systemMap
										.getValuesAsReadOnlyList());
					},
					clearSystems : function() {
						this.m_systemMap.clear();
					},
					createSystem : function() {
						return sap.firefly.SystemDescription.create(this, null,
								null);
					},
					existsSystemName : function(name) {
						return this.m_systemMap.containsKey(name);
					},
					getSystemDescription : function(name) {
						if (name === null) {
							return this.getMasterSystem();
						}
						return this.m_systemMap.getByKey(name);
					},
					getSystemNames : function() {
						var systemNames = sap.firefly.XListOfString
								.createFromReadOnlyList(this.m_systemMap
										.getKeysAsReadOnlyListOfString());
						systemNames
								.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
						return systemNames;
					},
					removeSystem : function(name) {
						this.m_systemMap.remove(name);
					},
					setSystemByUri : function(name, uri, systemType) {
						var systemDesc = sap.firefly.SystemDescription.create(
								this, name, null);
						var queryElements;
						var i;
						var queryElement;
						var key;
						var value;
						this.setSystemByDescription(systemDesc);
						systemDesc.setAuthenticationType(uri
								.getAuthenticationType());
						if (uri.getUser() !== null) {
							systemDesc.setUser(uri.getUser());
							systemDesc.setPassword(uri.getPassword());
						}
						systemDesc.setHost(uri.getHost());
						systemDesc.setPort(uri.getPort());
						systemDesc.setProtocolType(sap.firefly.ProtocolType
								.lookup(uri.getScheme()));
						systemDesc.setServicePath(uri.getPath());
						queryElements = uri.getQueryElements();
						if (queryElements !== null) {
							for (i = 0; i < queryElements.size(); i++) {
								queryElement = queryElements.get(i);
								key = sap.firefly.XString
										.convertToUpperCase(queryElement
												.getName());
								value = queryElement.getValue();
								if (sap.firefly.XString.isEqual(
										sap.firefly.ConnectionParameters.TAGS,
										key)) {
									systemDesc.setTags(value);
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.ConnectionParameters.SYSTEM_TYPE,
													key)
											|| sap.firefly.XString
													.isEqual(
															sap.firefly.ConnectionParameters.SYSTYPE,
															key)) {
										value = sap.firefly.XString
												.convertToUpperCase(value);
										systemDesc
												.setSystemType(sap.firefly.SystemType
														.lookup(value));
									} else {
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.ConnectionParameters.LANGUAGE,
														key)) {
											value = sap.firefly.XString
													.convertToUpperCase(value);
											systemDesc.setLanguage(value);
										}
									}
								}
							}
						}
						if (systemType !== null) {
							systemDesc.setSystemType(systemType);
						}
						return systemDesc;
					},
					setSystem : function(name, properties) {
						var systemDesc = sap.firefly.SystemDescription.create(
								this, name, properties);
						this.setSystemByDescription(systemDesc);
						return systemDesc;
					},
					setSystemByDescription : function(systemDescription) {
						if (systemDescription.getName() === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("NULL not allowed: systemDescription.getName() must not be NULL.");
						}
						systemDescription.setApplication(this.getApplication());
						this.m_systemMap.put(systemDescription.getName(),
								systemDescription);
					},
					getMasterSystemName : function() {
						return this
								.getDefaultSystemName(sap.firefly.SystemRole.MASTER);
					},
					setMasterSystemName : function(name) {
						this.setDefaultSystemName(
								sap.firefly.SystemRole.MASTER, name);
					},
					getMasterSystem : function() {
						var masterSystemName = this
								.getDefaultSystemName(sap.firefly.SystemRole.MASTER);
						return this.m_systemMap.getByKey(masterSystemName);
					},
					getDefaultSystemName : function(systemRole) {
						return this.m_roleMap.getByKey(systemRole.getName());
					},
					setDefaultSystemName : function(systemRole, name) {
						this.m_roleMap.put(systemRole.getName(), name);
					},
					getDefaultSystem : function(systemRole) {
						var name = this.m_roleMap
								.getByKey(systemRole.getName());
						return this.getSystemDescription(name);
					},
					getSystemsByRole : function(role) {
						var systems = sap.firefly.XList.create();
						var iterator = this.m_systemMap.getIterator();
						var systemDescription;
						var sysRoles;
						while (iterator.hasNext()) {
							systemDescription = iterator.next();
							if (role === null) {
								systems.add(systemDescription);
							} else {
								sysRoles = systemDescription.getRoles();
								if (sysRoles.contains(role)) {
									systems.add(systemDescription);
								}
							}
						}
						iterator.releaseObject();
						return systems;
					},
					hasChildren : function() {
						return this.m_systemMap.size() > 0;
					},
					getChildSetState : function() {
						return sap.firefly.ChildSetState.COMPLETE;
					},
					getName : function() {
						return "SystemLandscape";
					},
					getText : function() {
						return "System Landscape";
					},
					isNode : function() {
						return true;
					},
					isLeaf : function() {
						return false;
					},
					getTagValue : function(tagName) {
						return null;
					},
					processChildFetch : function(syncType, listener,
							customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getContentElement : function() {
						return this;
					},
					getContentConstant : function() {
						return null;
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						var systemNameIterator;
						var systemName;
						var systemDescription;
						sb.append("System landscape");
						sb.appendNewLine();
						if (sap.firefly.XCollectionUtils
								.hasElements(this.m_systemMap)) {
							systemNameIterator = this.m_systemMap
									.getKeysAsIteratorOfString();
							while (systemNameIterator.hasNext()) {
								systemName = systemNameIterator.next();
								systemDescription = this.m_systemMap
										.getByKey(systemName);
								if (systemDescription === null) {
									continue;
								}
								sb.appendNewLine();
								sb.append(systemDescription.toString());
							}
						}
						return sb.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.SystemLandscapeLoadAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, listener,
								customIdentifier, application, url) {
							return sap.firefly.SystemLandscapeLoadAction
									.createAndRunInternal(syncType, listener,
											customIdentifier, application, url,
											0, sap.firefly.XHashSetOfString
													.create());
						},
						createAndRunInternal : function(syncType, listener,
								customIdentifier, application, url, level,
								uriSet) {
							var newObject;
							var location;
							var relative;
							var fullUri;
							if (url === null) {
								throw sap.firefly.XException
										.createIllegalArgumentException("No url given");
							}
							newObject = new sap.firefly.SystemLandscapeLoadAction();
							if (url.isRelativeUri()) {
								location = sap.firefly.NetworkEnv.getLocation();
								relative = url.getUriString();
								newObject.m_url = sap.firefly.XUri
										.createFromUriWithParent(relative,
												location, false);
							} else {
								newObject.m_url = url;
							}
							newObject.m_application = application;
							newObject.m_parents = sap.firefly.XList.create();
							newObject.m_level = level;
							newObject.m_systemLandscape = application
									.getSystemLandscape();
							newObject.m_uriSet = uriSet;
							fullUri = url.getUriString();
							uriSet.put(fullUri);
							newObject.setupActionAndRun(syncType, application,
									listener, customIdentifier);
							return newObject;
						},
						getSystemPropertiesFromUri : function(uri) {
							var properties = sap.firefly.XProperties.create();
							var protocolType = uri.getProtocolType();
							var host;
							var port;
							if (protocolType !== null) {
								properties
										.put(
												sap.firefly.ConnectionParameters.PROTOCOL,
												protocolType.getName());
							}
							host = uri.getHost();
							if (host !== null) {
								properties.put(
										sap.firefly.ConnectionParameters.HOST,
										uri.getHost());
							}
							port = uri.getPort();
							if (port > 0) {
								properties.put(
										sap.firefly.ConnectionParameters.PORT,
										sap.firefly.XInteger
												.convertIntegerToString(port));
							}
							return sap.firefly.ExtResult.create(properties,
									null);
						},
						createProperties : function(systemStructure) {
							var properties = sap.firefly.XProperties.create();
							var elementNames = systemStructure
									.getStructureElementNames();
							var size = elementNames.size();
							var i;
							var key;
							var inaMappings;
							var sizeMappings;
							var idxMapping;
							var inaMapping;
							var systemName;
							var saveSchema;
							var saveTable;
							var loadSchema;
							var loadTable;
							var value;
							for (i = 0; i < size; i++) {
								key = elementNames.get(i);
								if (sap.firefly.XString
										.isEqual(
												key,
												sap.firefly.ConnectionParameters.MAPPINGS)) {
									inaMappings = systemStructure
											.getListByName(key);
									sizeMappings = inaMappings.size();
									for (idxMapping = 0; idxMapping < sizeMappings; idxMapping++) {
										inaMapping = inaMappings
												.getStructureByIndex(idxMapping);
										systemName = inaMapping
												.getStringByName(sap.firefly.ConnectionParameters.MAPPING_SYSTEM_NAME);
										properties
												.put(
														sap.firefly.XStringUtils
																.concatenate3(
																		sap.firefly.ConnectionParameters.MAPPING_SYSTEM_NAME,
																		"$$",
																		systemName),
														systemName);
										saveSchema = inaMapping
												.getStringByName(sap.firefly.ConnectionParameters.MAPPING_SERIALIZATION_SCHEMA);
										properties
												.put(
														sap.firefly.XStringUtils
																.concatenate3(
																		sap.firefly.ConnectionParameters.MAPPING_SERIALIZATION_SCHEMA,
																		"$$",
																		systemName),
														saveSchema);
										saveTable = inaMapping
												.getStringByName(sap.firefly.ConnectionParameters.MAPPING_SERIALIZATION_TABLE);
										properties
												.put(
														sap.firefly.XStringUtils
																.concatenate3(
																		sap.firefly.ConnectionParameters.MAPPING_SERIALIZATION_TABLE,
																		"$$",
																		systemName),
														saveTable);
										loadSchema = inaMapping
												.getStringByName(sap.firefly.ConnectionParameters.MAPPING_DESERIALIZATION_SCHEMA);
										properties
												.put(
														sap.firefly.XStringUtils
																.concatenate3(
																		sap.firefly.ConnectionParameters.MAPPING_DESERIALIZATION_SCHEMA,
																		"$$",
																		systemName),
														loadSchema);
										loadTable = inaMapping
												.getStringByName(sap.firefly.ConnectionParameters.MAPPING_DESERIALIZATION_TABLE);
										properties
												.put(
														sap.firefly.XStringUtils
																.concatenate3(
																		sap.firefly.ConnectionParameters.MAPPING_DESERIALIZATION_TABLE,
																		"$$",
																		systemName),
														loadTable);
									}
								} else {
									value = systemStructure
											.getStringByName(key);
									properties.setStringByName(key, value);
								}
							}
							return properties;
						}
					},
					m_application : null,
					m_systemLandscape : null,
					m_url : null,
					m_parents : null,
					m_structure : null,
					m_systemName : null,
					m_parentReferences : null,
					m_finishedParents : 0,
					m_level : 0,
					m_uriSet : null,
					releaseObject : function() {
						var i;
						this.m_application = null;
						this.m_systemLandscape = null;
						this.m_url = null;
						this.m_systemName = null;
						this.m_parentReferences = null;
						this.m_structure = null;
						this.m_uriSet = null;
						if (this.m_parents !== null) {
							for (i = 0; i < this.m_parents.size(); i++) {
								this.m_parents.get(i).releaseObject();
							}
							this.m_parents.releaseObject();
							this.m_parents = null;
						}
						sap.firefly.SystemLandscapeLoadAction.$superclass.releaseObject
								.call(this);
					},
					getComponentName : function() {
						return "SystemLandscapeLoadAction";
					},
					processSynchronization : function(syncType) {
						var buffer = sap.firefly.XStringBuffer.create();
						var systemLandscape;
						var propertiesData;
						var connectionPool;
						var connection;
						var path;
						var query;
						var rpcFunction;
						var request;
						buffer.append("__landscapeserver__");
						buffer.append(this.m_url.getHost());
						buffer.append(":");
						buffer.appendInt(this.m_url.getPort());
						this.m_systemName = buffer.toString();
						systemLandscape = this.m_application
								.getSystemLandscape();
						if (systemLandscape
								.getSystemDescription(this.m_systemName) === null) {
							propertiesData = sap.firefly.SystemLandscapeLoadAction
									.getSystemPropertiesFromUri(this.m_url);
							this.addAllMessages(propertiesData);
							if (propertiesData.hasErrors()) {
								this.addError(
										sap.firefly.ErrorCodes.OTHER_ERROR,
										"Cannot create system");
								return false;
							}
							systemLandscape.setSystem(this.m_systemName,
									propertiesData.getData());
						}
						connectionPool = this.m_application.getConnectionPool();
						connection = connectionPool
								.getConnection(this.m_systemName);
						path = this.m_url.getPath();
						if (path !== null) {
							query = this.m_url.getQuery();
							if (query !== null) {
								path = sap.firefly.XStringUtils.concatenate3(
										path, "?", query);
							}
						}
						rpcFunction = connection.newRpcFunction(path);
						if (rpcFunction === null) {
							this.addError(sap.firefly.ErrorCodes.OTHER_ERROR,
									"Cannot create function");
							return false;
						}
						request = rpcFunction.getRequest();
						request
								.setMethod(sap.firefly.HttpRequestMethod.HTTP_GET);
						rpcFunction.processFunctionExecution(syncType, this,
								null);
						return true;
					},
					onFunctionExecuted : function(extResult, response,
							customIdentifier) {
						var rootElement;
						var furtherProcessing;
						var i;
						var parentRelativeUrlValue;
						var url;
						var urlValue;
						var parentAction;
						this.addAllMessages(extResult);
						if (extResult.hasErrors()) {
							this.endSync();
						} else {
							rootElement = response.getRootElement();
							if (rootElement === null) {
								this.addError(
										sap.firefly.ErrorCodes.OTHER_ERROR,
										"No json root element in response");
								this.endSync();
							} else {
								this.m_structure = sap.firefly.PrStructure
										.createDeepCopy(rootElement);
								this.m_parentReferences = this.m_structure
										.getListByName("ParentLandscapeReferences");
								furtherProcessing = false;
								if ((this.m_parentReferences !== null)
										&& (this.m_parentReferences.size() > 0)) {
									if (this.m_level > 5) {
										this
												.addError(
														sap.firefly.ErrorCodes.OTHER_ERROR,
														"System Landscape Network too deep: > 5 levels");
									} else {
										for (i = 0; i < this.m_parentReferences
												.size(); i++) {
											parentRelativeUrlValue = this.m_parentReferences
													.getStringByIndex(i);
											if (sap.firefly.XStringUtils
													.isNotNullAndNotEmpty(parentRelativeUrlValue)) {
												url = sap.firefly.XUri
														.createFromUriWithParent(
																parentRelativeUrlValue,
																this.m_url,
																true);
												urlValue = url.getUriString();
												if (this.m_uriSet
														.contains(urlValue) === false) {
													parentAction = sap.firefly.SystemLandscapeLoadAction
															.createAndRunInternal(
																	this
																			.getActiveSyncType(),
																	this,
																	sap.firefly.XIntegerValue
																			.create(i),
																	this.m_application,
																	url,
																	this.m_level + 1,
																	this.m_uriSet);
													this.m_parents
															.add(parentAction);
													furtherProcessing = true;
												}
											}
										}
									}
								}
								if ((this.getActiveSyncType() === sap.firefly.SyncType.BLOCKING)
										|| (furtherProcessing === false)) {
									this.setData(this.m_systemLandscape);
									this.endSync();
								}
							}
						}
					},
					onLandscapeNodeLoaded : function(extResult, landscape,
							customIdentifier) {
						this.m_finishedParents++;
						if (this.getActiveSyncType() === sap.firefly.SyncType.NON_BLOCKING) {
							if (this.m_finishedParents === this.m_parents
									.size()) {
								this.setData(this.m_systemLandscape);
								this.endSync();
							}
						}
					},
					endSync : function() {
						if (this.m_level === 0) {
							this.removeTempSystems();
							this.mapSystems();
						}
						sap.firefly.SystemLandscapeLoadAction.$superclass.endSync
								.call(this);
					},
					removeTempSystems : function() {
						var i;
						var parentNode;
						for (i = 0; i < this.m_parents.size(); i++) {
							parentNode = this.m_parents.get(i);
							parentNode.removeTempSystems();
						}
						this.m_application.getConnectionPool()
								.clearConnectionsForSystem(this.m_systemName);
						this.m_systemLandscape.removeSystem(this.m_systemName);
					},
					mapSystems : function() {
						var i;
						var parentNode;
						for (i = 0; i < this.m_parents.size(); i++) {
							parentNode = this.m_parents.get(i);
							parentNode.mapSystems();
						}
						this.mapStructureToSystem(this.m_structure);
					},
					mapStructureToSystem : function(landscapeStructure) {
						var systemLandscape;
						var systemsStructure;
						var includeFilter;
						var survivors;
						var ex;
						var systemNameToIncude;
						var k;
						var excludeFilter;
						var ex1;
						var systemNameToExclude;
						var roles;
						var iterator;
						var currentRole;
						var masterName;
						if (landscapeStructure !== null) {
							systemLandscape = this.m_application
									.getSystemLandscape();
							systemsStructure = landscapeStructure
									.getStructureByName("Systems");
							if (systemsStructure !== null) {
								this.setSystems(systemsStructure);
							}
							includeFilter = landscapeStructure
									.getListByName("IncludeFilter");
							if (includeFilter !== null) {
								survivors = sap.firefly.XList.create();
								for (ex = 0; ex < includeFilter.size(); ex++) {
									systemNameToIncude = includeFilter
											.getStringByIndex(ex);
									survivors
											.add(systemLandscape
													.getSystemDescription(systemNameToIncude));
								}
								systemLandscape.clearSystems();
								for (k = 0; k < survivors.size(); k++) {
									systemLandscape
											.setSystemByDescription(survivors
													.get(k));
								}
							}
							excludeFilter = landscapeStructure
									.getListByName("ExcludeFilter");
							if (excludeFilter !== null) {
								for (ex1 = 0; ex1 < excludeFilter.size(); ex1++) {
									systemNameToExclude = excludeFilter
											.getStringByIndex(ex1);
									systemLandscape
											.removeSystem(systemNameToExclude);
								}
							}
							roles = landscapeStructure
									.getStructureByName("Roles");
							if (roles !== null) {
								iterator = sap.firefly.SystemRole.getAllRoles()
										.getIterator();
								while (iterator.hasNext()) {
									currentRole = iterator.next();
									masterName = roles
											.getStringByName(currentRole
													.getName());
									if (sap.firefly.XStringUtils
											.isNotNullAndNotEmpty(masterName)) {
										systemLandscape.setDefaultSystemName(
												currentRole, masterName);
									}
								}
								iterator.releaseObject();
							}
						}
					},
					setSystems : function(systemsStructure) {
						var systemLandscape = this.m_application
								.getSystemLandscape();
						var elementNames = systemsStructure
								.getStructureElementNames();
						var i;
						var systemName;
						var element;
						var systemStructure;
						var prop;
						var systemDescription;
						var keysAsIteratorOfString;
						var key;
						var value;
						var text;
						if (elementNames !== null) {
							for (i = 0; i < elementNames.size(); i++) {
								systemName = elementNames.get(i);
								if (systemName !== null) {
									element = systemsStructure
											.getElementByName(systemName);
									if ((element !== null)
											&& (element.getType() === sap.firefly.PrElementType.STRUCTURE)) {
										systemStructure = element;
										prop = sap.firefly.SystemLandscapeLoadAction
												.createProperties(systemStructure);
										systemDescription = systemLandscape
												.getSystemDescription(systemName);
										if (systemDescription !== null) {
											keysAsIteratorOfString = prop
													.getKeysAsIteratorOfString();
											while (keysAsIteratorOfString
													.hasNext()) {
												key = keysAsIteratorOfString
														.next();
												value = prop
														.getStringByName(key);
												systemDescription.setProperty(
														key, value);
											}
										} else {
											systemDescription = sap.firefly.SystemDescription
													.create(systemLandscape,
															systemName, prop);
											systemLandscape
													.setSystemByDescription(systemDescription);
										}
										text = systemDescription.getText();
										if (text === null) {
											systemDescription
													.setText(systemDescription
															.getName());
										}
									}
								}
							}
						}
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onLandscapeNodeLoaded(extResult, data,
								customIdentifier);
					}
				});
$Firefly.createClass("sap.firefly.DfService", sap.firefly.SyncAction, {
	m_connectionContainer : null,
	m_isInRelease : false,
	m_serviceConfig : null,
	m_application : null,
	setupService : function(serviceConfigInfo) {
		this.setupSynchronizingObject(serviceConfigInfo);
		this.m_serviceConfig = serviceConfigInfo;
		this.m_application = serviceConfigInfo.getApplication();
		this.registerServiceAtApplication();
	},
	releaseObject : function() {
		if (this.m_isInRelease === false) {
			this.m_isInRelease = true;
			this.unregisterServiceAtApplication();
			if (this.m_serviceConfig !== null) {
				this.m_serviceConfig.releaseObject();
				this.m_serviceConfig = null;
			}
			this.m_connectionContainer = null;
			this.m_application = null;
			sap.firefly.DfService.$superclass.releaseObject.call(this);
		}
	},
	getComponentName : function() {
		return "DfService2";
	},
	processInitialization : function(syncType, listener, customIdentifier) {
		return this.processSyncAction(syncType, listener, customIdentifier);
	},
	callListener : function(extResult, listener, data, customIdentifier) {
		listener.onServiceInitialized(extResult, data, customIdentifier);
	},
	requiresInitialization : function() {
		return true;
	},
	registerServiceAtApplication : function() {
		var application = this.getApplication();
		if (application === null) {
			return;
		}
		application.registerService(this);
	},
	unregisterServiceAtApplication : function() {
		var application = this.getApplication();
		if (application !== null) {
			application.unregisterService(this);
		}
	},
	isServiceConfigMatching : function(serviceConfig, connection, messages) {
		return true;
	},
	getConnection : function() {
		return sap.firefly.XWeakReferenceUtil
				.getHardRef(this.m_connectionContainer);
	},
	setConnection : function(connection) {
		this.m_connectionContainer = sap.firefly.XWeakReferenceUtil
				.getWeakRef(connection);
	},
	getServiceConfig : function() {
		return this.m_serviceConfig;
	},
	getApplication : function() {
		return this.m_application;
	}
});
$Firefly
		.createClass(
				"sap.firefly.DfServiceConfig",
				sap.firefly.SyncAction,
				{
					m_application : null,
					m_name : null,
					m_connectionContainer : null,
					m_usePrivateConnection : false,
					m_connectionName : null,
					m_syncTypeForInitialization : null,
					m_serverMetadata : null,
					m_serviceType : null,
					m_systemName : null,
					m_serviceTemporary : null,
					m_isInRelease : false,
					m_tagging : null,
					m_useAsDataProvider : false,
					setupConfig : function(application) {
						this.setupSynchronizingObject(application);
						this.m_application = application;
						this.setAutoConvertDataToWeakRef(true);
						this.m_tagging = sap.firefly.XHashMapOfStringByString
								.create();
						(application).registerDataProvider(this);
					},
					releaseObject : function() {
						var data;
						if (this.m_isInRelease === false) {
							this.m_isInRelease = true;
							(this.m_application).unregisterDataProvider(this);
							if (this.m_useAsDataProvider) {
								data = this.getData();
								data.releaseObject();
								data = null;
								this.setData(data);
							}
							this.m_application = null;
							this.m_tagging = null;
							this.m_connectionContainer = null;
							this.m_connectionName = null;
							this.m_serverMetadata = null;
							if (this.m_serviceTemporary !== null) {
								this.m_serviceTemporary.releaseObject();
								this.m_serviceTemporary = null;
							}
							this.m_serviceType = null;
							this.m_syncTypeForInitialization = null;
							this.m_systemName = null;
							sap.firefly.DfServiceConfig.$superclass.releaseObject
									.call(this);
						}
					},
					getComponentType : function() {
						return sap.firefly.RuntimeComponentType.SERVICE_DATA_PROVIDER;
					},
					getName : function() {
						return this.m_name;
					},
					setName : function(name) {
						this.m_name = name;
					},
					getDataProviderName : function() {
						return this.m_name;
					},
					setDataProviderName : function(name) {
						this.m_name = name;
					},
					getTagging : function() {
						return this.m_tagging;
					},
					processSynchronization : function(syncType) {
						var systemDescription;
						var connectionPool;
						var revalidateMetadata;
						var connectionContainer;
						var serverMetadataExt;
						this.m_syncTypeForInitialization = syncType;
						if (this.isSystemBoundService()) {
							systemDescription = this.getSystemDescription();
							if (systemDescription === null) {
								this.addError(0,
										"Cannot find system description");
								return false;
							}
							if ((this.m_connectionContainer === null)
									|| this.getConnectionContainer().isDirty()) {
								connectionPool = this.getActionContext()
										.getConnectionPool();
								this.m_connectionContainer = sap.firefly.XWeakReferenceUtil
										.getWeakRef(connectionPool
												.getConnectionExt(
														systemDescription
																.getName(),
														this.m_usePrivateConnection,
														this.m_connectionName));
							}
							revalidateMetadata = false;
							connectionContainer = this.getConnectionContainer();
							if (syncType === sap.firefly.SyncType.BLOCKING) {
								serverMetadataExt = connectionContainer
										.getServerMetadataExt(syncType, null,
												null, revalidateMetadata);
								this.onServerMetadataLoaded(serverMetadataExt,
										serverMetadataExt.getData(), null);
							} else {
								connectionContainer.getServerMetadataExt(
										syncType, this, null,
										revalidateMetadata);
							}
						} else {
							this.onServerMetadataLoaded(null, null, null);
						}
						return true;
					},
					onServerMetadataLoaded : function(extResult,
							serverMetadata, customIdentifier) {
						var syncType;
						var serviceReferenceName;
						var syncAction;
						this.addAllMessages(extResult);
						this.m_serverMetadata = extResult;
						if (this.isSystemBoundService()
								&& (this.m_serverMetadata.hasErrors())) {
							this.endSync();
						} else {
							syncType = this.m_syncTypeForInitialization;
							this.m_syncTypeForInitialization = null;
							serviceReferenceName = this.getServiceTypeInfo()
									.getServiceReferenceName();
							this.m_serviceTemporary = this
									.getMatchingServiceForServiceName(serviceReferenceName);
							if (this.m_serviceTemporary !== null) {
								if ((this.m_serviceTemporary)
										.requiresInitialization()) {
									syncAction = (this.m_serviceTemporary)
											.processInitialization(syncType,
													this, null);
									if (syncAction === null) {
										this
												.setDataFromService(this.m_serviceTemporary);
										this.endSync();
									}
								} else {
									this
											.setDataFromService(this.m_serviceTemporary);
									this.endSync();
								}
							} else {
								this
										.addError(
												sap.firefly.ErrorCodes.SERVICE_NOT_FOUND,
												serviceReferenceName);
								this.endSync();
							}
						}
					},
					onServiceInitialized : function(extResult, service,
							customIdentifier) {
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							this.setDataFromService(this.m_serviceTemporary);
						}
						this.endSync();
					},
					setDataFromService : function(service) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					endSync : function() {
						this.m_serviceTemporary = null;
						sap.firefly.DfServiceConfig.$superclass.endSync
								.call(this);
					},
					getMatchingServiceForServiceName : function(
							serviceReferenceName) {
						var regService = sap.firefly.RegistrationService
								.getInstance();
						var references = regService
								.getReferences(serviceReferenceName);
						var i;
						var registeredClass;
						var service;
						for (i = 0; i < references.size(); i++) {
							registeredClass = references.get(i);
							service = registeredClass.newInstance(this);
							if (service.isServiceConfigMatching(this, this
									.getConnectionContainer(), this)) {
								service.setupService(this);
								if (this.isSystemBoundService()) {
									service.setConnection(this
											.getConnectionContainer());
								}
								return service;
							}
						}
						return null;
					},
					getSystemName : function() {
						if (this.m_systemName === null) {
							this.m_systemName = this.getApplication()
									.getSystemLandscape().getMasterSystemName();
						}
						return this.m_systemName;
					},
					setSystemName : function(systemName) {
						this.m_systemName = systemName;
					},
					isSystemBoundService : function() {
						return true;
					},
					getServiceTypeInfo : function() {
						return this.m_serviceType;
					},
					getComponentName : function() {
						var serviceTypeInfo = this.getServiceTypeInfo();
						if (serviceTypeInfo === null) {
							return "ServiceConfig";
						}
						return serviceTypeInfo.getServiceReferenceName();
					},
					setServiceTypeInfo : function(serviceTypeInfo) {
						this.m_serviceType = serviceTypeInfo;
					},
					getApplication : function() {
						return this.m_application;
					},
					getSystemDescription : function() {
						var application = this.getActionContext();
						var systemLandscape = application.getSystemLandscape();
						var systemName;
						if (systemLandscape === null) {
							return null;
						}
						systemName = this.getSystemName();
						if (systemName === null) {
							return systemLandscape.getMasterSystem();
						}
						return systemLandscape.getSystemDescription(systemName);
					},
					processSyncAction : function(syncType, listener,
							customIdentifier) {
						if ((this.m_connectionContainer !== null)
								&& (this.getConnectionContainer().isDirty())) {
							this.m_connectionContainer = null;
							this.clearMessages();
							this.resetSyncState();
						}
						return sap.firefly.DfServiceConfig.$superclass.processSyncAction
								.call(this, syncType, listener,
										customIdentifier);
					},
					setConnectionContainer : function(connectionContainer) {
						this.m_connectionContainer = sap.firefly.XWeakReferenceUtil
								.getWeakRef(connectionContainer);
					},
					getConnectionContainer : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_connectionContainer);
					},
					setConnectionName : function(name) {
						this.m_connectionName = name;
					},
					getConnectionName : function() {
						return this.m_connectionName;
					},
					usePrivateConnection : function(usePrivateConnection) {
						this.m_usePrivateConnection = usePrivateConnection;
					},
					hasPrivateConnection : function() {
						return this.m_usePrivateConnection;
					},
					setUseAsDataProvider : function(useAsDataProvider) {
						this.m_useAsDataProvider = useAsDataProvider;
						this
								.setAutoConvertDataToWeakRef(useAsDataProvider === false);
					},
					isDataProviderUsage : function() {
						return this.m_useAsDataProvider;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.RpcBatchFunction",
				sap.firefly.DfRpcFunction,
				{
					$statics : {
						create : function(connection, relativeUri) {
							var ocpFunction = new sap.firefly.RpcBatchFunction();
							ocpFunction.setupFunction(connection, connection
									.getSystemDescription(), relativeUri);
							return ocpFunction;
						}
					},
					m_decorator : null,
					getComponentName : function() {
						return "RpcBatchFunction";
					},
					processSynchronization : function(syncType) {
						return true;
					},
					processFunctionExecution : function(syncType, listener,
							customIdentifier) {
						var extResult;
						if (syncType !== sap.firefly.SyncType.NON_BLOCKING) {
							throw sap.firefly.XException
									.createIllegalStateException("batch mode is enabled: function calls must be non-blocking");
						}
						extResult = sap.firefly.RpcBatchFunction.$superclass.processFunctionExecution
								.call(this, syncType, listener,
										customIdentifier);
						return extResult;
					},
					endSync : function() {
						this.setData(this.m_rpcResponse);
						sap.firefly.RpcBatchFunction.$superclass.endSync
								.call(this);
					},
					setDecorator : function(decorator) {
						this.m_decorator = decorator;
					},
					getDecorator : function() {
						return this.m_decorator;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.RpcHttpFunction",
				sap.firefly.DfRpcFunction,
				{
					$statics : {
						s_queue : null,
						REQUEST_PARAM_TIMESTAMP : "timestamp",
						REQUEST_PARAM_TRACE_NAME : "traceName",
						REQUEST_PARAM_TRACE_PATH : "tracePath",
						REQUEST_PARAM_TRACE_REQ_INDEX : "traceRequestIndex",
						REQUEST_PARAM_SERVER_TRACE_FLAG : "trace",
						REQUEST_PARAM_SAP_STATISTICS : "sap-statistics",
						REQUEST_PARAM_SESSION_VIA_URL : "sap-sessionviaurl",
						PRINT_REQUESTS : false,
						PRINT_RESPONSES : false,
						ORIGIN_TEST_BUFFER : null,
						DEBUG_MODE : false,
						USE_QUEUE : false,
						TEST_MODE : false,
						TEST_MODE_LAST_REQUEST : null,
						create : function(connection, relativeUri) {
							var ocpFunction = new sap.firefly.RpcHttpFunction();
							ocpFunction.setupFunction(connection, connection
									.getSystemDescription(), relativeUri);
							return ocpFunction;
						},
						doWebdispatcherRouting : function(connection,
								systemDescription, relativeUriPath) {
							var webDispatcherUri = connection
									.getSystemDescription()
									.getWebdispatcherUri();
							var enforceWebdispatcherUri = true;
							var environment;
							var myLocation;
							var uri;
							var sysHost;
							var sysPort;
							var dpHost;
							var dpPort;
							var httpPathWd;
							var useAlias;
							var sysPrefix;
							var prefixIndex;
							var sysAlias;
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(webDispatcherUri)) {
								enforceWebdispatcherUri = false;
								environment = sap.firefly.XEnvironment
										.getVariables();
								webDispatcherUri = environment
										.getByKey(sap.firefly.XEnvironmentConstants.HTTP_DISPATCHER_URI);
								if (sap.firefly.XStringUtils
										.isNullOrEmpty(webDispatcherUri)) {
									webDispatcherUri = environment
											.getByKey(sap.firefly.XEnvironmentConstants.HTTP_DISPATCHER_URI_DOT);
								}
							}
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(webDispatcherUri)) {
								myLocation = sap.firefly.NetworkEnv
										.getLocation();
								uri = sap.firefly.XUri.createFromUriWithParent(
										webDispatcherUri, myLocation, false);
								sysHost = systemDescription.getHost();
								sysPort = systemDescription.getPort();
								dpHost = uri.getHost();
								dpPort = uri.getPort();
								httpPathWd = uri.getPath();
								useAlias = sap.firefly.XString.containsString(
										httpPathWd, "$alias$");
								enforceWebdispatcherUri = enforceWebdispatcherUri
										|| useAlias;
								if ((!enforceWebdispatcherUri)
										&& sap.firefly.XString.isEqual(dpHost,
												sysHost)
										&& (dpPort === sysPort)) {
									uri = null;
								} else {
									if (sap.firefly.XString.containsString(
											httpPathWd, "$prefix$")) {
										sysPrefix = systemDescription
												.getPrefix();
										if (sap.firefly.XString.startsWith(
												sysPrefix, "/")) {
											prefixIndex = sap.firefly.XString
													.indexOf(httpPathWd,
															"$prefix$");
											httpPathWd = sap.firefly.XString
													.substring(httpPathWd,
															prefixIndex, -1);
										}
										httpPathWd = sap.firefly.XString
												.replace(httpPathWd,
														"$prefix$", sysPrefix);
									} else {
										if (useAlias) {
											sysAlias = systemDescription
													.getName();
											httpPathWd = sap.firefly.XString
													.replace(httpPathWd,
															"$alias$", sysAlias);
										} else {
											httpPathWd = sap.firefly.XString
													.replace(httpPathWd,
															"$host$", sysHost);
											httpPathWd = sap.firefly.XString
													.replace(
															httpPathWd,
															"$port$",
															sap.firefly.XInteger
																	.convertIntegerToString(sysPort));
										}
									}
									httpPathWd = sap.firefly.XString.replace(
											httpPathWd, "$path$",
											relativeUriPath);
									uri.setPath(httpPathWd);
									uri.setUser(systemDescription.getUser());
									uri.setPassword(systemDescription
											.getPassword());
									return uri;
								}
							}
							return null;
						},
						getLibVersion : function(application) {
							var libVerBuffer = sap.firefly.XStringBuffer
									.create();
							libVerBuffer.append("[FF-XV:");
							libVerBuffer.appendInt(application.getVersion());
							libVerBuffer.append("/LV:");
							libVerBuffer
									.appendInt(sap.firefly.XVersion.LIBRARY);
							libVerBuffer.append("/GC:");
							libVerBuffer
									.append(sap.firefly.XVersion.GIT_COMMIT_ID);
							libVerBuffer.append("/LG:");
							libVerBuffer.append(sap.firefly.XLanguage
									.getLanguage().getName());
							libVerBuffer.append("]");
							return libVerBuffer.toString();
						},
						printExchangeDebugInfo : function(httpExchange) {
							if (sap.firefly.RpcHttpFunction.ORIGIN_TEST_BUFFER !== null) {
								sap.firefly.RpcHttpFunction.ORIGIN_TEST_BUFFER
										.append(httpExchange.toString())
										.appendNewLine();
							} else {
								sap.firefly.XLogger.println(httpExchange
										.toString());
							}
						}
					},
					m_firstCsrfFetch : false,
					m_httpClient : null,
					m_parameterSerializer : null,
					m_traceResponseFile : null,
					m_fingerprint : null,
					releaseObject : function() {
						this.m_fingerprint = null;
						this.m_httpClient = sap.firefly.XObject
								.releaseIfNotNull(this.m_httpClient);
						this.m_parameterSerializer = sap.firefly.XObject
								.releaseIfNotNull(this.m_parameterSerializer);
						this.m_traceResponseFile = sap.firefly.XObject
								.releaseIfNotNull(this.m_traceResponseFile);
						sap.firefly.RpcHttpFunction.$superclass.releaseObject
								.call(this);
					},
					getComponentName : function() {
						return "RpcHttpFunction";
					},
					getDefaultMessageLayer : function() {
						return sap.firefly.OriginLayer.IOLAYER;
					},
					processSynchronization : function(syncType) {
						if ((sap.firefly.RpcHttpFunction.USE_QUEUE)
								&& (syncType === sap.firefly.SyncType.NON_BLOCKING)) {
							sap.firefly.RpcHttpFunction.s_queue.add(this);
							if (sap.firefly.RpcHttpFunction.s_queue.size() === 1) {
								this
										.doRpcHttpProcessing(sap.firefly.SyncType.NON_BLOCKING);
							}
						} else {
							this.doRpcHttpProcessing(syncType);
						}
						return true;
					},
					cancelSynchronization : function() {
						this.addErrorWithMessage("Request was cancelled");
						this.callListeners(false);
						sap.firefly.RpcHttpFunction.$superclass.cancelSynchronization
								.call(this);
					},
					doRpcHttpProcessing : function(syncType) {
						var connection = this.getActionContext();
						var systemDescription = connection
								.getSystemDescription();
						var relativeUriPath;
						var uri;
						var clientConnection;
						var application;
						var httpRequest;
						var rpcRequest;
						var method;
						var headerFields;
						var reentranceTicket;
						var parameters;
						var keys;
						var key;
						var value;
						var requestStructureName;
						var requestStructure;
						var traceType;
						var traceInfo;
						var protocolTrace;
						var traceName;
						var serializedJsonString;
						var cache;
						var content;
						var response;
						var requestContentType;
						var buffer;
						var hasElement;
						var cookiesMasterStore;
						var normalizedPath;
						var traceFolderPath;
						var tracingFolderFile;
						this.setTraceInfo(connection.getTraceInfo());
						if (this.m_httpClient !== null) {
							this.m_httpClient.releaseObject();
						}
						relativeUriPath = this.getRelativeUriPath(connection);
						uri = sap.firefly.RpcHttpFunction
								.doWebdispatcherRouting(connection,
										systemDescription, relativeUriPath);
						if (uri !== null) {
							clientConnection = uri;
						} else {
							clientConnection = systemDescription;
						}
						application = this.getApplication();
						this.m_httpClient = sap.firefly.HttpClientFactory
								.newInstanceByConnection(application
										.getSession(), clientConnection);
						this.setSyncChild(this.m_httpClient);
						httpRequest = this.m_httpClient.getRequest();
						if (uri !== null) {
							httpRequest.setUri(uri);
							httpRequest
									.setScheme(systemDescription.getScheme());
						} else {
							httpRequest.setConnectionInfo(systemDescription);
							httpRequest.setPath(relativeUriPath);
						}
						rpcRequest = this.getRequest();
						method = rpcRequest.getMethod();
						httpRequest.setMethod(method);
						httpRequest.setAcceptContentType(rpcRequest
								.getAcceptContentType());
						headerFields = httpRequest.getHeaderFieldsBase();
						headerFields.put(
								sap.firefly.HttpConstants.HD_SAP_CLIENT_ID,
								sap.firefly.RpcHttpFunction
										.getLibVersion(application));
						reentranceTicket = connection.getReentranceTicket();
						if (reentranceTicket !== null) {
							headerFields.put(
									sap.firefly.HttpConstants.HD_MYSAPSSO2,
									reentranceTicket);
						}
						parameters = this.prepareParameters();
						keys = parameters.getKeysAsIteratorOfString();
						while (keys.hasNext()) {
							key = keys.next();
							value = parameters.getByKey(key);
							httpRequest.addQueryElement(key, value);
						}
						if (connection.useSessionUrlRewrite()) {
							httpRequest
									.addQueryElement(
											sap.firefly.RpcHttpFunction.REQUEST_PARAM_SESSION_VIA_URL,
											"X");
						}
						requestStructureName = rpcRequest
								.getRequestStructureName();
						requestStructure = rpcRequest.getRequestStructure();
						traceType = this.getTraceType();
						traceInfo = this.getTraceInfo();
						if (traceType === sap.firefly.TraceType.JSON) {
							protocolTrace = requestStructure
									.setNewStructureByName("ProtocolTrace");
							traceName = traceInfo.getTraceName();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(traceName)) {
								protocolTrace
										.setStringByName("Name", traceName);
							}
							protocolTrace.setIntegerByName("Index", traceInfo
									.getTraceIndex());
						} else {
							if (traceType === sap.firefly.TraceType.BW_CATT) {
								httpRequest
										.addQueryElement(
												sap.firefly.RpcHttpFunction.REQUEST_PARAM_SERVER_TRACE_FLAG,
												"C");
							} else {
								if (traceType === sap.firefly.TraceType.BW_STD) {
									httpRequest
											.addQueryElement(
													sap.firefly.RpcHttpFunction.REQUEST_PARAM_SERVER_TRACE_FLAG,
													"X");
								}
							}
						}
						if (application.isSapStatisticsEnabled()) {
							httpRequest
									.addQueryElement(
											sap.firefly.RpcHttpFunction.REQUEST_PARAM_SAP_STATISTICS,
											"true");
						}
						if (this.m_parameterSerializer === null) {
							this.m_parameterSerializer = sap.firefly.JsonSerializerToString
									.create();
						}
						this.setTokenHeader(connection, headerFields,
								sap.firefly.HttpConstants.HD_CSRF_TOKEN,
								connection.getCsrfToken());
						if (systemDescription.getSystemType() === sap.firefly.SystemType.UNV) {
							this
									.setTokenHeader(
											connection,
											headerFields,
											sap.firefly.HttpConstants.HD_BOE_SESSION_TOKEN,
											connection.getBoeSessionToken());
						}
						serializedJsonString = this.m_parameterSerializer
								.serializePrettyPrint(requestStructure, true,
										false, 0);
						if (method === sap.firefly.HttpRequestMethod.HTTP_GET) {
							if (requestStructureName !== null) {
								httpRequest.addQueryElement(
										requestStructureName,
										serializedJsonString);
							}
						} else {
							cache = connection.getCache();
							if (cache.isEnabled()) {
								this.m_fingerprint = sap.firefly.XString
										.createSHA1(serializedJsonString);
								content = cache.getByKey(this.m_fingerprint);
								if (content !== null) {
									response = this.getResponse();
									response.setRootElement(content, null);
									this.setData(response);
									this.endSync();
									return;
								}
							}
							requestContentType = rpcRequest
									.getRequestContentType();
							httpRequest.setHttpContentType(requestContentType);
							if (requestContentType === sap.firefly.HttpContentType.APPLICATION_JSON) {
								httpRequest
										.setStringContent(serializedJsonString);
							} else {
								if (requestContentType === sap.firefly.HttpContentType.APPLICATION_FORM) {
									buffer = sap.firefly.XStringBuffer.create();
									hasElement = false;
									keys = parameters
											.getKeysAsIteratorOfString();
									while (keys.hasNext()) {
										if (hasElement) {
											buffer.append("&");
										}
										key = keys.next();
										value = parameters.getByKey(key);
										buffer.append(sap.firefly.XHttpUtils
												.encodeURIComponent(key));
										buffer.append("=");
										buffer.append(sap.firefly.XHttpUtils
												.encodeURIComponent(value));
										hasElement = true;
									}
									if (requestStructureName !== null) {
										if (hasElement) {
											buffer.append("&");
										}
										buffer.append(requestStructureName);
										buffer.append("=");
										buffer
												.append(sap.firefly.XHttpUtils
														.encodeURIComponent(serializedJsonString));
									}
									httpRequest.setStringContent(buffer
											.toString());
									buffer.releaseObject();
								} else {
									throw sap.firefly.XException
											.createIllegalStateException("Unsupported request content type");
								}
							}
						}
						cookiesMasterStore = connection.getConnectionPool()
								.getCookiesMasterStore();
						httpRequest.setCookiesMasterStore(cookiesMasterStore);
						if (sap.firefly.RpcHttpFunction.DEBUG_MODE) {
							sap.firefly.XLogger.println(httpRequest.toString());
						}
						if (traceType === sap.firefly.TraceType.FILE) {
							if (method === sap.firefly.HttpRequestMethod.HTTP_POST) {
								normalizedPath = traceInfo
										.getTraceFolderInternal();
								if (normalizedPath === null) {
									traceFolderPath = traceInfo
											.getTraceFolderPath();
									tracingFolderFile = sap.firefly.XFile
											.createByNativePath(traceFolderPath);
									if (tracingFolderFile.isExisting()
											&& tracingFolderFile.isDirectory()) {
										normalizedPath = tracingFolderFile
												.getNormalizedPath();
										traceInfo
												.setTraceFolderInternal(normalizedPath);
									}
								}
								if (normalizedPath !== null) {
									this.saveTraceFile(normalizedPath,
											systemDescription, parameters,
											serializedJsonString);
								}
							}
						}
						if ((sap.firefly.RpcHttpFunction.PRINT_REQUESTS)
								&& (method === sap.firefly.HttpRequestMethod.HTTP_POST)) {
							sap.firefly.RpcHttpFunction
									.printExchangeDebugInfo(httpRequest);
						}
						if (sap.firefly.RpcHttpFunction.TEST_MODE) {
							sap.firefly.RpcHttpFunction.TEST_MODE_LAST_REQUEST = httpRequest;
						}
						if (traceType !== sap.firefly.TraceType.NONE) {
							traceInfo.incrementTraceIndex();
						}
						this.m_httpClient.processHttpRequest(syncType, this,
								null);
					},
					setTokenHeader : function(connection, headerFields,
							headerFieldName, token) {
						if (token !== null) {
							headerFields.put(headerFieldName, token);
						} else {
							if (this.getRequest().getMethod() !== sap.firefly.HttpRequestMethod.HTTP_GET) {
								return;
							}
							if (connection.isLogoffSent()) {
								return;
							}
							headerFields.put(headerFieldName,
									sap.firefly.HttpConstants.VA_CSRF_FETCH);
						}
					},
					saveTraceFile : function(normalizedPath, systemDescription,
							parameters, serializedJsonString) {
						var path = sap.firefly.XStringBuffer.create();
						var appName;
						var tracePath;
						var traceFolder;
						var appReqIndex;
						var sizeReqIndex;
						var temp;
						var traceFilePath;
						var traceFile;
						var traceResponseFilePath;
						var byteArray;
						path.append(normalizedPath);
						path.append("/");
						path.append(systemDescription.getHost());
						path.append("/");
						path.appendInt(systemDescription.getPort());
						appName = parameters
								.getByKey(sap.firefly.RpcHttpFunction.REQUEST_PARAM_TRACE_NAME);
						if (appName !== null) {
							path.append("/");
							path.append(appName);
						}
						tracePath = path.toString();
						traceFolder = sap.firefly.XFile.create(tracePath);
						if (!traceFolder.isExisting()) {
							traceFolder.mkdirs();
						}
						path.append("/");
						appReqIndex = parameters
								.getByKey(sap.firefly.RpcHttpFunction.REQUEST_PARAM_TRACE_REQ_INDEX);
						if (appReqIndex !== null) {
							sizeReqIndex = sap.firefly.XString
									.size(appReqIndex);
							if (sizeReqIndex === 1) {
								path.append("00");
							} else {
								if (sizeReqIndex === 2) {
									path.append("0");
								}
							}
							path.append(appReqIndex);
						}
						temp = path.toString();
						path.append("_req.json");
						traceFilePath = path.toString();
						path.releaseObject();
						traceFile = sap.firefly.XFile.create(traceFilePath);
						if (traceFile.isExisting()) {
							traceFile.deleteFile();
						}
						traceResponseFilePath = sap.firefly.XString
								.concatenate2(temp, "_res.json");
						this.m_traceResponseFile = sap.firefly.XFile
								.create(traceResponseFilePath);
						if (this.m_traceResponseFile.isExisting()) {
							this.m_traceResponseFile.deleteFile();
						}
						if (serializedJsonString !== null) {
							byteArray = sap.firefly.XByteArray
									.convertStringToXByteArrayWithCharset(
											serializedJsonString,
											sap.firefly.XCharset.UTF8);
							traceFile.save(byteArray);
						}
					},
					getRelativeUriPath : function(connection) {
						var relativeUriPath = this.m_relativeUri.getPath();
						var sessionUrlRewrite = connection
								.getSessionUrlRewrite();
						var index;
						var pathStart;
						var pathEnd;
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(sessionUrlRewrite)) {
							index = sap.firefly.XString.indexOf(
									relativeUriPath, "/sap/");
							if (index !== -1) {
								pathStart = sap.firefly.XString.substring(
										relativeUriPath, 0, index + 4);
								pathEnd = sap.firefly.XString.substring(
										relativeUriPath, index + 4, -1);
								return sap.firefly.XStringUtils.concatenate3(
										pathStart, sessionUrlRewrite, pathEnd);
							}
						}
						return relativeUriPath;
					},
					prepareParameters : function() {
						var parameters = sap.firefly.XProperties
								.createPropertiesCopy(this.m_rpcRequest
										.getAdditionalParameters());
						var systemDescription = this.getActionContext()
								.getSystemDescription();
						var systemType = systemDescription.getSystemType();
						var language;
						var traceType;
						var traceInfo;
						var traceName;
						var index;
						var tracePath;
						var queryElements;
						var nameValuePair;
						var i;
						if (systemType.isTypeOf(sap.firefly.SystemType.ABAP)) {
							parameters.setStringByName(
									sap.firefly.ConnectionConstants.SAP_CLIENT,
									systemDescription.getClient());
							language = systemDescription.getLanguage();
							if ((language !== null)
									&& (sap.firefly.XString.size(language) > 0)) {
								parameters
										.setStringByName(
												sap.firefly.ConnectionConstants.SAP_LANGUAGE,
												language);
							}
						}
						if (this.m_rpcRequest.getMethod() === sap.firefly.HttpRequestMethod.HTTP_GET) {
							parameters
									.put(
											sap.firefly.RpcHttpFunction.REQUEST_PARAM_TIMESTAMP,
											sap.firefly.XLong
													.convertLongToString(sap.firefly.XSystemUtils
															.getCurrentTimeInMilliseconds()));
						}
						traceType = this.getTraceType();
						if (traceType !== sap.firefly.TraceType.NONE) {
							traceInfo = this.getTraceInfo();
							traceName = traceInfo.getTraceName();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(traceName)) {
								traceName = sap.firefly.XString.replace(
										traceName, ":", ".");
								parameters
										.put(
												sap.firefly.RpcHttpFunction.REQUEST_PARAM_TRACE_NAME,
												traceName);
								index = sap.firefly.XInteger
										.convertIntegerToString(traceInfo
												.getTraceIndex());
								parameters
										.put(
												sap.firefly.RpcHttpFunction.REQUEST_PARAM_TRACE_REQ_INDEX,
												index);
								tracePath = traceInfo.getTraceFolderPath();
								if (sap.firefly.XStringUtils
										.isNotNullAndNotEmpty(tracePath)) {
									parameters
											.put(
													sap.firefly.RpcHttpFunction.REQUEST_PARAM_TRACE_PATH,
													tracePath);
								}
							}
						}
						queryElements = this.m_relativeUri.getQueryElements();
						if (queryElements !== null) {
							for (i = 0; i < queryElements.size(); i++) {
								nameValuePair = queryElements.get(i);
								parameters.put(nameValuePair.getName(),
										nameValuePair.getValue());
							}
						}
						return parameters;
					},
					printResponseDebugInfo : function(response) {
						var synchronizationType = this.getActiveSyncType();
						if (synchronizationType !== null) {
							sap.firefly.XLogger.println(sap.firefly.XString
									.concatenate2("Synchronization type: ",
											synchronizationType.toString()));
						}
						if (response !== null) {
							sap.firefly.XLogger.println(response.toString());
						}
					},
					addHttpErrorInfo : function(response) {
						var statusCodeDetails = response.getStatusCodeDetails();
						var errorBuffer;
						var httpCode;
						var errorStringContent;
						this.addErrorExt(sap.firefly.OriginLayer.PROTOCOL,
								sap.firefly.ErrorCodes.SYSTEM_IO_HTTP,
								statusCodeDetails, null);
						errorBuffer = sap.firefly.XStringBuffer.create();
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(statusCodeDetails)) {
							errorBuffer.append(statusCodeDetails);
							errorBuffer.appendNewLine();
						}
						httpCode = response.getStatusCode();
						if (httpCode === sap.firefly.HttpStatusCode.SC_NOT_FOUND) {
							errorBuffer.append(response.getHttpRequest()
									.getPath());
						}
						if (response.isStringContentSet()) {
							errorStringContent = response.getStringContent();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(errorStringContent)) {
								if ((sap.firefly.XStringUtils
										.isNullOrEmpty(statusCodeDetails))
										|| (!sap.firefly.XString
												.containsString(
														statusCodeDetails,
														errorStringContent))) {
									errorBuffer.append(errorStringContent);
									errorBuffer.appendNewLine();
								}
							}
						}
						this.addErrorExt(sap.firefly.OriginLayer.PROTOCOL,
								httpCode, errorBuffer.toString(), null);
						errorBuffer.releaseObject();
					},
					onHttpResponse : function(extResult, response,
							customIdentifier) {
						var isCsrfTokenRequired = false;
						var traceType;
						var jsonContent;
						var json;
						var byteArray;
						var connection;
						var statusCode;
						var headerFields;
						var sessionUrlRewrite;
						var isGetRequest;
						var csrfToken;
						var boeSessionToken;
						var jsonObject;
						var cache;
						var synchronizationType;
						this.addAllMessages(this.m_httpClient);
						if (sap.firefly.RpcHttpFunction.DEBUG_MODE) {
							this.printResponseDebugInfo(response);
						}
						traceType = this.getTraceType();
						if ((traceType === sap.firefly.TraceType.FILE)
								&& (this.m_traceResponseFile !== null)
								&& (response !== null)) {
							jsonContent = response.getJsonContent();
							if (jsonContent !== null) {
								json = jsonContent.toString();
								byteArray = sap.firefly.XByteArray
										.convertStringToXByteArrayWithCharset(
												json, sap.firefly.XCharset.UTF8);
								this.m_traceResponseFile.save(byteArray);
							}
						}
						connection = this.getActionContext();
						if ((extResult.isValid()) && (response !== null)) {
							statusCode = response.getStatusCode();
							if (!sap.firefly.HttpStatusCode.isOk(statusCode)) {
								this.addHttpErrorInfo(response);
							}
							headerFields = response.getHeaderFields();
							sessionUrlRewrite = headerFields
									.getStringByName(sap.firefly.HttpConstants.HD_SAP_URL_SESSION_ID);
							if (sessionUrlRewrite !== null) {
								connection
										.setSessionUrlRewrite(sessionUrlRewrite);
							}
							isGetRequest = this.getRequest().getMethod() === sap.firefly.HttpRequestMethod.HTTP_GET;
							csrfToken = headerFields
									.getStringByName(sap.firefly.HttpConstants.HD_CSRF_TOKEN);
							if (csrfToken !== null) {
								if (isGetRequest) {
									if (statusCode === sap.firefly.HttpStatusCode.SC_OK) {
										connection.setCsrfToken(csrfToken);
									}
								} else {
									isCsrfTokenRequired = sap.firefly.XString
											.isEqual(
													sap.firefly.HttpConstants.VA_CSRF_REQUIRED,
													csrfToken);
									if (isCsrfTokenRequired) {
										connection.setCsrfToken(null);
									}
								}
							}
							if (connection.getSystemDescription()
									.getSystemType() === sap.firefly.SystemType.UNV) {
								boeSessionToken = headerFields
										.getStringByName(sap.firefly.HttpConstants.HD_BOE_SESSION_TOKEN);
								if (boeSessionToken !== null) {
									if (isGetRequest
											&& (statusCode === sap.firefly.HttpStatusCode.SC_OK)) {
										connection
												.setBoeSessionToken(boeSessionToken);
									}
								}
							}
							if (sap.firefly.RpcHttpFunction.PRINT_RESPONSES) {
								sap.firefly.RpcHttpFunction
										.printExchangeDebugInfo(response);
							}
							jsonObject = response.getJsonContent();
							this.getResponse().setRootElement(jsonObject,
									response.getStringContent());
							if (jsonObject !== null) {
								cache = connection.getCache();
								if ((this.m_fingerprint !== null)
										&& (cache.isEnabled())) {
									cache.put(this.m_fingerprint, jsonObject,
											null);
								}
							}
						}
						synchronizationType = this.getActiveSyncType();
						if (isCsrfTokenRequired) {
							if (this.m_firstCsrfFetch) {
								this.m_firstCsrfFetch = false;
								connection.getServerMetadataExt(
										synchronizationType, this, null, true);
							} else {
								this.addErrorExt(
										sap.firefly.OriginLayer.PROTOCOL,
										sap.firefly.ErrorCodes.INVALID_STATE,
										"Cannot fetch csrf token from server",
										null);
							}
						}
						if ((sap.firefly.RpcHttpFunction.USE_QUEUE)
								&& (synchronizationType === sap.firefly.SyncType.NON_BLOCKING)) {
							sap.firefly.RpcHttpFunction.s_queue.removeAt(0);
							if (sap.firefly.RpcHttpFunction.s_queue
									.hasElements()) {
								sap.firefly.RpcHttpFunction.s_queue
										.get(0)
										.doRpcHttpProcessing(
												sap.firefly.SyncType.NON_BLOCKING);
							}
						}
						this.setData(this.m_rpcResponse);
						this.endSync();
					},
					onServerMetadataLoaded : function(extResult,
							serverMetadata, customIdentifier) {
						this.clearMessages();
						this.doRpcHttpProcessing(this.getActiveSyncType());
					},
					getApplication : function() {
						return this.getActionContext().getApplication();
					}
				});
$Firefly
		.createClass("sap.firefly.DfServiceConfigClassic",
				sap.firefly.DfServiceConfig, {
					processServiceCreation : function(syncType, listener,
							customIdentifier) {
						return this.processSyncAction(syncType, listener,
								customIdentifier);
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						var myListener = listener;
						myListener.onServiceCreation(extResult, data,
								customIdentifier);
					},
					setDataFromService : function(service) {
						this.setData(service);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.RuntimeModule",
				sap.firefly.DfModule,
				{
					$statics : {
						LISTENER_SERVICE_INCUBATOR : null,
						LISTENER_SERVER_METADATA_VALID : null,
						XS_REPOSITORY : "REPOSITORY",
						s_module : null,
						getInstance : function() {
							return sap.firefly.RuntimeModule
									.initVersion(sap.firefly.XVersion.API_DEFAULT);
						},
						initVersion : function(version) {
							var registrationService;
							if (sap.firefly.RuntimeModule.s_module === null) {
								if (sap.firefly.IoNativeModule
										.initVersion(version) === null) {
									throw sap.firefly.XException
											.createInitializationException();
								}
								sap.firefly.RuntimeModule.s_module = new sap.firefly.RuntimeModule();
								registrationService = sap.firefly.RegistrationService
										.getInstance();
								sap.firefly.RuntimeModule.LISTENER_SERVICE_INCUBATOR = sap.firefly.XStringValue
										.create("IServiceCreationListener");
								sap.firefly.RuntimeModule.LISTENER_SERVER_METADATA_VALID = sap.firefly.XStringValue
										.create("IServerMetadataListener");
								sap.firefly.RuntimeComponentType
										.staticSetupRuntimeComponentTypes();
								sap.firefly.SystemRole.staticSetup();
								sap.firefly.ConnectionConstants.staticSetup();
								sap.firefly.SignPresentation.staticSetup();
								sap.firefly.UiManagerFactory.staticSetup();
								sap.firefly.OlapEnvironmentFactory
										.staticSetup();
								sap.firefly.DjPropertyType.staticSetup();
								sap.firefly.ApplicationFactory.staticSetup();
								sap.firefly.SharedMimes.staticSetup();
								sap.firefly.DataBindingType.staticSetup();
								sap.firefly.SigSelType.staticSetup();
								sap.firefly.SigSelDomain.staticSetup();
								sap.firefly.SigSelIndexType.staticSetup();
								sap.firefly.NestedBatchRequestDecoratorProvider
										.staticSetup();
								registrationService
										.addReference(
												sap.firefly.BatchRequestDecoratorFactory.BATCH_REQUEST_DECORATOR_PROVIDER,
												sap.firefly.NestedBatchRequestDecoratorProvider.CLAZZ);
							}
							return sap.firefly.RuntimeModule.s_module;
						}
					}
				});
sap.firefly.RuntimeModule.getInstance();