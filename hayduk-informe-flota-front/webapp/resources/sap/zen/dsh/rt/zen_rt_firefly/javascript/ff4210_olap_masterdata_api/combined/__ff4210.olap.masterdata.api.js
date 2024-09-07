$Firefly.createClass("sap.firefly.CmdSetQueryManagerAtLayer",
		sap.firefly.XObject, {
			$statics : {
				CMD_NAME : "SET_QUERY_MANAGER_AT_LAYER",
				PARAM_I_REPORT_ERRORS : "REPORTS_ERRORS",
				PARAM_I_QUERY_MANAGER : "QUERY_MANAGER",
				PARAM_I_LAYER_MODEL : "LAYER_MODEL",
				PARAM_I_LAYER_ID : "LAYER_ID"
			}
		});
$Firefly.createClass("sap.firefly.MultiSourceMapping", sap.firefly.XObject, {
	$statics : {
		create : function(type) {
			var mapping;
			if (type === null) {
				throw sap.firefly.XException
						.createIllegalArgumentException("type null");
			}
			mapping = new sap.firefly.MultiSourceMapping();
			mapping.m_type = type;
			mapping.m_mappingDefinitions = sap.firefly.XList.create();
			mapping.m_aliases = sap.firefly.XHashSetOfString.create();
			return mapping;
		}
	},
	m_type : null,
	m_mappingDefinitions : null,
	m_aliases : null,
	releaseObject : function() {
		this.m_type = null;
		this.m_mappingDefinitions = sap.firefly.XObject
				.releaseIfNotNull(this.m_mappingDefinitions);
		this.m_aliases = sap.firefly.XObject.releaseIfNotNull(this.m_aliases);
		sap.firefly.MultiSourceMapping.$superclass.releaseObject.call(this);
	},
	getType : function() {
		return this.m_type;
	},
	addMappingDefinition : function(mappingDefinition) {
		var type;
		var alias;
		if (mappingDefinition === null) {
			throw sap.firefly.XException
					.createIllegalArgumentException("mapping definition null");
		}
		type = mappingDefinition.getType();
		if (type === null) {
			throw sap.firefly.XException
					.createIllegalArgumentException("type null");
		}
		if (type !== this.getType()) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal type");
		}
		alias = mappingDefinition.getAlias();
		if (sap.firefly.XStringUtils.isNullOrEmpty(alias)) {
			throw sap.firefly.XException
					.createIllegalArgumentException("alias null");
		}
		if (this.m_aliases.contains(alias)) {
			throw sap.firefly.XException
					.createIllegalArgumentException("duplicate alias");
		}
		this.m_mappingDefinitions.add(mappingDefinition);
		this.m_aliases.put(alias);
		return this;
	},
	getMappingDefinitions : function() {
		return this.m_mappingDefinitions;
	}
});
$Firefly
		.createClass(
				"sap.firefly.MultiSourceMappingDefinition",
				sap.firefly.XObject,
				{
					m_type : null,
					m_alias : null,
					releaseObject : function() {
						this.m_type = null;
						this.m_alias = null;
						sap.firefly.MultiSourceMappingDefinition.$superclass.releaseObject
								.call(this);
					},
					setType : function(type) {
						if (type === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("type null");
						}
						this.m_type = type;
					},
					getType : function() {
						return this.m_type;
					},
					setAlias : function(alias) {
						if (sap.firefly.XStringUtils.isNullOrEmpty(alias)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("alias null");
						}
						this.m_alias = alias;
					},
					getAlias : function() {
						return this.m_alias;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.MultiSourceUtil",
				sap.firefly.XObject,
				{
					$statics : {
						C_FIELD_NAME : "FieldName",
						C_MAPPING : "Mapping",
						C_ALIAS_NAME : "AliasName",
						C_MAPPING_DEFINITION : "MappingDefinition",
						C_MEMBER : "Member",
						C_NAME : "Name",
						C_CONSTANT : "Constant",
						C_VALUE_TYPE : "ValueType",
						C_VALUE : "Value",
						ERROR_FIELD : 3001,
						ERROR_MULTI_SOURCE_NOT_SUPPORTED : 3002,
						ERROR_INCOMPATIBLE_VALUE_TYPES : 3003,
						ERROR_DATA_SOURCE : 3004,
						ERROR_MAPPING : 3005,
						ERROR_STRUCTURE_MEMBER : 3006,
						ERROR_INCOMPATIBLE_DIMENSION_TYPES : 3007,
						addError : function(messages, errorCode, extendedInfo) {
							if (messages === null) {
								return;
							}
							messages.addErrorExt(
									sap.firefly.OriginLayer.DRIVER, errorCode,
									"Multi Source Validation Error",
									extendedInfo);
						},
						isStructureMemberValidForMapping : function(
								structureMember, messageManager) {
							if ((structureMember === null)
									|| (structureMember.getValueType() === null)) {
								sap.firefly.MultiSourceUtil
										.addError(
												messageManager,
												sap.firefly.MultiSourceUtil.ERROR_STRUCTURE_MEMBER,
												structureMember);
								return false;
							}
							return sap.firefly.MultiSourceUtil
									.isDimensionValidForMapping(
											structureMember,
											sap.firefly.MultiSourceUtil.ERROR_STRUCTURE_MEMBER,
											structureMember.getDimension(),
											messageManager);
						},
						isStructureMemberCombinationValidForMapping : function(
								structureMember1, structureMember2,
								messageManager) {
							if (!sap.firefly.MultiSourceUtil
									.isStructureMemberValidForMapping(
											structureMember1, messageManager)
									|| !sap.firefly.MultiSourceUtil
											.isStructureMemberValidForMapping(
													structureMember2,
													messageManager)) {
								return false;
							}
							return sap.firefly.MultiSourceUtil
									._isStructureMemberCombinationValidForMapping(
											structureMember1, structureMember2,
											messageManager);
						},
						_isStructureMemberCombinationValidForMapping : function(
								structureMember1, structureMember2,
								messageManager) {
							var valueType1 = structureMember1.getValueType();
							var valueType2 = structureMember2.getValueType();
							var dimensionType1;
							var dimensionType2;
							if ((valueType1 === null) || (valueType2 === null)
									|| (valueType1 !== valueType2)) {
								sap.firefly.MultiSourceUtil
										.addError(
												messageManager,
												sap.firefly.MultiSourceUtil.ERROR_INCOMPATIBLE_VALUE_TYPES,
												null);
								return false;
							}
							dimensionType1 = structureMember1.getDimension()
									.getDimensionType();
							dimensionType2 = structureMember2.getDimension()
									.getDimensionType();
							if ((dimensionType1 === null)
									|| (dimensionType2 === null)
									|| (dimensionType1 !== dimensionType2)) {
								sap.firefly.MultiSourceUtil
										.addError(
												messageManager,
												sap.firefly.MultiSourceUtil.ERROR_INCOMPATIBLE_DIMENSION_TYPES,
												null);
								return false;
							}
							return true;
						},
						isStructureMemberListValidForMapping : function(
								structureMemberList, messageManager) {
							var isValid = true;
							var validList;
							var i;
							var structureMember;
							var j;
							var structureMember1;
							var k;
							var structureMember2;
							if (structureMemberList === null) {
								return isValid;
							}
							validList = sap.firefly.XList.create();
							for (i = 0; i < structureMemberList.size(); i++) {
								structureMember = structureMemberList.get(i);
								if (sap.firefly.MultiSourceUtil
										.isStructureMemberValidForMapping(
												structureMember, messageManager) === false) {
									isValid = false;
								} else {
									validList.add(structureMember);
								}
							}
							for (j = 0; j < validList.size(); j++) {
								structureMember1 = validList.get(j);
								for (k = j + 1; k < validList.size(); k++) {
									structureMember2 = validList.get(k);
									if (sap.firefly.MultiSourceUtil
											._isStructureMemberCombinationValidForMapping(
													structureMember1,
													structureMember2,
													messageManager) === false) {
										isValid = false;
									}
								}
							}
							return isValid;
						},
						isDimensionValidForMapping : function(contentObject,
								contextErrorCode, dimension, messageManager) {
							var queryModel;
							var queryManager;
							var systemDescription;
							var systemType;
							if (dimension === null) {
								sap.firefly.MultiSourceUtil.addError(
										messageManager, contextErrorCode,
										contentObject);
								return false;
							}
							queryModel = dimension.getQueryModel();
							if (queryModel === null) {
								sap.firefly.MultiSourceUtil.addError(
										messageManager, contextErrorCode,
										contentObject);
								return false;
							}
							queryManager = queryModel.getQueryManager();
							if (queryManager === null) {
								sap.firefly.MultiSourceUtil.addError(
										messageManager, contextErrorCode,
										contentObject);
								return false;
							}
							systemDescription = queryManager
									.getSystemDescription();
							if (systemDescription === null) {
								sap.firefly.MultiSourceUtil.addError(
										messageManager, contextErrorCode,
										contentObject);
								return false;
							}
							systemType = systemDescription.getSystemType();
							if (systemType === null) {
								sap.firefly.MultiSourceUtil.addError(
										messageManager, contextErrorCode,
										contentObject);
								return false;
							}
							if (systemType !== sap.firefly.SystemType.HANA) {
								sap.firefly.MultiSourceUtil
										.addError(
												messageManager,
												sap.firefly.MultiSourceUtil.ERROR_MULTI_SOURCE_NOT_SUPPORTED,
												null);
								return false;
							}
							return true;
						},
						isFieldValidForMapping : function(field, messageManager) {
							if ((field === null)
									|| (field.getPresentationType() === null)
									|| (field.getValueType() === null)) {
								sap.firefly.MultiSourceUtil
										.addError(
												messageManager,
												sap.firefly.MultiSourceUtil.ERROR_FIELD,
												field);
								return false;
							}
							return sap.firefly.MultiSourceUtil
									.isDimensionValidForMapping(
											field,
											sap.firefly.MultiSourceUtil.ERROR_FIELD,
											field.getDimension(),
											messageManager);
						},
						isFieldCombinationValidForMapping : function(field1,
								field2, messageManager) {
							if (!sap.firefly.MultiSourceUtil
									.isFieldValidForMapping(field1,
											messageManager)
									|| !sap.firefly.MultiSourceUtil
											.isFieldValidForMapping(field2,
													messageManager)) {
								return false;
							}
							return sap.firefly.MultiSourceUtil
									._isFieldCombinationValidForMapping(field1,
											field2, messageManager);
						},
						_isFieldCombinationValidForMapping : function(field1,
								field2, messageManager) {
							var valueType1 = field1.getValueType();
							var valueType2 = field2.getValueType();
							var dimensionType1;
							var dimensionType2;
							if ((valueType1 === null) || (valueType2 === null)
									|| (valueType1 !== valueType2)) {
								sap.firefly.MultiSourceUtil
										.addError(
												messageManager,
												sap.firefly.MultiSourceUtil.ERROR_INCOMPATIBLE_VALUE_TYPES,
												null);
								return false;
							}
							dimensionType1 = field1.getDimension()
									.getDimensionType();
							dimensionType2 = field2.getDimension()
									.getDimensionType();
							if ((dimensionType1 === null)
									|| (dimensionType2 === null)
									|| (dimensionType1 !== dimensionType2)) {
								sap.firefly.MultiSourceUtil
										.addError(
												messageManager,
												sap.firefly.MultiSourceUtil.ERROR_INCOMPATIBLE_DIMENSION_TYPES,
												null);
								return false;
							}
							return true;
						},
						isFieldListValidForMapping : function(fieldList,
								messageManager) {
							var isValid = true;
							var validList;
							var i;
							var field;
							var j;
							var field1;
							var k;
							var field2;
							if (fieldList === null) {
								return isValid;
							}
							validList = sap.firefly.XList.create();
							for (i = 0; i < fieldList.size(); i++) {
								field = fieldList.get(i);
								if (sap.firefly.MultiSourceUtil
										.isFieldValidForMapping(field,
												messageManager) === false) {
									isValid = false;
								} else {
									validList.add(field);
								}
							}
							for (j = 0; j < validList.size(); j++) {
								field1 = validList.get(j);
								for (k = j + 1; k < validList.size(); k++) {
									field2 = validList.get(k);
									if (sap.firefly.MultiSourceUtil
											._isFieldCombinationValidForMapping(
													field1, field2,
													messageManager) === false) {
										isValid = false;
									}
								}
							}
							return isValid;
						},
						validateMultiSource : function(multiSource,
								queryManagers, systemDescription, messages) {
							var dataSourceType;
							var queries;
							var validationOk;
							if (multiSource === null) {
								sap.firefly.MultiSourceUtil
										.addError(
												messages,
												sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
												multiSource);
								return false;
							}
							dataSourceType = multiSource.getType();
							if (dataSourceType === null) {
								sap.firefly.MultiSourceUtil
										.addError(
												messages,
												sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
												multiSource);
								return false;
							}
							if (dataSourceType !== sap.firefly.MetaObjectType.MULTI_SOURCE) {
								sap.firefly.MultiSourceUtil
										.addError(
												messages,
												sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
												multiSource);
								return false;
							}
							queries = queryManagers;
							if (queries === null) {
								queries = sap.firefly.XList.create();
							}
							validationOk = sap.firefly.MultiSourceUtil
									.validateMultiSourceInternal(multiSource,
											queries, systemDescription,
											messages);
							sap.firefly.MultiSourceUtil.checkQueryManagers(
									queryManagers, queries);
							return validationOk;
						},
						getDataSourcePlain : function(dataSource) {
							var ds;
							var schemaName;
							if (dataSource === null) {
								return null;
							}
							ds = sap.firefly.QFactory2.newDataSource();
							ds.setFullQualifiedName(dataSource
									.getFullQualifiedName());
							ds.setAlias(null);
							ds.setInstanceId(null);
							schemaName = ds.getSchemaName();
							if (sap.firefly.XString.isEqual("_SYS_BIC",
									schemaName)) {
								ds.setSchemaName(null);
							}
							return ds;
						},
						validateMultiSourceInternal : function(multiSource,
								queries, systemDescription, messageManager) {
							var multiSourcesSize = 0;
							var dataSources = multiSource.getMultiSources();
							var queriesSize;
							var primaryAlias;
							var firstSystemDescription;
							var alias2QueryMap;
							var query;
							var alias;
							var fullQualifiedName;
							var dataSourceType;
							var dataSource;
							var multiSourceIndex;
							var dsNoAlias;
							var queryModel;
							var queryModelDataSource;
							var fqn;
							var sd;
							var isValid;
							var mappingsList;
							var fieldNames;
							var alias2MemberNames;
							var mappingsListIndex;
							var mappingElement;
							var fieldNameString;
							var fieldName;
							var mappings;
							var firstField;
							var firstStructureMember;
							var firstMemberName;
							var firstValueType;
							var fieldList;
							var structureMemberList;
							var aliasNames;
							var mappingIndex;
							var mapping;
							var aliasNameString;
							var aliasName;
							var mappingDefinition;
							var mappingDefinitionSize;
							var constantStructure;
							var memberStructure;
							var constantValueTypeString;
							var constantValueType;
							var memberNameString;
							var memberName;
							var structureMember;
							var field;
							var valueType;
							var memberNames;
							var memberValueType;
							if (dataSources !== null) {
								multiSourcesSize = dataSources.size();
							}
							queriesSize = queries.size();
							if (queriesSize > 0) {
								if (queriesSize !== multiSourcesSize) {
									sap.firefly.MultiSourceUtil
											.addError(
													messageManager,
													sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
													multiSource);
									return false;
								}
							}
							primaryAlias = null;
							firstSystemDescription = null;
							alias2QueryMap = sap.firefly.XHashMapByString
									.create();
							query = null;
							alias = null;
							fullQualifiedName = null;
							dataSourceType = null;
							dataSource = null;
							if (dataSources !== null) {
								for (multiSourceIndex = 0; multiSourceIndex < multiSourcesSize; multiSourceIndex++) {
									dataSource = dataSources
											.get(multiSourceIndex);
									dataSourceType = dataSource.getType();
									if (dataSourceType === null) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
														dataSource);
										return false;
									}
									if ((dataSourceType !== sap.firefly.MetaObjectType.DBVIEW)
											&& (dataSourceType !== sap.firefly.MetaObjectType.PLANNING)) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
														dataSource);
										return false;
									}
									alias = dataSource.getAlias();
									if (sap.firefly.XStringUtils
											.isNullOrEmpty(alias)) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
														dataSource);
										return false;
									}
									if (alias2QueryMap.containsKey(alias)) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
														dataSource);
										return false;
									}
									dsNoAlias = sap.firefly.MultiSourceUtil
											.getDataSourcePlain(dataSource);
									fullQualifiedName = dsNoAlias
											.getFullQualifiedName();
									if (queriesSize > 0) {
										query = queries.get(multiSourceIndex);
										if (query === null) {
											sap.firefly.MultiSourceUtil
													.addError(
															messageManager,
															sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
															dataSource);
											return false;
										}
										queryModel = query.getQueryModel();
										if (queryModel === null) {
											sap.firefly.MultiSourceUtil
													.addError(
															messageManager,
															sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
															dataSource);
											return false;
										}
										queryModelDataSource = sap.firefly.MultiSourceUtil
												.getDataSourcePlain(queryModel
														.getDataSource());
										if (queryModelDataSource === null) {
											sap.firefly.MultiSourceUtil
													.addError(
															messageManager,
															sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
															dataSource);
											return false;
										}
										fqn = queryModelDataSource
												.getFullQualifiedName();
										if (sap.firefly.XString.isEqual(
												fullQualifiedName, fqn) === false) {
											sap.firefly.MultiSourceUtil
													.addError(
															messageManager,
															sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
															dataSource);
											return false;
										}
										sd = query.getSystemDescription();
										if (sd === null) {
											sap.firefly.MultiSourceUtil
													.addError(
															messageManager,
															sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
															dataSource);
											return false;
										}
										if (firstSystemDescription === null) {
											firstSystemDescription = sd;
										} else {
											if (firstSystemDescription !== sd) {
												sap.firefly.MultiSourceUtil
														.addError(
																messageManager,
																sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
																dataSource);
												return false;
											}
										}
									} else {
										query = sap.firefly.MultiSourceUtil
												.createQueryManager(
														systemDescription,
														messageManager,
														dsNoAlias);
										if (query === null) {
											sap.firefly.MultiSourceUtil
													.addError(
															messageManager,
															sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
															dataSource);
											return false;
										}
										queries.add(query);
									}
									alias2QueryMap.put(alias, query);
									if (sap.firefly.XStringUtils
											.isNullOrEmpty(primaryAlias)) {
										primaryAlias = alias;
									}
								}
							}
							isValid = true;
							mappingsList = multiSource.getMappings();
							fieldNames = sap.firefly.XHashSetOfString.create();
							alias2MemberNames = sap.firefly.XHashMapByString
									.create();
							for (mappingsListIndex = 0; mappingsListIndex < sap.firefly.PrUtils
									.getListSize(mappingsList, 0); mappingsListIndex++) {
								mappingElement = sap.firefly.PrUtils
										.getStructureElement(mappingsList,
												mappingsListIndex);
								if (mappingElement === null) {
									sap.firefly.MultiSourceUtil
											.addError(
													messageManager,
													sap.firefly.MultiSourceUtil.ERROR_MAPPING,
													mappingsList);
									isValid = false;
									continue;
								}
								fieldNameString = sap.firefly.PrUtils
										.getStringProperty(
												mappingElement,
												sap.firefly.MultiSourceUtil.C_FIELD_NAME);
								if (fieldNameString === null) {
									sap.firefly.MultiSourceUtil
											.addError(
													messageManager,
													sap.firefly.MultiSourceUtil.ERROR_MAPPING,
													mappingElement);
									isValid = false;
									continue;
								}
								fieldName = fieldNameString.getStringValue();
								if (sap.firefly.XStringUtils
										.isNullOrEmpty(fieldName)) {
									sap.firefly.MultiSourceUtil
											.addError(
													messageManager,
													sap.firefly.MultiSourceUtil.ERROR_MAPPING,
													mappingElement);
									isValid = false;
									continue;
								}
								if (fieldNames.contains(fieldName)) {
									sap.firefly.MultiSourceUtil
											.addError(
													messageManager,
													sap.firefly.MultiSourceUtil.ERROR_MAPPING,
													mappingElement);
									isValid = false;
									continue;
								}
								fieldNames.put(fieldName);
								mappings = sap.firefly.PrUtils.getListProperty(
										mappingElement,
										sap.firefly.MultiSourceUtil.C_MAPPING);
								if (mappings === null) {
									sap.firefly.MultiSourceUtil
											.addError(
													messageManager,
													sap.firefly.MultiSourceUtil.ERROR_MAPPING,
													mappingElement);
									isValid = false;
									continue;
								}
								firstField = null;
								firstStructureMember = null;
								firstMemberName = null;
								firstValueType = null;
								fieldList = null;
								structureMemberList = null;
								aliasNames = sap.firefly.XHashSetOfString
										.create();
								for (mappingIndex = 0; mappingIndex < sap.firefly.PrUtils
										.getListSize(mappings, 0); mappingIndex++) {
									mapping = sap.firefly.PrUtils
											.getStructureElement(mappings,
													mappingIndex);
									if (mapping === null) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_MAPPING,
														mappings);
										isValid = false;
										continue;
									}
									aliasNameString = sap.firefly.PrUtils
											.getStringProperty(
													mapping,
													sap.firefly.MultiSourceUtil.C_ALIAS_NAME);
									if (aliasNameString === null) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_MAPPING,
														mapping);
										isValid = false;
										continue;
									}
									aliasName = aliasNameString
											.getStringValue();
									if (sap.firefly.XStringUtils
											.isNullOrEmpty(aliasName)) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_MAPPING,
														mapping);
										isValid = false;
										continue;
									}
									if (aliasNames.contains(aliasName)) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_MAPPING,
														mapping);
										isValid = false;
										continue;
									}
									aliasNames.put(aliasName);
									query = alias2QueryMap.getByKey(aliasName);
									if (query === null) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_MAPPING,
														mapping);
										isValid = false;
										continue;
									}
									mappingDefinition = sap.firefly.PrUtils
											.getStructureProperty(
													mapping,
													sap.firefly.MultiSourceUtil.C_MAPPING_DEFINITION);
									if (mappingDefinition === null) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_MAPPING,
														mapping);
										isValid = false;
										continue;
									}
									mappingDefinitionSize = sap.firefly.PrUtils
											.getStructureSize(
													mappingDefinition, 0);
									if (mappingDefinitionSize !== 1) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_MAPPING,
														mapping);
										isValid = false;
										continue;
									}
									constantStructure = sap.firefly.PrUtils
											.getStructureProperty(
													mappingDefinition,
													sap.firefly.MultiSourceUtil.C_CONSTANT);
									memberStructure = sap.firefly.PrUtils
											.getStructureProperty(
													mappingDefinition,
													sap.firefly.MultiSourceUtil.C_MEMBER);
									if (constantStructure !== null) {
										constantValueTypeString = sap.firefly.PrUtils
												.getStringProperty(
														constantStructure,
														sap.firefly.MultiSourceUtil.C_VALUE_TYPE);
										if (constantValueTypeString !== null) {
											constantValueType = constantValueTypeString
													.getStringValue();
											if (sap.firefly.XStringUtils
													.isNullOrEmpty(constantValueType)) {
												sap.firefly.MultiSourceUtil
														.addError(
																messageManager,
																sap.firefly.MultiSourceUtil.ERROR_MAPPING,
																mapping);
												isValid = false;
												continue;
											}
											if (sap.firefly.XStringUtils
													.isNullOrEmpty(firstValueType)) {
												firstValueType = constantValueType;
											} else {
												if (sap.firefly.XString
														.isEqual(
																firstValueType,
																constantValueType) === false) {
													sap.firefly.MultiSourceUtil
															.addError(
																	messageManager,
																	sap.firefly.MultiSourceUtil.ERROR_MAPPING,
																	mapping);
													isValid = false;
													continue;
												}
											}
										}
									} else {
										if (memberStructure !== null) {
											memberNameString = sap.firefly.PrUtils
													.getStringProperty(
															memberStructure,
															sap.firefly.MultiSourceUtil.C_NAME);
											if (memberNameString === null) {
												sap.firefly.MultiSourceUtil
														.addError(
																messageManager,
																sap.firefly.MultiSourceUtil.ERROR_MAPPING,
																mapping);
												isValid = false;
												continue;
											}
											memberName = memberNameString
													.getStringValue();
											if (sap.firefly.XStringUtils
													.isNullOrEmpty(memberName)) {
												sap.firefly.MultiSourceUtil
														.addError(
																messageManager,
																sap.firefly.MultiSourceUtil.ERROR_MAPPING,
																mapping);
												isValid = false;
												continue;
											}
											structureMember = sap.firefly.MultiSourceUtil
													.getStructureMemberByName(
															query, memberName);
											field = sap.firefly.MultiSourceUtil
													.getFieldByName(query,
															memberName);
											valueType = null;
											if (structureMember !== null) {
												if (firstField !== null) {
													sap.firefly.MultiSourceUtil
															.addError(
																	messageManager,
																	sap.firefly.MultiSourceUtil.ERROR_MAPPING,
																	mapping);
													isValid = false;
													continue;
												}
												if (firstStructureMember === null) {
													firstStructureMember = structureMember;
												}
												if (structureMemberList === null) {
													structureMemberList = sap.firefly.XList
															.create();
												}
												structureMemberList
														.add(structureMember);
												valueType = structureMember
														.getValueType();
											} else {
												if (field !== null) {
													if (firstStructureMember !== null) {
														sap.firefly.MultiSourceUtil
																.addError(
																		messageManager,
																		sap.firefly.MultiSourceUtil.ERROR_MAPPING,
																		mapping);
														isValid = false;
														continue;
													}
													if (firstField === null) {
														firstField = field;
													}
													if (fieldList === null) {
														fieldList = sap.firefly.XList
																.create();
													}
													fieldList.add(field);
													valueType = field
															.getValueType();
												} else {
													sap.firefly.MultiSourceUtil
															.addError(
																	messageManager,
																	sap.firefly.MultiSourceUtil.ERROR_MAPPING,
																	mapping);
													isValid = false;
													continue;
												}
											}
											if (sap.firefly.XStringUtils
													.isNullOrEmpty(firstMemberName)) {
												firstMemberName = memberName;
												if (sap.firefly.XString
														.isEqual(aliasName,
																primaryAlias)) {
													if (mappingIndex !== 0) {
														sap.firefly.MultiSourceUtil
																.addError(
																		messageManager,
																		sap.firefly.MultiSourceUtil.ERROR_MAPPING,
																		mapping);
														isValid = false;
														continue;
													}
												}
											}
											memberNames = alias2MemberNames
													.getByKey(aliasName);
											if (memberNames === null) {
												memberNames = sap.firefly.XHashSetOfString
														.create();
												alias2MemberNames.put(
														aliasName, memberNames);
											}
											if (memberNames
													.contains(memberName)) {
												sap.firefly.MultiSourceUtil
														.addError(
																messageManager,
																sap.firefly.MultiSourceUtil.ERROR_MAPPING,
																mapping);
												isValid = false;
												continue;
											}
											memberNames.put(memberName);
											if (valueType === null) {
												sap.firefly.MultiSourceUtil
														.addError(
																messageManager,
																sap.firefly.MultiSourceUtil.ERROR_MAPPING,
																mapping);
												isValid = false;
												continue;
											}
											memberValueType = valueType
													.getName();
											if (sap.firefly.XStringUtils
													.isNullOrEmpty(firstValueType)) {
												firstValueType = memberValueType;
											} else {
												if (sap.firefly.XString
														.isEqual(
																firstValueType,
																memberValueType) === false) {
													sap.firefly.MultiSourceUtil
															.addError(
																	messageManager,
																	sap.firefly.MultiSourceUtil.ERROR_MAPPING,
																	mapping);
													isValid = false;
													continue;
												}
											}
										} else {
											sap.firefly.MultiSourceUtil
													.addError(
															messageManager,
															sap.firefly.MultiSourceUtil.ERROR_MAPPING,
															mapping);
											isValid = false;
											continue;
										}
									}
								}
								if (sap.firefly.MultiSourceUtil
										.isFieldListValidForMapping(fieldList,
												messageManager) === false) {
									isValid = false;
								}
								if (sap.firefly.MultiSourceUtil
										.isStructureMemberListValidForMapping(
												structureMemberList,
												messageManager) === false) {
									isValid = false;
								}
								if (sap.firefly.XStringUtils
										.isNullOrEmpty(firstMemberName)) {
									sap.firefly.MultiSourceUtil
											.addError(
													messageManager,
													sap.firefly.MultiSourceUtil.ERROR_MAPPING,
													mappingElement);
									isValid = false;
								}
								if (sap.firefly.XString.isEqual(fieldName,
										firstMemberName) === false) {
									sap.firefly.MultiSourceUtil
											.addError(
													messageManager,
													sap.firefly.MultiSourceUtil.ERROR_MAPPING,
													mappingElement);
									isValid = false;
								}
							}
							return isValid;
						},
						getFieldByName : function(queryManager, fieldName) {
							var queryModel;
							var field;
							var nonGroupingDimension;
							var dimension;
							if (queryManager === null) {
								return null;
							}
							queryModel = queryManager.getQueryModel();
							if (queryModel === null) {
								return null;
							}
							field = queryModel.getFieldByName(fieldName);
							if (field === null) {
								nonGroupingDimension = queryModel
										.getDimensionByName(fieldName);
								if ((nonGroupingDimension !== null)
										&& (nonGroupingDimension
												.isGroupingDimension() === false)) {
									field = nonGroupingDimension.getKeyField();
								}
							} else {
								dimension = field.getDimension();
								if (dimension === null) {
									field = null;
								} else {
									if (dimension.isGroupingDimension() === false) {
										if (field !== dimension.getKeyField()) {
											field = null;
										}
									}
								}
							}
							return field;
						},
						getStructureMemberByName : function(queryManager,
								structureMemberName) {
							var queryModel;
							var measureStructure;
							if (queryManager === null) {
								return null;
							}
							queryModel = queryManager.getQueryModel();
							if (queryModel === null) {
								return null;
							}
							measureStructure = queryModel.getMeasureDimension();
							if (measureStructure === null) {
								return null;
							}
							return measureStructure
									.getStructureMember(structureMemberName);
						},
						createQueryManager : function(systemDescription,
								messageManager, dataSource) {
							var application;
							var serviceConfig;
							var managerResult;
							var queryManager;
							if (systemDescription === null) {
								sap.firefly.MultiSourceUtil
										.addError(
												messageManager,
												sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
												dataSource);
								return null;
							}
							application = systemDescription.getApplication();
							if (application === null) {
								sap.firefly.MultiSourceUtil
										.addError(
												messageManager,
												sap.firefly.MultiSourceUtil.ERROR_DATA_SOURCE,
												dataSource);
								return null;
							}
							serviceConfig = sap.firefly.QueryServiceConfig
									.createWithDataSource(application,
											systemDescription.getName(),
											dataSource);
							managerResult = serviceConfig
									.processQueryManagerCreation(
											sap.firefly.SyncType.BLOCKING,
											null, null);
							if (managerResult.hasErrors()) {
								if (messageManager !== null) {
									messageManager
											.addAllMessages(managerResult);
								}
								return null;
							}
							queryManager = managerResult.getData();
							return queryManager;
						},
						checkQueryManagers : function(originalQueryManagers,
								localQueryManagers) {
							var i;
							var queryManager;
							if (originalQueryManagers !== null) {
								return;
							}
							if (localQueryManagers === null) {
								return;
							}
							for (i = 0; i < localQueryManagers.size(); i++) {
								queryManager = localQueryManagers.get(i);
								queryManager.releaseObject();
							}
						},
						createMultiSource : function(multiSourceName,
								aliasStrings, fullQualifiedDataSourceStrings,
								queryManagers, systemDescription,
								messageManager) {
							var dataSource = null;
							var queries = queryManagers;
							var dataSources;
							var i;
							var queryIndex;
							var dataSourceIndex;
							var query;
							var aliases;
							var alias;
							var aliasSet;
							var aliasIndex;
							var dataSourceAliasIndex;
							var multiSource;
							var multiSources;
							var dsIndex;
							var dsWithAlias;
							if (queries === null) {
								queries = sap.firefly.XList.create();
							}
							dataSources = sap.firefly.XList.create();
							if ((fullQualifiedDataSourceStrings !== null)
									&& (fullQualifiedDataSourceStrings.size() > 0)) {
								if (queries.size() > 0) {
									throw sap.firefly.XException
											.createIllegalArgumentException("datasources or queries must contain elements exclusively.");
								}
								for (i = 0; i < fullQualifiedDataSourceStrings
										.size(); i++) {
									dataSource = sap.firefly.QFactory2
											.newDataSource();
									dataSource
											.setFullQualifiedName(fullQualifiedDataSourceStrings
													.get(i));
									dataSource.setAlias(null);
									dataSources.add(dataSource);
								}
							}
							if (queries.size() > 0) {
								if (dataSources.size() > 0) {
									throw sap.firefly.XException
											.createIllegalArgumentException("datasources or queries must contain elements exclusively.");
								}
								for (queryIndex = 0; queryIndex < queries
										.size(); queryIndex++) {
									dataSource = sap.firefly.MultiSourceUtil
											.getDataSourcePlain(queries.get(
													queryIndex).getQueryModel()
													.getDataSource());
									dataSource.setAlias(null);
									dataSources.add(dataSource);
								}
							} else {
								if (dataSources.size() < 1) {
									throw sap.firefly.XException
											.createIllegalArgumentException("datasources or queries must contain elements");
								}
								for (dataSourceIndex = 0; dataSourceIndex < dataSources
										.size(); dataSourceIndex++) {
									dataSource = dataSources
											.get(dataSourceIndex);
									query = sap.firefly.MultiSourceUtil
											.createQueryManager(
													systemDescription,
													messageManager, dataSource);
									if (query === null) {
										return null;
									}
									queries.add(query);
								}
							}
							aliases = aliasStrings;
							if (aliases === null) {
								aliases = sap.firefly.XListOfString.create();
							}
							alias = null;
							if (aliases.size() > 0) {
								if (aliases.size() !== dataSources.size()) {
									throw sap.firefly.XException
											.createIllegalArgumentException("illegal aliases list");
								}
								aliasSet = sap.firefly.XHashSetOfString
										.create();
								for (aliasIndex = 0; aliasIndex < aliases
										.size(); aliasIndex++) {
									alias = aliases.get(aliasIndex);
									if (aliasSet.contains(alias)) {
										throw sap.firefly.XException
												.createIllegalArgumentException("alias must be unique");
									}
									aliasSet.put(alias);
								}
							} else {
								for (dataSourceAliasIndex = 0; dataSourceAliasIndex < dataSources
										.size(); dataSourceAliasIndex++) {
									alias = sap.firefly.XString
											.concatenate2(
													"Source",
													sap.firefly.XInteger
															.convertIntegerToString(dataSourceAliasIndex + 1));
									aliases.add(alias);
								}
							}
							multiSource = sap.firefly.QFactory2.newDataSource();
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(multiSourceName)) {
								multiSource.setObjectName("MULTI_SOURCE");
							} else {
								multiSource.setObjectName(multiSourceName);
							}
							multiSource.setSystemName(systemDescription
									.getName());
							multiSource
									.setType(sap.firefly.MetaObjectType.MULTI_SOURCE);
							multiSources = multiSource.getMultiSourcesBase();
							for (dsIndex = 0; dsIndex < dataSources.size(); dsIndex++) {
								dsWithAlias = sap.firefly.MultiSourceUtil
										.getDataSourcePlain(dataSources
												.get(dsIndex));
								dsWithAlias.setAlias(aliases.get(dsIndex));
								multiSources.add(dsWithAlias);
							}
							if (sap.firefly.MultiSourceUtil
									.validateMultiSource(multiSource, queries,
											null, messageManager) === false) {
								multiSource = null;
							}
							sap.firefly.MultiSourceUtil.checkQueryManagers(
									queryManagers, queries);
							return multiSource;
						},
						setMultiSourceMappings : function(multiSource,
								queryManagers, systemDescription, mappings,
								messageManager) {
							var queries;
							var validationOk;
							var mappingsList;
							if (multiSource === null) {
								throw sap.firefly.XException
										.createIllegalArgumentException("multi source null");
							}
							(multiSource).setMappings(null);
							queries = queryManagers;
							if (queries === null) {
								queries = sap.firefly.XList.create();
							}
							validationOk = sap.firefly.MultiSourceUtil
									.validateMultiSource(multiSource, queries,
											systemDescription, messageManager);
							if (validationOk) {
								if (sap.firefly.XCollectionUtils
										.hasElements(mappings)) {
									mappingsList = sap.firefly.MultiSourceUtil
											.getMappingsList(multiSource,
													queries, mappings);
									if (mappingsList === null) {
										sap.firefly.MultiSourceUtil
												.addError(
														messageManager,
														sap.firefly.MultiSourceUtil.ERROR_MAPPING,
														mappings);
										validationOk = false;
									} else {
										(multiSource).setMappings(mappingsList);
										validationOk = sap.firefly.MultiSourceUtil
												.validateMultiSource(
														multiSource, queries,
														systemDescription,
														messageManager);
									}
								}
							}
							sap.firefly.MultiSourceUtil.checkQueryManagers(
									queryManagers, queries);
							return validationOk;
						},
						getMappingsList : function(multiSource, queryManagers,
								mappings) {
							var mappingsList = sap.firefly.PrList.create();
							var alias2QueryMap = sap.firefly.MultiSourceUtil
									.getAliasToQueryMap(multiSource,
											queryManagers);
							var mappingIndex;
							var mapping;
							var mappingDefinitions;
							var mappingType;
							var mappingsStructure;
							var fieldNameSet;
							var mappingList;
							var mappingDefitionIndex;
							var mappingDefinition;
							var mappingAlias;
							var mappingQuery;
							var memberName;
							var mappingDefinitionField;
							var field;
							var dimension;
							var mappingDefinitionStructureMember;
							var structureMember;
							var mappingStructure;
							var mappingDefinitionStructure;
							var memberStructure;
							for (mappingIndex = 0; mappingIndex < mappings
									.size(); mappingIndex++) {
								mapping = mappings.get(mappingIndex);
								if (mapping === null) {
									throw sap.firefly.XException
											.createIllegalArgumentException("mapping null");
								}
								mappingDefinitions = mapping
										.getMappingDefinitions();
								mappingType = mapping.getType();
								mappingsStructure = sap.firefly.PrStructure
										.create();
								fieldNameSet = false;
								mappingList = null;
								for (mappingDefitionIndex = 0; mappingDefitionIndex < mappingDefinitions
										.size(); mappingDefitionIndex++) {
									mappingDefinition = mappingDefinitions
											.get(mappingDefitionIndex);
									mappingAlias = mappingDefinition.getAlias();
									mappingQuery = alias2QueryMap
											.getByKey(mappingAlias);
									if (mappingQuery === null) {
										return null;
									}
									memberName = null;
									if (mappingType === sap.firefly.MultiSourceMappingType.FIELD) {
										mappingDefinitionField = mappingDefinition;
										field = sap.firefly.MultiSourceUtil
												.getFieldByName(mappingQuery,
														mappingDefinitionField
																.getFieldName());
										if (field === null) {
											return null;
										}
										dimension = field.getDimension();
										if (dimension.isGroupingDimension()) {
											memberName = field.getName();
										} else {
											memberName = dimension.getName();
										}
									} else {
										if (mappingType === sap.firefly.MultiSourceMappingType.STRUCTURE_MEMBER) {
											mappingDefinitionStructureMember = mappingDefinition;
											structureMember = sap.firefly.MultiSourceUtil
													.getStructureMemberByName(
															mappingQuery,
															mappingDefinitionStructureMember
																	.getStructureMemberName());
											if (structureMember === null) {
												return null;
											}
											memberName = structureMember
													.getName();
										} else {
											throw sap.firefly.XException
													.createIllegalArgumentException("illegal type");
										}
									}
									if (sap.firefly.XStringUtils
											.isNullOrEmpty(memberName)) {
										return null;
									}
									if (fieldNameSet === false) {
										mappingsStructure
												.setStringByName(
														sap.firefly.MultiSourceUtil.C_FIELD_NAME,
														memberName);
										fieldNameSet = true;
									}
									mappingStructure = sap.firefly.PrStructure
											.create();
									mappingStructure
											.setStringByName(
													sap.firefly.MultiSourceUtil.C_ALIAS_NAME,
													mappingAlias);
									mappingDefinitionStructure = mappingStructure
											.setNewStructureByName(sap.firefly.MultiSourceUtil.C_MAPPING_DEFINITION);
									memberStructure = mappingDefinitionStructure
											.setNewStructureByName(sap.firefly.MultiSourceUtil.C_MEMBER);
									memberStructure.setStringByName(
											sap.firefly.MultiSourceUtil.C_NAME,
											memberName);
									if (mappingList === null) {
										mappingList = mappingsStructure
												.setNewListByName(sap.firefly.MultiSourceUtil.C_MAPPING);
									}
									mappingList.add(mappingStructure);
								}
								mappingsList.add(mappingsStructure);
							}
							return mappingsList;
						},
						getAliasToQueryMap : function(multiSource,
								queryManagers) {
							var multiSources;
							var alias2QueryMap;
							var multiSourceIndex;
							var dataSource;
							var alias;
							var query;
							if (multiSource === null) {
								return null;
							}
							if ((queryManagers === null)
									|| (queryManagers.size() < 1)) {
								return null;
							}
							multiSources = multiSource.getMultiSources();
							if ((multiSources === null)
									|| (multiSources.size() < 1)) {
								return null;
							}
							if (queryManagers.size() !== multiSources.size()) {
								return null;
							}
							alias2QueryMap = sap.firefly.XHashMapByString
									.create();
							for (multiSourceIndex = 0; multiSourceIndex < multiSources
									.size(); multiSourceIndex++) {
								dataSource = multiSources.get(multiSourceIndex);
								if (dataSource === null) {
									return null;
								}
								alias = dataSource.getAlias();
								if (sap.firefly.XStringUtils
										.isNullOrEmpty(alias)) {
									return null;
								}
								if (alias2QueryMap.containsKey(alias)) {
									return null;
								}
								query = queryManagers.get(multiSourceIndex);
								if (query === null) {
									return null;
								}
								alias2QueryMap.put(alias, query);
							}
							return alias2QueryMap;
						},
						getMappings : function(multiSource, queryManagers,
								systemDescription, messageManager) {
							var queries = queryManagers;
							var validationOk;
							var mappings;
							var alias2QueryMap;
							var mappingsList;
							var mappingsIndex;
							var mappingsStructure;
							var mappingList;
							var mapping;
							var mappingIndex;
							var mappingStructure;
							var alias;
							var query;
							var mappingDefinitionStructure;
							var memberStructure;
							var memberName;
							var structureMember;
							var field;
							if (queries === null) {
								queries = sap.firefly.XList.create();
							}
							validationOk = sap.firefly.MultiSourceUtil
									.validateMultiSource(multiSource,
											queryManagers, systemDescription,
											messageManager);
							mappings = null;
							if (validationOk) {
								mappings = sap.firefly.XList.create();
								alias2QueryMap = sap.firefly.MultiSourceUtil
										.getAliasToQueryMap(multiSource,
												queries);
								mappingsList = multiSource.getMappings();
								for (mappingsIndex = 0; mappingsIndex < sap.firefly.PrUtils
										.getListSize(mappingsList, 0); mappingsIndex++) {
									mappingsStructure = sap.firefly.PrUtils
											.getStructureElement(mappingsList,
													mappingsIndex);
									mappingList = sap.firefly.PrUtils
											.getListProperty(
													mappingsStructure,
													sap.firefly.MultiSourceUtil.C_MAPPING);
									mapping = null;
									for (mappingIndex = 0; mappingIndex < sap.firefly.PrUtils
											.getListSize(mappingList, 0); mappingIndex++) {
										mappingStructure = sap.firefly.PrUtils
												.getStructureElement(
														mappingList,
														mappingIndex);
										alias = sap.firefly.PrUtils
												.getStringValueProperty(
														mappingStructure,
														sap.firefly.MultiSourceUtil.C_ALIAS_NAME,
														null);
										if (sap.firefly.XStringUtils
												.isNullOrEmpty(alias)) {
											continue;
										}
										query = alias2QueryMap.getByKey(alias);
										mappingDefinitionStructure = sap.firefly.PrUtils
												.getStructureProperty(
														mappingStructure,
														sap.firefly.MultiSourceUtil.C_MAPPING_DEFINITION);
										memberStructure = sap.firefly.PrUtils
												.getStructureProperty(
														mappingDefinitionStructure,
														sap.firefly.MultiSourceUtil.C_MEMBER);
										memberName = sap.firefly.PrUtils
												.getStringValueProperty(
														memberStructure,
														sap.firefly.MultiSourceUtil.C_NAME,
														null);
										if (sap.firefly.XStringUtils
												.isNullOrEmpty(memberName)) {
											continue;
										}
										structureMember = sap.firefly.MultiSourceUtil
												.getStructureMemberByName(
														query, memberName);
										field = sap.firefly.MultiSourceUtil
												.getFieldByName(query,
														memberName);
										if (structureMember !== null) {
											if (mapping === null) {
												mapping = sap.firefly.MultiSourceMapping
														.create(sap.firefly.MultiSourceMappingType.STRUCTURE_MEMBER);
											}
											mapping
													.addMappingDefinition(sap.firefly.MultiSourceMappingDefinitionStructureMember
															.create(
																	alias,
																	structureMember,
																	messageManager));
										} else {
											if (field !== null) {
												if (mapping === null) {
													mapping = sap.firefly.MultiSourceMapping
															.create(sap.firefly.MultiSourceMappingType.FIELD);
												}
												mapping
														.addMappingDefinition(sap.firefly.MultiSourceMappingDefinitionField
																.create(alias,
																		field,
																		messageManager));
											} else {
												continue;
											}
										}
									}
									if (mapping !== null) {
										mappings.add(mapping);
									}
								}
							}
							if (validationOk === false) {
								mappings = null;
							}
							sap.firefly.MultiSourceUtil.checkQueryManagers(
									queryManagers, queries);
							return mappings;
						},
						getMappingDefinitionForStructureMember : function(
								mappings, alias, structureMember) {
							var structureMemberName;
							var mappingIndex;
							var mapping;
							var mappingType;
							var mappingDefinitions;
							var mappingDefinitionIndex;
							var mappingDefinition;
							var mappingDefinitionStructureMember;
							if (mappings === null) {
								return null;
							}
							if (sap.firefly.XStringUtils.isNullOrEmpty(alias)) {
								return null;
							}
							if (structureMember === null) {
								return null;
							}
							structureMemberName = structureMember.getName();
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(structureMemberName)) {
								return null;
							}
							for (mappingIndex = 0; mappingIndex < mappings
									.size(); mappingIndex++) {
								mapping = mappings.get(mappingIndex);
								if (mapping === null) {
									continue;
								}
								mappingType = mapping.getType();
								if (mappingType === null) {
									continue;
								}
								if (mappingType !== sap.firefly.MultiSourceMappingType.STRUCTURE_MEMBER) {
									continue;
								}
								mappingDefinitions = mapping
										.getMappingDefinitions();
								for (mappingDefinitionIndex = 0; mappingDefinitionIndex < mappingDefinitions
										.size(); mappingDefinitionIndex++) {
									mappingDefinition = mappingDefinitions
											.get(mappingDefinitionIndex);
									if (sap.firefly.XString.isEqual(alias,
											mappingDefinition.getAlias()) === false) {
										continue;
									}
									mappingDefinitionStructureMember = mappingDefinition;
									if (sap.firefly.XString.isEqual(
											structureMemberName,
											mappingDefinitionStructureMember
													.getStructureMemberName()) === false) {
										continue;
									}
									return mapping;
								}
							}
							return null;
						},
						getMappingDefinitionForField : function(mappings,
								alias, field) {
							var fieldName;
							var mappingIndex;
							var mapping;
							var mappingType;
							var mappingDefinitions;
							var mappingDefinitionIndex;
							var mappingDefinition;
							var mappingDefinitionField;
							if (mappings === null) {
								return null;
							}
							if (sap.firefly.XStringUtils.isNullOrEmpty(alias)) {
								return null;
							}
							if (field === null) {
								return null;
							}
							fieldName = field.getName();
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(fieldName)) {
								return null;
							}
							for (mappingIndex = 0; mappingIndex < mappings
									.size(); mappingIndex++) {
								mapping = mappings.get(mappingIndex);
								if (mapping === null) {
									continue;
								}
								mappingType = mapping.getType();
								if (mappingType === null) {
									continue;
								}
								if (mappingType !== sap.firefly.MultiSourceMappingType.FIELD) {
									continue;
								}
								mappingDefinitions = mapping
										.getMappingDefinitions();
								for (mappingDefinitionIndex = 0; mappingDefinitionIndex < mappingDefinitions
										.size(); mappingDefinitionIndex++) {
									mappingDefinition = mappingDefinitions
											.get(mappingDefinitionIndex);
									if (sap.firefly.XString.isEqual(alias,
											mappingDefinition.getAlias()) === false) {
										continue;
									}
									mappingDefinitionField = mappingDefinition;
									if (sap.firefly.XString.isEqual(fieldName,
											mappingDefinitionField
													.getFieldName()) === false) {
										continue;
									}
									return mapping;
								}
							}
							return null;
						},
						getFieldsValidForMappingToField : function(field,
								queryManager, withKeyFields, withNonKeyFields) {
							var fieldList = sap.firefly.XList.create();
							var fieldsToCheck;
							var i;
							var fieldToCheck;
							if (field === null) {
								return fieldList;
							}
							if (sap.firefly.MultiSourceUtil
									.isFieldValidForMapping(field, null) === false) {
								return fieldList;
							}
							fieldsToCheck = sap.firefly.MultiSourceUtil
									.getFields(queryManager, withKeyFields,
											withNonKeyFields);
							if (fieldsToCheck === null) {
								return fieldList;
							}
							for (i = 0; i < fieldsToCheck.size(); i++) {
								fieldToCheck = fieldsToCheck.get(i);
								if (sap.firefly.MultiSourceUtil
										.isFieldCombinationValidForMapping(
												field, fieldToCheck, null)) {
									fieldList.add(fieldToCheck);
								}
							}
							return fieldList;
						},
						getFieldsValidForMappingToFieldList : function(fields,
								queryManager, withKeyFields, withNonKeyFields) {
							var fieldList = sap.firefly.XList.create();
							var fieldsToCheck;
							var i;
							var fieldToCheck;
							var fieldCombinationList;
							var j;
							if (fields === null) {
								return fieldList;
							}
							if (sap.firefly.MultiSourceUtil
									.isFieldListValidForMapping(fields, null) === false) {
								return fieldList;
							}
							fieldsToCheck = sap.firefly.MultiSourceUtil
									.getFields(queryManager, withKeyFields,
											withNonKeyFields);
							if (fieldsToCheck === null) {
								return fieldList;
							}
							for (i = 0; i < fieldsToCheck.size(); i++) {
								fieldToCheck = fieldsToCheck.get(i);
								fieldCombinationList = sap.firefly.XList
										.create();
								for (j = 0; j < fields.size(); j++) {
									fieldCombinationList.add(fields.get(j));
								}
								fieldCombinationList.add(fieldToCheck);
								if (sap.firefly.MultiSourceUtil
										.isFieldListValidForMapping(
												fieldCombinationList, null)) {
									fieldList.add(fieldToCheck);
								}
							}
							return fieldList;
						},
						getFields : function(queryManager, withKeyFields,
								withNonKeyFields) {
							var queryModel;
							var fieldList;
							var dimensions;
							var i;
							var dimension;
							var keyField;
							var fields;
							var j;
							var field;
							if (queryManager === null) {
								return null;
							}
							queryModel = queryManager.getQueryModel();
							if (queryModel === null) {
								return null;
							}
							fieldList = null;
							dimensions = queryModel.getDimensions();
							if (dimensions !== null) {
								for (i = 0; i < dimensions.size(); i++) {
									dimension = dimensions.get(i);
									if (dimension.isStructure()) {
										continue;
									}
									keyField = dimension.getKeyField();
									if (withKeyFields) {
										if (keyField !== null) {
											if (fieldList === null) {
												fieldList = sap.firefly.XList
														.create();
											}
											fieldList.add(keyField);
										}
									}
									if (withNonKeyFields) {
										fields = dimension.getFields();
										if (fields !== null) {
											for (j = 0; j < fields.size(); j++) {
												field = fields.get(j);
												if ((field !== null)
														&& (field !== keyField)) {
													if (fieldList === null) {
														fieldList = sap.firefly.XList
																.create();
													}
													fieldList.add(field);
												}
											}
										}
									}
								}
							}
							return fieldList;
						},
						getStructureMembersValidForMappingToStructureMember : function(
								structureMember, queryManager) {
							var structureMemberList = sap.firefly.XList
									.create();
							var structureMembersToCheck;
							var i;
							var structureMemberToCheck;
							if (structureMember === null) {
								return structureMemberList;
							}
							if (sap.firefly.MultiSourceUtil
									.isStructureMemberValidForMapping(
											structureMember, null) === false) {
								return structureMemberList;
							}
							structureMembersToCheck = sap.firefly.MultiSourceUtil
									.getMeasureStructureMembers(queryManager);
							if (structureMembersToCheck === null) {
								return structureMemberList;
							}
							for (i = 0; i < structureMembersToCheck.size(); i++) {
								structureMemberToCheck = structureMembersToCheck
										.get(i);
								if (sap.firefly.MultiSourceUtil
										.isStructureMemberCombinationValidForMapping(
												structureMember,
												structureMemberToCheck, null)) {
									structureMemberList
											.add(structureMemberToCheck);
								}
							}
							return structureMemberList;
						},
						getStructureMembersValidForMappingToStructureMemberList : function(
								structureMembers, queryManager) {
							var structureMemberList = sap.firefly.XList
									.create();
							var structureMembersToCheck;
							var i;
							var structureMemberToCheck;
							var structureMemberCombinationList;
							var j;
							if (structureMembers === null) {
								return structureMemberList;
							}
							if (sap.firefly.MultiSourceUtil
									.isStructureMemberListValidForMapping(
											structureMembers, null) === false) {
								return structureMemberList;
							}
							structureMembersToCheck = sap.firefly.MultiSourceUtil
									.getMeasureStructureMembers(queryManager);
							if (structureMembersToCheck === null) {
								return structureMemberList;
							}
							for (i = 0; i < structureMembersToCheck.size(); i++) {
								structureMemberToCheck = structureMembersToCheck
										.get(i);
								structureMemberCombinationList = sap.firefly.XList
										.create();
								for (j = 0; j < structureMembers.size(); j++) {
									structureMemberCombinationList
											.add(structureMembers.get(j));
								}
								structureMemberCombinationList
										.add(structureMemberToCheck);
								if (sap.firefly.MultiSourceUtil
										.isStructureMemberListValidForMapping(
												structureMemberCombinationList,
												null)) {
									structureMemberList
											.add(structureMemberToCheck);
								}
							}
							return structureMemberList;
						},
						getMeasureStructureMembers : function(queryManager) {
							var queryModel;
							var structureMemberList;
							var dimensions;
							var i;
							var dimension;
							var structureMembers;
							var j;
							var structureMember;
							if (queryManager === null) {
								return null;
							}
							queryModel = queryManager.getQueryModel();
							if (queryModel === null) {
								return null;
							}
							structureMemberList = null;
							dimensions = queryModel.getDimensions();
							if (dimensions !== null) {
								for (i = 0; i < dimensions.size(); i++) {
									dimension = dimensions.get(i);
									structureMembers = dimension
											.getAllStructureMembers();
									if (structureMembers !== null) {
										for (j = 0; j < structureMembers.size(); j++) {
											structureMember = structureMembers
													.get(j);
											if (structureMember === null) {
												continue;
											}
											if (structureMemberList === null) {
												structureMemberList = sap.firefly.XList
														.create();
											}
											structureMemberList
													.add(structureMember);
										}
									}
								}
							}
							return structureMemberList;
						},
						mappingsToString : function(mappings) {
							var sb = sap.firefly.XStringBuffer.create();
							var mappingIndex;
							var sourceMapping;
							if (mappings !== null) {
								for (mappingIndex = 0; mappingIndex < mappings
										.size(); mappingIndex++) {
									sourceMapping = mappings.get(mappingIndex);
									sb.append(sap.firefly.MultiSourceUtil
											.mappingToString(sourceMapping));
									sb.appendNewLine();
								}
							}
							return sb.toString();
						},
						mappingToString : function(mapping) {
							var sb = sap.firefly.XStringBuffer.create();
							var sourceMappingType;
							var mappingDefinitions;
							var mappingDefinitionIndex;
							var mappingDefinition;
							var alias;
							var memberName;
							var mappingDefinitionStructureMember;
							var mappingDefinitionField;
							if (mapping !== null) {
								sourceMappingType = mapping.getType();
								sb.append(sourceMappingType.getName());
								mappingDefinitions = mapping
										.getMappingDefinitions();
								for (mappingDefinitionIndex = 0; mappingDefinitionIndex < mappingDefinitions
										.size(); mappingDefinitionIndex++) {
									mappingDefinition = mappingDefinitions
											.get(mappingDefinitionIndex);
									alias = mappingDefinition.getAlias();
									memberName = null;
									if (sourceMappingType === sap.firefly.MultiSourceMappingType.STRUCTURE_MEMBER) {
										mappingDefinitionStructureMember = mappingDefinition;
										memberName = mappingDefinitionStructureMember
												.getStructureMemberName();
									} else {
										if (sourceMappingType === sap.firefly.MultiSourceMappingType.FIELD) {
											mappingDefinitionField = mappingDefinition;
											memberName = mappingDefinitionField
													.getFieldName();
										} else {
											sb.append("illegal mapping type");
										}
									}
									sb.append(" ");
									sb.append(alias);
									sb.append("~");
									sb.append(memberName);
								}
							}
							return sb.toString();
						}
					}
				});
$Firefly.createClass("sap.firefly.SuggestQueryOptions", sap.firefly.XObject,
		{
			$statics : {
				create : function() {
					var options = new sap.firefly.SuggestQueryOptions();
					options.m_exactness = 0.5;
					options.m_dimensionNamesFilter = sap.firefly.XListOfString
							.create();
					return options;
				}
			},
			m_datasourceName : null,
			m_suggestString : null,
			m_exactness : 0,
			m_dimensionNamesFilter : null,
			releaseObject : function() {
				this.m_datasourceName = null;
				this.m_suggestString = null;
				this.m_dimensionNamesFilter = sap.firefly.XObject
						.releaseIfNotNull(this.m_dimensionNamesFilter);
				sap.firefly.SuggestQueryOptions.$superclass.releaseObject
						.call(this);
			},
			getDatasourceName : function() {
				return this.m_datasourceName;
			},
			setDatasourceName : function(datasourceName) {
				this.m_datasourceName = datasourceName;
			},
			getSuggestString : function() {
				return this.m_suggestString;
			},
			setSuggestString : function(suggestString) {
				this.m_suggestString = suggestString;
			},
			getExactness : function() {
				return this.m_exactness;
			},
			setExactness : function(exactness) {
				this.m_exactness = exactness;
			},
			getDimensionNamesFilter : function() {
				return this.m_dimensionNamesFilter;
			}
		});
$Firefly
		.createClass(
				"sap.firefly.SuggestQueryResultItem",
				sap.firefly.XObject,
				{
					$statics : {
						create : function() {
							var result = new sap.firefly.SuggestQueryResultItem();
							result.m_attributes = sap.firefly.XHashMapOfStringByString
									.create();
							return result;
						}
					},
					m_score : 0,
					m_dimension : null,
					m_dimensionKey : null,
					m_dimensionText : null,
					m_attributes : null,
					releaseObject : function() {
						this.m_dimension = null;
						this.m_dimensionKey = null;
						this.m_dimensionText = null;
						this.m_attributes = sap.firefly.XObject
								.releaseIfNotNull(this.m_attributes);
						sap.firefly.SuggestQueryResultItem.$superclass.releaseObject
								.call(this);
					},
					getScore : function() {
						return this.m_score;
					},
					setScore : function(score) {
						this.m_score = score;
					},
					getDimension : function() {
						return this.m_dimension;
					},
					setDimension : function(dimension) {
						this.m_dimension = dimension;
					},
					getDimensionKey : function() {
						return this.m_dimensionKey;
					},
					setDimensionKey : function(dimensionKey) {
						this.m_dimensionKey = dimensionKey;
					},
					getDimensionText : function() {
						return this.m_dimensionText;
					},
					setDimensionText : function(dimensionText) {
						this.m_dimensionText = dimensionText;
					},
					getAttributes : function() {
						return this.m_attributes;
					},
					getAttributesImpl : function() {
						return this.m_attributes;
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						var sortedNames;
						var i;
						var name;
						var value;
						sb.append("Score: ");
						sb.append(sap.firefly.XDouble
								.convertDoubleToString(this.m_score));
						sb.appendNewLine();
						sb.append("Dimension: ");
						sb.append(this.m_dimension);
						sb.appendNewLine();
						sb.append("Dimension key: ");
						sb.append(this.m_dimensionKey);
						sb.appendNewLine();
						sb.append("Dimension text: ");
						sb.append(this.m_dimensionText);
						sb.appendNewLine();
						sb.append("Attributes: ");
						if (this.m_attributes !== null) {
							sortedNames = sap.firefly.XListOfString
									.createFromReadOnlyList(this.m_attributes
											.getKeysAsReadOnlyListOfString());
							sortedNames
									.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
							for (i = 0; i < sortedNames.size(); i++) {
								if (i > 0) {
									sb.append(",");
								}
								name = sortedNames.get(i);
								value = this.m_attributes.getByKey(name);
								sb.append(name);
								sb.append("=");
								sb.append(value);
							}
						}
						sb.appendNewLine();
						return sb.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.SuggestQueryUtil",
				sap.firefly.XObject,
				{
					$statics : {
						createSuggestQueryOptions : function() {
							return sap.firefly.SuggestQueryOptions.create();
						},
						checkSuggestQueryModel : function(queryModel) {
							if (queryModel === null) {
								throw sap.firefly.XException
										.createRuntimeException("query model null");
							}
							if (sap.firefly.XString.isEqual(queryModel
									.getDataSource().getFullQualifiedName(),
									"view:[_SYS_BIC][][$$Suggest$$]") === false) {
								throw sap.firefly.XException
										.createRuntimeException("illegal datasource");
							}
						},
						setupQueryModel : function(queryModel,
								suggestQueryOptions) {
							var convenienceCommands;
							var dataSource;
							var schemaName;
							var packageName;
							var objectName;
							var dimensionNamesFilter;
							var i;
							var dimensionName;
							var suggestString;
							var selection;
							var scoreDimension;
							sap.firefly.SuggestQueryUtil
									.checkSuggestQueryModel(queryModel);
							if (suggestQueryOptions === null) {
								throw sap.firefly.XException
										.createRuntimeException("suggest query options null");
							}
							convenienceCommands = queryModel
									.getConvenienceCommands();
							convenienceCommands.resetToDefault();
							dataSource = sap.firefly.QFactory2.newDataSource();
							dataSource.setFullQualifiedName(suggestQueryOptions
									.getDatasourceName());
							schemaName = dataSource.getSchemaName();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(schemaName)) {
								convenienceCommands
										.addSingleMemberFilterByDimensionName(
												"SchemaName",
												schemaName,
												sap.firefly.ComparisonOperator.EQUAL);
							}
							packageName = dataSource.getPackageName();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(packageName)) {
								convenienceCommands
										.addSingleMemberFilterByDimensionName(
												"PackageName",
												packageName,
												sap.firefly.ComparisonOperator.EQUAL);
							}
							objectName = dataSource.getObjectName();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(objectName)) {
								convenienceCommands
										.addSingleMemberFilterByDimensionName(
												"ObjectName",
												objectName,
												sap.firefly.ComparisonOperator.EQUAL);
							}
							dimensionNamesFilter = suggestQueryOptions
									.getDimensionNamesFilter();
							for (i = 0; i < dimensionNamesFilter.size(); i++) {
								dimensionName = dimensionNamesFilter.get(i);
								if (sap.firefly.XStringUtils
										.isNotNullAndNotEmpty(dimensionName)) {
									convenienceCommands
											.addSingleMemberFilterByDimensionName(
													"Dimension",
													dimensionName,
													sap.firefly.ComparisonOperator.EQUAL);
								}
							}
							suggestString = suggestQueryOptions
									.getSuggestString();
							if (suggestString === null) {
								suggestString = "";
							}
							selection = convenienceCommands
									.addSingleMemberFilterByDimensionName(
											"AttributeValues",
											suggestString,
											sap.firefly.ComparisonOperator.SEARCH);
							selection.setExactness(suggestQueryOptions
									.getExactness());
							scoreDimension = convenienceCommands
									.moveDimensionToAxis("Score",
											sap.firefly.AxisType.ROWS);
							scoreDimension.getResultSetSorting().setDirection(
									sap.firefly.XSortDirection.DESCENDING);
							convenienceCommands.moveDimensionToAxis(
									"Dimension", sap.firefly.AxisType.ROWS);
							convenienceCommands.moveDimensionToAxis(
									"DimensionKey", sap.firefly.AxisType.ROWS);
							convenienceCommands.moveDimensionToAxis(
									"DimensionText", sap.firefly.AxisType.ROWS);
							convenienceCommands.moveDimensionToAxis(
									"AttributeValues",
									sap.firefly.AxisType.ROWS);
						},
						parseAttributes : function(attributeValuesValue) {
							var jsonString;
							var jsonParser;
							var jsonElement;
							var parameters;
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(attributeValuesValue)) {
								return null;
							}
							jsonString = sap.firefly.XStringBuffer.create();
							jsonString.append('{"json":');
							jsonString.append(attributeValuesValue);
							jsonString.append("}");
							jsonParser = sap.firefly.JsonParserFactory
									.newInstance();
							jsonElement = jsonParser.parse(jsonString
									.toString());
							if (jsonParser.hasErrors()) {
								throw sap.firefly.XException
										.createRuntimeException(jsonParser
												.getSummary());
							}
							if (jsonElement !== null) {
								if (jsonElement.getType() !== sap.firefly.PrElementType.STRUCTURE) {
									throw sap.firefly.XException
											.createRuntimeException("JSON string is not a structure");
								}
								parameters = jsonElement.asStructure();
								return parameters.getListByName("json");
							}
							return null;
						},
						getResultItems : function(resultSet) {
							var queryModel;
							var scoreDimension;
							var scoreField;
							var dimensionDimension;
							var dimensionField;
							var dimensionKeyDimension;
							var dimensionKeyField;
							var dimensionTextDimension;
							var dimensionTextField;
							var attributeValuesDimension;
							var attributeValuesField;
							var resultList;
							var rowsAxis;
							var tuplesCount;
							var i;
							var tuple;
							var resultItem;
							var attributes;
							var attributeValuesValue;
							var attributesList;
							var j;
							var nvp;
							var attributeString;
							var valueString;
							if (resultSet === null) {
								throw sap.firefly.XException
										.createRuntimeException("resultset null");
							}
							if (resultSet.hasErrors()) {
								throw sap.firefly.XException
										.createRuntimeException(resultSet
												.getSummary());
							}
							queryModel = resultSet.getQueryModel();
							sap.firefly.SuggestQueryUtil
									.checkSuggestQueryModel(queryModel);
							scoreDimension = queryModel
									.getDimensionByName("Score");
							scoreField = scoreDimension.getKeyField();
							dimensionDimension = queryModel
									.getDimensionByName("Dimension");
							dimensionField = dimensionDimension.getKeyField();
							dimensionKeyDimension = queryModel
									.getDimensionByName("DimensionKey");
							dimensionKeyField = dimensionKeyDimension
									.getKeyField();
							dimensionTextDimension = queryModel
									.getDimensionByName("DimensionText");
							dimensionTextField = dimensionTextDimension
									.getKeyField();
							attributeValuesDimension = queryModel
									.getDimensionByName("AttributeValues");
							attributeValuesField = attributeValuesDimension
									.getKeyField();
							resultList = sap.firefly.XList.create();
							rowsAxis = resultSet.getRowsAxis();
							tuplesCount = rowsAxis.getTuplesCount();
							for (i = 0; i < tuplesCount; i++) {
								tuple = rowsAxis.getTupleByIndex(i);
								resultItem = sap.firefly.SuggestQueryResultItem
										.create();
								resultItem.setScore(tuple
										.getDoubleValueByField(scoreField));
								resultItem.setDimension(tuple
										.getStringValueByField(dimensionField));
								resultItem
										.setDimensionKey(tuple
												.getStringValueByField(dimensionKeyField));
								resultItem
										.setDimensionText(tuple
												.getStringValueByField(dimensionTextField));
								attributes = resultItem.getAttributesImpl();
								attributeValuesValue = tuple
										.getStringValueByField(attributeValuesField);
								attributesList = sap.firefly.SuggestQueryUtil
										.parseAttributes(attributeValuesValue);
								if (attributesList !== null) {
									for (j = 0; j < attributesList.size(); j++) {
										nvp = sap.firefly.PrUtils
												.getStructureElement(
														attributesList, j);
										attributeString = sap.firefly.PrUtils
												.getStringProperty(nvp,
														"Attribute");
										if (attributeString === null) {
											throw sap.firefly.XException
													.createRuntimeException("Attribute null");
										}
										valueString = sap.firefly.PrUtils
												.getStringProperty(nvp, "Value");
										if (valueString === null) {
											throw sap.firefly.XException
													.createRuntimeException("Value null");
										}
										attributes.put(attributeString
												.getStringValue(), valueString
												.getStringValue());
									}
								}
								resultList.add(resultItem);
							}
							return resultList;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QModelComponentMap",
				sap.firefly.XObject,
				{
					$statics : {
						create : function() {
							return new sap.firefly.QModelComponentMap();
						},
						createWithSerialization : function(serializedMapping) {
							var newObj;
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(serializedMapping)) {
								return null;
							}
							newObj = new sap.firefly.QModelComponentMap();
							newObj.deserialize(serializedMapping);
							return newObj;
						}
					},
					m_fieldMapping : null,
					getFieldMapping : function() {
						if (this.m_fieldMapping === null) {
							this.m_fieldMapping = sap.firefly.XHashMapOfStringByString
									.create();
						}
						return this.m_fieldMapping;
					},
					mapField : function(keyField, replacementField) {
						if ((keyField === null) || (replacementField === null)) {
							return;
						}
						this.getFieldMapping().put(keyField.getName(),
								replacementField.getName());
					},
					getFieldForKey : function(keyField) {
						if (keyField === null) {
							return null;
						}
						return this.getFieldMapping().getByKey(
								keyField.getName());
					},
					releaseObject : function() {
						this.m_fieldMapping = sap.firefly.XObject
								.releaseIfNotNull(this.m_fieldMapping);
						sap.firefly.QModelComponentMap.$superclass.releaseObject
								.call(this);
					},
					toString : function() {
						return this.serialize();
					},
					serialize : function() {
						return this.serializeToElement().toString();
					},
					serializeToElement : function() {
						var root = sap.firefly.PrStructure.create();
						var fieldMapping = this.getFieldMapping();
						var fieldMappingList;
						var fieldMappingKeys;
						var fieldMappingValues;
						var i;
						var currentKey;
						var currentValue;
						var newFieldMappingEntry;
						if (fieldMapping.hasElements()) {
							fieldMappingList = root
									.setNewListByName("fieldMapping");
							fieldMappingKeys = this.getFieldMapping()
									.getKeysAsReadOnlyListOfString();
							fieldMappingValues = this.getFieldMapping()
									.getValuesAsReadOnlyListOfString();
							for (i = 0; i < fieldMappingKeys.size(); i++) {
								currentKey = fieldMappingKeys.get(i);
								currentValue = fieldMappingValues.get(i);
								newFieldMappingEntry = sap.firefly.PrStructure
										.create();
								newFieldMappingEntry.setStringByName("key",
										currentKey);
								newFieldMappingEntry.setStringByName("value",
										currentValue);
								fieldMappingList.add(newFieldMappingEntry);
							}
						}
						return root;
					},
					deserialize : function(serializedMapping) {
						var jsonParser;
						var serializedMappingElement;
						if (serializedMapping !== null) {
							jsonParser = sap.firefly.JsonParserFactory
									.newInstance();
							serializedMappingElement = jsonParser
									.parse(serializedMapping);
							if (serializedMappingElement !== null) {
								this
										.deserializeFromElement(serializedMappingElement);
							}
						}
					},
					deserializeFromElement : function(serializedMappingElement) {
						var mappingElement;
						var fieldMappingList;
						var fieldMapping;
						var i;
						var fieldMappingEntry;
						var keyString;
						var valueString;
						if ((serializedMappingElement !== null)
								&& (serializedMappingElement.isStructure())) {
							mappingElement = serializedMappingElement
									.asStructure();
							fieldMappingList = mappingElement
									.getListByName("fieldMapping");
							if (!sap.firefly.PrUtils
									.isListEmpty(fieldMappingList)) {
								this.m_fieldMapping = null;
								fieldMapping = this.getFieldMapping();
								for (i = 0; i < fieldMappingList.size(); i++) {
									fieldMappingEntry = fieldMappingList
											.getStructureByIndex(i);
									keyString = fieldMappingEntry
											.getStringByName("key");
									valueString = fieldMappingEntry
											.getStringByName("value");
									if ((keyString !== null)
											&& (valueString !== null)) {
										fieldMapping
												.put(keyString, valueString);
									}
								}
							}
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.MultiSourceMappingDefinitionField",
				sap.firefly.MultiSourceMappingDefinition,
				{
					$statics : {
						create : function(alias, field, messageManager) {
							var mappingDefinition;
							if (sap.firefly.MultiSourceUtil
									.isFieldValidForMapping(field,
											messageManager) === false) {
								return null;
							}
							mappingDefinition = new sap.firefly.MultiSourceMappingDefinitionField();
							mappingDefinition
									.setType(sap.firefly.MultiSourceMappingType.FIELD);
							mappingDefinition.setAlias(alias);
							mappingDefinition.m_fieldName = field.getName();
							return mappingDefinition;
						}
					},
					m_fieldName : null,
					releaseObject : function() {
						this.m_fieldName = null;
						sap.firefly.MultiSourceMappingDefinitionField.$superclass.releaseObject
								.call(this);
					},
					getFieldName : function() {
						return this.m_fieldName;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.MultiSourceMappingDefinitionStructureMember",
				sap.firefly.MultiSourceMappingDefinition,
				{
					$statics : {
						create : function(alias, structureMember,
								messageManager) {
							var mappingDefinition;
							if (sap.firefly.MultiSourceUtil
									.isStructureMemberValidForMapping(
											structureMember, messageManager) === false) {
								return null;
							}
							mappingDefinition = new sap.firefly.MultiSourceMappingDefinitionStructureMember();
							mappingDefinition
									.setType(sap.firefly.MultiSourceMappingType.STRUCTURE_MEMBER);
							mappingDefinition.setAlias(alias);
							mappingDefinition.m_structureMemberName = structureMember
									.getName();
							return mappingDefinition;
						}
					},
					m_structureMemberName : null,
					releaseObject : function() {
						this.m_structureMemberName = null;
						sap.firefly.MultiSourceMappingDefinitionStructureMember.$superclass.releaseObject
								.call(this);
					},
					getStructureMemberName : function() {
						return this.m_structureMemberName;
					}
				});
$Firefly.createClass("sap.firefly.QModelComponentMapElement",
		sap.firefly.XObject, {
			$statics : {
				create : function(parent, child, mapping,
						saveApiChangesForChild) {
					var newObj = new sap.firefly.QModelComponentMapElement();
					newObj.m_parent = parent;
					newObj.m_child = child;
					newObj.m_mapping = mapping;
					newObj.m_saveApiChanges = saveApiChangesForChild;
					newObj.m_persistedApiChanges = sap.firefly.XList.create();
					return newObj;
				}
			},
			m_parent : null,
			m_child : null,
			m_mapping : null,
			m_saveApiChanges : false,
			m_persistedApiChanges : null,
			getParent : function() {
				return this.m_parent;
			},
			getChild : function() {
				return this.m_child;
			},
			getMapping : function() {
				return this.m_mapping;
			},
			setParent : function(parent) {
				this.m_parent = parent;
			},
			setChild : function(child) {
				this.m_child = child;
			},
			setMapping : function(mapping) {
				this.m_mapping = mapping;
			},
			toString : function() {
				var stringBuffer = sap.firefly.XStringBuffer.create();
				stringBuffer.append(this.m_parent.toString());
				stringBuffer.append(" --> ");
				stringBuffer.append(this.m_child.toString());
				if (this.m_mapping !== null) {
					stringBuffer.append(" Mapping: ");
					stringBuffer.append(this.m_mapping.toString());
				}
				return stringBuffer.toString();
			},
			releaseObject : function() {
				this.m_parent = sap.firefly.XObject
						.releaseIfNotNull(this.m_parent);
				this.m_child = sap.firefly.XObject
						.releaseIfNotNull(this.m_child);
				this.m_mapping = sap.firefly.XObject
						.releaseIfNotNull(this.m_mapping);
				this.m_persistedApiChanges = sap.firefly.XObject
						.releaseIfNotNull(this.m_persistedApiChanges);
				sap.firefly.QModelComponentMapElement.$superclass.releaseObject
						.call(this);
			},
			shouldSaveApiChangesOfChild : function() {
				return this.m_saveApiChanges;
			},
			getLastApiChangeOfChild : function() {
				var lastChange = null;
				if (this.m_persistedApiChanges.size() >= 1) {
					lastChange = this.m_persistedApiChanges
							.get(this.m_persistedApiChanges.size() - 1);
				}
				return lastChange;
			},
			getApiChangesOfChild : function() {
				return this.m_persistedApiChanges;
			},
			addApiChangeOfChild : function(serializedElement) {
				if (serializedElement !== null) {
					this.m_persistedApiChanges.add(serializedElement);
				}
			}
		});
$Firefly
		.createClass(
				"sap.firefly.QModelComponentTunnel",
				sap.firefly.XObject,
				{
					$statics : {
						isValidForReceiverRecording : function(modelComponent) {
							var olapComponentType;
							if ((modelComponent !== null)
									&& (sap.firefly.QModelComponentTunnel
											.isValidComponentType(modelComponent
													.getOlapComponentType()))) {
								olapComponentType = modelComponent
										.getOlapComponentType();
								if (olapComponentType === sap.firefly.OlapComponentType.FILTER_EXPRESSION) {
									return true;
								} else {
									if (olapComponentType
											.isTypeOf(sap.firefly.MemberType.RESTRICTED_MEASURE)) {
										return true;
									}
								}
							}
							return false;
						},
						isValidComponentType : function(olapComponentType) {
							if (olapComponentType === sap.firefly.OlapComponentType.FILTER_EXPRESSION) {
								return true;
							} else {
								if (olapComponentType === sap.firefly.VariableType.DIMENSION_MEMBER_VARIABLE) {
									return true;
								} else {
									if (olapComponentType === sap.firefly.FilterComponentType.CARTESIAN_LIST) {
										return true;
									} else {
										if (olapComponentType
												.isTypeOf(sap.firefly.VariableType.ANY_VARIABLE)) {
											return true;
										} else {
											if (olapComponentType
													.isTypeOf(sap.firefly.MemberType.RESTRICTED_MEASURE)) {
												return true;
											} else {
												if (olapComponentType
														.isTypeOf(sap.firefly.DimensionType.MEASURE_STRUCTURE)) {
													return true;
												}
											}
										}
									}
								}
							}
							return false;
						},
						isValidCombination : function(sender, receiver) {
							if (receiver !== null) {
								if (sap.firefly.QModelComponentTunnel
										.isValidComponentType(receiver
												.getOlapComponentType()) === false) {
									return false;
								}
							}
							if (sender !== null) {
								if (sap.firefly.QModelComponentTunnel
										.isValidComponentType(sender
												.getOlapComponentType()) === false) {
									return false;
								}
							}
							if ((receiver !== null) && (sender !== null)) {
								if (sender.getOlapComponentType() !== receiver
										.getOlapComponentType()) {
									return false;
								}
								if (sender === receiver) {
									return false;
								}
							}
							return true;
						},
						create : function(sender, receiver, mapping) {
							var newObj;
							if (sap.firefly.QModelComponentTunnel
									.isValidCombination(sender, receiver) === false) {
								return null;
							}
							newObj = new sap.firefly.QModelComponentTunnel();
							newObj.m_paused = true;
							newObj.setSender(sender);
							newObj.setReceiver(receiver);
							newObj.setMapping(mapping);
							newObj
									.setApiChangeOfReceiver(newObj.m_currentReceiverState);
							return newObj;
						},
						createWithSerialization : function(serializedTunnel) {
							var newObj;
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(serializedTunnel) === false) {
								return null;
							}
							newObj = new sap.firefly.QModelComponentTunnel();
							newObj.deserialize(serializedTunnel);
							return newObj;
						},
						createWithSerializationElement : function(
								serializedTunnelElement) {
							var newObj;
							if (serializedTunnelElement === null) {
								return null;
							}
							newObj = new sap.firefly.QModelComponentTunnel();
							newObj
									.deserializeFromElement(serializedTunnelElement);
							return newObj;
						},
						save : function(modelComponent) {
							var olapComponentType = modelComponent
									.getOlapComponentType();
							var variable;
							var dimensionMemberVariable;
							if (olapComponentType
									.isTypeOf(sap.firefly.VariableType.ANY_VARIABLE)) {
								variable = modelComponent;
								if (olapComponentType
										.isTypeOf(sap.firefly.VariableType.DIMENSION_MEMBER_VARIABLE)) {
									dimensionMemberVariable = variable;
									return dimensionMemberVariable
											.getMemberSelection()
											.serializeToElement(
													sap.firefly.QModelFormat.INA_REPOSITORY,
													null);
								}
								throw sap.firefly.XException
										.createUnsupportedOperationException();
							}
							return modelComponent.serializeToElement(
									sap.firefly.QModelFormat.INA_REPOSITORY,
									null);
						},
						C_IS_PAUSED : "IsPaused",
						C_API_RECEIVER_STATE : "ApiReceiverState",
						C_TUNNEL_RECEIVER_STATE : "TunnelReceiverState",
						C_TYPE_OF_LAST_CHANGE : "TypeOfLastChange",
						C_MAPPING : "Mapping"
					},
					m_sender : null,
					m_receiver : null,
					m_mapping : null,
					m_paused : false,
					m_ignoreChangeEventsFromReceiver : false,
					m_isRecordingReceiverChanges : false,
					m_initialRecordingState : null,
					m_changedRecordingState : null,
					m_apiRecevierState : null,
					m_tunnelReceiverState : null,
					m_currentReceiverState : null,
					m_typeOfLastChange : null,
					m_changeListener : null,
					setChangeListener : function(changeListener) {
						this.m_changeListener = changeListener;
					},
					notifyModelComponentTunnelChange : function() {
						var currentIgnoreState;
						if (this.m_changeListener === null) {
							return;
						}
						currentIgnoreState = this.m_ignoreChangeEventsFromReceiver;
						this.m_ignoreChangeEventsFromReceiver = true;
						this.m_changeListener
								.onModelComponentTunnelChanged(this);
						this.m_ignoreChangeEventsFromReceiver = currentIgnoreState;
					},
					canRecordReceiverChanges : function() {
						return sap.firefly.QModelComponentTunnel
								.isValidForReceiverRecording(this.getReceiver());
					},
					startRecordingReceiverChanges : function() {
						var receiver = this.getReceiver();
						var serializeToElement;
						if ((this.m_isRecordingReceiverChanges === false)
								&& (this.canRecordReceiverChanges())) {
							serializeToElement = receiver.serializeToElement(
									sap.firefly.QModelFormat.INA_REPOSITORY,
									null);
							if (serializeToElement !== null) {
								this.clearRecordedReceiverChanges();
								this.m_initialRecordingState = serializeToElement;
								this.m_isRecordingReceiverChanges = true;
							}
						}
					},
					stopRecordingReceiverChanges : function() {
						var receiver = this.getReceiver();
						var serializeToElement;
						if ((this.m_isRecordingReceiverChanges)
								&& (receiver !== null)) {
							serializeToElement = receiver.serializeToElement(
									sap.firefly.QModelFormat.INA_REPOSITORY,
									null);
							if (serializeToElement !== null) {
								this.m_changedRecordingState = serializeToElement;
							} else {
								this.clearRecordedReceiverChanges();
							}
						}
						this.m_isRecordingReceiverChanges = false;
					},
					isRecordingReceiverChanges : function() {
						return this.m_isRecordingReceiverChanges;
					},
					clearRecordedReceiverChanges : function() {
						if (this.m_changedRecordingState !== null) {
							this.m_changedRecordingState.releaseObject();
							this.m_changedRecordingState = null;
						}
						if (this.m_initialRecordingState !== null) {
							this.m_initialRecordingState.releaseObject();
							this.m_initialRecordingState = null;
						}
					},
					getSender : function() {
						return this.m_sender;
					},
					getReceiver : function() {
						return this.m_receiver;
					},
					getMapping : function() {
						return this.m_mapping;
					},
					getRecordedReceiverAdditions : function() {
						if ((this.m_isRecordingReceiverChanges)
								|| (this.m_initialRecordingState === null)
								|| (this.m_changedRecordingState === null)) {
							return null;
						}
						return sap.firefly.PrDeltaUtil.getAdditions(
								this.m_initialRecordingState,
								this.m_changedRecordingState);
					},
					getRecordedReceiverDeletions : function() {
						if ((this.m_isRecordingReceiverChanges)
								|| (this.m_initialRecordingState === null)
								|| (this.m_changedRecordingState === null)) {
							return null;
						}
						return sap.firefly.PrDeltaUtil.getDeletions(
								this.m_initialRecordingState,
								this.m_changedRecordingState);
					},
					setReceiver : function(receiver) {
						if (this.m_receiver === receiver) {
							return;
						}
						if (sap.firefly.QModelComponentTunnel
								.isValidCombination(receiver, this.m_sender) === false) {
							return;
						}
						this.unregisterReceiver();
						this.m_receiver = receiver;
						this.registerReceiver();
					},
					setSender : function(sender) {
						if (this.m_sender === sender) {
							return;
						}
						if (sap.firefly.QModelComponentTunnel
								.isValidCombination(this.m_receiver, sender) === false) {
							return;
						}
						this.unregisterSender();
						this.m_sender = sender;
						this.registerSender();
					},
					isOperational : function() {
						return ((this.m_receiver !== null) && (this.m_sender !== null));
					},
					setMapping : function(mapping) {
						this.m_mapping = mapping;
					},
					isInheritancePaused : function() {
						return this.m_paused;
					},
					pauseInheritance : function(pause) {
						if (this.m_paused === pause) {
							return;
						}
						this.m_paused = pause;
						if ((pause === false) && (this.isOperational())) {
							this
									.onModelComponentChanged(
											this.m_sender,
											sap.firefly.QModelComponentChangeType.CHANGE_FROM_SENDER);
						}
					},
					toString : function() {
						return this.serialize();
					},
					releaseObject : function() {
						if (this.m_sender !== null) {
							this.unregisterSender();
						}
						if (this.m_receiver !== null) {
							this.unregisterReceiver();
						}
						this.m_mapping = sap.firefly.XObject
								.releaseIfNotNull(this.m_mapping);
						this.m_apiRecevierState = sap.firefly.XObject
								.releaseIfNotNull(this.m_apiRecevierState);
						this.m_tunnelReceiverState = sap.firefly.XObject
								.releaseIfNotNull(this.m_tunnelReceiverState);
						this.m_typeOfLastChange = null;
						this.m_changeListener = null;
						this.clearRecordedReceiverChanges();
						sap.firefly.QModelComponentTunnel.$superclass.releaseObject
								.call(this);
					},
					getCurrentRecevierState : function() {
						return this.m_currentReceiverState;
					},
					setApiChangeOfReceiver : function(serializedElement) {
						var currentIgnoreState;
						if (serializedElement !== null) {
							currentIgnoreState = this.m_ignoreChangeEventsFromReceiver;
							this.m_ignoreChangeEventsFromReceiver = true;
							this.m_apiRecevierState = serializedElement;
							this.m_typeOfLastChange = sap.firefly.QModelComponentChangeType.CHANGE_FROM_RECEIVER;
							this.m_ignoreChangeEventsFromReceiver = false;
							this.m_ignoreChangeEventsFromReceiver = currentIgnoreState;
							this.notifyModelComponentTunnelChange();
						}
					},
					setTunnelChangeOfReceiver : function(serializedElement) {
						if (serializedElement !== null) {
							this.m_tunnelReceiverState = serializedElement;
							this.m_typeOfLastChange = sap.firefly.QModelComponentChangeType.CHANGE_FROM_SENDER;
							this.notifyModelComponentTunnelChange();
						}
					},
					getTypeOfLastChange : function() {
						return this.m_typeOfLastChange;
					},
					handleChangesFromSender : function(modelComponent) {
						var receiver;
						var olapComponentType;
						var senderVariable;
						var receiverVariable;
						this.m_ignoreChangeEventsFromReceiver = true;
						receiver = this.getReceiver();
						olapComponentType = receiver.getOlapComponentType();
						if (olapComponentType
								.isTypeOf(sap.firefly.VariableType.ANY_VARIABLE)) {
							senderVariable = modelComponent;
							receiverVariable = receiver;
							this
									.applyVariable(senderVariable,
											receiverVariable);
						} else {
							this.applyWithSerialization(modelComponent,
									receiver);
						}
						this.m_ignoreChangeEventsFromReceiver = false;
					},
					handleApiChangesFromReceiver : function(modelComponent) {
						var serializedReceiverComponent = sap.firefly.QModelComponentTunnel
								.save(modelComponent);
						this
								.setApiChangeOfReceiver(serializedReceiverComponent);
					},
					saveCurrentReceiverState : function(modelComponent) {
						var newReceiverState = sap.firefly.QModelComponentTunnel
								.save(modelComponent);
						this.m_currentReceiverState = newReceiverState;
					},
					onModelComponentChanged : function(modelComponent,
							customIdentifier) {
						var changeType = customIdentifier;
						if ((changeType === sap.firefly.QModelComponentChangeType.CHANGE_FROM_SENDER)
								&& (this.m_paused === false)) {
							this.handleChangesFromSender(modelComponent);
						} else {
							if (changeType === sap.firefly.QModelComponentChangeType.CHANGE_FROM_RECEIVER) {
								this.saveCurrentReceiverState(modelComponent);
								if (this.m_ignoreChangeEventsFromReceiver === false) {
									this
											.handleApiChangesFromReceiver(modelComponent);
								}
							}
						}
					},
					applyVariable : function(sender, receiver) {
						var senderStringValue;
						if ((sender !== null) && (receiver !== null)) {
							if (receiver.isInputEnabled()) {
								if (sender.getOlapComponentType() === sap.firefly.VariableType.DIMENSION_MEMBER_VARIABLE) {
									this.applyWithSerialization((sender)
											.getMemberSelection(), (receiver)
											.getMemberSelection());
								} else {
									if (sender.getOlapComponentType() === sap.firefly.VariableType.HIERARCHY_NODE_VARIABLE) {
										this
												.applyWithSerialization(
														(sender)
																.getMemberSelection(),
														(receiver)
																.getMemberSelection());
									} else {
										senderStringValue = sender
												.getValueByString();
										if (senderStringValue !== null) {
											receiver
													.setValueByString(senderStringValue);
										}
									}
								}
							}
						}
					},
					applyRecordedReceiverStates : function(targetElement) {
						var theTargetElement;
						var recordedReceiverDeletions;
						var recordedReceiverAdditions;
						if (targetElement === null) {
							return null;
						}
						theTargetElement = targetElement;
						recordedReceiverDeletions = this
								.getRecordedReceiverDeletions();
						if (recordedReceiverDeletions !== null) {
							theTargetElement = sap.firefly.PrDeltaUtil
									.removeElement(theTargetElement,
											recordedReceiverDeletions, false);
						}
						recordedReceiverAdditions = this
								.getRecordedReceiverAdditions();
						if (recordedReceiverAdditions !== null) {
							theTargetElement = sap.firefly.PrDeltaUtil
									.addStructure(theTargetElement,
											recordedReceiverAdditions, true,
											true);
						}
						return theTargetElement;
					},
					applyWithSerialization : function(sender, receiver) {
						var serializedComponent = sender.serializeToElement(
								sap.firefly.QModelFormat.INA_REPOSITORY, null);
						var ext;
						if (serializedComponent !== null) {
							if (this.getMapping() !== null) {
								serializedComponent = this
										.applyMapping(serializedComponent);
							}
							if ((this.getCurrentRecevierState() !== null)
									&& (this.getCurrentRecevierState()
											.isEqualTo(serializedComponent))) {
								if ((this.m_tunnelReceiverState !== null)
										&& ((this.m_tunnelReceiverState
												.isEqualTo(serializedComponent)))) {
									return;
								}
							}
							this.setTunnelChangeOfReceiver(serializedComponent);
							serializedComponent = this
									.applyRecordedReceiverStates(serializedComponent);
							ext = receiver.deserializeFromElementExt(
									sap.firefly.QModelFormat.INA_REPOSITORY,
									serializedComponent);
							if (ext.hasErrors()) {
								throw sap.firefly.XException
										.createRuntimeException(ext
												.getSummary());
							}
						}
					},
					applyMapping : function(serializedSender) {
						this.parseJsonAndApplyMapping(serializedSender);
						return serializedSender;
					},
					parseJsonAndApplyMapping : function(element) {
						var senderStructure;
						var structureElementNames;
						var i;
						var currentElementName;
						var currentElement;
						var senderList;
						var j;
						var elementSenderList;
						if (element !== null) {
							if (element.isStructure()) {
								senderStructure = element.asStructure();
								structureElementNames = senderStructure
										.getStructureElementNames();
								for (i = 0; i < structureElementNames.size(); i++) {
									currentElementName = structureElementNames
											.get(i);
									currentElement = senderStructure
											.getElementByName(currentElementName);
									if ((sap.firefly.XString
											.isEqual(
													currentElementName,
													sap.firefly.QFactory2
															.getInAConstant(sap.firefly.QFactoryConstants.FIELD_NAME)))
											&& (currentElement.isString())) {
										this.applyFieldMapping(currentElement
												.asString());
									}
									this
											.parseJsonAndApplyMapping(currentElement);
								}
							} else {
								if (element.isList()) {
									senderList = element.asList();
									for (j = 0; j < senderList.size(); j++) {
										elementSenderList = senderList
												.getElementByIndex(j);
										this
												.parseJsonAndApplyMapping(elementSenderList);
									}
								}
							}
						}
					},
					applyFieldMapping : function(fieldElement) {
						var fieldName = fieldElement.getStringValue();
						var queryModel = this.getSender().getContext()
								.getQueryModel();
						var keyField;
						var replacementFieldName;
						if (queryModel !== null) {
							keyField = queryModel.getFieldByName(fieldName);
							if (keyField !== null) {
								replacementFieldName = this.getMapping()
										.getFieldForKey(keyField);
								if (replacementFieldName !== null) {
									fieldElement
											.setStringValue(replacementFieldName);
								}
							}
						}
					},
					unregisterSender : function() {
						var sender = this.getSender();
						if (sender !== null) {
							sender.unregisterChangedListener(this);
							this.m_sender = null;
						}
					},
					registerSender : function() {
						var sender = this.getSender();
						if (sender !== null) {
							sender
									.registerChangedListener(
											this,
											sap.firefly.QModelComponentChangeType.CHANGE_FROM_SENDER);
						}
					},
					unregisterReceiver : function() {
						var receiver = this.getReceiver();
						if (receiver !== null) {
							receiver.unregisterChangedListener(this);
							this.m_receiver = null;
						}
						this.m_currentReceiverState = null;
					},
					registerReceiver : function() {
						var receiver = this.getReceiver();
						if (receiver !== null) {
							receiver
									.registerChangedListener(
											this,
											sap.firefly.QModelComponentChangeType.CHANGE_FROM_RECEIVER);
							this.m_currentReceiverState = receiver
									.serializeToElement(
											sap.firefly.QModelFormat.INA_REPOSITORY,
											null);
						}
					},
					loadApiReceiverState : function() {
						var apiChangeOfReceiver = this.m_apiRecevierState;
						var currentIgnoreState;
						if (apiChangeOfReceiver !== null) {
							currentIgnoreState = this.m_ignoreChangeEventsFromReceiver;
							this.m_ignoreChangeEventsFromReceiver = true;
							this.loadChangeToReceiver(apiChangeOfReceiver);
							this.m_typeOfLastChange = sap.firefly.QModelComponentChangeType.CHANGE_FROM_RESET_TO_RECEIVER;
							this.notifyModelComponentTunnelChange();
							this.m_ignoreChangeEventsFromReceiver = currentIgnoreState;
						}
					},
					loadLastTunnelChangeToReceiver : function() {
						var tunnelChangeOfReceiver = this.m_tunnelReceiverState;
						var currentIgnoreState;
						if (tunnelChangeOfReceiver !== null) {
							currentIgnoreState = this.m_ignoreChangeEventsFromReceiver;
							this.m_ignoreChangeEventsFromReceiver = true;
							this.loadChangeToReceiver(tunnelChangeOfReceiver);
							this.m_typeOfLastChange = sap.firefly.QModelComponentChangeType.CHANGE_FROM_RESET_TO_SENDER;
							this.notifyModelComponentTunnelChange();
							this.m_ignoreChangeEventsFromReceiver = currentIgnoreState;
						}
					},
					loadChangeToReceiver : function(change) {
						var component = this.getReceiver();
						var componentType;
						var variable;
						var dimensionMemberVariable;
						var ext1;
						var ext2;
						if (component === null) {
							return;
						}
						componentType = component.getOlapComponentType();
						if (componentType === null) {
							return;
						}
						if (componentType
								.isTypeOf(sap.firefly.VariableType.ANY_VARIABLE)) {
							variable = component;
							if (variable.isInputEnabled() === false) {
								return;
							}
							if (componentType
									.isTypeOf(sap.firefly.VariableType.DIMENSION_MEMBER_VARIABLE)) {
								dimensionMemberVariable = variable;
								ext1 = dimensionMemberVariable
										.getMemberSelection()
										.deserializeFromElementExt(
												sap.firefly.QModelFormat.INA_REPOSITORY,
												change);
								if (ext1.hasErrors()) {
									throw sap.firefly.XException
											.createRuntimeException(ext1
													.getSummary());
								}
							}
						} else {
							ext2 = component.deserializeFromElementExt(
									sap.firefly.QModelFormat.INA_REPOSITORY,
									change);
							if (ext2.hasErrors()) {
								throw sap.firefly.XException
										.createRuntimeException(ext2
												.getSummary());
							}
						}
					},
					serialize : function() {
						return this.serializeToElement().toString();
					},
					deserialize : function(serializedTunnel) {
						var parser;
						var serializedTunnelElement;
						if (serializedTunnel !== null) {
							parser = sap.firefly.JsonParserFactory
									.newInstance();
							serializedTunnelElement = parser
									.parse(serializedTunnel);
							if (serializedTunnelElement !== null) {
								this
										.deserializeFromElement(serializedTunnelElement);
							}
						}
					},
					serializeToElement : function() {
						var root = sap.firefly.PrStructure.create();
						root.setBooleanByName(
								sap.firefly.QModelComponentTunnel.C_IS_PAUSED,
								this.m_paused);
						root
								.setElementByName(
										sap.firefly.QModelComponentTunnel.C_API_RECEIVER_STATE,
										this.m_apiRecevierState);
						root
								.setElementByName(
										sap.firefly.QModelComponentTunnel.C_TUNNEL_RECEIVER_STATE,
										this.m_tunnelReceiverState);
						if (this.m_typeOfLastChange !== null) {
							root
									.setStringByName(
											sap.firefly.QModelComponentTunnel.C_TYPE_OF_LAST_CHANGE,
											this.m_typeOfLastChange.getName());
						}
						if (this.m_mapping !== null) {
							root
									.setElementByName(
											sap.firefly.QModelComponentTunnel.C_MAPPING,
											this.m_mapping.serializeToElement());
						}
						return root;
					},
					deserializeFromElement : function(serializedTunnelElement) {
						var tunnelStructElement;
						var typeOfLastChange;
						var mappingElement;
						if ((serializedTunnelElement !== null)
								&& (serializedTunnelElement.isStructure())) {
							tunnelStructElement = serializedTunnelElement
									.asStructure();
							this.m_currentReceiverState = null;
							this.setReceiver(null);
							this.setSender(null);
							this.setMapping(null);
							this.m_paused = tunnelStructElement
									.getBooleanByNameWithDefault(
											sap.firefly.QModelComponentTunnel.C_IS_PAUSED,
											true);
							this.m_apiRecevierState = tunnelStructElement
									.getElementByName(sap.firefly.QModelComponentTunnel.C_API_RECEIVER_STATE);
							this.m_tunnelReceiverState = tunnelStructElement
									.getElementByName(sap.firefly.QModelComponentTunnel.C_TUNNEL_RECEIVER_STATE);
							typeOfLastChange = sap.firefly.PrUtils
									.getStringProperty(
											tunnelStructElement,
											sap.firefly.QModelComponentTunnel.C_TYPE_OF_LAST_CHANGE);
							if (typeOfLastChange !== null) {
								this.m_typeOfLastChange = sap.firefly.QModelComponentChangeType
										.lookupName(typeOfLastChange
												.getStringValue());
							}
							mappingElement = tunnelStructElement
									.getElementByName(sap.firefly.QModelComponentTunnel.C_MAPPING);
							if (mappingElement !== null) {
								this.setMapping(sap.firefly.QModelComponentMap
										.createWithSerialization(mappingElement
												.toString()));
							}
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectAuthActivity",
				sap.firefly.XConstant,
				{
					$statics : {
						_ALL : null,
						_DISPLAY : null,
						_DELETE : null,
						_MAINTAIN : null,
						_NONE : null,
						staticSetup : function() {
							sap.firefly.InfoObjectAuthActivity._ALL = sap.firefly.InfoObjectAuthActivity
									.create("ALL");
							sap.firefly.InfoObjectAuthActivity._DISPLAY = sap.firefly.InfoObjectAuthActivity
									.create("DISPLAY");
							sap.firefly.InfoObjectAuthActivity._DELETE = sap.firefly.InfoObjectAuthActivity
									.create("DELETE");
							sap.firefly.InfoObjectAuthActivity._MAINTAIN = sap.firefly.InfoObjectAuthActivity
									.create("MAINTAIN");
							sap.firefly.InfoObjectAuthActivity._NONE = sap.firefly.InfoObjectAuthActivity
									.create("NONE");
						},
						create : function(name) {
							var object = new sap.firefly.InfoObjectAuthActivity();
							object.setupConstant(name);
							return object;
						},
						getAuthActivity : function(type) {
							if (sap.firefly.XString.isEqual(
									sap.firefly.InfoObjectAuthActivity._ALL
											.getName(), type)) {
								return sap.firefly.InfoObjectAuthActivity._ALL;
							} else {
								if (sap.firefly.XString
										.isEqual(
												sap.firefly.InfoObjectAuthActivity._DISPLAY
														.getName(), type)) {
									return sap.firefly.InfoObjectAuthActivity._DISPLAY;
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InfoObjectAuthActivity._DELETE
															.getName(), type)) {
										return sap.firefly.InfoObjectAuthActivity._DELETE;
									} else {
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.InfoObjectAuthActivity._MAINTAIN
																.getName(),
														type)) {
											return sap.firefly.InfoObjectAuthActivity._MAINTAIN;
										} else {
											return sap.firefly.InfoObjectAuthActivity._NONE;
										}
									}
								}
							}
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectAuthSelObject",
				sap.firefly.XConstant,
				{
					$statics : {
						_MASTERDATA_MAINTENANCE : null,
						_MASTERDATA_ANALYSIS : null,
						_HIERARCHY_MAINTENANCE : null,
						_UNKNOWN : null,
						staticSetup : function() {
							sap.firefly.InfoObjectAuthSelObject._MASTERDATA_MAINTENANCE = sap.firefly.InfoObjectAuthSelObject
									.create("S_RS_IOMAD");
							sap.firefly.InfoObjectAuthSelObject._MASTERDATA_ANALYSIS = sap.firefly.InfoObjectAuthSelObject
									.create("ANALYSIS");
							sap.firefly.InfoObjectAuthSelObject._HIERARCHY_MAINTENANCE = sap.firefly.InfoObjectAuthSelObject
									.create("S_RS_HIER");
							sap.firefly.InfoObjectAuthSelObject._UNKNOWN = sap.firefly.InfoObjectAuthSelObject
									.create("UNKNOWN");
						},
						create : function(name) {
							var object = new sap.firefly.InfoObjectAuthSelObject();
							object.setupConstant(name);
							return object;
						},
						getAuthSelObject : function(type) {
							if (sap.firefly.XString
									.isEqual(
											sap.firefly.InfoObjectAuthSelObject._MASTERDATA_MAINTENANCE
													.getName(), type)) {
								return sap.firefly.InfoObjectAuthSelObject._MASTERDATA_MAINTENANCE;
							} else {
								if (sap.firefly.XString
										.isEqual(
												sap.firefly.InfoObjectAuthSelObject._MASTERDATA_ANALYSIS
														.getName(), type)) {
									return sap.firefly.InfoObjectAuthSelObject._MASTERDATA_ANALYSIS;
								} else {
									if (sap.firefly.XString
											.isEqual(
													sap.firefly.InfoObjectAuthSelObject._HIERARCHY_MAINTENANCE
															.getName(), type)) {
										return sap.firefly.InfoObjectAuthSelObject._HIERARCHY_MAINTENANCE;
									} else {
										return sap.firefly.InfoObjectAuthSelObject._UNKNOWN;
									}
								}
							}
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectCheckOperation",
				sap.firefly.XConstant,
				{
					$statics : {
						_NONE : null,
						_CHECK_FOR_DUPLICATES : null,
						_CHECK_HIERARCHY : null,
						_CHECK_ALL : null,
						staticSetup : function() {
							sap.firefly.InfoObjectCheckOperation._NONE = sap.firefly.InfoObjectCheckOperation
									.create("None");
							sap.firefly.InfoObjectCheckOperation._CHECK_FOR_DUPLICATES = sap.firefly.InfoObjectCheckOperation
									.create("CheckDuplicates");
							sap.firefly.InfoObjectCheckOperation._CHECK_HIERARCHY = sap.firefly.InfoObjectCheckOperation
									.create("CheckHierarchy");
							sap.firefly.InfoObjectCheckOperation._CHECK_ALL = sap.firefly.InfoObjectCheckOperation
									.create("CheckAll");
						},
						create : function(name) {
							var object = new sap.firefly.InfoObjectCheckOperation();
							object.setupConstant(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectClearOperation",
				sap.firefly.XConstant,
				{
					$statics : {
						_NONE : null,
						_CLEAR_HIERARCHY_MEMBER : null,
						_CLEAR_HIERARCHY : null,
						_CLEAR_OPERATION : null,
						_CLEAR_ALL : null,
						staticSetup : function() {
							sap.firefly.InfoObjectClearOperation._NONE = sap.firefly.InfoObjectClearOperation
									.create("None");
							sap.firefly.InfoObjectClearOperation._CLEAR_HIERARCHY_MEMBER = sap.firefly.InfoObjectClearOperation
									.create("ClearHierarchyMember");
							sap.firefly.InfoObjectClearOperation._CLEAR_HIERARCHY = sap.firefly.InfoObjectClearOperation
									.create("ClearHierarchy");
							sap.firefly.InfoObjectClearOperation._CLEAR_OPERATION = sap.firefly.InfoObjectClearOperation
									.create("ClearOperation");
							sap.firefly.InfoObjectClearOperation._CLEAR_ALL = sap.firefly.InfoObjectClearOperation
									.create("ClearAll");
						},
						create : function(name) {
							var object = new sap.firefly.InfoObjectClearOperation();
							object.setupConstant(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectHierarchyOperation",
				sap.firefly.XConstant,
				{
					$statics : {
						_NONE : null,
						_ADD_AS_CHILD : null,
						_ADD_AS_NEXT : null,
						_ADD_CHILD_AS_LINK_NODE : null,
						_ADD_NEXT_AS_LINK_NODE : null,
						_INSERT_AS_CHILD : null,
						_INSERT_AS_NEXT : null,
						staticSetup : function() {
							sap.firefly.InfoObjectHierarchyOperation._NONE = sap.firefly.InfoObjectHierarchyOperation
									.create("None");
							sap.firefly.InfoObjectHierarchyOperation._ADD_AS_CHILD = sap.firefly.InfoObjectHierarchyOperation
									.create("AddAsChild");
							sap.firefly.InfoObjectHierarchyOperation._ADD_AS_NEXT = sap.firefly.InfoObjectHierarchyOperation
									.create("AddAsNext");
							sap.firefly.InfoObjectHierarchyOperation._ADD_CHILD_AS_LINK_NODE = sap.firefly.InfoObjectHierarchyOperation
									.create("AddAsChildLinkNode");
							sap.firefly.InfoObjectHierarchyOperation._ADD_NEXT_AS_LINK_NODE = sap.firefly.InfoObjectHierarchyOperation
									.create("AddAsNextLinkNode");
							sap.firefly.InfoObjectHierarchyOperation._INSERT_AS_CHILD = sap.firefly.InfoObjectHierarchyOperation
									.create("InsertAsChild");
							sap.firefly.InfoObjectHierarchyOperation._INSERT_AS_NEXT = sap.firefly.InfoObjectHierarchyOperation
									.create("InsertAsNext");
						},
						create : function(name) {
							var object = new sap.firefly.InfoObjectHierarchyOperation();
							object.setupConstant(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectMode",
				sap.firefly.XConstant,
				{
					$statics : {
						_NONE : null,
						_METADATA : null,
						_GET : null,
						_MODIFY : null,
						_SAVE : null,
						_ACTIVATE : null,
						_SAVE_AND_ACTIVATE : null,
						_HIERARCHY_GET : null,
						_HIERARCHY_MODIFY : null,
						_HIERARCHY_COPY : null,
						_HIERARCHY_CHECK : null,
						_HIERARCHY_SAVE : null,
						_HIERARCHY_ACTIVATE : null,
						_HIERARCHY_SAVE_AND_ACTIVATE : null,
						_HIERARCHY_MEMBER_METADATA : null,
						_HIERARCHY_MEMBER_GET : null,
						_HIERARCHY_MEMBER_MODIFY : null,
						_HIERARCHY_MEMBER_CHECK : null,
						_HIERARCHY_INTERVAL_METADATA : null,
						_HIERARCHY_INTERVAL_GET : null,
						_HIERARCHY_INTERVAL_CHECK : null,
						_HIERARCHY_INTERVAL_MODIFY : null,
						staticSetup : function() {
							sap.firefly.InfoObjectMode._NONE = sap.firefly.InfoObjectMode
									.create("NONE", false);
							sap.firefly.InfoObjectMode._METADATA = sap.firefly.InfoObjectMode
									.create("METADATA", false);
							sap.firefly.InfoObjectMode._GET = sap.firefly.InfoObjectMode
									.create("GET", false);
							sap.firefly.InfoObjectMode._MODIFY = sap.firefly.InfoObjectMode
									.create("MODIFY", false);
							sap.firefly.InfoObjectMode._SAVE = sap.firefly.InfoObjectMode
									.create("SAVE", false);
							sap.firefly.InfoObjectMode._ACTIVATE = sap.firefly.InfoObjectMode
									.create("ACTIVATE", false);
							sap.firefly.InfoObjectMode._SAVE_AND_ACTIVATE = sap.firefly.InfoObjectMode
									.create("SAVE_AND_ACTIVATE", false);
							sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_METADATA = sap.firefly.InfoObjectMode
									.create("METADATA", true);
							sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_GET = sap.firefly.InfoObjectMode
									.create("GET", true);
							sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_MODIFY = sap.firefly.InfoObjectMode
									.create("MODIFY", true);
							sap.firefly.InfoObjectMode._HIERARCHY_MEMBER_CHECK = sap.firefly.InfoObjectMode
									.create("CHECK", true);
							sap.firefly.InfoObjectMode._HIERARCHY_GET = sap.firefly.InfoObjectMode
									.create("GET", true);
							sap.firefly.InfoObjectMode._HIERARCHY_MODIFY = sap.firefly.InfoObjectMode
									.create("MODIFY", true);
							sap.firefly.InfoObjectMode._HIERARCHY_COPY = sap.firefly.InfoObjectMode
									.create("COPY", true);
							sap.firefly.InfoObjectMode._HIERARCHY_CHECK = sap.firefly.InfoObjectMode
									.create("CHECK", true);
							sap.firefly.InfoObjectMode._HIERARCHY_SAVE = sap.firefly.InfoObjectMode
									.create("SAVE", true);
							sap.firefly.InfoObjectMode._HIERARCHY_ACTIVATE = sap.firefly.InfoObjectMode
									.create("ACTIVATE", true);
							sap.firefly.InfoObjectMode._HIERARCHY_SAVE_AND_ACTIVATE = sap.firefly.InfoObjectMode
									.create("SAVE_AND_ACTIVATE", true);
							sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_METADATA = sap.firefly.InfoObjectMode
									.create("METADATA", true);
							sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_GET = sap.firefly.InfoObjectMode
									.create("GET", true);
							sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_CHECK = sap.firefly.InfoObjectMode
									.create("CHECK", true);
							sap.firefly.InfoObjectMode._HIERARCHY_INTERVAL_MODIFY = sap.firefly.InfoObjectMode
									.create("MODIFY", true);
						},
						create : function(name, isHierarchy) {
							var object = new sap.firefly.InfoObjectMode();
							object.setupConstant(name);
							object.setIsHierarchy(isHierarchy);
							return object;
						}
					},
					m_is_hierarchy : false,
					setIsHierarchy : function(isHierarchy) {
						this.m_is_hierarchy = isHierarchy;
					},
					getIsHierarchy : function() {
						return this.m_is_hierarchy;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectSection",
				sap.firefly.XConstant,
				{
					$statics : {
						_UNDEFINED : null,
						_TIME_INDEPENDENT : null,
						_TIME_DEPENDENT : null,
						_TEXTS : null,
						_XXL : null,
						_MVIEW : null,
						_ALL : null,
						staticSetup : function() {
							sap.firefly.InfoObjectSection._UNDEFINED = sap.firefly.InfoObjectSection
									.create("UNDEFINED");
							sap.firefly.InfoObjectSection._TIME_INDEPENDENT = sap.firefly.InfoObjectSection
									.create("TI");
							sap.firefly.InfoObjectSection._TIME_DEPENDENT = sap.firefly.InfoObjectSection
									.create("TD");
							sap.firefly.InfoObjectSection._TEXTS = sap.firefly.InfoObjectSection
									.create("TEXTS");
							sap.firefly.InfoObjectSection._XXL = sap.firefly.InfoObjectSection
									.create("XXL");
							sap.firefly.InfoObjectSection._MVIEW = sap.firefly.InfoObjectSection
									.create("MVIEW");
							sap.firefly.InfoObjectSection._ALL = sap.firefly.InfoObjectSection
									.create("ALL");
						},
						create : function(name) {
							var object = new sap.firefly.InfoObjectSection();
							object.setupConstant(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectTraceLevel",
				sap.firefly.XConstant,
				{
					$statics : {
						T_NO : null,
						T_ABORT : null,
						T_ERROR : null,
						T_WARNING : null,
						T_SUCCESS : null,
						T_INFORMATION : null,
						T_DEBUG : null,
						staticSetup : function() {
							sap.firefly.InfoObjectTraceLevel.T_NO = sap.firefly.InfoObjectTraceLevel
									.create("NO");
							sap.firefly.InfoObjectTraceLevel.T_ABORT = sap.firefly.InfoObjectTraceLevel
									.create("ABORT");
							sap.firefly.InfoObjectTraceLevel.T_ERROR = sap.firefly.InfoObjectTraceLevel
									.create("ERROR");
							sap.firefly.InfoObjectTraceLevel.T_WARNING = sap.firefly.InfoObjectTraceLevel
									.create("WARNING");
							sap.firefly.InfoObjectTraceLevel.T_SUCCESS = sap.firefly.InfoObjectTraceLevel
									.create("SUCCESS");
							sap.firefly.InfoObjectTraceLevel.T_INFORMATION = sap.firefly.InfoObjectTraceLevel
									.create("INFORMATION");
							sap.firefly.InfoObjectTraceLevel.T_DEBUG = sap.firefly.InfoObjectTraceLevel
									.create("DEBUG");
						},
						create : function(type) {
							var traceLevelType = new sap.firefly.InfoObjectTraceLevel();
							traceLevelType.setTraceLevelType(type);
							return traceLevelType;
						}
					},
					setTraceLevelType : function(type) {
						this.setName(type);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.MultiSourceMappingType",
				sap.firefly.XConstant,
				{
					$statics : {
						s_all : null,
						FIELD : null,
						STRUCTURE_MEMBER : null,
						staticSetup : function() {
							sap.firefly.MultiSourceMappingType.s_all = sap.firefly.XSetOfNameObject
									.create();
							sap.firefly.MultiSourceMappingType.FIELD = sap.firefly.MultiSourceMappingType
									.create("Field");
							sap.firefly.MultiSourceMappingType.STRUCTURE_MEMBER = sap.firefly.MultiSourceMappingType
									.create("StructureMember");
						},
						create : function(name) {
							var newConstant = new sap.firefly.MultiSourceMappingType();
							newConstant.setName(name);
							sap.firefly.MultiSourceMappingType.s_all
									.put(newConstant);
							return newConstant;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QModelComponentChangeType",
				sap.firefly.XConstant,
				{
					$statics : {
						CHANGE_FROM_RECEIVER : null,
						CHANGE_FROM_SENDER : null,
						CHANGE_FROM_RESET_TO_SENDER : null,
						CHANGE_FROM_RESET_TO_RECEIVER : null,
						s_lookup : null,
						staticSetup : function() {
							sap.firefly.QModelComponentChangeType.s_lookup = sap.firefly.XHashMapByString
									.create();
							sap.firefly.QModelComponentChangeType.CHANGE_FROM_RECEIVER = sap.firefly.QModelComponentChangeType
									.create("ChangeFromReceiver");
							sap.firefly.QModelComponentChangeType.CHANGE_FROM_SENDER = sap.firefly.QModelComponentChangeType
									.create("ChangeFromSender");
							sap.firefly.QModelComponentChangeType.CHANGE_FROM_RESET_TO_SENDER = sap.firefly.QModelComponentChangeType
									.create("ChangeFromResetToSender");
							sap.firefly.QModelComponentChangeType.CHANGE_FROM_RESET_TO_RECEIVER = sap.firefly.QModelComponentChangeType
									.create("ChangeFromResetToReceiver");
						},
						create : function(name) {
							var newConstant = new sap.firefly.QModelComponentChangeType();
							newConstant.setName(name);
							sap.firefly.QModelComponentChangeType.s_lookup.put(
									name, newConstant);
							return newConstant;
						},
						lookupName : function(name) {
							return sap.firefly.QModelComponentChangeType.s_lookup
									.getByKey(name);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ActionT",
				sap.firefly.XConstant,
				{
					$statics : {
						T_NO : null,
						T_GET : null,
						T_GET_PROVIDER : null,
						T_CREATE : null,
						T_INSERT : null,
						T_MODIFY : null,
						T_DELETE : null,
						T_ACTIVATE : null,
						T_DEACTIVATE : null,
						T_VALIDATE : null,
						T_CLEAN_DATA : null,
						staticSetup : function() {
							sap.firefly.ActionT.T_NO = sap.firefly.ActionT
									.create("No");
							sap.firefly.ActionT.T_GET = sap.firefly.ActionT
									.create("Get");
							sap.firefly.ActionT.T_GET_PROVIDER = sap.firefly.ActionT
									.create("Provider:Get");
							sap.firefly.ActionT.T_CREATE = sap.firefly.ActionT
									.create("Create");
							sap.firefly.ActionT.T_INSERT = sap.firefly.ActionT
									.create("Insert");
							sap.firefly.ActionT.T_MODIFY = sap.firefly.ActionT
									.create("Modify");
							sap.firefly.ActionT.T_DELETE = sap.firefly.ActionT
									.create("Delete");
							sap.firefly.ActionT.T_ACTIVATE = sap.firefly.ActionT
									.create("Activate");
							sap.firefly.ActionT.T_DEACTIVATE = sap.firefly.ActionT
									.create("Deactivate");
							sap.firefly.ActionT.T_VALIDATE = sap.firefly.ActionT
									.create("Validate");
							sap.firefly.ActionT.T_CLEAN_DATA = sap.firefly.ActionT
									.create("CleanData");
						},
						create : function(type) {
							var actionType = new sap.firefly.ActionT();
							actionType.setActionType(type);
							return actionType;
						},
						getActionWithPrefix : function(prefix, action) {
							var iXStringBuffer;
							if ((prefix === null) && (action === null)) {
								return null;
							}
							if (prefix === null) {
								return action.getName();
							}
							iXStringBuffer = sap.firefly.XStringBuffer.create();
							iXStringBuffer.append(prefix);
							iXStringBuffer.append(":");
							iXStringBuffer.append(action.getName());
							return iXStringBuffer.toString();
						}
					},
					setActionType : function(type) {
						this.setName(type);
					}
				});
$Firefly.createClass("sap.firefly.AuditT", sap.firefly.XConstant, {
	$statics : {
		T_ON_ACTIVE : null,
		T_ON_INACTIVE : null,
		T_NO : null,
		staticSetup : function() {
			sap.firefly.AuditT.T_ON_ACTIVE = sap.firefly.AuditT
					.create("OnActive");
			sap.firefly.AuditT.T_ON_INACTIVE = sap.firefly.AuditT
					.create("OnInActive");
			sap.firefly.AuditT.T_NO = sap.firefly.AuditT.create("No");
		},
		create : function(type) {
			var auditType = new sap.firefly.AuditT();
			auditType.setAuditType(type);
			return auditType;
		},
		getAuditT : function(type) {
			if (sap.firefly.XString.isEqual(sap.firefly.AuditT.T_ON_ACTIVE
					.getName(), type)) {
				return sap.firefly.AuditT.T_ON_ACTIVE;
			} else {
				if (sap.firefly.XString.isEqual(
						sap.firefly.AuditT.T_ON_INACTIVE.getName(), type)) {
					return sap.firefly.AuditT.T_ON_INACTIVE;
				} else {
					if (sap.firefly.XString.isEqual(sap.firefly.AuditT.T_NO
							.getName(), type)) {
						return sap.firefly.AuditT.T_NO;
					}
				}
			}
			return null;
		}
	},
	setAuditType : function(type) {
		this.setName(type);
	}
});
$Firefly.createClass("sap.firefly.DataLocationT", sap.firefly.XConstant, {
	$statics : {
		DATABASE : null,
		BYTE : null,
		staticSetup : function() {
			sap.firefly.DataLocationT.DATABASE = sap.firefly.DataLocationT
					.create("DATABASE");
			sap.firefly.DataLocationT.BYTE = sap.firefly.DataLocationT
					.create("BYTE");
		},
		create : function(type) {
			var dataLocationType = new sap.firefly.DataLocationT();
			dataLocationType.setDataLocationType(type);
			return dataLocationType;
		}
	},
	setDataLocationType : function(type) {
		this.setName(type);
	}
});
$Firefly
		.createClass(
				"sap.firefly.DataT",
				sap.firefly.XConstant,
				{
					$statics : {
						STRING : null,
						INFO_OBJECT : null,
						DATE : null,
						TIME : null,
						INTEGER : null,
						FLOATING_POINT : null,
						NUMBER : null,
						staticSetup : function() {
							sap.firefly.DataT.STRING = sap.firefly.DataT
									.create("STRG");
							sap.firefly.DataT.INFO_OBJECT = sap.firefly.DataT
									.create("IOBJ");
							sap.firefly.DataT.DATE = sap.firefly.DataT
									.create("DATS");
							sap.firefly.DataT.TIME = sap.firefly.DataT
									.create("TIMS");
							sap.firefly.DataT.INTEGER = sap.firefly.DataT
									.create("INT4");
							sap.firefly.DataT.FLOATING_POINT = sap.firefly.DataT
									.create("FLTP");
							sap.firefly.DataT.NUMBER = sap.firefly.DataT
									.create("DEC");
						},
						create : function(type) {
							var dataType = new sap.firefly.DataT();
							dataType.setDataType(type);
							return dataType;
						},
						getDataT : function(type) {
							if (sap.firefly.XString.isEqual(
									sap.firefly.DataT.STRING.getName(), type)) {
								return sap.firefly.DataT.STRING;
							} else {
								if (sap.firefly.XString.isEqual(
										sap.firefly.DataT.TIME.getName(), type)) {
									return sap.firefly.DataT.TIME;
								} else {
									if (sap.firefly.XString.isEqual(
											sap.firefly.DataT.INFO_OBJECT
													.getName(), type)) {
										return sap.firefly.DataT.INFO_OBJECT;
									} else {
										if (sap.firefly.XString.isEqual(
												sap.firefly.DataT.DATE
														.getName(), type)) {
											return sap.firefly.DataT.DATE;
										} else {
											if (sap.firefly.XString.isEqual(
													sap.firefly.DataT.INTEGER
															.getName(), type)) {
												return sap.firefly.DataT.INTEGER;
											} else {
												if (sap.firefly.XString
														.isEqual(
																sap.firefly.DataT.FLOATING_POINT
																		.getName(),
																type)) {
													return sap.firefly.DataT.FLOATING_POINT;
												} else {
													if (sap.firefly.XString
															.isEqual(
																	sap.firefly.DataT.NUMBER
																			.getName(),
																	type)) {
														return sap.firefly.DataT.NUMBER;
													}
												}
											}
										}
									}
								}
							}
							return null;
						},
						getSupportedDataT : function() {
							var aDataT = sap.firefly.XList.create();
							aDataT.add(sap.firefly.DataT.STRING);
							aDataT.add(sap.firefly.DataT.INTEGER);
							aDataT.add(sap.firefly.DataT.FLOATING_POINT);
							aDataT.add(sap.firefly.DataT.NUMBER);
							aDataT.add(sap.firefly.DataT.TIME);
							aDataT.add(sap.firefly.DataT.DATE);
							aDataT.add(sap.firefly.DataT.INFO_OBJECT);
							return aDataT;
						}
					},
					setDataType : function(type) {
						this.setName(type);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DateFormatT",
				sap.firefly.XConstant,
				{
					$statics : {
						DDpMMpYYYY : null,
						DDsMMsYYYY : null,
						DDmMMmYYYY : null,
						YYYYpMMpDD : null,
						YYYYsMMsDD : null,
						YYYYmMMmDD : null,
						GYYpMMpDD_JP : null,
						GYYsMMsDD_JP : null,
						GYYmMMmDD_JP : null,
						YYYYsMMsDD_IS1 : null,
						YYYYsMMsDD_IS2 : null,
						YYYYsMMsDD_IR : null,
						staticSetup : function() {
							sap.firefly.DateFormatT.DDpMMpYYYY = sap.firefly.DateFormatT
									.create("1");
							sap.firefly.DateFormatT.DDsMMsYYYY = sap.firefly.DateFormatT
									.create("2");
							sap.firefly.DateFormatT.DDmMMmYYYY = sap.firefly.DateFormatT
									.create("3");
							sap.firefly.DateFormatT.YYYYpMMpDD = sap.firefly.DateFormatT
									.create("4");
							sap.firefly.DateFormatT.YYYYsMMsDD = sap.firefly.DateFormatT
									.create("5");
							sap.firefly.DateFormatT.YYYYmMMmDD = sap.firefly.DateFormatT
									.create("6");
							sap.firefly.DateFormatT.GYYpMMpDD_JP = sap.firefly.DateFormatT
									.create("7");
							sap.firefly.DateFormatT.GYYsMMsDD_JP = sap.firefly.DateFormatT
									.create("8");
							sap.firefly.DateFormatT.GYYmMMmDD_JP = sap.firefly.DateFormatT
									.create("9");
							sap.firefly.DateFormatT.YYYYsMMsDD_IS1 = sap.firefly.DateFormatT
									.create("A");
							sap.firefly.DateFormatT.YYYYsMMsDD_IS2 = sap.firefly.DateFormatT
									.create("B");
							sap.firefly.DateFormatT.YYYYsMMsDD_IR = sap.firefly.DateFormatT
									.create("C");
						},
						create : function(type) {
							var dateFormatType = new sap.firefly.DateFormatT();
							dateFormatType.setDateFormatType(type);
							return dateFormatType;
						},
						getDateFormatT : function(type) {
							if (sap.firefly.XString.isEqual(
									sap.firefly.DateFormatT.DDpMMpYYYY
											.getName(), type)) {
								return sap.firefly.DateFormatT.DDpMMpYYYY;
							} else {
								if (sap.firefly.XString.isEqual(
										sap.firefly.DateFormatT.DDsMMsYYYY
												.getName(), type)) {
									return sap.firefly.DateFormatT.DDsMMsYYYY;
								} else {
									if (sap.firefly.XString.isEqual(
											sap.firefly.DateFormatT.DDmMMmYYYY
													.getName(), type)) {
										return sap.firefly.DateFormatT.DDmMMmYYYY;
									} else {
										if (sap.firefly.XString
												.isEqual(
														sap.firefly.DateFormatT.YYYYpMMpDD
																.getName(),
														type)) {
											return sap.firefly.DateFormatT.YYYYpMMpDD;
										} else {
											if (sap.firefly.XString
													.isEqual(
															sap.firefly.DateFormatT.YYYYsMMsDD
																	.getName(),
															type)) {
												return sap.firefly.DateFormatT.YYYYsMMsDD;
											} else {
												if (sap.firefly.XString
														.isEqual(
																sap.firefly.DateFormatT.YYYYmMMmDD
																		.getName(),
																type)) {
													return sap.firefly.DateFormatT.YYYYmMMmDD;
												} else {
													if (sap.firefly.XString
															.isEqual(
																	sap.firefly.DateFormatT.GYYpMMpDD_JP
																			.getName(),
																	type)) {
														return sap.firefly.DateFormatT.GYYpMMpDD_JP;
													} else {
														if (sap.firefly.XString
																.isEqual(
																		sap.firefly.DateFormatT.GYYsMMsDD_JP
																				.getName(),
																		type)) {
															return sap.firefly.DateFormatT.GYYsMMsDD_JP;
														} else {
															if (sap.firefly.XString
																	.isEqual(
																			sap.firefly.DateFormatT.GYYmMMmDD_JP
																					.getName(),
																			type)) {
																return sap.firefly.DateFormatT.GYYmMMmDD_JP;
															} else {
																if (sap.firefly.XString
																		.isEqual(
																				sap.firefly.DateFormatT.YYYYsMMsDD_IS1
																						.getName(),
																				type)) {
																	return sap.firefly.DateFormatT.YYYYsMMsDD_IS1;
																} else {
																	if (sap.firefly.XString
																			.isEqual(
																					sap.firefly.DateFormatT.YYYYsMMsDD_IS2
																							.getName(),
																					type)) {
																		return sap.firefly.DateFormatT.YYYYsMMsDD_IS2;
																	} else {
																		if (sap.firefly.XString
																				.isEqual(
																						sap.firefly.DateFormatT.YYYYsMMsDD_IR
																								.getName(),
																						type)) {
																			return sap.firefly.DateFormatT.YYYYsMMsDD_IR;
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
					setDateFormatType : function(type) {
						this.setName(type);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DecimalDelimiterT",
				sap.firefly.XConstant,
				{
					$statics : {
						COMMA : null,
						PERIOD : null,
						staticSetup : function() {
							sap.firefly.DecimalDelimiterT.COMMA = sap.firefly.DecimalDelimiterT
									.create(",");
							sap.firefly.DecimalDelimiterT.PERIOD = sap.firefly.DecimalDelimiterT
									.create(".");
						},
						create : function(type) {
							var auditType = new sap.firefly.DecimalDelimiterT();
							auditType.setDecimalDelimiterType(type);
							return auditType;
						},
						getDecimalDelimiterT : function(type) {
							if (sap.firefly.XString.isEqual(
									sap.firefly.DecimalDelimiterT.COMMA
											.getName(), type)) {
								return sap.firefly.DecimalDelimiterT.COMMA;
							} else {
								if (sap.firefly.XString.isEqual(
										sap.firefly.DecimalDelimiterT.PERIOD
												.getName(), type)) {
									return sap.firefly.DecimalDelimiterT.PERIOD;
								}
							}
							return null;
						}
					},
					setDecimalDelimiterType : function(type) {
						this.setName(type);
					}
				});
$Firefly.createClass("sap.firefly.EncodingT", sap.firefly.XConstant,
		{
			$statics : {
				UTF_8 : null,
				staticSetup : function() {
					sap.firefly.EncodingT.UTF_8 = sap.firefly.EncodingT
							.create("UTF-8");
				},
				create : function(type) {
					var encodingType = new sap.firefly.EncodingT();
					encodingType.setEncodingType(type);
					return encodingType;
				},
				getEncodingT : function(type) {
					if ((sap.firefly.XString.isEqual(
							sap.firefly.EncodingT.UTF_8.getName(), type))
							|| (sap.firefly.XString.isEqual("DEFAULT", type))) {
						return sap.firefly.EncodingT.UTF_8;
					}
					return null;
				}
			},
			setEncodingType : function(type) {
				this.setName(type);
			}
		});
$Firefly
		.createClass(
				"sap.firefly.ProcessingT",
				sap.firefly.XConstant,
				{
					$statics : {
						T_CREATE_WORKSPACE : null,
						T_GET_WORKSPACE_DETAILS : null,
						T_DELETE_WORKSPACE : null,
						T_GET_PROVIDER : null,
						T_CREATE_PROVIDER : null,
						T_GET_PROVIDER_PROPOSAL : null,
						T_DELETE_PROVIDER : null,
						T_CREATE_PROVIDER_LOAD_DATA : null,
						T_LOAD_DATA : null,
						T_CHANGE_AUDIT_STATE : null,
						T_GET_PROVIDER_DETAILS : null,
						staticSetup : function() {
							sap.firefly.ProcessingT.T_CREATE_WORKSPACE = sap.firefly.ProcessingT
									.create("Create_Workspace");
							sap.firefly.ProcessingT.T_GET_WORKSPACE_DETAILS = sap.firefly.ProcessingT
									.create("Get_Workspace_Details");
							sap.firefly.ProcessingT.T_DELETE_WORKSPACE = sap.firefly.ProcessingT
									.create("Delete_Workspace");
							sap.firefly.ProcessingT.T_GET_PROVIDER = sap.firefly.ProcessingT
									.create("Get_Providers");
							sap.firefly.ProcessingT.T_CREATE_PROVIDER = sap.firefly.ProcessingT
									.create("Create_Provider");
							sap.firefly.ProcessingT.T_GET_PROVIDER_PROPOSAL = sap.firefly.ProcessingT
									.create("Get_Provider_Proposal");
							sap.firefly.ProcessingT.T_DELETE_PROVIDER = sap.firefly.ProcessingT
									.create("Delete_Provider");
							sap.firefly.ProcessingT.T_CREATE_PROVIDER_LOAD_DATA = sap.firefly.ProcessingT
									.create("Create_Provider_Load_Data");
							sap.firefly.ProcessingT.T_LOAD_DATA = sap.firefly.ProcessingT
									.create("Load_Data");
							sap.firefly.ProcessingT.T_CHANGE_AUDIT_STATE = sap.firefly.ProcessingT
									.create("Change_Audit_State");
							sap.firefly.ProcessingT.T_GET_PROVIDER_DETAILS = sap.firefly.ProcessingT
									.create("Get_Provider_Details");
						},
						create : function(type) {
							var processingType = new sap.firefly.ProcessingT();
							processingType.setProcessingType(type);
							return processingType;
						}
					},
					setProcessingType : function(type) {
						this.setName(type);
					}
				});
$Firefly.createClass("sap.firefly.ProviderT", sap.firefly.XConstant, {
	$statics : {
		AINX : null,
		LCHA : null,
		LHIE : null,
		staticSetup : function() {
			sap.firefly.ProviderT.AINX = sap.firefly.ProviderT.create("AINX");
			sap.firefly.ProviderT.LCHA = sap.firefly.ProviderT.create("LCHA");
			sap.firefly.ProviderT.LHIE = sap.firefly.ProviderT.create("LHIE");
		},
		create : function(type) {
			var providerType = new sap.firefly.ProviderT();
			providerType.setProviderType(type);
			return providerType;
		},
		getProviderT : function(type) {
			if (sap.firefly.XString.isEqual(sap.firefly.ProviderT.AINX
					.getName(), type)) {
				return sap.firefly.ProviderT.AINX;
			} else {
				if (sap.firefly.XString.isEqual(sap.firefly.ProviderT.LCHA
						.getName(), type)) {
					return sap.firefly.ProviderT.LCHA;
				} else {
					if (sap.firefly.XString.isEqual(sap.firefly.ProviderT.LHIE
							.getName(), type)) {
						return sap.firefly.ProviderT.LHIE;
					}
				}
			}
			return null;
		}
	},
	setProviderType : function(type) {
		this.setName(type);
	}
});
$Firefly.createClass("sap.firefly.QueueStatusT", sap.firefly.XConstant, {
	$statics : {
		T_OPEN : null,
		T_FLUSHED : null,
		T_OFF : null,
		staticSetup : function() {
			sap.firefly.QueueStatusT.T_OPEN = sap.firefly.QueueStatusT
					.create("Open");
			sap.firefly.QueueStatusT.T_FLUSHED = sap.firefly.QueueStatusT
					.create("Flushed");
			sap.firefly.QueueStatusT.T_OFF = sap.firefly.QueueStatusT
					.create("Off");
		},
		create : function(type) {
			var queueStatusType = new sap.firefly.QueueStatusT();
			queueStatusType.setQueueStatusType(type);
			return queueStatusType;
		}
	},
	setQueueStatusType : function(type) {
		this.setName(type);
	}
});
$Firefly.createClass("sap.firefly.QueueT", sap.firefly.XConstant, {
	$statics : {
		T_NAMED_ORDERED : null,
		T_NOT_NAMED_ORDERED : null,
		staticSetup : function() {
			sap.firefly.QueueT.T_NAMED_ORDERED = sap.firefly.QueueT
					.create("NamedOrdered");
			sap.firefly.QueueT.T_NOT_NAMED_ORDERED = sap.firefly.QueueT
					.create("NotNamedOrdered");
		},
		create : function(type) {
			var queueType = new sap.firefly.QueueT();
			queueType.setQueueType(type);
			return queueType;
		}
	},
	setQueueType : function(type) {
		this.setName(type);
	}
});
$Firefly
		.createClass(
				"sap.firefly.TlogoT",
				sap.firefly.XConstant,
				{
					$statics : {
						T_UNKNOWN : null,
						T_ALVL : null,
						T_PLSE : null,
						T_PLSQ : null,
						T_ELEM : null,
						T_REP : null,
						T_STR : null,
						T_SEL : null,
						T_CKF : null,
						T_VAR : null,
						T_SOB : null,
						T_MODL : null,
						T_PLCR : null,
						T_PLDS : null,
						T_XLWB : null,
						T_LQRY : null,
						T_HCPR : null,
						T_COPR : null,
						T_ODSO : null,
						T_ADSO : null,
						staticSetup : function() {
							sap.firefly.TlogoT.T_UNKNOWN = sap.firefly.TlogoT
									.create("UNKNOWN", "Unknown");
							sap.firefly.TlogoT.T_ALVL = sap.firefly.TlogoT
									.create("ALVL", "Aggregation Level");
							sap.firefly.TlogoT.T_PLSE = sap.firefly.TlogoT
									.create("PLSE", "Planning Function");
							sap.firefly.TlogoT.T_PLSQ = sap.firefly.TlogoT
									.create("PLSQ", "Planning Sequence");
							sap.firefly.TlogoT.T_ELEM = sap.firefly.TlogoT
									.create("ELEM", "Query Element");
							sap.firefly.TlogoT.T_REP = sap.firefly.TlogoT
									.create("REP", "Query");
							sap.firefly.TlogoT.T_STR = sap.firefly.TlogoT
									.create("STR", "Structure");
							sap.firefly.TlogoT.T_SEL = sap.firefly.TlogoT
									.create("SEL", "Restricted Key Figure");
							sap.firefly.TlogoT.T_CKF = sap.firefly.TlogoT
									.create("CKF", "Calculated Key Figure");
							sap.firefly.TlogoT.T_VAR = sap.firefly.TlogoT
									.create("VAR", "Variable");
							sap.firefly.TlogoT.T_SOB = sap.firefly.TlogoT
									.create("SOB", "Filter");
							sap.firefly.TlogoT.T_MODL = sap.firefly.TlogoT
									.create("MODL", "Model");
							sap.firefly.TlogoT.T_PLCR = sap.firefly.TlogoT
									.create("PLCR", "Characteristic Relation");
							sap.firefly.TlogoT.T_PLDS = sap.firefly.TlogoT
									.create("PLDS", "Data Slices");
							sap.firefly.TlogoT.T_XLWB = sap.firefly.TlogoT
									.create("XLWB", "XLS Workbook");
							sap.firefly.TlogoT.T_LQRY = sap.firefly.TlogoT
									.create("LQRY", "Local Query");
							sap.firefly.TlogoT.T_HCPR = sap.firefly.TlogoT
									.create("HCPR", "Composite Provider");
							sap.firefly.TlogoT.T_COPR = sap.firefly.TlogoT
									.create("COPR", "Composite Provider 7.40");
							sap.firefly.TlogoT.T_ODSO = sap.firefly.TlogoT
									.create("ODSO", "Open Datastore Object");
							sap.firefly.TlogoT.T_ADSO = sap.firefly.TlogoT
									.create("ADSO", "A Datastore Object");
						},
						create : function(type, description) {
							var auditType = new sap.firefly.TlogoT();
							auditType.setTlogoType(type, description);
							return auditType;
						},
						getTlogoT : function(type) {
							if (sap.firefly.XString.isEqual(
									sap.firefly.TlogoT.T_ALVL.getName(), type)) {
								return sap.firefly.TlogoT.T_ALVL;
							} else {
								if (sap.firefly.XString.isEqual(
										sap.firefly.TlogoT.T_PLSE.getName(),
										type)) {
									return sap.firefly.TlogoT.T_PLSE;
								} else {
									if (sap.firefly.XString
											.isEqual(sap.firefly.TlogoT.T_PLSQ
													.getName(), type)) {
										return sap.firefly.TlogoT.T_PLSQ;
									} else {
										if (sap.firefly.XString.isEqual(
												sap.firefly.TlogoT.T_ELEM
														.getName(), type)) {
											return sap.firefly.TlogoT.T_ELEM;
										} else {
											if (sap.firefly.XString.isEqual(
													sap.firefly.TlogoT.T_REP
															.getName(), type)) {
												return sap.firefly.TlogoT.T_REP;
											} else {
												if (sap.firefly.XString
														.isEqual(
																sap.firefly.TlogoT.T_STR
																		.getName(),
																type)) {
													return sap.firefly.TlogoT.T_STR;
												} else {
													if (sap.firefly.XString
															.isEqual(
																	sap.firefly.TlogoT.T_SEL
																			.getName(),
																	type)) {
														return sap.firefly.TlogoT.T_SEL;
													} else {
														if (sap.firefly.XString
																.isEqual(
																		sap.firefly.TlogoT.T_CKF
																				.getName(),
																		type)) {
															return sap.firefly.TlogoT.T_CKF;
														} else {
															if (sap.firefly.XString
																	.isEqual(
																			sap.firefly.TlogoT.T_VAR
																					.getName(),
																			type)) {
																return sap.firefly.TlogoT.T_VAR;
															} else {
																if (sap.firefly.XString
																		.isEqual(
																				sap.firefly.TlogoT.T_SOB
																						.getName(),
																				type)) {
																	return sap.firefly.TlogoT.T_SOB;
																} else {
																	if (sap.firefly.XString
																			.isEqual(
																					sap.firefly.TlogoT.T_MODL
																							.getName(),
																					type)) {
																		return sap.firefly.TlogoT.T_MODL;
																	} else {
																		if (sap.firefly.XString
																				.isEqual(
																						sap.firefly.TlogoT.T_PLCR
																								.getName(),
																						type)) {
																			return sap.firefly.TlogoT.T_PLCR;
																		} else {
																			if (sap.firefly.XString
																					.isEqual(
																							sap.firefly.TlogoT.T_PLDS
																									.getName(),
																							type)) {
																				return sap.firefly.TlogoT.T_PLDS;
																			} else {
																				if (sap.firefly.XString
																						.isEqual(
																								sap.firefly.TlogoT.T_XLWB
																										.getName(),
																								type)) {
																					return sap.firefly.TlogoT.T_XLWB;
																				} else {
																					if (sap.firefly.XString
																							.isEqual(
																									sap.firefly.TlogoT.T_LQRY
																											.getName(),
																									type)) {
																						return sap.firefly.TlogoT.T_LQRY;
																					} else {
																						if (sap.firefly.XString
																								.isEqual(
																										sap.firefly.TlogoT.T_HCPR
																												.getName(),
																										type)) {
																							return sap.firefly.TlogoT.T_HCPR;
																						} else {
																							if (sap.firefly.XString
																									.isEqual(
																											sap.firefly.TlogoT.T_COPR
																													.getName(),
																											type)) {
																								return sap.firefly.TlogoT.T_COPR;
																							} else {
																								if (sap.firefly.XString
																										.isEqual(
																												sap.firefly.TlogoT.T_ODSO
																														.getName(),
																												type)) {
																									return sap.firefly.TlogoT.T_ODSO;
																								} else {
																									if (sap.firefly.XString
																											.isEqual(
																													sap.firefly.TlogoT.T_ADSO
																															.getName(),
																													type)) {
																										return sap.firefly.TlogoT.T_ADSO;
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
									}
								}
							}
							return sap.firefly.TlogoT.T_UNKNOWN;
						}
					},
					m_description : null,
					setTlogoType : function(type, description) {
						this.setName(type);
						this.m_description = description;
					},
					setDescription : function(description) {
						this.m_description = description;
					},
					getDescription : function() {
						return this.m_description;
					},
					toString : function() {
						return this.m_description;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.TraceLevelT",
				sap.firefly.XConstant,
				{
					$statics : {
						T_NO : null,
						T_ABORT : null,
						T_ERROR : null,
						T_WARNING : null,
						T_SUCCESS : null,
						T_INFORMATION : null,
						T_DEBUG : null,
						staticSetup : function() {
							sap.firefly.TraceLevelT.T_NO = sap.firefly.TraceLevelT
									.create("NO");
							sap.firefly.TraceLevelT.T_ABORT = sap.firefly.TraceLevelT
									.create("ABORT");
							sap.firefly.TraceLevelT.T_ERROR = sap.firefly.TraceLevelT
									.create("ERROR");
							sap.firefly.TraceLevelT.T_WARNING = sap.firefly.TraceLevelT
									.create("WARNING");
							sap.firefly.TraceLevelT.T_SUCCESS = sap.firefly.TraceLevelT
									.create("SUCCESS");
							sap.firefly.TraceLevelT.T_INFORMATION = sap.firefly.TraceLevelT
									.create("INFORMATION");
							sap.firefly.TraceLevelT.T_DEBUG = sap.firefly.TraceLevelT
									.create("DEBUG");
						},
						create : function(type) {
							var traceLevelType = new sap.firefly.TraceLevelT();
							traceLevelType.setTraceLevelType(type);
							return traceLevelType;
						}
					},
					setTraceLevelType : function(type) {
						this.setName(type);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.VisibilityT",
				sap.firefly.XConstant,
				{
					$statics : {
						T_LOCAL : null,
						T_PURE_LOCAL : null,
						T_CENTRAL : null,
						T_NO : null,
						staticSetup : function() {
							sap.firefly.VisibilityT.T_LOCAL = sap.firefly.VisibilityT
									.create("Local");
							sap.firefly.VisibilityT.T_PURE_LOCAL = sap.firefly.VisibilityT
									.create("PureLocal");
							sap.firefly.VisibilityT.T_CENTRAL = sap.firefly.VisibilityT
									.create("Central");
							sap.firefly.VisibilityT.T_NO = sap.firefly.VisibilityT
									.create("No");
						},
						create : function(type) {
							var visibilityType = new sap.firefly.VisibilityT();
							visibilityType.setVisibilityType(type);
							return visibilityType;
						},
						getVisibilityT : function(type) {
							if (sap.firefly.XString.isEqual(
									sap.firefly.VisibilityT.T_LOCAL.getName(),
									type)) {
								return sap.firefly.VisibilityT.T_LOCAL;
							} else {
								if (sap.firefly.XString.isEqual(
										sap.firefly.VisibilityT.T_PURE_LOCAL
												.getName(), type)) {
									return sap.firefly.VisibilityT.T_PURE_LOCAL;
								} else {
									if (sap.firefly.XString.isEqual(
											sap.firefly.VisibilityT.T_CENTRAL
													.getName(), type)) {
										return sap.firefly.VisibilityT.T_CENTRAL;
									} else {
										if (sap.firefly.XString.isEqual(
												sap.firefly.VisibilityT.T_NO
														.getName(), type)) {
											return sap.firefly.VisibilityT.T_NO;
										}
									}
								}
							}
							return null;
						}
					},
					setVisibilityType : function(type) {
						this.setName(type);
					}
				});
$Firefly.createClass("sap.firefly.WorkstatusMode", sap.firefly.XConstant, {
	$statics : {
		GET : null,
		SET : null,
		CANCEL : null,
		NONE : null,
		staticSetup : function() {
			sap.firefly.WorkstatusMode.GET = sap.firefly.WorkstatusMode
					.create("GET");
			sap.firefly.WorkstatusMode.SET = sap.firefly.WorkstatusMode
					.create("SET");
			sap.firefly.WorkstatusMode.CANCEL = sap.firefly.WorkstatusMode
					.create("CANCEL");
			sap.firefly.WorkstatusMode.NONE = sap.firefly.WorkstatusMode
					.create("NONE");
		},
		create : function(name) {
			var object = new sap.firefly.WorkstatusMode();
			object.setupConstant(name);
			return object;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.InfoObjectServiceConfig",
				sap.firefly.DfServiceConfig,
				{
					$statics : {
						CLAZZ : null,
						staticSetup : function() {
							sap.firefly.InfoObjectServiceConfig.CLAZZ = sap.firefly.XClass
									.create(sap.firefly.InfoObjectServiceConfig);
						}
					},
					m_datasource : null,
					m_authorization_selection_object : null,
					setupConfig : function(application) {
						sap.firefly.InfoObjectServiceConfig.$superclass.setupConfig
								.call(this, application);
					},
					processInfoObjectCreation : function(syncType, listener,
							customIdentifier) {
						return this.processSyncAction(syncType, listener,
								customIdentifier);
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onInfoObjectCreated(extResult, data,
								customIdentifier);
					},
					setDataFromService : function(service) {
						this.setData(service.getManager());
					},
					setDataSource : function(datasource) {
						this.m_datasource = datasource;
					},
					getDataSource : function() {
						return this.m_datasource;
					},
					setAuthorizationSelObject : function(authSelObject) {
						this.m_authorization_selection_object = authSelObject;
					},
					getAuthorizationSelObject : function() {
						return this.m_authorization_selection_object;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.WorkspaceServiceConfig",
				sap.firefly.DfServiceConfig,
				{
					$statics : {
						CLAZZ : null,
						staticSetup : function() {
							sap.firefly.WorkspaceServiceConfig.CLAZZ = sap.firefly.XClass
									.create(sap.firefly.WorkspaceServiceConfig);
						}
					},
					m_datasource : null,
					setupConfig : function(application) {
						sap.firefly.WorkspaceServiceConfig.$superclass.setupConfig
								.call(this, application);
					},
					processWorkspaceCreation : function(syncType, listener,
							customIdentifier) {
						return this.processSyncAction(syncType, listener,
								customIdentifier);
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onWorkspaceCreated(extResult, data,
								customIdentifier);
					},
					setDataFromService : function(service) {
						this.setData(service.getManager());
					},
					setDataSource : function(datasource) {
						this.m_datasource = datasource;
					},
					getDataSource : function() {
						return this.m_datasource;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.WorkstatusServiceConfig",
				sap.firefly.DfServiceConfig,
				{
					$statics : {
						CLAZZ : null,
						staticSetup : function() {
							sap.firefly.WorkstatusServiceConfig.CLAZZ = sap.firefly.XClass
									.create(sap.firefly.WorkstatusServiceConfig);
						}
					},
					m_datasource : null,
					setupConfig : function(application) {
						sap.firefly.WorkstatusServiceConfig.$superclass.setupConfig
								.call(this, application);
					},
					processWorkstatusCreation : function(syncType, listener,
							customIdentifier) {
						return this.processSyncAction(syncType, listener,
								customIdentifier);
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onWorkstatusCreated(extResult, data,
								customIdentifier);
					},
					setDataFromService : function(service) {
						this.setData(service.getManager());
					},
					setDataSource : function(datasource) {
						this.m_datasource = datasource;
					},
					getDataSource : function() {
						return this.m_datasource;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.OlapBwExtApiModule",
				sap.firefly.DfModule,
				{
					$statics : {
						s_module : null,
						XS_LAYER : "LAYER",
						SERVICE_TYPE_LAYER : null,
						XS_INFOOBJECT : "INFOOBJECT",
						SERVICE_TYPE_INFOOBJECT : null,
						XS_WORKSPACE : "WORKSPACE",
						SERVICE_TYPE_WORKSPACE : null,
						XS_WORKSTATUS : "WORKSTATUS",
						SERVICE_TYPE_WORKSTATUS : null,
						getInstance : function() {
							return sap.firefly.OlapBwExtApiModule
									.initVersion(sap.firefly.XVersion.API_DEFAULT);
						},
						initVersion : function(version) {
							var registrationService;
							if (sap.firefly.OlapBwExtApiModule.s_module === null) {
								if (sap.firefly.OlapApiModule
										.initVersion(version) === null) {
									throw sap.firefly.XException
											.createInitializationException();
								}
								sap.firefly.OlapBwExtApiModule.s_module = new sap.firefly.OlapBwExtApiModule();
								registrationService = sap.firefly.RegistrationService
										.getInstance();
								sap.firefly.OlapBwExtApiModule.SERVICE_TYPE_LAYER = sap.firefly.ServiceType
										.createType(sap.firefly.OlapBwExtApiModule.XS_LAYER);
								sap.firefly.WorkstatusMode.staticSetup();
								sap.firefly.DataT.staticSetup();
								sap.firefly.ProviderT.staticSetup();
								sap.firefly.ActionT.staticSetup();
								sap.firefly.AuditT.staticSetup();
								sap.firefly.ProcessingT.staticSetup();
								sap.firefly.DateFormatT.staticSetup();
								sap.firefly.DecimalDelimiterT.staticSetup();
								sap.firefly.EncodingT.staticSetup();
								sap.firefly.DataLocationT.staticSetup();
								sap.firefly.TraceLevelT.staticSetup();
								sap.firefly.QueueStatusT.staticSetup();
								sap.firefly.QueueT.staticSetup();
								sap.firefly.TlogoT.staticSetup();
								sap.firefly.InfoObjectTraceLevel.staticSetup();
								sap.firefly.VisibilityT.staticSetup();
								sap.firefly.InfoObjectMode.staticSetup();
								sap.firefly.InfoObjectHierarchyOperation
										.staticSetup();
								sap.firefly.InfoObjectCheckOperation
										.staticSetup();
								sap.firefly.InfoObjectClearOperation
										.staticSetup();
								sap.firefly.InfoObjectSection.staticSetup();
								sap.firefly.InfoObjectAuthActivity
										.staticSetup();
								sap.firefly.InfoObjectAuthSelObject
										.staticSetup();
								sap.firefly.OlapBwExtApiModule.SERVICE_TYPE_WORKSPACE = sap.firefly.ServiceType
										.createType(sap.firefly.OlapBwExtApiModule.XS_WORKSPACE);
								sap.firefly.WorkspaceServiceConfig
										.staticSetup();
								registrationService
										.addServiceConfig(
												sap.firefly.OlapBwExtApiModule.XS_WORKSPACE,
												sap.firefly.WorkspaceServiceConfig.CLAZZ);
								sap.firefly.OlapBwExtApiModule.SERVICE_TYPE_WORKSTATUS = sap.firefly.ServiceType
										.createType(sap.firefly.OlapBwExtApiModule.XS_WORKSTATUS);
								sap.firefly.WorkstatusServiceConfig
										.staticSetup();
								registrationService
										.addServiceConfig(
												sap.firefly.OlapBwExtApiModule.XS_WORKSTATUS,
												sap.firefly.WorkstatusServiceConfig.CLAZZ);
								sap.firefly.OlapBwExtApiModule.SERVICE_TYPE_INFOOBJECT = sap.firefly.ServiceType
										.createType(sap.firefly.OlapBwExtApiModule.XS_INFOOBJECT);
								sap.firefly.InfoObjectServiceConfig
										.staticSetup();
								registrationService
										.addServiceConfig(
												sap.firefly.OlapBwExtApiModule.XS_INFOOBJECT,
												sap.firefly.InfoObjectServiceConfig.CLAZZ);
								sap.firefly.QModelComponentChangeType
										.staticSetup();
								sap.firefly.MultiSourceMappingType
										.staticSetup();
							}
							return sap.firefly.OlapBwExtApiModule.s_module;
						}
					}
				});
sap.firefly.OlapBwExtApiModule.getInstance();