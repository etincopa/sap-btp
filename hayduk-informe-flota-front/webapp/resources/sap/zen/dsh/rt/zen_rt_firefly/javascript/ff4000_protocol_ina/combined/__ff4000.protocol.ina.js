$Firefly
		.createClass(
				"sap.firefly.InACapabilities",
				sap.firefly.XObject,
				{
					$statics : {
						AV_SUPPORTS_DATA_REFRESH_AND_DATA_TOPICALITY : "SupportsDataRefreshAndDataTopicality",
						AV_CAPABILITY_RS_CELL_VALUE_TYPES : "RsCellValueTypes",
						AV_CAPABILITY_QUERY_DATA_CELLS : "QDataCells",
						AV_CAPABILITY_METADATA_SERVICE : "MetadataService",
						AV_CAPABILITY_RESPONSE_FIXED_ATTR : "ResponseFixedAttributeSequence",
						AV_CAPABILITY_UNIFIED_REQUEST_SYNTAX : "UnifiedRequestSyntax",
						AV_CAPABILITY_STATEFUL_SERVER : "StatefulServer",
						AV_CAPABILITY_STATEFUL_DATAPROVIDER : "StatefulDataProvider",
						AV_CAPABILITY_SUPPORTS_SET_OPERAND : "SupportsSetOperand",
						AV_CAPABILITY_SUPPORTS_HIERARCHY_SELECTION_AS_FLAT_SELECTION : "SupportsHierarchySelectionAsFlatSelection",
						AV_CAPABILITY_READ_MODE : "ReadMode",
						AV_CAPABILITY_SERVER_STRUCTURE_NAMES : "ServerStructureNames",
						AV_CAPABILITY_SUPPORTS_ENCODED_RS : "SupportsEncodedResultSet",
						AV_CAPABILITY_OBTAINABILITY : "Obtainability",
						AV_CAPABILITY_SUPPORTS_COMPLEX_FILTERS : "SupportsComplexFilters",
						AV_CAPABILITY_DATASOURCE_AT_SERVICE : "DatasourceAtService",
						AV_CAPABILITY_NEW_VALUES_IMPLICIT_UNLOCK : "NewValuesImplicitUnlock",
						AV_CAPABILITY_NEW_VALUES_EXTENDED_FORMAT : "NewValuesExtendedFormat",
						AV_CAPABILITY_HIERARCHY_NAME_VARIABLE : "HierarchyNameVariable",
						AV_CAPABILITY_ATTRIBUTE_HIERARCHY : "AttributeHierarchy",
						AV_CAPABILITY_CLIENT_CAPABILITIES : "ClientCapabilities",
						AV_CAPABILITY_VARIABLE_RE_SUBMIT : "VariableReSubmit",
						AV_CAPABILITY_HIERARCHY_CATALOG : "HierarchyCatalog",
						AV_CAPABILITY_EXT_HIERARCHY : "ExtHierarchy",
						AV_CAPABILITY_RS_CELL_FORMAT_STRING : "ResultSetCellFormatString",
						AV_CAPABILITY_SAP_DATE : "SAPDate",
						AV_CAPABILITY_SUPPORTS_CUMMULATIVE : "SupportsCummulative",
						AV_CAPABILITY_EXCEPTIONS : "Exceptions",
						AV_CAPABILITY_EXCEPTION_SETTINGS : "ExceptionSettings",
						AV_CAPABILITY_SUPPLEMENTS : "Supplements",
						AV_CAPABILITY_RUN_AS_USER : "RunAsUser",
						AV_CAPABILITY_UNIQUE_ATTRIBUTE_NAMES : "UniqueAttributeNames",
						AV_CAPABILITY_RESULT_SET_INTERVAL : "ResultSetInterval",
						AV_CAPABILITY_HIERARCHY_UNIQUE_FIELDS : "AttributeHierarchyUniqueFields",
						AV_CAPABILITY_PAGING : "Paging",
						AV_CAPABILITY_IS_DISPLAY_ATTRIBUTE : "MetadataIsDisplayAttribute",
						AV_CAPABILITY_CANCEL_RUNNING_REQUESTS : "CancelRunningRequests",
						AV_CAPABILITY_LIST_SHARED_VERSIONS : "EPMResponseListSharedVersions",
						AV_CAPABILITY_TOTALS_AFTER_VISIBILITY_FILTER : "TotalsAfterVisibilityFilter",
						AV_CAPABILITY_EXT_DIM_TYPES : "ExtendedDimensionTypes",
						AV_CAPABILITY_SEMANTIC_ERROR_TYPE : "SemanticalErrorType",
						AV_CAPABILITY_FAST_PATH : "FastPath",
						AV_CAPABILITY_METADATA_DIM_GROUP : "MetadataDimensionGroup",
						AV_CAPABILITY_USE_EPM_VERSION : "UseEPMVersion",
						AV_CAPABILITY_DIMENSION_KIND_EPM_VERSION : "DimensionKindEPMVersion",
						AV_CAPABILITY_DIMENSION_KIND_CHART_OF_ACCOUNTS : "DimensionKindChartOfAccounts",
						AV_CAPABILITY_HIERARCHY_KEY_TEXT_NAME : "HierarchyKeyTextName",
						AV_CAPABILITY_RETURN_RESTRICTED_AND_CALCULATED_MEMBERS_IN_READMODE_BOOKED : "ReturnRestrictedAndCalculatedMembersInReadmodeBooked",
						AV_CAPABILITY_SP9 : "SP9",
						AV_CAPABILITY_PERSISTENCY_INA_MODEL : "inamodel",
						AV_CAPABILITY_HIERARCHY_NAV_COUNTER : "HierarchyNavigationCounter",
						AV_CAPABILITY_ATT_HIER_ATT_FIELDS : "AttributeHierarchyHierarchyFields",
						AV_CAPABILITY_TECHNICAL_AXIS : "TechnicalAxis",
						AV_CAPABILITY_DIMENSION_VALUEHELP_PROPERTY : "DimensionValuehelpProperty",
						AV_CAPABILITY_PAGING_TUPLE_COUNT_TOTAL : "PagingTupleCountTotal",
						AV_CAPABILITY_SUPPORTS_SORT_TYPE : "SupportsSortType",
						AV_CAPABILITY_HIERARCHY_PATH : "HierarchyPath",
						AV_CAPABILITY_ZERO_SUPPRESSION : "ZeroSuppression",
						AV_CAPABILITY_MANUAL_INPUT : "ManualInput",
						AV_CAPABILITY_MULTI_SOURCE : "MultiSource",
						AV_CAPABILITY_METADATA_DATA_CATEGORY : "MetadataDataCategory",
						AV_CAPABILITY_METADATA_HIERARCHY_STRUCTURE : "MetadataHierarchyStructure",
						AV_CAPABILITY_METADATA_HIERARCHY_LEVELS : "MetadataHierarchyLevels",
						AV_CAPABILITY_SUPPORTS_EXTENDED_SORT : "SupportsExtendedSort",
						AV_CAPABILITY_REPORT_REPORT_INTERFACE : "RRI",
						AV_CAPABILITY_METADATA_SEMANTIC_TYPE : "MetadataSemanticType",
						AV_CAPABILITY_METADATA_DIMENSION_OTHERS : "MetadataDimensionOthers",
						AV_CAPABILITY_METADATA_DIMENSION_IS_MODELED : "MetadataDimensionIsModeled",
						AV_CAPABILITY_RS_CELL_MEASURE : "ResultSetCellMeasure",
						AV_CAPABILITY_RS_HIERARCHY_LEVEL : "ResultSetHierarchyLevel",
						AV_CAPABILITY_VALUES_ROUNDED : "ValuesRounded",
						AV_CAPABILITY_OP_CRNT_MEMBER : "SetOperandCurrentMemberSingleNavigation",
						AV_CAPABILITY_CUSTOM_DIMENSION_MEMBER_EXECUTION_STEP : "CustomDimensionMemberExecutionStep",
						AV_CAPABILITY_HIERARCHY_PATH_UNIQUE_NAME : "HierarchyPathUniqueName",
						AV_CAPABILITY_HIERARCHY_DATA_AND_EXCLUDING_FILTERS : "HierarchyDataAndExcludingFilters",
						AV_CAPABILITY_VISIBILITY_FILTER : "VisibilityFilter",
						AV_CAPABILITY_SUPPORTS_SPATIAL_FILTER : "SupportsSpatialFilter",
						AV_CAPABILITY_SUPPORTS_SPATIAL_FILTER_WITH_SRID : "SpatialFilterSRID",
						AV_CAPABILITY_SUPPORTS_SPATIAL_TRANSFORMATIONS : "SupportsSpatialTransformations",
						AV_CAPABILITY_SUPPORTS_SPATIAL_CLUSTERING : "SpatialClustering",
						AV_CAPABILITY_SUPPORTS_MEMBER_VISIBILITY : "SupportsMemberVisibility",
						AV_CAPABILITY_SUBMIT_RETURNS_VARIABLE_VALUES : "SubmitReturnsVariableValues",
						AV_CAPABILITY_DEFINITION_RETURNS_VARIABLE_VALUES : "DefinitionReturnsVariableValues",
						AV_CAPABILITY_HIERARCHY_TRAPEZOID_FILTER : "HierarchyTrapezoidFilter",
						AV_CAPABILITY_METADATA_IS_DISPLAY_ATTR : "IsDisplayAttribute",
						AV_CAPABILITY_EXECUTION_STEP : "ExecutionStep",
						AV_CAPABILITY_CELL_DATA_TYPE : "CellDataType",
						AV_CAPABILITY_EXTENDED_DIMENSIONS : "ExtendedDimensions",
						AV_CAPABILITY_EXTENDED_DIMENSIONS_FIELD_MAPPING : "ExtendedDimensionsFieldMapping",
						AV_CAPABILITY_EXTENDED_DIMENSIONS_JOIN_COLUMNS : "ExtendedDimensionsJoinColumns",
						AV_CAPABILITY_EXTENDED_DIMENSIONS_OUTER_JOIN : "ExtendedDimensionsOuterJoin",
						AV_CAPABILITY_EXTENDED_DIMENSIONS_SKIP : "ExtendedDimensionsSkip",
						AV_CAPABILITY_ALIGNMENT_BOTTOM : "MetadataDefaultResultStructureResultAlignmentBottom",
						AV_CAPABILITY_SUPPORTS_IGNORE_EXTERNAL_DIMENSIONS : "SupportsIgnoreExternalDimensions",
						AV_CAPABILITY_PERSIST_RESULT_SET : "PersistResultSet",
						AV_CAPABILITY_RESTRICTED_MEMBERS_CONVERT_TO_FLAT_SELECTION : "RestrictedMembersConvertToFlatSelection",
						AV_CAPABILITY_VARIABLES : "Variables",
						AV_CAPABILITY_TOTALS : "Totals",
						AV_CAPABILITY_SUPPORTS_ENCODED_RS2 : "SupportsEncodedResultSet2",
						AV_CAPABILITY_RS_STATE : "ResultSetState",
						AV_CAPABILITY_RS_CELL_NUMERIC_SHIFT : "ResultSetCellNumericShift",
						AV_CAPABILITY_RS_CELL_DATA_TYPE : "ResultSetCellDataType",
						AV_CAPABILITY_ORDER_BY : "OrderBy",
						AV_CAPABILITY_METADATA_REPOSITORY_SUFFIX : "MetadataRepositorySuffix",
						AV_CAPABILITY_METADATA_CUBE_QUERY : "MetadataCubeQuery",
						AV_CAPABILITY_MAX_RESULT_RECORDS : "MaxResultRecords",
						AV_CAPABILITY_IGNORE_UNIT_OF_NULL_IN_AGGREGATION : "IgnoreUnitOfNullValueInAggregation",
						AV_CAPABILITY_SET_NULL_CELLS_UNIT_TYPE : "SetNullCellsUnitType",
						AV_CAPABILITY_SUPPORTS_DIMENSION_FILTER : "SupportsDimensionFilterCapability",
						AV_CAPABILITY_F4_COMPOUNDMENT_SELECTION : "DimF4SelectionWithCompoundment",
						AV_CAPABILITY_CUBE_BLENDING : "CubeBlending",
						AV_CAPABILITY_CUBE_BLENDING_AGGREGATION : "SupportsCubeBlendingAggregation",
						AV_CAPABILITY_CUBE_BLENDING_CUSTOM_MEMBERS : "CubeBlendingCustomMembers",
						AV_CAPABILITY_CUBE_BLENDING_MEMBER_SORTING : "CubeBlendingMemberSorting",
						AV_CAPABILITY_CUBE_BLENDING_OUT_OF_CONTEXT : "CubeBlendingOutOfContext",
						AV_CAPABILITY_CUBE_BLENDING_PROPERTIES : "CubeBlendingProperties",
						AV_CAPABILITY_CUBE_BLENDING_READMODE : "CubeBlendingReadMode",
						AV_CAPABILITY_REMOTE_BLENDING : "RemoteBlending",
						AV_CAPABILITY_CELL_VALUE_OPERAND : "CellValueOperand",
						AV_CAPABILITY_EXPAND_BOTTOM_UP : "ExpandHierarchyBottomUp",
						AV_CAPABILITY_CONDITIONS : "Conditions",
						AV_CAPABILITY_AGGREGATION_NOP_NULL : "AggregationNOPNULL",
						AV_CAPABILITY_AGGREGATION_NOP_NULL_ZERO : "AggregationNOPNULLZERO",
						AV_CAPABILITY_EXCEPTION_AGGREGATION_DIMS_FORMULAS : "ExceptionAggregationDimsAndFormulas",
						AV_CAPABILITY_MDS_EXPRESSION : "MdsExpression",
						AV_CAPABILITY_HIERARCHY_NAVIGATION_DELTA_MODE : "HierarchyNavigationDeltaMode",
						AV_CAPABILITY_CURRENT_MEMBER_FILTER_EXTENSION : "CurrentMemberFilterExtension",
						AV_CAPABILITY_FLAT_KEY_ON_HIERARCHY_DISPLAY : "FlatKeyOnHierarchicalDisplay",
						AV_CAPABILITY_SUPPORTS_DATA_CELL_MIXED_VALUES : "SupportsDataCellMixedValues",
						AV_CAPABILITY_ATTRIBUTE_VALUE_LOOKUP : "AttributeValueLookup",
						AV_CAPABILITY_METADATA_HIERARCHY_UNIQUE_NAME : "MetadataHierarchyUniqueName",
						AV_CAPABILITY_CALCULATED_KEYFIGURES : "SupportsCalculatedKeyFigures",
						AV_CAPABILITY_RESTRICTED_KEYFIGURES : "SupportsRestrictedKeyFigures",
						AV_CAPABILITY_RETURN_ERROR_FOR_INVALID_QUERYMODEL : "ReturnErrorForInvalidQueryModel",
						AV_CAPABILITY_CUSTOM_DIMENSION2 : "CustomDimension2",
						AV_CAPABILITY_SUPPORTS_EXTENDED_VARIABLE_STEPS : "SupportsExtVarSteps",
						AV_CAPABILITY_SUPPORTS_ORIGINAL_TEXTS : "SupportsOriginalTexts",
						AV_CAPABILITY_FILTER_CAPABILITIES : "CustomDimensionFilterCapabilities",
						AV_CAPABILITY_BUGFIX_BW_WINDOWING : "MDSLikePaging",
						AV_CAPABILITY_AVERAGE_COUNT_NULL_ZERO : "AverageCountIgnoreNullZero",
						AV_CAPABILITY_UNIFIED_DATA_CELLS : "UnifiedDataCells",
						AV_CAPABILITY_HIERARCHY_LEVELOFFSET_FILTER : "HierarchyLevelOffsetFilter",
						AV_CAPABILITY_LOCALE_SORTING : "LocaleSorting",
						AV_CAPABILITY_CE_SCENARIO_PARAMS : "CEScenarioParams",
						AV_CAPABILITY_METADATA_DIMENSION_CAN_BE_AGGREGATED : "MetadataDimensionCanBeAggregated",
						AV_CAPABILITY_SUPPORTS_MEMBER_VALUE_EXCEPTIONS : "SupportsMemberValueExceptions",
						AV_CAPABILITY_INITIAL_DRILL_LEVEL_RELATIVE : "InitialDrillLevelRelative",
						AV_CAPABILITY_MDM_HIERARCHY_DRILL_LEVEL : "MDMHierarchyWithDrillLevel",
						AV_CAPABILITY_CARTESIAN_FILTER_INTERSECT : "CartesianFilterIntersect",
						AV_CAPABILITY_NO_HIERARCHY_PATH_ON_FLAT_DIMENSIONS : "NoHierarchyPathOnFlatDimensions",
						AV_CAPABILITY_RETURNED_DATA_SELECTION : "ReturnedDataSelection",
						AV_CAPABILITY_SUPPORTS_KEYFIGURE_HIERARCHIES : "SupportsKeyfigureHierarchies",
						AV_CAPABILITY_SUPPORTS_DATA_REFRESH : "SupportsDataRefresh",
						AV_CAPABILITY_RESULT_SET_AXIS_TYPE : "ResultSetAxisType",
						AV_CAPABILITY_VARIABLE_VARIANTS : "SupportsVariableVariants",
						AV_CAPABILITY_CALCULATED_DIMENSION : "CalculatedDimension",
						AV_CAPABILITY_PLANNING_ON_CALCULATED_DIMENSION : "PlanningOnCalculatedDimension",
						AV_CAPABILITY_INPUT_READINESS_STATES : "InputReadinessStates",
						AV_CAPABILITY_METADATA_ACCOUNT_DIM_IN_RS_FORMAT : "MetadataAccountDimensionInResultsetFormat",
						AV_CAPABILITY_READMODES_V2 : "ReadModesV2",
						AV_CAPABILITY_VISUAL_AGGREGATION : "VisualAggregation",
						AV_CAPABILITY_LIST_REPORTING : "ListReporting",
						AV_CAPABILITY_SORT_NEW_VALUES : "SortNewValues",
						AV_IGNORE_UNIT_ZEROVALUE_IN_AGGREGATION : "IgnoreUnitOfZeroValueInAggregation",
						AV_EXTENDED_DIMENSION_CHANGE_DEFAULT_RENAMING_AND_DESCRIPTION : "ExtendedDimensionsChangeDefaultRenamingAndDescription",
						AV_CAPABILITY_SUPPORTS_DIMENSION_TYPE_TIME : "SupportsDimensionTypeTime",
						AV_CAPABILITY_SUPPORTS_DYNAMIC_FILTER_IN_SUBMIT : "SupportsDynamicFilterInSubmit"
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InACapabilitiesProvider",
				sap.firefly.XObject,
				{
					$statics : {
						createMainCapabilities : function(apiVersion) {
							var supportedMainCapabilities = sap.firefly.CapabilityContainer
									.create("main");
							var environment;
							var inaPlusCapability;
							var plusCap;
							var plusIterator;
							var inaMinusCapability;
							var minusCap;
							var minusIterator;
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_ATTRIBUTE_HIERARCHY);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_DATASOURCE_AT_SERVICE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_VARIABLE_RE_SUBMIT);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CLIENT_CAPABILITIES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_METADATA_SERVICE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_OBTAINABILITY);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_READ_MODE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RESPONSE_FIXED_ATTR);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SERVER_STRUCTURE_NAMES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_STATEFUL_SERVER);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_STATEFUL_DATAPROVIDER);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_SET_OPERAND);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_ENCODED_RS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_COMPLEX_FILTERS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_UNIFIED_REQUEST_SYNTAX);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SEMANTIC_ERROR_TYPE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_EXT_HIERARCHY);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SAP_DATE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_CUMMULATIVE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_EXT_DIM_TYPES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_NEW_VALUES_IMPLICIT_UNLOCK);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_NEW_VALUES_EXTENDED_FORMAT);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_HIERARCHY_NAME_VARIABLE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_EXCEPTIONS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_EXCEPTION_SETTINGS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RUN_AS_USER);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_QUERY_DATA_CELLS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RS_CELL_VALUE_TYPES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_METADATA_DIM_GROUP);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RS_CELL_FORMAT_STRING);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_UNIQUE_ATTRIBUTE_NAMES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_IS_DISPLAY_ATTRIBUTE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_FAST_PATH);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_HIERARCHY_UNIQUE_FIELDS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_HIERARCHY_KEY_TEXT_NAME);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_HIERARCHY_NAV_COUNTER);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_ATT_HIER_ATT_FIELDS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPLEMENTS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_USE_EPM_VERSION);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_DIMENSION_KIND_EPM_VERSION);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_DIMENSION_KIND_CHART_OF_ACCOUNTS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SP9);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_TECHNICAL_AXIS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_DIMENSION_VALUEHELP_PROPERTY);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_PAGING_TUPLE_COUNT_TOTAL);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_ZERO_SUPPRESSION);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_MANUAL_INPUT);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_MULTI_SOURCE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_MEMBER_VISIBILITY);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RESULT_SET_INTERVAL);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_REPORT_REPORT_INTERFACE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_HIERARCHY_PATH);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_METADATA_HIERARCHY_STRUCTURE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_METADATA_HIERARCHY_LEVELS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_EXTENDED_SORT);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CUSTOM_DIMENSION_MEMBER_EXECUTION_STEP);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_HIERARCHY_PATH_UNIQUE_NAME);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_HIERARCHY_DATA_AND_EXCLUDING_FILTERS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_HIERARCHY_SELECTION_AS_FLAT_SELECTION);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_VISIBILITY_FILTER);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CELL_VALUE_OPERAND);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_SPATIAL_FILTER);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_SPATIAL_FILTER_WITH_SRID);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_SPATIAL_TRANSFORMATIONS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_SPATIAL_CLUSTERING);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_HIERARCHY_TRAPEZOID_FILTER);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUBMIT_RETURNS_VARIABLE_VALUES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_EXTENDED_DIMENSIONS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_EXTENDED_DIMENSIONS_FIELD_MAPPING);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_EXTENDED_DIMENSIONS_JOIN_COLUMNS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_EXTENDED_DIMENSIONS_OUTER_JOIN);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_EXTENDED_DIMENSIONS_SKIP);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_ALIGNMENT_BOTTOM);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_IGNORE_EXTERNAL_DIMENSIONS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RETURN_RESTRICTED_AND_CALCULATED_MEMBERS_IN_READMODE_BOOKED);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_PERSIST_RESULT_SET);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RESTRICTED_MEMBERS_CONVERT_TO_FLAT_SELECTION);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_VARIABLES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_TOTALS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_ENCODED_RS2);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RS_STATE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RS_CELL_NUMERIC_SHIFT);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RS_CELL_DATA_TYPE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_ORDER_BY);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_METADATA_REPOSITORY_SUFFIX);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_METADATA_CUBE_QUERY);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_MAX_RESULT_RECORDS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_IGNORE_UNIT_OF_NULL_IN_AGGREGATION);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SET_NULL_CELLS_UNIT_TYPE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_DIMENSION_FILTER);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_F4_COMPOUNDMENT_SELECTION);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CUBE_BLENDING);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CUBE_BLENDING_AGGREGATION);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_REMOTE_BLENDING);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CUBE_BLENDING_CUSTOM_MEMBERS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CUBE_BLENDING_MEMBER_SORTING);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CUBE_BLENDING_OUT_OF_CONTEXT);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CUBE_BLENDING_PROPERTIES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CUBE_BLENDING_READMODE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CUBE_BLENDING_CUSTOM_MEMBERS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CUBE_BLENDING_OUT_OF_CONTEXT);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_METADATA_DATA_CATEGORY);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_EXPAND_BOTTOM_UP);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CONDITIONS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_AGGREGATION_NOP_NULL);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_AGGREGATION_NOP_NULL_ZERO);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_EXCEPTION_AGGREGATION_DIMS_FORMULAS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_MDS_EXPRESSION);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_TOTALS_AFTER_VISIBILITY_FILTER);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_DEFINITION_RETURNS_VARIABLE_VALUES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_HIERARCHY_NAVIGATION_DELTA_MODE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_FLAT_KEY_ON_HIERARCHY_DISPLAY);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_DATA_CELL_MIXED_VALUES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_VALUES_ROUNDED);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_ATTRIBUTE_VALUE_LOOKUP);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_METADATA_HIERARCHY_UNIQUE_NAME);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CANCEL_RUNNING_REQUESTS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CALCULATED_KEYFIGURES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RESTRICTED_KEYFIGURES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CURRENT_MEMBER_FILTER_EXTENSION);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RETURN_ERROR_FOR_INVALID_QUERYMODEL);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_ORIGINAL_TEXTS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_FILTER_CAPABILITIES);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_AVERAGE_COUNT_NULL_ZERO);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_BUGFIX_BW_WINDOWING);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_HIERARCHY_LEVELOFFSET_FILTER);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CE_SCENARIO_PARAMS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_METADATA_DIMENSION_CAN_BE_AGGREGATED);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_INITIAL_DRILL_LEVEL_RELATIVE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_MDM_HIERARCHY_DRILL_LEVEL);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_NO_HIERARCHY_PATH_ON_FLAT_DIMENSIONS);
							if (apiVersion >= sap.firefly.XVersion.V77_RETURNED_DATA_SELECTION) {
								supportedMainCapabilities
										.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RETURNED_DATA_SELECTION);
							}
							if (apiVersion >= sap.firefly.XVersion.V74_HIERARCHICAL_BW_KEYFIGURES) {
								supportedMainCapabilities
										.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_KEYFIGURE_HIERARCHIES);
							}
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_DATA_REFRESH);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_RESULT_SET_AXIS_TYPE);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_LIST_SHARED_VERSIONS);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_VARIABLE_VARIANTS);
							if (apiVersion >= sap.firefly.XVersion.V80_INPUT_READINESS_STATES) {
								supportedMainCapabilities
										.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_INPUT_READINESS_STATES);
							}
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_READMODES_V2);
							if (apiVersion >= sap.firefly.XVersion.V81_CARTESIAN_FILTER_INTERSECT) {
								supportedMainCapabilities
										.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_CARTESIAN_FILTER_INTERSECT);
							}
							if (apiVersion >= sap.firefly.XVersion.V83_VISUAL_AGGREGATION) {
								supportedMainCapabilities
										.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_VISUAL_AGGREGATION);
							}
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_LIST_REPORTING);
							if (apiVersion >= sap.firefly.XVersion.V85_MDS_IGNORE_UNIT_ZEROVALUE_IN_AGGREGATION) {
								supportedMainCapabilities
										.addCapability(sap.firefly.InACapabilities.AV_IGNORE_UNIT_ZEROVALUE_IN_AGGREGATION);
							}
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_CAPABILITY_SUPPORTS_DIMENSION_TYPE_TIME);
							supportedMainCapabilities
									.addCapability(sap.firefly.InACapabilities.AV_SUPPORTS_DATA_REFRESH_AND_DATA_TOPICALITY);
							environment = sap.firefly.XEnvironment
									.getVariables();
							inaPlusCapability = environment
									.getByKey("com.sap.firefly.ina.inacapplus");
							if (inaPlusCapability !== null) {
								plusCap = sap.firefly.XStringTokenizer
										.splitString(inaPlusCapability, ",");
								plusIterator = plusCap.getIterator();
								while (plusIterator.hasNext()) {
									supportedMainCapabilities
											.addCapability(plusIterator.next());
								}
							}
							inaMinusCapability = environment
									.getByKey("com.sap.firefly.ina.inacapminus");
							if (inaMinusCapability !== null) {
								minusCap = sap.firefly.XStringTokenizer
										.splitString(inaMinusCapability, ",");
								minusIterator = minusCap.getIterator();
								while (minusIterator.hasNext()) {
									supportedMainCapabilities
											.remove(minusIterator.next());
								}
							}
							return supportedMainCapabilities;
						}
					},
					m_clientMainCapabilities : null,
					m_serverMainCapabilities : null,
					m_serverBetaCapabilities : null,
					m_activeMainCapabilities : null,
					getClientMainCapabilities : function() {
						return this.m_clientMainCapabilities;
					},
					getServerBetaCapabilities : function() {
						return this.m_serverBetaCapabilities;
					},
					getServerMainCapabilities : function() {
						return this.m_serverMainCapabilities;
					},
					getActiveMainCapabilities : function() {
						var clientCapabilities;
						var serverCapabilities;
						if (this.m_activeMainCapabilities === null) {
							clientCapabilities = this
									.getClientMainCapabilities();
							serverCapabilities = this
									.getServerMainCapabilities();
							if ((clientCapabilities !== null)
									&& (serverCapabilities !== null)) {
								this.m_activeMainCapabilities = serverCapabilities
										.intersect(clientCapabilities);
							}
						}
						return this.m_activeMainCapabilities;
					},
					getServerMainCapability : function(capabilityName) {
						return this.getServerMainCapabilities().getByKey(
								capabilityName);
					},
					exportActiveMainCapabilities : function(requestStructure) {
						var list = this.exportActiveMainCapabilitiesAsList();
						if (list !== null) {
							requestStructure.setElementByName(
									sap.firefly.InAConstants.QY_CAPABILITIES,
									list);
						}
						return list;
					},
					exportActiveMainCapabilitiesAsList : function() {
						var activeMainCapabilities = this
								.getActiveMainCapabilities();
						var sortedCapabilityNames;
						var intersectCapabilities;
						var size;
						var i;
						if (activeMainCapabilities === null) {
							return null;
						}
						if (activeMainCapabilities
								.containsKey(sap.firefly.InACapabilities.AV_CAPABILITY_CLIENT_CAPABILITIES) === false) {
							return null;
						}
						sortedCapabilityNames = activeMainCapabilities
								.getSortedCapabilityNames();
						intersectCapabilities = sap.firefly.PrList.create();
						size = sortedCapabilityNames.size();
						for (i = 0; i < size; i++) {
							intersectCapabilities
									.addString(sortedCapabilityNames.get(i));
						}
						return intersectCapabilities;
					},
					releaseObject : function() {
						this.m_clientMainCapabilities = sap.firefly.XObject
								.releaseIfNotNull(this.m_clientMainCapabilities);
						this.m_serverBetaCapabilities = sap.firefly.XObject
								.releaseIfNotNull(this.m_serverBetaCapabilities);
						this.m_serverMainCapabilities = sap.firefly.XObject
								.releaseIfNotNull(this.m_serverMainCapabilities);
						this.m_activeMainCapabilities = sap.firefly.XObject
								.releaseIfNotNull(this.m_activeMainCapabilities);
						sap.firefly.InACapabilitiesProvider.$superclass.releaseObject
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
						if (this.m_clientMainCapabilities !== null) {
							buffer.append("=== Client Main Capabilities ===");
							buffer.appendNewLine();
							buffer.append(this.m_clientMainCapabilities
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
						return buffer.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAConstants",
				sap.firefly.XObject,
				{
					$statics : {
						VA_ABAP_TRUE : "X",
						VA_ABAP_FALSE : "",
						VA_ABAP_UNKNOWN : "U",
						QY_ACTIONS : "Actions",
						QY_ACTION_APPROVE : "approve",
						QY_ACTION_CHANGE_ASSIGNMENT : "change_assignment",
						QY_ACTION_LIST : "LIST",
						QY_ACTION_GET_HOME_VIEW_INFO : "GET_HOME_VIEW_INFO",
						QY_ACTION_COMPLETE : "complete",
						QY_ACTION_CREATE : "CREATE",
						QY_ACTION_CREATE_ALIAS : "CREATE_ALIAS",
						QY_ACTION_CREATE_BOOK_SECTION : "CREATE_BOOK_SECTION",
						QY_ACTION_UPDATE_BOOK_SECTION : "UPDATE_BOOK_SECTION",
						QY_ACTION_DELETE : "DELETE",
						QY_ACTION_ARCHIVE : "ARCHIVE",
						QY_ACTION_BULK_ARCHIVE : "BULK_ARCHIVE",
						QY_ACTION_DELETE_FEED : "DELETE_FEED",
						QY_ACTION_REJECT : "reject",
						QY_ACTION_REOPEN : "reopen",
						QY_ACTION_SCH_INST_START : "SCH_INST_START",
						QY_ACTION_SCH_ACT_DLINE : "SCH_ACT_DLINE",
						QY_ACTION_SCH_BOTH_INST_ACT_DLINE : "SCH_BOTH_INST_ACT_DLINE",
						QY_ACTION_UPDATE : "UPDATE",
						QY_ACTION_UPDATE_SHARE : "UPDATE_SHARE",
						QY_ACTION_GET_USER_SHARE : "GET_USER_SHARE",
						QY_ACTION_CHECK_MODL : "CHECKMODL",
						QY_ACTION_GET : "GET",
						QY_ACTION_GET_ALIAS : "GET_ALIAS",
						QY_ACTION_GET_AVL_IPRO : "GET_AVL_IPRV",
						QY_ACTION_GET_AUDIT_IPRV : "GET_AUDIT_IPRV",
						QY_ACTION_GET_FEED : "GET_FEED",
						QY_ACTION_GET_FEED_COMMENT : "GET_FEED_COMMENT",
						QY_ACTION_GET_BOOK_SECTION_BY_ID : "GET_BOOK_SECTION_BY_ID",
						QY_ACTION_GET_BOOK_SECTION_BY_NAME : "GET_BOOK_SECTION_BY_NAME",
						QY_ACTION_DELETE_BOOK_SECTION_BY_ID : "DEL_BOOK_SECTION_BY_ID",
						QY_ACTION_GET_REOPEN_LIST : "get_reopen_list",
						QY_ACTION_GET_TODO_LIST : "get_todolist",
						QY_ACTION_GET_TODO_DLINE_LIST : "GET_TODO_DLINE_LIST",
						QY_ACTION_GET_VERSION_INFO : "get_version_info",
						QY_ACTION_GET_VERSION_LIST : "get_version_list",
						QY_ACTION_GET_VERSION_ASSIGNMENT : "get_version_assignment",
						QY_ACTION_GET_VERSION_IDENTITY_DIM : "get_version_identity_dim",
						QY_ACTION_GET_GRID : "get_grid",
						QY_ACTION_GET_GROUP : "get_group",
						QY_ACTION_GET_MONITOR : "get_monitor",
						QY_ACTION_PREVIEW : "preview",
						QY_ACTION_FINALIZE : "finalize",
						QY_ACTION_RESET : "reset",
						QY_ACTION_RESUME : "resume",
						QY_ACTION_START : "start",
						QY_ACTION_SUSPEND : "suspend",
						QY_ACTION_SEARCH_ACTY_TODOLIST : "SEARCH_ACTY_TODOLIST",
						QY_ACTION_REQUIRED : "ActionRequired",
						QY_ACTION_ALLOW_REOPEN : "AllowReopen",
						QY_ACTION_DELETE_LOCAL_QUERY : "DELETE_LOCAL_QUERY",
						QY_ACTION_GET_ALL_MODEL_PARAM : "GET_ALL_MODEL_PARAMETER",
						QY_ACTION_GET_DIMENS_OF_ENVM : "GET_DIMENS_OF_ENVM",
						QY_ACTION_GET_DIMENS_OF_ENVM_W_D : "GET_DIMENS_OF_ENVM_W_D",
						QY_ACTION_GET_IOBJ_DETAIL : "GET_IOBJ_DETAIL",
						QY_ACTION_GET_IOBJ_MEMBER_DETAIL : "GET_IOBJ_MEMBER_DETAIL",
						QY_ACTION_GET_DIMENS_IN_SYSTEM : "GET_DIMENS_IN_SYSTEM",
						QY_ACTION_GET_IOBJ_IN_SYSTEM : "GET_IOBJ_IN_SYSTEM",
						QY_ACTION_GET_IOBJ_BY_CATEGORY : "GET_IOBJ_BY_CATEGORY",
						QY_ACTION_GET_ENVM_DIM_LIST : "GET_DIM_LIST_BY_ENVM",
						QY_ACTION_GET_ACCESS_ENVMS : "GET_ACCESS_ENVMS",
						QY_ACTION_CHECK_IPRV_AUTH : "CHECK_IPRV_AUTH",
						QY_ACTION_CHECK_ENVM_ACCESS : "CHECK_ENVM_ACCESS",
						QY_ACTION_GET_METADATA : "GET_METADATA",
						QY_ACTION_LIST_LOCAL_PROVIDERS : "LIST_LPRV",
						QY_ACTION_LIST_IPRV_LPRV : "LIST_IPRV_LPRV",
						QY_ACTION_LIST_IPRV_LPRV_BY_ROLE : "LIST_IPRV_LPRV_BY_ROLE",
						QY_ACTION_LIST_REQUIRED_DIMENSIONS : "LIST_REQUIRED_DIMENSIONS",
						QY_ACTION_GET_CHILDREN : "GET_CHILDREN",
						QY_ACTION_GET_ROOT : "GET_ROOT",
						QY_ACTION_UPDATE_LIST : "UPDATE_LIST",
						QY_ACTION_COPY : "COPY",
						QY_ACTION_DAP_LIST : "DAPLIST",
						QY_ACTION_DAP_DETAIL : "DAPDETAIL",
						QY_ACTION_DAP_USERS : "DAPUSERS",
						QY_ACTION_USER_DAPS : "USERDAPS",
						QY_ACTION_ASSIGN_DAP_USER : "ASSIGNDAPUSER",
						QY_ACTION_PARSE_PATH : "PARSE_PATH",
						QY_ACTION_VALIDATE_MODEL : "VALIDATE_MODEL",
						QY_ACTION_VALIDATE_BPF_TEMPLATE : "VALIDATE_BPF_TEMPLATE",
						QY_ACTIVE : "Active",
						QY_ACTIVITY : "Activity",
						QY_ACTIVITIES : "Activities",
						QY_ACTIVITY_ID : "ActivityId",
						QY_ActivityInstOrdinal : "ActivityInstOrdinal",
						QY_ACTIVITY_INSTANCES : "ActivityInsts",
						QY_ACTIVITY_INST_ID : "ActivityInstId",
						QY_ACTIVITY_INSTRUCTION : "ActivityInstruction",
						QY_ACTIVITY_ORDINAL : "ActivityOrdinal",
						QY_ACTIVITY_NAME : "ActivityName",
						QY_ACTIVITY_MAPS : "ActivityMaps",
						QY_ACTIVITY_ROLES : "ActivityRoles",
						QY_ACTIVATE_USER : "ActivateUser",
						QY_ACTIVATE_TIME : "ActivateTime",
						QY_ACTION : "Action",
						VA_ACTION_SAVE_LINE : "SaveLine",
						VA_ACTION_ACTIVATE_LINE : "ActivateLine",
						VA_ACTION_NEW_LINE : "NewLine",
						VA_ACTION_DELETE_LINE : "DeleteLine",
						VA_ACTION_NEW_VALUES : "NewValues",
						VA_ACTION_CHECK_DUPLICATES : "CheckDuplicates",
						QY_ACTION_ID : "ActionId",
						QY_ACTION_DESCRIPTION : "ActionDescription",
						QY_ACTION_PARAMETERS : "ActionParameters",
						QY_ALERTLEVEL : "AlertLevel",
						QY_ALIAS : "Alias",
						QY_ALIAS_COMPONENT : "AliasComponent",
						QY_ALIAS_NAME : "AliasName",
						QY_AUDIT : "Audit",
						QY_AUTHORIZATION : "Authorization",
						QY_AUTHORIZATIONS : "Authorizations",
						QY_AUTHS : "Auths",
						QY_AUTH_OBJ : "AuthObj",
						QY_AUTH_OBJS : "AuthObjs",
						QY_AUTH_MODULE : "AUTH_MODULE",
						QY_AUTH_DETAILS : "AuthDetails",
						QY_AUTO_GROUP : "AutoGroup",
						QY_AUDITABLE : "Auditable",
						QY_AUDIT_QUERY_NAME : "AuditQueryName",
						QY_AGGREGATION : "Aggregation",
						VA_AGG_AVERAGE : "AVERAGE",
						VA_AGG_COUNT : "COUNT",
						VA_AGG_COUNT_DISTINCT : "COUNT_DISTINCT",
						VA_AGG_FIRST : "FIRST",
						VA_AGG_LAST : "LAST",
						VA_AGG_MAX : "MAX",
						VA_AGG_MIN : "MIN",
						VA_AGG_RANK : "RANK",
						VA_AGG_RANK_DENSE : "RANK_DENSE",
						VA_AGG_RANK_OLYMPIC : "RANK_OLYMPIC",
						VA_AGG_RANK_PERCENTILE : "RANK_PERCENTILE",
						VA_AGG_RANK_PERCENT : "RANK_PERCENT",
						VA_AGG_SUM : "SUM",
						VA_AGG_STANDARD_DEVIATION : "STANDARD_DEVIATION",
						VA_AGG_VARIANCE : "VARIANCE",
						VA_AGG_NOP_NULL : "NOPNULL",
						VA_AGG_NOP_NULL_ZERO : "NOPNULLZERO",
						VA_AGG_AVERAGE_NULL : "AVERAGENULL",
						VA_AGG_AVERAGE_NULL_ZERO : "AVERAGENULLZERO",
						VA_AGG_COUNT_NULL : "COUNTNULL",
						VA_AGG_COUNT_NULL_ZERO : "COUNTNULLZERO",
						QY_AGGREGATION_DIMENSION : "AggregationDimension",
						QY_AGGREGATION_LEVEL : "AggregationLevel",
						QY_AGGREGATION_LEVEL_CAT : "AggregationLevelCat",
						QY_AGLV_NAME : "AglvName",
						QY_AGGR_LEVEL_NAME : "AggrLevelName",
						QY_AGGR_LEVEL_TECH_NAME : "AggrLevelTechName",
						QY_AGGR_LEVEL_TYPE : "AggrLevelType",
						QY_AGGR_LEVEL_ACTIVE_FLAG : "AggrLevelActiveFlag",
						QY_AGGR_LEVEL_OBJ_STAT : "AggrLevelObjStat",
						QY_ANALYTICAL_INDEX : "AnalyticalIndex",
						QY_ANALYTICS : "Analytics",
						QY_APPLICATION_ID : "ApplicationlId",
						QY_APPLICATION_DESCRIPTION : "ApplDescription",
						QY_APPROVE : "Approve",
						QY_APPSET_ID : "AppsetId",
						QY_APPSET_ID_DASH : "Appset_id",
						QY_ASSIGNED_MEMBER : "AssignedMember",
						QY_ATTRIBUTE : "Attribute",
						QY_ATTRIBUTE_HIERARCHY : "AttributeHierarchy",
						QY_ATTRIBUTE_MAPPINGS : "AttributeMappings",
						QY_ATTRIBUTE_MEMBER_SET_ID : "AttributeMemberSetId",
						QY_ATTRIBUTE_MEMBER_SETS : "AttributeMemberSets",
						QY_ATTRIBUTE_NAME : "AttributeName",
						QY_ATTRIBUTE_NAMES : "AttributeNames",
						QY_ATTRIBUTE_SETTINGS : "AttributeSettings",
						QY_ATTRIBUTE_TYPE : "AttributeType",
						QY_ATTRIBUTE_VALUE : "AttributeValue",
						QY_ATTRIBUTES : "Attributes",
						QY_ATTRIBUTES_MD : "AttributesMd",
						QY_AUTH_FIELD_JOURNAL : "JNL",
						QY_AUTH_FIELD_CONS_MONITOR : "MON",
						QY_AUTH_FIELD_OWNERSHIP : "OWN",
						QY_AUTH_FIELD_BUSINESS_RULE : "RULE",
						QY_AXIS : "Axis",
						QY_AXIS_DEFAULT : "AxisDefault",
						QY_AXIS_CONSTRAINTS : "AxisConstraints",
						VA_AXIS_ROWS : "Rows",
						VA_AXIS_COLS : "Columns",
						VA_AXIS_FREE : "Free",
						VA_AXIS_DYNAMIC : "Dynamic",
						VA_AXIS_FILTER : "Filter",
						VA_AXIS_NONE : "None",
						VA_AXIS_REPOSITORY : "Repository",
						VA_AXIS_TECHNICAL : "Technical",
						QY_AXES : "Axes",
						QY_AXES_LAYOUT : "AxesLayout",
						QY_BACKEND_CELL_LOCKING : "BackendCellLocking",
						QY_BBPF : "BBPF",
						QY_BW_WSP : "BWSP",
						QY_BASE_DATA_SOURCE : "BaseDataSource",
						QY_BASE_DIMENSION : "BaseDimension",
						QY_BASIC_MEMBERS : "BasicMembers",
						QY_BODY : "Body",
						QY_BW_MASTER_DATA : "BWMasterData",
						QY_BPC_ATTR_NAME : "BPCAttrName",
						QY_BOOK : "Book",
						QY_BOOK_ID : "BookId",
						QY_BOOK_NAME : "BookName",
						QY_BOOK_TYPE : "BookType",
						QY_BOOK_SECTION : "BookSection",
						QY_BREAK_GROUP : "BreakGroup",
						QY_BREAK_GROUP_LIST : "BreakGroupList",
						QY_COMPONENT_TAGS : "ComponentTags",
						QY_COMPONENT_TAGS_KEY : "KEY",
						QY_COMPONENT_TAGS_VALUE : "VALUE",
						QY_CALLS : "Calls",
						QY_CAN_BE_AGGREGATED : "CanBeAggregated",
						QY_CAPABILITIES : "Capabilities",
						QY_CELL_LOCKING : "CellLocking",
						QY_CELL_DATA_TYPE : "CellDataType",
						QY_CELL_DIMENSION_REFERENCE : "CellDimensionReference",
						QY_CELL_VALUE_OPERAND : "CellValueOperand",
						QY_CELL_VALUE_TYPE : "CellValueType",
						QY_CELL_VALUE_TYPES : "CellValueTypes",
						QA_CELL_VALUE_TYPE_DOUBLE : 0,
						QA_CELL_VALUE_TYPE_PERCENT : 1,
						QA_CELL_VALUE_TYPE_DATE : 2,
						QA_CELL_VALUE_TYPE_TIME : 3,
						QA_CELL_VALUE_TYPE_STRING : 4,
						QA_CELL_VALUE_TYPE_AMOUNT : 5,
						QA_CELL_VALUE_TYPE_QUANTITY : 6,
						QA_CELL_VALUE_TYPE_PRICE : 7,
						QA_CELL_VALUE_TYPE_DIMENSION_MEMBER : 8,
						QA_CELL_VALUE_TYPE_INTEGER : 9,
						QA_CELL_VALUE_TYPE_DEC_FLOAT : 10,
						QA_CELL_VALUE_TYPE_DATE_TIME : 11,
						QA_CELL_VALUE_TYPE_TIMESTAMP : 12,
						QA_CELL_VALUE_TYPE_BOOL : 13,
						QA_CELL_VALUE_TYPE_GEOMETRY : 14,
						QY_CHANGE_COUNTER : "ChangeCounter",
						QY_CHECK_MASTER_DATA : "CheckMasterData",
						QY_CLEANSING : "Cleansing",
						QY_CLEANSING_PERFORMED_ACTIONS : "PerformedActions",
						QY_CLEANSING_ACTIONS : "Actions",
						QY_CLEANSING_ACTION : "Action",
						QY_CLEANSING_VALUE : "Value",
						QY_CLEANSING_VALUE_TO_BE_REPLACED : "ValueToBeReplaced",
						QY_CLIENT_TRACES : "ClientTraces",
						QY_COMMAND : "Command",
						QY_COMMAND_RESULTS : "CommandResults",
						QY_COMMANDS : "Commands",
						QY_COMPOUNDING_FIXED_VALUES : "CompoundingFixedValues",
						QY_CONDITIONS : "Conditions",
						VA_CONDITIONS_ACTIVE : "Active",
						VA_CONDITIONS_REPO_IS_BACKEND_CONDITION : "IsBackendCondition",
						VA_CONDITIONS_DESCRIPTION : "Description",
						VA_CONDITIONS_NAME : "Name",
						QY_CONDITIONS_ON_DISABLED : "OnDisabled",
						VA_CONDITIONS_ON_DISABLED_WARNING : "Warning",
						VA_CONDITIONS_ON_DISABLED_ERROR : "Error",
						VA_CONDITIONS_EVALUATE_ON_DIMENSIONS : "EvaluateOnDimensions",
						QY_CONDITIONS_EVALUATE_ON_DIMENSIONS_LIST : "EvaluateOnDimensionsList",
						QY_CONDITIONS_THRESHOLD : "Threshold",
						QY_CONDITIONS_MEASURE_COORDINATE : "MeasureCoordinate",
						VA_CONDITIONS_DIMENSION_NAME : "DimensionName",
						VA_CONDITIONS_MEMBER_NAME : "MemberName",
						VA_CONDITIONS_COMPARISON : "Comparison",
						VA_CONDITIONS_LOW : "Low",
						VA_CONDITIONS_LOW_IS : "LowIs",
						VA_CONDITIONS_HIGH : "High",
						VA_CONDITIONS_HIGH_IS : "HighIs",
						QY_COLLATOR : "Collator",
						QY_CONSTANT : "Constant",
						QY_CONTENT : "Content",
						QY_CONTENT_DESCRPTION : "ContentDescription",
						QY_CONTENT_LOCATION : "ContentLocation",
						QY_CONTENT_TYPE : "ContentType",
						QY_CONTEXT : "Context",
						QY_CONV_EXIT : "ConvExit",
						VA_CONTEXT_ANALYTICS : "Analytics",
						VA_CONTEXT_LIST_REPORTING : "ListReporting",
						VA_CONTEXT_PLANNING : "Planning",
						QY_CONNECTION_TYPE : "ConnectionType",
						QY_CONVERSION : "Conversion",
						QY_CASE_SENSITIVE : "CaseSensitive",
						QY_CTYPE : "CType",
						VA_CTYPE_AXIS : "Axis",
						VA_CTYPE_CONDITION : "Condition",
						VA_CTYPE_QUERY_MODEL : "QueryModel",
						VA_CTYPE_FILTER : "Filter",
						VA_CTYPE_FILTER_EXPRESSION : "FilterExpression",
						VA_CTYPE_FILTER_CARTESIAN_PRODUCT : "FilterCartesianProduct",
						VA_CTYPE_FILTER_CARTESIAN_LIST : "FilterCartesianList",
						VA_CTYPE_FILTER_OPERATION : "FilterOperation",
						VA_CTYPE_FILTER_ALGEBRA : "FilterAlgebra",
						VA_CTYPE_MEMBER_RESTRICTED : "MemberRestricted",
						VA_CTYPE_DIMENSION_MEMBER_VARIABLE : "DimensionMemberVariable",
						VA_CTYPE_HIERARCHY_NODE_VARIABLE : "HierarchyNodeVariable",
						VA_CTYPE_CELL_VALUE_OPERAND : "CellValueOperand",
						VA_CTYPE_SORTING : "Sorting",
						VA_CTYPE_SORT_OPERATION : "SortOperation",
						VA_CTYPE_TOTALS : "Totals",
						VA_CTYPE_FIELD : "Field",
						VA_CTYPE_DIMENSION_MGR : "DimensionManager",
						VA_CTYPE_DIMENSION : "Dimension",
						VA_CTYPE_BASIC_MEASURE : "BasicMeasure",
						VA_CTYPE_MEMBERS : "Members",
						VA_CTYPE_FORMULA : "Formula",
						VA_CTYPE_DRILL_MANAGER : "DrillManager",
						QY_COMPARISON : "Comparison",
						VA_COMPARISON_EQUAL : "=",
						VA_COMPARISON_EQUAL2 : "EQ",
						VA_COMPARISON_EQUAL3 : "EQUAL",
						VA_COMPARISON_EQUAL4 : "EQUALS",
						VA_COMPARISON_NOT_EQUAL : "<>",
						VA_COMPARISON_GREATER : ">",
						VA_COMPARISON_LESS : "<",
						VA_COMPARISON_GREATER_EQUAL : ">=",
						VA_COMPARISON_LESS_EQUAL : "<=",
						VA_COMPARISON_MATCH : "MATCH",
						VA_COMPARISON_NOT_MATCH : "NOT_MATCH",
						VA_COMPARISON_SEARCH : "SEARCH",
						VA_COMPARISON_LIKE : "LIKE",
						VA_COMPARISON_IS_NULL : "IS_NULL",
						VA_COMPARISON_IS_NULL2 : "IS NULL",
						VA_COMPARISON_BETWEEN : "BETWEEN",
						VA_COMPARISON_NOTBETWEEN : "NOTBETWEEN",
						VA_COMPARISON_NOT_BETWEEN : "NOT_BETWEEN",
						VA_COMPARISON_BETWEEN_EXCLUDING : "BETWEEN_EXCLUDING",
						VA_COMPARISON_NOT_BETWEEN_EXCLUDING : "NOT_BETWEEN_EXCLUDING",
						VA_COMPARISON_FUZZY : "FUZZY",
						VA_COMPARISON_ALL : "ALL",
						VA_COMPARISON_AGGREGATED : "AGGREGATED",
						VA_COMPARISON_NON_AGGREGATED : "NON-AGGREGATED",
						VA_COMPARISON_SPATIAL_CONTAINS : "CONTAINS",
						VA_COMPARISON_SPATIAL_COVERS : "COVERS",
						VA_COMPARISON_SPATIAL_CROSSES : "CROSSES",
						VA_COMPARISON_SPATIAL_DISJOINT : "DISJOINT",
						VA_COMPARISON_SPATIAL_OVERLAPS : "OVERLAPS",
						VA_COMPARISON_SPATIAL_TOUCHES : "TOUCHES",
						VA_COMPARISON_SPATIAL_INTERSECTS : "INTERSECTS",
						VA_COMPARISON_SPATIAL_INTERSECT_RECT : "INTERSECT_RECT",
						VA_COMPARISON_SPATIAL_INTERSECTS_RECT : "INTERSECTS_RECT",
						VA_COMPARISON_SPATIAL_WITHIN : "WITHIN",
						VA_COMPARISON_SPATIAL_WITHIN_DISTANCE : "WITHIN_DISTANCE",
						QY_CONVERSION_ROUTINE : "ConversionRoutine",
						QY_COMPLETE : "Complete",
						QY_COMPLETED : "Completed",
						VA_CHECK_CURRENT_STEP_ONLY : "CheckCurrentStepOnly",
						QY_CELL_ARRAY_SIZES : "CellArraySizes",
						QY_CELL_FORMAT : "CellFormat",
						QY_COLUMN : "Column",
						QY_COLUMN_FROM : "ColumnFrom",
						QY_COLUMN_TO : "ColumnTo",
						VA_CURRENT_MEMBER : "CurrentMember",
						QY_CODE : "Code",
						QY_CODE_L : "code",
						VA_CODE_AND : "And",
						VA_CODE_OR : "Or",
						VA_CODE_NOT : "Not",
						QY_CUBE_TYPE : "CubeType",
						QY_CUBE_SUB_TYPE : "CubeSubType",
						QY_CUBE : "Cube",
						QY_CELLS : "Cells",
						QY_CELL_VALUES : "CellValues",
						QY_COMPOUNDINGS : "Compoundings",
						QY_COMPOUNDING : "Compounding",
						QY_COPY_TARGET_APPSET_ID : "TARGET_APPSET_ID",
						QY_COPY_TARGET_PARENT_RES_ID : "TARGET_PARENT_ID",
						QY_CONTROLL_BY : "ControllBy",
						QY_COMPONETS : "Components",
						QY_CONDITIONAL_TOTALS : "ConditionalTotals",
						QY_CONDITIONAL_TOTALS_LIST : "ConditionalTotalsList",
						QY_CONDITIONAL_VISIBILITY : "ConditionalVisibility",
						QY_CONFIG_LEVEL : "ConfigLevel",
						VA_CONFIG_LEVEL_NONE : "None",
						VA_CONFIG_LEVEL_QUERY : "Query",
						VA_CONFIG_LEVEL_AXIS : "Axis",
						VA_CONFIG_LEVEL_DIMENSION : "Dimension",
						QY_COORDINATES : "Coordinates",
						QY_CREATE_USER : "CreateUser",
						QY_CHANGE_USER : "ChangeUser",
						QY_CHANGEABLE : "Changegable",
						QY_CREATE_TIME : "CreateTime",
						QY_CREATED_TIME : "CreatedTime",
						QY_CREATED_BY : "CreatedBy",
						QY_CREATED_ON : "CreatedOn",
						QY_CHANGE_TIME : "ChangeTime",
						QY_CAPABILITY_EXCLUDING : "Excluding",
						QY_CAPABILITY_INCLUDING : "Including",
						QY_CAPABILITY_COMPARISON_GROUP : "ComparisonGroup",
						VA_CAPABILITY_COMPARISON_GROUP_SINGLE_VALUE : "SingleValue",
						VA_CAPABILITY_COMPARISON_GROUP_INTERVAL : "Interval",
						VA_CAPABILITY_COMPARISON_GROUP_RANGE : "Range",
						QY_CHILDREN : "Children",
						QY_CONVERT_TO_FLAT_SELECTION : "ConvertToFlatSelection",
						QY_CURRENCY : "Currency",
						QY_CURRENCY_REFERENCE : "CurrencyReference",
						QY_DATA_SOURCE : "DataSource",
						QY_DATA_SOURCES : "DataSources",
						QY_DATA_SOURCE_C : "Datasource",
						QY_DATA_SOURCE_TYPE : "DatasourceType",
						QY_DATA : "Data",
						QY_DATA_PROVIDER : "DataProvider",
						QY_DATA_L : "data",
						QY_DATA_U : "DATA",
						QY_DATA_ENTRIES : "DataEntries",
						QY_DATA_ENTRY_ENABLED : "DataEntryEnabled",
						QY_DATA_ENTRY_MASK : "DataEntryMask",
						QY_DATA_LENGTH : "DataLength",
						QY_DATA_TYPE : "DataType",
						QY_DATA_AREA : "DataArea",
						QY_DATA_AREAS : "DataAreas",
						QY_DATA_AREA_DEFAULT : "DEFAULT",
						QY_DATA_INT_LEN : "DataIntLen",
						QY_DATA_FIELDS : "DataFields",
						VA_DATA_TYPE_STRING : "String",
						VA_DATA_TYPE_INT : "Int",
						VA_DATA_TYPE_LONG : "Long",
						VA_DATA_TYPE_DOUBLE : "Double",
						VA_DATA_TYPE_NUMC : "Numc",
						VA_DATA_TYPE_DATE : "Date",
						VA_DATA_TYPE_TIME : "Time",
						VA_DATA_TYPE_TIMESTAMP : "Timestamp",
						VA_DATA_TYPE_TIMESPAN : "Timespan",
						VA_DATA_TYPE_BOOL : "Bool",
						VA_DATA_TYPE_AMOUNT : "Amount",
						VA_DATA_TYPE_PROPERTIES : "Properties",
						VA_DATA_TYPE_STRUCTURE : "Structure",
						VA_DATA_TYPE_STRUCTURE_LIST : "StructureList",
						VA_DATA_TYPE_POINT : "Point",
						VA_DATA_TYPE_GEOMETRY : "Geometry",
						VA_DATA_TYPE_LANGUAGE : "Language",
						VA_DATA_TYPE_LINE_STRING : "LineString",
						VA_DATA_TYPE_DECIMAL_FLOAT : "DecimalFloat",
						VA_DATA_TYPE_VARIABLE : "Variable",
						VA_DATA_TYPE_CURRENT_MEMBER : "CurrentMember",
						QY_DATE_FORMAT : "DateFormat",
						QY_0DATE_FROM : "0DATEFROM",
						QY_DATE_TO : "DateTo",
						QY_DAP : "DAP",
						QY_DAPID : "DAPID",
						QY_DAPS : "Daps",
						QY_DAP_NO_AGGR_NUM : "NoAggrNum",
						QY_DAP_INHERITED_FROM : "InheritedFrom",
						QY_DEADLINE_END_TIME : "DeadlineEndTime",
						QY_DEADLINE_ZONE : "DeadlineZone",
						QY_DECIMALS : "Decimals",
						QY_DECIMAL_DELIMITER : "DecimalDelimiter",
						VA_DESIGN_TIME_MODE : "D",
						QY_DEPENDENT_ATTRIBUTES : "DependentAttributes",
						QY_DELTA_ROW_COUNT : "DeltaRowCount",
						QY_DEFAULT_RESULT_SET_READ_MODE : "DefaultResultSetReadMode",
						QY_DEFAULT_SELECTOR_READ_MODE : "DefaultSelectorReadMode",
						QY_DEFAULT_VARIABLE_READ_MODE : "DefaultVariableReadMode",
						QY_DEFAULT_BASE_MEMBER : "DefaultBaseMember",
						QY_DEFAULT_DISPLAY_KEY_ATTRIBUTE : "DefaultDisplayKeyAttribute",
						QY_DEFAULT_KEY_ATTRIBUTE : "DefaultKeyAttribute",
						QY_DEFAULT_MEMBER : "DefaultMember",
						QY_DEFAULT_RESULT_SET_ATTRIBUTES : "DefaultResultSetAttributes",
						QY_DEFAULT_RESULT_SET_ATTRIBUTES_MD : "DefaultResultSetAttributesMd",
						QY_DEFAULT_RESULT_SET_ATTRIBUTE_NODES : "DefaultResultSetAttributeNodes",
						QY_DEFAULT_RESULT_SET_ATTRIBUTE_NODES_MD : "DefaultResultSetAttributeNodesMd",
						QY_DEFAULT_SELECTED_DIMENSIONS : "DefaultSelectedDimensions",
						QY_DEFAULT_SELECTION : "DefaultSelection",
						QY_DEFAULT_TEXT_ATTRIBUTE : "DefaultTextAttribute",
						QY_DEFAULT_VALUE : "DefaultValue",
						QY_DETAILS : "Details",
						QY_DEPTH : "Depth",
						QY_DIGITS : "Digits",
						QY_DIM : "Dim",
						QY_DIM_DESCRIPTION : "DimDescription",
						QY_DIM_NAME : "DimName",
						QY_DIM_ATTRIBUTES : "DimensionAttributes",
						QY_DIMENSION_TYPE : "DimensionType",
						QY_DIMENSION_CHILDREN : "DimensionChildren",
						QY_DIMENSION_DAP_DETAILS : "DimensionDapDetails",
						QY_DIMENSION_CONTEXT : "DimensionContext",
						QY_DIMENSION_ID : "DimensionId",
						QY_DIMENSION_DESCRIPTION : "DimensionDescription",
						QY_DIMENSION_GROUPS : "DimensionGroups",
						VA_DIMENSION_TYPE_TIME : 1,
						VA_DIMENSION_TYPE_MEASURE_STRUCT : 2,
						VA_DIMENSION_TYPE_NON_STRUCT_C : 3,
						VA_DIMENSION_TYPE_CURRENCY : 4,
						VA_DIMENSION_TYPE_UNIT : 5,
						VA_DIMENSION_TYPE_SECONDARY_STRUCT : 6,
						VA_DIMENSION_TYPE_DATE : 7,
						VA_DIMENSION_TYPE_HIERARCHY_VERSION : 8,
						VA_DIMENSION_TYPE_HIERARCHY_NAME : 9,
						VA_DIMENSION_TYPE_GEO : 10,
						VA_DIMENSION_TYPE_VERSION : 11,
						VA_DIMENSION_TYPE_ACCOUNTS : 12,
						QY_DIMENSIONS : "Dimensions",
						QY_DIMENSION : "Dimension",
						QY_DIMENSION_NAME : "DimensionName",
						QY_DIMENSION_REFERENCE : "DimensionReference",
						QY_DIMENSION_MEMBERS_REFERENCES : "DimensionMemberReferences",
						QY_DEFAULT_HIERARCHY : "DefaultHierarchy",
						QY_DEFAULT_INPUT_MODE : "DefaultInputMode",
						QY_DESCRIPTION : "Description",
						QY_DEFINITION : "Definition",
						QY_DEFINING_CONTEXT : "DefiningContext",
						QY_DETAIL : "DETAIL",
						QY_DETAIL_LEVEL : "DetailLevel",
						QY_DETAIL_LVL : "D_LVL",
						QY_DETAIL_LVL_ENVM : "ENVM",
						QY_DETAIL_LVL_MODL : "MODL",
						QY_DETAIL_LVL_IPRV : "IPRV",
						QY_DETAIL_LVL_IOBJ : "IOBJ",
						QY_DYNAMIC_FILTER : "DynamicFilter",
						QY_DIRECTION : "Direction",
						VA_DIRECTION_ASCENDING : "Asc",
						VA_DIRECTION_DESCENDING : "Desc",
						VA_DIRECTION_NONE : "None",
						QY_DISPLAY_LEVEL : "DisplayLevel",
						QY_DRILL_MEMBER : "DrillMember",
						QY_DRILL_CONTEXT_MEMBERS : "DrillContextMembers",
						QY_DRILL_LEVEL : "DrillLevel",
						QY_DRILL_STATE : "DrillState",
						QY_CHILD_COUNT : "ChildCount",
						VA_DRILL_STATE_LEAF : 1,
						VA_DRILL_STATE_COLLAPSED : 2,
						VA_DRILL_STATE_EXPANDED : 3,
						VA_DRILL_STATE_OP_COLLAPSED : "Collapsed",
						VA_DRILL_STATE_OP_EXPANDED : "Expanded",
						QY_DRIVER_DIM : "DriverDim",
						QY_DRIVER_DIMS : "DriverDims",
						QY_DRIVER_ID : "DriverId",
						QY_DRIVER_HIERARCHY : "DriverHierarchy",
						QY_DEFAULT_RESULT_STRUCTURE : "DefaultResultStructure",
						QY_DUMMY : "",
						QY_DIMENSION_IS_HIERARCHICAL : "isHierarchical",
						QY_DEPENDENT_OF_VARIABLE : "DependentOfVariable",
						QY_DUE_DATE : "DueDate",
						QY_DUE_DATE_IS : "DueDateIs",
						VA_DUE_TO_IS_VARIABLE : "Variable",
						QY_DISPLAY_KEY_ATTRIBUTE : "DisplayKeyAttribute",
						QY_ENVM : "ENVM",
						QY_ENVM_DIMS : "EnvmDims",
						QY_ENVIRONMENT : "Environment",
						QY_ELEMENTS : "Elements",
						QY_EMAIL : "Email",
						QY_ENCODING : "Encoding",
						QY_ENABLED : "Enabled",
						QY_ENABLE_WORKSTATUS : "EnableWorkStatus",
						QY_ENABLE_AUDIT : "EnableAudit",
						QY_EXPAND_BOTTOM_UP : "ExpandBottomUp",
						QY_EXPERIMENTAL_FEATURES : "ExperimentalFeatures",
						QY_ERROR : "Error",
						QY_ERROR_L : "error",
						QY_ERROR_DETIALS : "ErrorDetails",
						QY_EXACTNESS : "Exactness",
						QY_EXECUTE_REQUEST_ON_OLD_RESULT_SET : "ExecuteRequestOnOldResultSet",
						QY_EXECUTED : "Executed",
						QY_EXPAND : "Expand",
						VA_EXPAND_CUBE : "Cube",
						VA_EXPAND_COMMAND : "Command",
						QY_EXCEPTION_AGGREGATION : "ExceptionAggregation",
						QY_EXCEPTION_AGGREGATION_DIMENSIONS : "ExceptionAggregationDimensions",
						QY_EXCEPTION : "Exception",
						QY_EXCEPTIONS : "Exceptions",
						QY_EXCEPTION_HEADER_SETTING : "ApplySettingsToHeader",
						QY_EXCEPTION_SETTING_INDEX : "ExceptionSettingIndex",
						QY_EXTRA_DEADLINE_OFFSET : "ExtraDeadlineOffset",
						QY_EVALUATE : "Evaluate",
						QY_EVALUATE_BEFORE_POST_AGGREGATION : "EvaluateBeforePostAggregation",
						QY_EVALUATE_DEFAULT : "EvaluateDefault",
						QY_EVALUATE_ON : "EvaluateOn",
						VA_EXCEPTION_NORMAL : 0,
						VA_EXCEPTION_NULL : 1,
						VA_EXCEPTION_ZERO : 2,
						VA_EXCEPTION_UNDEFINED : 3,
						VA_EXCEPTION_OVERFLOW : 4,
						VA_EXCEPTION_NO_PRESENTATION : 5,
						VA_EXCEPTION_DIFF0 : 6,
						VA_EXCEPTION_ERROR : 7,
						VA_EXCEPTION_NO_AUTHORITY : 8,
						VA_EXCEPTION_MIXED_CURRENCIES_OR_UNITS : 9,
						VA_EXCEPTION_UNDEFINED_NOP : 10,
						QY_EXCEPTION_NAME : "ExceptionName",
						QY_EXCEPTION_ALERT_LEVEL : "ExceptionAlertLevel",
						QY_EXTENDED_SORT_TYPES : "ExtendedSortTypes",
						QY_EXTENDED_DIMENSIONS : "ExtendedDimensions",
						QY_EXECUTION_STEP : "ExecutionStep",
						VA_EXECUTION_STEP_CALCULATION_BEFORE_AGGREGATION : "CalculationBeforeAggregation",
						QY_FIELD : "Field",
						QY_FIELDS : "Fields",
						QY_FIELD_DELIMITER : "FieldDelimiter",
						QY_FIELD_DEFAULTS : "FieldDefaults",
						VA_FIELD_DELIMITER_QUOTATION_MARK : '"',
						QY_FIELD_LAYOUT_TYPE : "FieldLayoutType",
						VA_FIELD_LAYOUT_TYPE_FIELD_BASED : "FieldBased",
						VA_FIELD_LAYOUT_TYPE_ATTRIBUTE_BASED : "AttributeBased",
						VA_FIELD_LAYOUT_TYPE_ATTRIBUTES_AND_PRESENTATIONS : "AttributesAndPresentations",
						QY_FIELD_LITERAL_VALUE : "FieldLiteralValue",
						QY_FIELD_RENAMING_MODE : "FieldRenamingMode",
						QY_FIELD_SETTINGS : "FieldSettings",
						QY_FILE_PATH : "FilePath",
						QY_FEED_ID : "FeedId",
						QY_FEED_DETAIL : "FeedDetail",
						QY_FEED_COMMENTS : "FeedComments",
						QY_FEED_COMMENT_ID : "FeedCommentId",
						QY_FEED_COMMENT_COUNT : "FeedCommentCount",
						QY_FEED_COMMENT_REQUEST : "FeedCommentRequest",
						QY_FIRST_NAME : "Firstname",
						QY_FIRST_DATA_ROW : "FirstDataRow",
						QY_FIXED_FILTER : "FixedFilter",
						QY_FIXED_MEMBER : "FixedMember",
						QY_FIX_KEYS : "FixKeys",
						QY_FILTER : "Filter",
						QY_FILTERVALUE_C : "FILTERVALUE",
						QY_FILTER_ROOT : "FilterRoot",
						QY_FILTER_REPO : "FilterRepo",
						QY_FILTERS : "Filters",
						QY_FILTER_BY : "FilterBy",
						QY_FILTER_VALUE : "FilterValue",
						QY_FIELD_MAPPINGS : "FieldMappings",
						QY_FIELD_NAME : "FieldName",
						QY_FIELD_NAME_IN_REFERENCED_DATA : "FieldNameInReferencedData",
						QY_FULL_NAME : "FullName",
						QY_FUNCTION : "Function",
						QY_FORMULA : "Formula",
						QY_FORMULA_MEASURE : "FormulaMeasure",
						QY_FEATURE_ID : "FeatureId",
						QY_FOR_OPERATING : "ForOperating",
						QY_FRACT_DIGITS : "FractDigits",
						QY_FOR_LOCAL_COMPOSITEP_ROVIDER : "ForLocalCompositeProvider",
						QY_FILTER_CAPABILITY : "FilterCapability",
						QY_GENERATION_OF_SID_ALLOWED : "GenerationOfSIDAllowed",
						QY_GEOMETRY_OPERAND : "GeometryOperand",
						QY_GRIDS : "Grids",
						QY_GROUP_BY : "GroupBy",
						QY_GROUP_ID : "GroupId",
						QY_GROUPING_INFO : "GroupingInfo",
						QY_HAS_CHANGED_DATA : "HasChangedData",
						QY_HAS_AUTH : "HasAuth",
						QY_HAS_AUTHORITY : "HasAuthority",
						QY_HAS_AUDIT_AUTH : "HasAuditAuth",
						QY_HAS_HIE : "HasHie",
						QY_HAS_LOCK_DATA : "HasLockData",
						QY_HAS_LEVEL_OFFSET : "HasLevelOffset",
						QY_HAS_DEPTH : "HasDepth",
						QY_HAS_OWNER : "HasOwner",
						QY_HAS_VERSIONED_HIE : "HasVersionedHie",
						QY_HEADER_ROW : "HeaderRow",
						QY_HIE_TYPE : "HieType",
						QY_HIGH : "High",
						QY_HIGH_IS : "HighIs",
						QY_HIGH_SUPPLEMENTS : "HighSupplements",
						QY_HIER_NAME : "HierName",
						QY_HIER_VERSION : "HierVersion",
						QY_HIER_KEY_DATE : "HierKeyDate",
						QY_HIER_DATE_FROM : "HierDateFrom",
						QY_HIER_DATE_TO : "HierDateTo",
						QY_HIE_NAME : "HieName",
						QY_HIE_DESCRIPTION : "HieDescription",
						QY_HIE_VERSION : "HieVersion",
						QY_HIE_DATE_FROM : "HieDateFrom",
						QY_HIE_DATE_TO : "HieDateTo",
						QY_HIERARCHIES : "Hierarchies",
						QY_HIERARCHIES_POSSIBLE : "HierarchiesPossible",
						QY_HIERARCHY : "Hierarchy",
						QY_HIERACHY_BASE_DIMENSION : "HierachyBaseDimension",
						QY_HIERARCHY_BASE_DIMENSION : "HierarchyBaseDimension",
						QY_HIERARCHY_ACTIVE : "HierarchyActive",
						QY_HIERARCHY_DESCRIPTION : "HierarchyDescription",
						QY_HIERARCHY_MEMBER : "HierarchyMember",
						QY_HIERARCHY_NAVIGATION_DELTA_MODE : "HierarchyNavigationDeltaMode",
						QY_HIERARCHY_INTERVAL : "HierarchyInterval",
						QY_HIERARCHY_LIST : "HierarchyList",
						QY_HIERARCHY_NAME : "HierarchyName",
						QY_HIERARCHY_NAV_COUNTER : "HierarchyNavigationCounter",
						QY_HIERARCHY_NAVIGATIONS : "HierarchyNavigations",
						QY_HIERARCHY_PATH_ATTRIBUTE : "HierarchyPathAttribute",
						QY_HINTS : "Hints",
						VA_HIERARCHY_LEVEL_TYPE_REGULAR : 0,
						VA_HIERARCHY_LEVEL_TYPE_ALL : 1,
						VA_HIERARCHY_LEVEL_TYPE_TIME_YEAR : 20,
						VA_HIERARCHY_LEVEL_TYPE_TIME_HALFYEAR : 36,
						VA_HIERARCHY_LEVEL_TYPE_TIME_QUARTER : 68,
						VA_HIERARCHY_LEVEL_TYPE_TIME_MONTH : 132,
						VA_HIERARCHY_LEVEL_TYPE_TIME_WEEK : 260,
						VA_HIERARCHY_LEVEL_TYPE_TIME_DAY : 516,
						VA_HIERARCHY_LEVEL_TYPE_TIME_HOUR : 772,
						VA_HIERARCHY_LEVEL_TYPE_TIME_MINUTES : 1028,
						VA_HIERARCHY_LEVEL_TYPE_TIME_SECONDS : 2052,
						QY_HIERARCHY_MEMBER_SET : "HierarchyMemberSet",
						QY_HIERARCHY_MEMBER_SETS : "HierarchyMemberSets",
						QY_HIERARCHY_VERSION : "HierarchyVersion",
						QY_HIERARCHY_PROPERTIES : "HierarchyProperties",
						QY_HIERARCHY_MAINTENANCE : "HierarchyMaintenance",
						QY_HIERARCHY_CREATION : "HierarchyCreation",
						QY_HIERARCHY_CREATION_BY_REFERENCE : "HierarchyCreationByReference",
						QY_HIERARCHY_UPDATE : "HierarchyUpdate",
						QY_HIERARCHY_COPY : "HierarchyCopy",
						QY_HIERARCHY_DELETION : "HierarchyDeletion",
						QY_HIERARCHY_SAVING : "HierarchySaving",
						QY_HIERARCHY_ACTIVATION : "HierarchyActivation",
						QY_HIERARCHY_INTERVALS : "HierarchyIntervals",
						QY_HIERARCHY_REVERSE_SIGN : "HierarchyReverseSign",
						QY_HIERARCHY_STRUCTURE_TIME_DEP : "HierarchyStructureTimeDep",
						QY_HIERARCHY_TIME_DEP : "HierarchyTimeDep",
						QY_HIERARCHY_VERSION_DEP : "HierarchyVersionDep",
						QY_HIERARCHY_EXTERNAL_DIMENSION : "HierarchyExternalDimension",
						QY_HIERARCHY_LOCAL_MAINTENANCE : "HierarchyLocalMaintenance",
						QY_HIERARCHY_LOCAL_CREATION : "HierarchyLocalCreation",
						QY_HIERARCHY_LOCAL_CREATION_BY_REFERENCE : "HierarchyLocalCreationByReference",
						QY_HIERARCHY_LOCAL_UPDATE : "HierarchyLocalUpdate",
						QY_HIERARCHY_LOCAL_COPY : "HierarchyLocalCopy",
						QY_HIERARCHY_LOCAL_DELETION : "HierarchyLocalDeletion",
						QY_HIERARCHY_LOCAL_SAVING : "HierarchyLocalSaving",
						QY_HIERARCHY_LOCAL_ACTIVATION : "HierarchyLocalActivation",
						QY_HIERARCHY_LOCAL_INTERVALS : "HierarchyLocalIntervals",
						QY_HIERARCHY_LOCAL_REVERSE_SIGN : "HierarchyLocalReverseSign",
						QY_HIERARCHY_LOCAL_STRUCTURE_TIME_DEP : "HierarchyLocalStructureTimeDep",
						QY_HIERARCHY_LOCAL_TIME_DEP : "HierarchyLocalTimeDep",
						QY_HIERARCHY_LOCAL_VERSION_DEP : "HierarchyLocalVersionDep",
						QY_HIERARCHY_LOCAL_EXTERNAL_DIMENSION : "HierarchyLocalExternalDimension",
						QY_HIERARCHY_KEY_ATTRIBUTE : "HierarchyKeyAttribute",
						QY_HIERARCHY_DISPLAY_KEY_ATTRIBUTE : "HierarchyDisplayKeyAttribute",
						QY_HIERARCHY_TEXT_ATTRIBUTE : "HierarchyTextAttribute",
						QY_HIERARCHY_MAINTAIN : "HierarchyMaintain",
						QY_HIERARCHY_AUTH : "HierarchyAuth",
						VA_HIERARCHY_TYPE_MD_IO : "1",
						VA_HIERARCHY_TYPE_LH : "8",
						QY_HUMAN_ROLE : "HumanRole",
						QY_ID : "Id",
						QY_IDENTITY_DIMS : "IdentityDims",
						QY_ID_U : "ID",
						QY_ID_SEPARATER : "//",
						QY_ID_LIST : "ID_LIST",
						QY_ID_LIST_SEPARATER : ";",
						QY_IGNORE_EXTERNAL_DIMENSIONS : "IgnoreExternalDimensions",
						VA_IGNORE_EXTERNAL_DIMENSIONS_ALL : "All",
						QY_IOBJ_NAME : "Iobjnm",
						QY_INPUT_SUPPORTED : "InputSupported",
						QY_INTEGRATION_CONSOLIDATION : "IntegrationConsolidation",
						QY_ONLY_INTERVAL : "Interval",
						QY_IS_ACTIVE : "IsActive",
						QY_IS_COMPOUNDING : "IsCompounding",
						QY_IS_DRIVER : "IsDriver",
						QY_IS_DIMENSION_GROUP : "IsDimensionGroup",
						QY_IS_DISPLAY_ATTRIBUTE : "IsDisplayAttribute",
						QY_IS_ENABLED : "IsEnabled",
						QY_IS_ENTIRE_HIE_TD : "IsEntireHieTD",
						QY_IS_EXCLUDING : "IsExcluding",
						QY_IS_FILTERABLE : "IsFilterable",
						QY_IS_HIE_STRUCT_TD : "IsHieStructTD",
						QY_IS_HIE_INTERVAL_PERMITTED : "IsHieIntervalPermitted",
						QY_IS_HIE_SIGN_REVERSED : "IsHieSignReversed",
						QY_IS_KEY : "IsKey",
						QY_IS_KYF : "IsKyf",
						QY_IS_LINK_KEY : "IsLinkKey",
						QY_IS_MAINTAINABLE : "IsMaintainable",
						QY_IS_MANDATORY : "IsMandatory",
						QY_IS_NOTIFY_ACTIVATED : "IsNotifyActivated",
						QY_IS_OWNER_DIMENSION : "IsOwnerDimension",
						QY_IS_OWNER_CUSTOMIZED : "IsOwnerCustomized",
						QY_IS_PERFORMER : "IsPerformer",
						QY_IS_PAYLOAD_ZIP : "IsPayloadZip",
						QY_IS_PROV_RELEVANT : "IsProvRelevant",
						QY_IS_REMOTE_HIE : "IsRemoteHie",
						QY_IS_REVIEWER : "IsReviewer",
						QY_IS_SELECTION_CANDIDATE : "IsSelectionCandidate",
						QY_IS_TEAM : "IsTeam",
						QY_IS_LINKED : "IsLinked",
						QY_IS_SHARE_ALL : "IsShareAll",
						QY_IS_VALID : "IsValid",
						QY_IS_WORK_STATUS_ACTIVE : "IsWorkStatusActive",
						QY_IS_OWNER_ACTION_DONE : "IsOwnerActionDone",
						QY_IS_OWNER_DEADLINE_PASSIVE : "IsOwnerDeadlinePassive",
						QY_IS_REVIEWER_ACTION_DONE : "IsReviewerActionDone",
						QY_IS_REVIEWER_DEADLINE_PASSIVE : "IsReviewerDeadlinePassive",
						QY_IS_SUPPRESSING_NULLS : "IsSuppressingNulls",
						QY_IF_ACTIVE : "IfActive",
						QY_IF_SYSTEM_REPORT : "IfSystemReport",
						QY_IN_PROGRESS : "InProgress",
						QY_INITIAL_DRILL_LEVEL : "InitialDrillLevel",
						QY_INITIAL_VALUE : "InitialValue",
						QY_IS_TEAM_LEADER : "IsTeamLeader",
						QY_IS_CUMMULATIVE : "IsCummulative",
						QY_IS_MEMBER_PARENT : "IsMemberParent",
						QY_IS_MEMBER_LINK : "IsMemberLink",
						QY_IS_MEMBER_INTERVAL : "IsMemberInterval",
						QY_INDEX : "Index",
						QY_ITEM_LIST : "ItemList",
						QY_INSTANCE : "Instance",
						QY_INSTANCES : "Instances",
						QY_INSTANCE_ID : "InstanceId",
						QY_INSTANCE_NAME : "InstanceName",
						QY_INSTANCE_ACTIVITIES : "InstanceActivities",
						QY_INPUT_ENABLED : "InputEnabled",
						QY_INPUT_READINESS_FLAG : "Flag",
						QY_INPUT_READINESS_INDEX : "InputReadinessIndex",
						QY_INPUT_READINESS_STATES : "InputReadinessStates",
						QY_INPUT_TYPE : "InputType",
						VA_INPUT_TYPE_MANDATORY : "Mandatory",
						VA_INPUT_TYPE_OPTIONAL : "Optional",
						VA_INPUT_TYPE_MANDATORY_NOT_INITIAL : "MandatoryNotInitial",
						QY_INFO_OBJECT : "InfoObject",
						QY_INFO_OBJECTS : "InfoObjects",
						QY_INFO_OBJECT_DETAILS : "InfoObjectDetails",
						QY_INFO_OBJECT_DESCRIPTION : "InfoObjectDescription",
						QY_INFO_OBJECT_NAME : "InfoObjectName",
						QY_INFO_OBJECT_MAPPING : "InfoObjectMapping",
						QY_IOBJNM : "IOBJNM",
						QY_IPRV : "Iprv",
						QY_INFO_AREA : "InfoArea",
						QY_INFO_L_AREA : "Infoarea",
						QY_INFO_AREA_C : "InfoAreaC",
						QY_INFO_AREA_N : "InfoAreaN",
						QY_INFO_AREA_P : "InfoAreaP",
						QY_INFO_PROV : "InfoProv",
						QY_INFO_PROVIDER : "InfoProvider",
						QY_INFO_PROVIDERS : "InfoProviders",
						QY_INFO_AREAS_ALVL : "InfoAreasAlvl",
						QY_INFO_AREAS_DELTA : "InfoAreasDelta",
						QY_INFO_OBJ_TYPE : "InfoobjType",
						QY_INFO_OBJ_NAME : "InfoobjName",
						QY_INFO_OBJ_CATEGORY : "IOBJCATEGORY",
						VA_INFO_OBJ_TYPE_CHA : "CHA",
						VA_INFO_OBJ_TYPE_KYF : "KYF",
						VA_INFO_OBJ_TYPE_TIM : "TIM",
						VA_INFO_OBJ_TYPE_UNI : "UNI",
						VA_INFO_OBJ_TYPE_DPA : "DPA",
						VA_INFO_OBJ_TYPE_ATR : "ATR",
						VA_INFO_OBJ_TYPE_MTA : "MTA",
						VA_INFO_OBJ_TYPE_XXL : "XXL",
						VA_INFO_OBJ_TYPE_ALL : "ALL",
						QY_JOIN_FIELDS : "JoinFields",
						QY_JOIN_FIELD_NAME : "JoinFieldName",
						QY_JOIN_FIELD_NAME_IN_EXTENDED_DIMENSION : "JoinFieldNameInExtendedDimension",
						QY_JOIN_FIELD_NAME_IN_REFERENCED_DATA : "JoinFieldNameInReferencedData",
						QY_JOIN_TYPE : "JoinType",
						QY_JOIN_PARAMETERS : "JoinParameters",
						QY_KEEP_VALUE : "KeepValue",
						QY_KEY : "Key",
						QY_KEYS : "Keys",
						QY_KEY_ATTRIBUTE : "KeyAttribute",
						QY_KEY_WORD : "Keyword",
						QY_KEY_FIGURE : "Keyfigure",
						QY_KEY_FIELDS : "KeyFields",
						QY_KEY_DATE : "KeyDate",
						QY_KPI : "KPI",
						QY_KPI_OPEN : "KpiOpen",
						QY_KPI_REJECTED : "KpiRejected",
						QY_KPI_REOPEN : "KpiReopen",
						QY_KPI_PENDING : "KpiPending",
						QY_KPI_SUBMITTED : "KpiSubmitted",
						QY_KPI_DELAYED : "KpiDelayed",
						QY_KPI_COMPELETED : "KpiCompeleted",
						QY_LAYOUT : "Layout",
						QY_LANGU : "Langu",
						QY_LANGUAGE : "Language",
						QY_LAST_NAME : "Lastname",
						QY_LAST_FEED_COM_ID : "LastFeedComId",
						QY_LINE_ID : "LineId",
						QY_LINK_TYPE : "LinkType",
						QY_LIST : "List",
						QY_LOCATION : "Location",
						QY_LOCALE : "Locale",
						QY_LOW : "Low",
						QY_LOW_IS : "LowIs",
						QY_LOWER_BOUND : "LowerBound",
						QY_LOGICAL_OPERATOR : "Operator",
						QY_LAST_UPDATE : "LastDataUpdate",
						QY_DATA_LAST_REFRESH : "DataLastRefresh",
						QY_DATA_ROLL_UP_MAX : "DataRollupMax",
						QY_DATA_ROLL_UP_MIN : "DataRollupMin",
						QY_LAST_UPDATE_BY : "LastDataUpdateBy",
						QY_LAST_DATA_UPDATE_ON : "LastDataUpdateOn",
						QY_LEAVES_ONLY : "LeavesOnly",
						QY_LENGTH : "Length",
						QY_LEVEL : "Level",
						QY_LEVELS : "Levels",
						QY_LEVEL_NAME : "LevelName",
						QY_LEVEL_CAPTION : "LevelCaption",
						QY_LEVEL_UNIQUE_NAME : "LevelUniqueName",
						QY_LEVEL_TYPE : "LevelType",
						QY_LEVEL_OFFSET : "LevelOffset",
						QY_LOCKED_CELL : "LockedCell",
						QY_LOCKED_VALUE : "LockedValue",
						QY_LOCK_USER : "LockUser",
						QY_LOCK_TIME : "LockTime",
						QY_LCHA_MESSAGES : "LChaMessages",
						QY_LOCAL_PROVIDERS : "LocalProviders",
						QY_LOCAL_PROVIDER_PREFIX : "@3",
						QY_LOCAL_DIMENSION_PROVIDER : "LocalDimension",
						QY_LOCAL_HIERARCHY_PROVIDER : "LocalHierarchy",
						QY_LOWER_CASE_ENABLED : "LowerCaseEnabled",
						QY_LOWERCASE_SUPPORTED : "LowercaseSupported",
						QY_LOW_NAVIGATIONS : "LowNavigations",
						QY_LOW_SUPPLEMENTS : "LowSupplements",
						QY_LOCAL_COMPOSITE_PROVIDER_NAME : "LocalCompositeProviderName",
						QY_LQRY : "LQRY",
						QY_MAPPED_COLUMN : "MappedColumn",
						QY_MAPPING : "Mapping",
						QY_MAPPING_DEFINITION : "MappingDefinition",
						QY_MAPPINGS : "Mappings",
						QY_MAX_TUPLE_COUNT : "MaxTupleCount",
						QY_MAX_RESULT_RECORDS : "MaxResultRecords",
						QY_MBR_LEVEL : "MBR_LEVEL",
						QY_MEASURE : "Measure",
						QY_MEASUREMENTS : "Measurements",
						QY_MEASURE_NAME : "MeasureName",
						QY_MEASURES : "Measures",
						QY_MEASURES_AGGREGATION : "[Measures].[Aggregation]",
						QY_MEASURES_DIGITS : "[Measures].[Digits]",
						QY_MEASURES_FRACT_DIGITS : "[Measures].[FractDigits]",
						QY_MEASURES_MEASURES : "[Measures].[Measures]",
						QY_MEMBER : "Member",
						QY_MEMBER_ACCESS : "MemberAccess",
						QY_MEMBER_COMPOUNDINGS : "MemberCompoundings",
						QY_MEMBER_DETAILS : "MemberDetails",
						QY_MEMBER_DESC : "MBR_DESC",
						QY_MEMBER_EXTERNAL_ID : "MemberExternalID",
						QY_MEMBER_EXTID : "MBR_EXTID",
						QY_MEMBER_HIER_SID : "MemberHierSID",
						QY_MEMBER_INDEXES : "MemberIndexes",
						QY_MEMBER_IOBJ : "MBR_IOBJ",
						QY_MEMBER_ITEM : "MemberItem",
						QY_MEMBER_DESCRIPTION : "MemberDescription",
						QY_MEMBER_NAME : "MemberName",
						QY_MEMBER_OF_POSTED_NODE_VISIBILITY : "MemberOfPostedNodeVisibility",
						QY_MEMBER_OPERAND : "MemberOperand",
						QY_MEMBER_TYPE : "MemberType",
						QY_MEMBER_TYPES : "MemberTypes",
						QY_MEMBER_UNIQUE_NAME : "MemberUniqueName",
						QY_MEMBERS : "Members",
						QY_MEMBERS_REPO : "MembersRepo",
						QY_METADATA : "Metadata",
						QY_MASTERDATA : "Masterdata",
						QY_MASTER_DATA_PROPERTIES : "MasterDataProperties",
						QY_MASTER_DATA_MAINTENANCE : "MasterDataMaintenance",
						QY_MASTER_DATA_MAINTAIN : "MasterDataMaintain",
						QY_MAXIMUM_NUMBER_OF_LOCAL_PROVIDERS : "MaximumNumberOfLocalProviders",
						QY_MEASURE_OPERAND : "MeasureOperand",
						QY_MESSAGE : "Message",
						QY_MESSAGE_L : "message",
						QY_MESSAGES : "Messages",
						QY_MESSAGE_TYPE : "MessageType",
						QY_MESSAGE_CLASS : "MessageClass",
						VA_SEVERITY_INFO : 0,
						VA_SEVERITY_WARNING : 1,
						VA_SEVERITY_ERROR : 2,
						VA_SEVERITY_SEMANTICAL_ERROR : 3,
						QY_MODEL : "Model",
						QY_MODEL_TYPE : "ModelType",
						QY_MODELING : "Modeling",
						QY_MAP_TYPE : "MapType",
						QY_MODL : "MODL",
						QY_MODL_DETAILS : "ModlDetails",
						QY_MODEL_PERSISTENCE : "ModelPersistence",
						QY_MULT_PROVIDERS_ALVL : "MultProvidersAlvl",
						QY_MULT_PROVIDERS_DELTA : "MultProvidersDelta",
						QY_MULT_PROVIDER : "MultProvider",
						QY_MULTI_PROVIDER : "MultiProvider",
						QY_MPRO_NAME : "MproName",
						QY_MODIFIED_BY : "ModifiedBy",
						QY_MODIFIED_TIME : "ModifiedTime",
						QY_MULTIPLE_VALUES : "MultipleValues",
						QY_NAV_ATTRIBUTE : "NavAttribute",
						QY_NAVIGATIONS : "Navigations",
						QY_NBUSERS : "Nbusers",
						QY_NBDAPS : "Nbdaps",
						QY_NOT : "Not",
						QY_NON_EMPTY : "NonEmpty",
						QY_NAME : "Name",
						QY_NAME_IS : "NameIs",
						QY_NAME_EXTERNAL : "NameExternal",
						QY_NAMED_VALUES : "NamedValues",
						QY_NAMESPACE : "Namespace",
						VA_NAMESPACE_BW : "http://com.sap/bw",
						VA_NAMESPACE_BPC : "http://com.sap/bpc",
						QY_NUMBER : "Number",
						QY_NUMERIC_PRECISION : "NumericPrecision",
						QY_NUMERIC_ROUNDING : "NumericRounding",
						QY_NUMERIC_SCALE : "NumericScale",
						QY_NUMERIC_SHIFT : "NumericShift",
						QY_NEW_VALUE : "NewValue",
						QY_NEW_VALUE_AS_STRING : "NewValueAsString",
						QY_NEW_VALUE_EXTERNAL : "NewValueExternal",
						QY_NEW_VALUES : "NewValues",
						QY_NAME_OF_REMOTE_HIE : "NameOfRemoteHie",
						QY_NODE_CONDENSATION : "NodeCondensation",
						QY_NON_INTERCO_MEMBER : "NonIntercoMember",
						QY_LOWER_LEVEL_NODE_ALIGNMENT : "LowerLevelNodeAlignment",
						VA_ALIGNMENT_BELOW : "Below",
						VA_ALIGNMENT_ABOVE : "Above",
						VA_ALIGNMENT_DEFAULT : "Default",
						QY_NOTIFICATION_MESSAGE : "NotificationMessage",
						QY_NUM_OF_TEAMS : "NumOfTeams",
						QY_NUM_OF_USERS : "NumOfUsers",
						QY_OFFSET : "Offset",
						QY_OPERATOR : "Operator",
						QY_ORDER : "Order",
						QY_ORDER_ID : "OrderId",
						QY_OBJECT_NAME : "ObjectName",
						QY_ORDERED_DIMENSION_NAMES : "OrderedDimensionNames",
						QY_ORDERED_STRUCTURE_MEMBER_NAMES : "OrderedStructureMemberNames",
						QY_OPTIONS : "Options",
						VA_OPTIONS_STATEFUL_SERVER : "StatefulServer",
						VA_OPTIONS_SYNCHRONOUS_RUN : "SynchronousRun",
						QY_OPTION : "Option",
						QY_OPTION_VALUES : "OptionValues",
						QY_OPTION_LIST_VARIABLE : "OptionListVariable",
						QY_OPEN_CRITERIA : "OpenCriteria",
						QY_OUTPUT_LEN : "OutputLen",
						QY_OBJ_TECH_NAME : "ObjTechName",
						QY_OBJ_NAME : "ObjName",
						QY_OBJ_TYPE : "ObjType",
						VA_OBJVERS_MOST_RECENT : "$",
						VA_OBJVERS_ACTIVE : "A",
						QY_OWNER_PROP : "OwnerProp",
						QY_OWNER_ID : "OwnerId",
						QY_OWNER_TYPE : "OwnerType",
						QY_OWNER_DEADLINE_OFFSET_D : "OwnerDeadlineOffsetD",
						QY_OWNER_DEADLINE_ACTION_D : "OwnerDeadlineActionD",
						QY_OWNER_DEADLINE_OFFSET_R : "OwnerDeadlineOffsetR",
						QY_OWNER_DEADLINE_ACTION_R : "OwnerDeadlineActionR",
						QY_ORIGLANGU : "OrigLangu",
						QY_OWNER : "Owner",
						QY_OBTAINABILITY : "Obtainability",
						VA_OBTAINABILITY_ALWAYS : "Always",
						VA_OBTAINABILITY_USER_INTERFACE : "UserInterface",
						QY_OPTIONLIST_OPTIONS : "Options",
						QY_PATH : "Path",
						QY_PARAMETERS : "Parameters",
						QY_PARAMETER_CATEGORY : "ParameterCategory",
						QY_PARAMETER_NAME : "ParameterName",
						QY_PARAMETER_VALUE : "ParameterValue",
						QY_PARAMS_OF_REMOTE_HIE : "ParamsOfRemoteHie",
						QY_PAGE : "Page",
						QY_PARENT_INDEXES : "ParentIndexes",
						QY_PARENT_RES_ID : "ParentResId",
						QY_PACKAGE_NAME : "PackageName",
						QY_PRESENTATION_TYPE : "PresentationType",
						QY_PRESENTATION_SIGN_REVERSAL : "PresentationSignReversal",
						QY_PRESERVE_GROUPING : "PreserveGrouping",
						QY_PRESERVE_MEMBERS : "PreserveMembers",
						QY_PRE_QUERY_NAMES : "PreQueryNames",
						QY_PRE_QUERIES : "PreQueries",
						QY_PENDING : "Pending",
						QY_PERFORMANCE_DATA : "PerformanceData",
						QY_PERFORMER_PROPERTY : "PerformerProperty",
						QY_PERFORMER_PROPERTY_TEAM : "PerformerPropertyTeam",
						QY_PERFORMER_PROPERTY_TYPE : "PerformerPropertyType",
						QY_PAYLOAD : "PAYLOAD",
						QY_PAY_LOAD : "Payload",
						QY_PAYLOAD_PATH : "PayloadPath",
						QY_PUBLISH_TYPE : "PublishType",
						QY_PUBLISH_COMPONENT : "PublishComponent",
						QY_POST_AGGREGATION : "PostAggregation",
						QY_POST_AGGREGATION_DIMENSIONS : "PostAggregationDimensions",
						QY_POST_AGGREGATION_IGNORE_HIERARCHY : "PostAggregationIgnoreHierarchy",
						QY_PREFIX : "Prefix",
						QY_PEOPLE_ASSIGNMENTS : "PeopleAssignments",
						VA_PRESENTATION_TYPE_UNDEFINED : "Undefined",
						VA_PRESENTATION_TYPE_ID : "Id",
						VA_PRESENTATION_TYPE_KEY : "Key",
						VA_PRESENTATION_TYPE_KEY_NOT_COMPOUND : "KeyNotCompound",
						VA_PRESENTATION_TYPE_DISPLAY_KEY : "DisplayKey",
						VA_PRESENTATION_TYPE_DISPLAY_KEY_MIXED_COMPOUNDMENT : "DisplayKeyMixedCompoundment",
						VA_PRESENTATION_TYPE_DISPLAY_KEY_NOT_COMPOUND : "DisplayKeyNotCompound",
						VA_PRESENTATION_TYPE_HIERARCHY_KEY : "HierarchyKey",
						VA_PRESENTATION_TYPE_HIERARCHY_TEXT : "HierarchyText",
						VA_PRESENTATION_TYPE_HIERARCHY_DISPLAY_KEY : "HierarchyDisplayKey",
						VA_PRESENTATION_TYPE_TEXT : "Text",
						VA_PRESENTATION_TYPE_SHORT_TEXT : "ShortText",
						VA_PRESENTATION_TYPE_MEDIUM_TEXT : "MediumText",
						VA_PRESENTATION_TYPE_LONG_TEXT : "LongText",
						VA_PRESENTATION_TYPE_XL_LONG_TEXT : "XLLongText",
						VA_PRESENTATION_TYPE_WHY_FOUND : "WhyFound",
						VA_PRESENTATION_TYPE_RELATED_ACTIONS : "RelatedActions",
						VA_BOOK_TYPE_SINGLE : "S",
						VA_BOOK_TYPE_MULTIPLE : "M",
						VA_BOOK_PUBLISH_TYPE_PUBLIC : "PUBLIC",
						VA_BOOK_PUBLISH_TYPE_TEAM : "TEAM",
						VA_BOOK_PUBLISH_TYPE_PRIVATE : "PRIVATE",
						QY_PRIORITY : "Priority",
						QY_PROCESSING_DIRECTIVES : "ProcessingDirectives",
						QY_PROCESSING_STEP : "ProcessingStep",
						VA_PROCESSING_STEP_SUBMIT : "VariableSubmit",
						VA_PROCESSING_STEP_CANCEL : "VariableCancel",
						VA_PROCESSING_STEP_DEFINITION : "VariableDefinition",
						QY_PROVIDERS : "Providers",
						QY_PROVIDER_DETIALS : "ProviderDetails",
						QY_PROVIDER_ROLE : "ProviderRole",
						QY_PROVIDER_VALIDATION_RESULTS : "ProviderValidationResults",
						QY_POSITION : "Position",
						QY_PROCESSING_TYPE : "ProcessingType",
						QY_PROPERTY : "Property",
						QY_PROPERTY_NAME : "PropertyName",
						QY_PROPERTY_VALUE : "PropertyValue",
						QY_PROFILE_ID : "ProfileId",
						QY_PLANNING : "Planning",
						QY_PLANNING_EXTENSIONS : "PlanningExtensions",
						QY_PLANNING_MODE : "PlanningMode",
						QY_PLANNING_VERSION_RESTRICTION : "RestrictToPrivateVersions",
						QY_QUERY : "Query",
						QY_QUERY_MD : "QueryMd",
						QY_QUERIES : "Queries",
						QY_QUERY_CELL_NAMES : "QueryCellNames",
						QY_QUERY_NAME : "QueryName",
						QY_QUEUE_TYPE : "QueueType",
						QY_QUERY_DATA_CELL : "QueryDataCell",
						QY_QUERY_DATA_CELLS : "QueryDataCells",
						QY_QUERY_DATA_CELL_REFERENCES : "QueryDataCellReferences",
						QY_SIGN_REVERSAL : "SignReversal",
						QY_SRID : "SRID",
						QY_DISAGGREGATION_MODE : "DisaggregationMode",
						QY_DISAGGREGATION_REF_CELL_NAME : "DisaggregationReferenceCellName",
						QY_EMPHASIZED : "Emphasized",
						QY_CUMULATION : "Cumulation",
						QY_SCALING_FACTOR : "ScalingFactor",
						QY_SUPPRESS_KEYS : "SuppressKeys",
						QY_SHARE : "Share",
						QY_SEQUENCE_ID : "SequenceId",
						QY_READ_MODE : "ReadMode",
						VA_RM_UNDEFINED : "Undefined",
						VA_RM_DEFAULT : "Default",
						VA_RM_MASTER : "Master",
						VA_RM_NONE : "None",
						VA_RM_MASTER_AND_SPACE : "MasterAndSpace",
						VA_RM_MASTER_AND_SPACE_AND_STATE : "MasterAndSpaceAndState",
						VA_RM_REL_MASTER : "RelatedMaster",
						VA_RM_REL_MASTER_AND_SPACE : "RelatedMasterAndSpace",
						VA_RM_REL_MASTER_AND_SPACE_AND_STATE : "RelatedMasterAndSpaceAndState",
						VA_RM_BOOKED : "Booked",
						VA_RM_BOOKED_AND_SPACE : "BookedAndSpace",
						VA_RM_BOOKED_AND_SPACE_AND_STATE : "BookedAndSpaceAndState",
						VA_RM_REL_BOOKED : "RelatedBooked",
						VA_RM_REL_BOOKED_AND_SPACE : "RelatedBookedAndSpace",
						VA_RM_REL_BOOKED_AND_SPACE_AND_STATE : "RelatedBookedAndSpaceAndState",
						VA_RECORDS_PER_PAGE : "RecordsPerPage",
						QY_REQUIRE_REVIEW : "RequireReview",
						QY_REFRESH : "Refresh",
						QY_REFRESH_VERSION_STATES : "RefreshVersionStates",
						QY_REFERENCE : "Reference",
						QY_REFERENCE_ID : "ReferenceId",
						QY_REFERENCES : "References",
						QY_REFERENCE_DIM : "ReferenceDim",
						QY_REF_INFO_OBJECT : "RefInfoObject",
						QY_REQUIRED_ATTRIBUTES : "RequiredAttributes",
						QY_REQUIRED_DIMENSIONS : "RequiredDimensions",
						QY_RESOURCE_ID : "ResourceId",
						QY_RESOURCE_TYPE : "ResourceType",
						QY_RESOURCE : "Resource",
						QY_RESOURCES : "Resources",
						QY_RETURN_ORIGIN_KEYS : "ReturnOriginKeys",
						QY_RETURNED_DATA_SELECTION : "ReturnedDataSelection",
						QY_RETURN_EMPTY_JSON_RESULTSET : "ReturnEmptyJsonResultSet",
						QY_REPORT_ID : "ReportId",
						QY_REPORTS : "Reports",
						QY_REPORT_NAME : "ReportName",
						QY_REGIONS : "Regions",
						QY_REPORTING_DIMENSION : "ReportingDimension",
						QY_REVIEWER_PROPERTY : "ReviewerProperty",
						QY_REVIEWER_PROPERTY_TEAM : "ReviewerPropertyTeam",
						QY_REVIEWER_PROPERTY_TYPE : "ReviewerPropertyType",
						QY_REVIEWER_DEADLINE_OFFSET_D : "ReviewerDeadlineOffsetD",
						QY_REVIEWER_DEADLINE_ACTION_D : "ReviewerDeadlineActionD",
						QY_REVIEWER_DEADLINE_OFFSET_R : "ReviewerDeadlineOffsetR",
						QY_REVIEWER_DEADLINE_ACTION_R : "ReviewerDeadlineActionR",
						QY_RS_READ_MODE : "ResultSetReadMode",
						QY_RS_DEFAULT_READ_MODE : "ResultSetDefaultReadMode",
						QY_RWD : "RWD",
						QY_RELATIONSHIP : "MBR_REL",
						QY_RUN_AS_USER : "RunAsUser",
						QY_RUNTIME : "Runtime",
						QY_RUNNING_MODE : "RunningMode",
						QY_REQUEST_MAX_TUPLE_COUNT : "RequestMaxTupleCount",
						QY_REORDERING : "Reordering",
						QY_RRI_LOGICAL_DESTINATION : "LogicalDestination",
						QY_RRI_PROPERTIES : "Properties",
						QY_RRI_P_QUERY : "QUERY",
						QY_RRI_P_PARAMETER_NAME : "RRI_PARAMETER_NAME",
						QY_RRI_P_PARAMETER_VALUE : "RRI_PARAMETER_VALUE",
						QY_RRI_RECEIVER_APPLICATION_TYPE : "ReceiverApplicationType",
						QY_RRI_T_RECEIVER_APPLICATION_QURY : "QURY",
						QY_REPORT_REPORT_TARGETS : "RRITargets",
						QY_REPORT_REPORT_CONTEXT : "RRIContext",
						QY_ROW : "Row",
						QY_ROW_FROM : "RowFrom",
						QY_ROW_TO : "RowTo",
						QY_RESULT_SET_MEMBER_DEFAULT_READ_MODE : "ResultSetMemberDefaultReadMode",
						QY_RESULT_SET_MEMBER_READ_MODE : "ResultSetMemberReadMode",
						QY_RESULT_SET_READ_MODE : "ResultSetReadMode",
						QY_RESULT_SET_STATE : "ResultSetState",
						VA_RESULT_SET_STATE_DATA_AVAILABLE : 0,
						VA_RESULT_SET_STATE_NO_DATA_AVAILABLE_A : 1,
						VA_RESULT_SET_STATE_NO_DATA_AVAILABLE_B : 2,
						VA_RESULT_SET_STATE_LIMIT_EXCEEDED : 4,
						VA_RESULT_SET_STATE_SUCCESSFUL_PERSISTED : 5,
						VA_RESULT_SET_STATE_EMPTY_JSON : 6,
						QY_RESULT_SET_FEATURE_CAPABILITIES : "ResultSetFeatureCapabilities",
						QY_RSTT_C : "RSTT",
						VA_RSTT_EXCLUDE_L : "exclude",
						QY_RS_ALIGNMENT : "ResultAlignment",
						VA_RS_ALIGNMENT_TOP : "Top",
						VA_RS_ALIGNMENT_BOTTOM : "Bottom",
						VA_RS_ALIGNMENT_TOP_BOTTOM : "TopBottom",
						VA_RS_ALIGNMENT_NONE : "None",
						VA_RS_ALIGNMENT_STRUCTURE : "Structure",
						VA_RS_ALIGNMENT_ON_DEFAULT : "Default",
						QY_RS_FIXED_ATTRIBUTES : "ResultSetFixedAttributes",
						QY_RS_FEATURE_REQUEST : "ResultSetFeatureRequest",
						QY_RS_RESULT_SET_PERSISTANCE_SCHEMA : "ResultSetPersistanceSchema",
						QY_RS_RESULT_SET_PERSISTANCE_TABLE : "ResultSetPersistanceTable",
						QY_RS_RESULT_SET_PERSISTANCE_IDENTIFIER : "ResultSetPersistanceIdentifier",
						QY_REPOSITORY_TYPE : "RepositoryType",
						QY_RESULT_FORMAT : "ResultFormat",
						VA_RS_FORMAT_V2 : "Version2",
						VA_RS_FORMAT_SERIALIZED_DATA : "SerializedData",
						QY_RESULT_ENCODING : "ResultEncoding",
						VA_RS_ENCODING_NONE : "None",
						VA_RS_ENCODING_AUTO : "Auto",
						VA_RS_ENCODING_DELTA_RUN_LENGTH : "DeltaRunLength",
						QY_RESULT_KEEP_ORIGINAL_TEXTS : "ResultKeepOriginalTexts",
						VA_IS_VARIABLE : "Variable",
						VA_IS_MANUAL_INPUT : "ManualInput",
						QY_RESULT_STRUCTURE : "ResultStructure",
						QY_RESULT_STRUCTURE_BAG : "ResultStructureBag",
						QY_RESULT_STRUCTURE_REPO : "ResultStructureRepo",
						QY_RESULT : "Result",
						VA_RESULT_TOTAL : "Total",
						VA_RESULT_MEMBERS : "Members",
						VA_RESULT_TOTAL_INCLUDED_MEMBERS : "TotalIncludedMembers",
						VA_RESULT_TOTAL_REMAINING_MEMBERS : "TotalRemainingMembers",
						QY_RESULT_SET_FIELDS : "ResultSetFields",
						QY_RESULT_SET_ATTRIBUTE_NODES : "ResultSetAttributeNodes",
						QY_RESULT_STRUCTURE_FEATURE : "ResultStructureFeature",
						QY_RESULT_ALIGNMENT_LIST : "ResultAlignmentList",
						QY_RESULT_ALIGNMENT : "ResultAlignment",
						QY_REJECT : "Reject",
						VA_REORDERING_FULL : "Full",
						VA_REORDERING_RESTRICTED : "Restricted",
						VA_REORDERING_NONE : "None",
						VA_RUNTIME_MODE : "R",
						QY_ROOT_TUPLE : "RootTuple",
						VA_REPO_ERROR : -100,
						VA_REPO_ERROR_RESP : 0,
						VA_REPO_OBJECT_RESP : 1,
						VA_REPO_LIST_RESP : 2,
						QY_RESULTCALCULATION : "ResultCalculation",
						VA_RS_VISIBILITY_VISIBLE : "Visible",
						VA_RS_VISIBILITY_HIDDEN : "Hidden",
						VA_RS_VISIBILITY_CONDITIONAL : "Conditional",
						QY_SAVE_ONLY : "SaveOnly",
						QY_SCREEN_ORDER : "ScreenOrder",
						QY_SESSION_ID : "SessionId",
						QY_SECTION : "Section",
						QY_SECTIONS : "Sections",
						QY_SECTION_NAME : "SectionName",
						QY_SECTION_ID : "SectionId",
						QY_SET_OPERAND : "SetOperand",
						QY_SETTING_NAME : "SettingName",
						QY_SETTINGS : "Settings",
						QY_SYSTEM : "System",
						QY_SYSTEM_DIMS : "SystemDims",
						QY_SECURITY : "Security",
						QY_SECURED_SETTING : "SecuredSetting",
						QY_SELECTION_OBJECT : "SelectionObject",
						QY_SINGLE_VALUE_CALCULATION : "SingleValueCalculation",
						QY_VALUE_HELP_FILTER : "ValueHelpFilter",
						QY_SYSR : "SYSR",
						QY_SORT_TYPES_BREAKING_GROUP : "SortTypesBreakGrouping",
						QY_SORT : "Sort",
						QY_SORT_REPO : "SortRepo",
						QY_SORT_ORDER : "SortOrder",
						QY_SOLVE_ORDER : "SolveOrder",
						VA_SORTING_DEFAULT : 0,
						VA_SORTING_ASCENDING : 1,
						VA_SORTING_DESCENDING : 2,
						VA_SORTING_NONE : 3,
						QY_SORT_TYPE : "SortType",
						VA_SORT_TYPE_MEMBER : "Member",
						VA_SORT_TYPE_MEMBER_KEY : "MemberKey",
						VA_SORT_TYPE_MEMBER_TEXT : "MemberText",
						VA_SORT_TYPE_FIELD : "Field",
						VA_SORT_TYPE_MEASURE : "Measure",
						VA_SORT_TYPE_COMPLEX : "Complex",
						VA_SORT_TYPE_FILTER : "Filter",
						VA_SORT_TYPE_SELECTION : "Selection",
						VA_SORT_TYPE_DATA_CELL : "Datacell",
						VA_SORT_TYPE_HIERARCHY : "Hierarchy",
						QY_SORT_TUPLE : "SortTuple",
						QY_SCOPE : "Scope",
						QY_SCHEMA_NAME : "SchemaName",
						QY_SCHEDULE_DATE : "ScheduleDate",
						QY_SELECTOR_READ_MODE : "SelectorReadMode",
						QY_SELECTOR_DEFAULT_READ_MODE : "SelectorDefaultReadMode",
						QY_SEARCH_OPERAND : "SearchOperand",
						QY_SELECTION : "Selection",
						QY_SELECTION_REPO : "SelectionRepo",
						QY_SELECTION_MEASURE : "SelectionMeasure",
						QY_SHOW_WS : "ShowWS",
						QY_SIGN : "Sign",
						QY_SIGNATURE : "Signature",
						QY_SIMPLE_NUMERIC_VALUES : "SimpleNumericValues",
						QY_SIMPLE_STRING_VALUES : "SimpleStringValues",
						QY_SKIP : "Skip",
						QY_SLASH_SLASH : "//",
						QY_SPACE : " ",
						QY_START_TYPE : "StartType",
						QY_STATE : "State",
						QY_STATISTICS : "Statistics",
						QY_STATUS : "Status",
						QY_STATUS_FILTER : "StatusFilter",
						QY_STRUCTURE : "Structure",
						QY_STRUCTURE_NAME : "StructureName",
						QY_SUB_ACTION : "SubAction",
						QY_SUB_AUTH_OBJ : "SubAuthObj",
						QY_SUB_OBJECT : "SUB_OBJECT",
						QY_SUB_OBJECT_AUDIT : "AUDIT",
						QY_SUB_OBJECT_FEED : "FEED",
						QY_SUB_OBJECT_COMMENT : "COMMENT",
						QY_SUB_OBJECT_SEC : "SEC",
						QY_SUB_OBJECT_WS_RPT : "WS_RPT",
						QY_SUB_OBJECT_SYS_RPT : "SYS_RPT",
						QY_SUB_OBJECT_IPRV_DETAIL : "IPRV_DETAIL",
						QY_SUB_OBJECT_IPRV_USAGE : "IPRV_USAGE",
						QY_SUB_FOLDER : "SubFolder",
						QY_SUB_GROUP_ID : "SubGroupId",
						QY_SUPERIOR_DIMENSION : "SuperiorDimension",
						QY_CODE_TUPLE : "Tuple",
						QY_TUPLES_TUPLES : "Tuples",
						QY_TUPLES_FIELDNAMES : "FieldNames",
						QY_TUPLES_OPERAND : "TuplesOperand",
						QY_SUCCESS : "Success",
						QY_SUB_SELECTIONS : "SubSelections",
						QY_SUPPORTS_RESULTSET_FACETS : "SupportsResultsetFacets",
						QY_SUBSET_DESCRIPTION : "SubSetDescription",
						QY_SUPPORTED_RESULT_SET_READ_MODES : "SupportedResultSetReadModes",
						QY_SUPPORTED_SELECTOR_READ_MODES : "SupportedSelectorReadModes",
						QY_SUPPORTED_VARIABLE_READ_MODES : "SupportedVariableReadModes",
						QY_SUPPORTS_HIERARCHY_NAV_COUNTER : "SupportsHierNavCounter",
						QY_SUPPORTS_EXTENDED_SORT : "SupportsExtendedSort",
						QY_SUPPORTS_SELECTION : "SupportsSelection",
						QY_SUPPORTS_VALUE_HELP : "SupportsValueHelp",
						QY_SUPPORTS_LCHA_GEN : "SupportsLChaGen",
						QY_SUPPORTS_DATA_CELLS : "SupportsDataCells",
						QY_SUPPORTS_DATA_ENTRY_READ_ONLY : "SupportsDataEntryReadOnly",
						QY_SUPPORTS_CONDITIONS : "SupportsConditions",
						QY_SUPPORTS_EXCEPTION_AGGREGATION_DIMS_FORMULAS : "ExceptionAggregationDimsAndFormulas",
						QY_SIZE : "Size",
						QY_SCALE : "Scale",
						QY_SEPARATOR : "Separator",
						VA_SEPARATOR_SEMICOLON : ";",
						QY_SOURCE_TEMPLATE_ID : "SourceTemplateId",
						QY_SQL_TYPE : "SQLType",
						QY_SUB_ACTION_COPY : "COPY",
						QY_SUB_ACTION_EDIT : "EDIT",
						QY_SUB_ACTION_ACTIVATE : "ACTIVATE",
						QY_SUB_ACTION_NEW_VERSION : "NEW_VERSION",
						QY_SUB_ACTION_DELETE_VERSION : "DELETE_VERSION",
						QY_SUB_ACTION_UNLOCK : "UNLOCK",
						QY_SUB_ACTION_UPDATE_VERSION : "UPDATE_VERSION",
						QY_SUB_ACTION_VALIDATE : "VALIDATE",
						QY_SUB_USER_DETAIL : "USERDETAIL",
						QY_SUPPORTED_RESULT_SET_MEMBER_READ_MODES : "SupportedResultSetMemberReadModes",
						QY_START_DATE : "StartDate",
						QY_START_TIME : "StartTime",
						QY_STEP_ID : "StepId",
						QY_TODOLIST_COUNT : "CountOfTodoList",
						QY_MONITORLIST_COUNT : "CountOfMonitorList",
						QY_STEP_TYPE : "StepType",
						QY_STEP_NUMBER : "StepNumber",
						QY_STEPS : "Steps",
						QY_SEMANTIC_TYPE : "SemanticType",
						VA_SEMANTIC_TYPE_HIER_NODE_VAR : "HierarchyNodeVariable",
						VA_SEMANTIC_TYPE_HIER_NAME_VAR : "HierarchyNameVariable",
						VA_SEMANTIC_TYPE_HIERARCHY_VARIABLE : "HierarchyVariable",
						VA_SEMANTIC_TYPE_OPTION_LIST_VARIABLE : "OptionListVariable",
						VA_SEMANTIC_TYPE_FORMULA_VARIABLE : "FormulaVariable",
						VA_SEMANTIC_TYPE_TEXT_VARIABLE : "TextVariable",
						VA_SEMANTIC_TYPE_VALUE_VARIABLE : "ValueVariable",
						VA_SEMANTIC_TYPE_DIM_MEMBER_VAR : "DimensionMemberVariable",
						QY_SHARED_INFOOBJECTS : "SharedInfoobjects",
						QY_SIMPLE_PROVIDERS_ALVL : "SimpleProvidersAlvl",
						QY_SIMPLE_PROVIDERS_DELTA : "SimpleProvidersDelta",
						QY_SIMPLEPROVS_UNDER_MULTPROVALVL : "SimpleProvsUnderMultProvAlvl",
						QY_SIMPLEPROVS_UNDER_MULTPROVDELTA : "SimpleProvsUnderMultProvDelta",
						QY_SECURED_IOBJ : "SecuredIOBJ",
						QY_SUPPORTS_CUMMULATIVE : "SupportsCummulative",
						QY_SUPPLEMENTS_FIELD_NAMES : "SupplementsFieldNames",
						QY_SOURCES : "Sources",
						QY_TASK : "Task",
						QY_TASKS : "Tasks",
						QY_TARGET_ID : "TargetId",
						QY_TARGET_VERSION_ID : "TargetVersionId",
						QY_TARGET_TYPE : "TargetType",
						QY_TECH_NAME : "TechName",
						QY_TEXT_TRANSFORMATION : "TextTransformation",
						VA_TEXT_TRANSFORMATION_STRING_TRANSFORMATION : "StringTransformation",
						VA_TEXT_TRANSFORMATION_UPPERCASE : "Uppercase",
						VA_TEXT_TRANSFORMATION_LOWERCASE : "Lowercase",
						VA_TEXT_TRANSFORMATION_CAPITALIZE : "Capitalize",
						VA_TEXT_TRANSFORMATION_SPATIAL_AS_BINARY : "SpatialAsBinary",
						VA_TEXT_TRANSFORMATION_SPATIAL_AS_EWKB : "SpatialAsEWKB",
						VA_TEXT_TRANSFORMATION_SPATIAL_AS_EWKT : "SpatialAsEWKT",
						VA_TEXT_TRANSFORMATION_SPATIAL_AS_GEOJSON : "SpatialAsGeoJSON",
						VA_TEXT_TRANSFORMATION_SPATIAL_AS_TEXT : "SpatialAsText",
						VA_TEXT_TRANSFORMATION_SPATIAL_AS_WKB : "SpatialAsWKB",
						VA_TEXT_TRANSFORMATION_SPATIAL_AS_WKT : "SpatialAsWKT",
						VA_TEXT_TRANSFORMATION_SPATIAL_AS_SVG : "SpatialAsSVG",
						QY_TRACE_LEVEL : "TraceLevel",
						QY_THRESHOLD : "Threshold",
						QY_TIME : "Time",
						QY_TIMESTAMP : "Timestamp",
						QY_TEAM_U : "TEAM",
						QY_TEAM_LEAD : "Teamlead",
						QY_TEAM_ID : "TeamId",
						QY_TEAMS : "Teams",
						QY_TEAM_PROP : "TeamProp",
						QY_TYPE : "Type",
						VA_TYPE_CLOSE : "Close",
						VA_TYPE_DATA_AREA_CMD : "DataAreaCommand",
						VA_TYPE_PLANNING_FUNCTION : "PlanningFunction",
						VA_TYPE_PLANNING_SEQUENCE : "PlanningSequence",
						VA_TYPE_STRING : "String",
						QY_TYPES : "Types",
						QY_TEMPLATE_ID : "TemplateId",
						QY_TEMPLATE_VERSION : "TemplateVersion",
						QY_TEMPLATE_DESCRIPTION : "TemplateDescription",
						QY_TLOGO : "TLOGO",
						QY_TLOGO_TXT : "TLOGOText",
						QY_TLOGO_OBJ_NAME : "TLOGOObjName",
						QY_TLOGO_TYPE : "TLOGOType",
						QY_TLOGO_SUB_TYPE : "TLOGOSubType",
						QY_TLOGO_NAME : "TlogoName",
						QY_TUPLES : "Tuples",
						QY_TUPLE_COUNT : "TupleCount",
						QY_TUPLE_COUNT_TOTAL : "TupleCountTotal",
						QY_TOP : "Top",
						QY_TEXT : "Text",
						QY_TEXT_ATTRIBUTE : "TextAttribute",
						QY_TOTAL : "Total",
						QY_TOTAL_INCLUDING : "Total Including",
						QY_TOTAL_REMAINING : "Total Remaining",
						QY_TOTAL_PAGES : "TotalPages",
						VA_TOTAL_INCLUDED_MEMBERS : "TotalIncludedMembers",
						VA_TOTAL_REMAINING_MEMBERS : "TotalRemainingMembers",
						QY_TUPLE_ELEMENT_IDS : "TupleElementIds",
						QY_UNASSIGNED : "Unassigned",
						QY_UNIT : "Unit",
						QY_UNITS : "Units",
						QY_UPPER_BOUND : "UpperBound",
						QY_UNIT_TYPES : "UnitTypes",
						VA_UNIT_TYPES_IS_MIXED : -1,
						VA_UNIT_TYPES_IS_CURRENCY : 1,
						VA_UNIT_TYPES_IS_UNIT : 2,
						VA_UNIT_TYPES_IS_CURRENCY_UNIT : 3,
						QY_UNIT_POSITIONS : "UnitPositions",
						VA_UNIT_POSITIONS_BEFORE_UNIT : 2,
						QY_USAGE_TYPE : "UsageType",
						QY_UNIT_UNINM : "Uninm",
						QY_UNIT_UNITP : "Unitp",
						QY_UNIT_DESCRIPTIONS : "UnitDescriptions",
						QY_UNIT_REFERENCE : "UnitReference",
						QY_UNIT_CURRENCY : "UnitCurrency",
						VA_UNIT_CURRENCY_U : "U",
						VA_UNIT_CURRENCY_C : "C",
						QY_UNIQUE_NAME : "UniqueName",
						QY_USE_CONV_EXIT : "UseConvExit",
						QY_USERS : "Users",
						QY_USER_U : "USER",
						QY_USER_DESCRIPTION : "UserDescription",
						QY_USER_ID : "UserId",
						QY_USER_FIRST_NAME : "UserFirstName",
						QY_USER_LAST_NAME : "UserLastName",
						QY_USER_TEAM_ID : "UserTeamId",
						QY_USER_TEAM_DESCRIPTION : "UserTeamDescription",
						QY_USE_DEFAULT_ATTRIBUTE_KEY : "UseDefaultAttributeKey",
						QY_UPDATE_COUNTER : "UpdateCounter",
						QY_USE_EXTERNAL_VIEW : "UseExternalView",
						QY_VALIDATEION : "Validation",
						QY_VALIDATION_STATUS : "ValidationStatus",
						QY_VALIDATION_MESSAGES : "ValidationMessages",
						QY_VALUE : "Value",
						QY_VALUE_IS : "ValueIs",
						QY_VALUES : "Values",
						QY_VALUE1 : "Value1",
						QY_VALUE2 : "Value2",
						QY_VALUE3 : "Value3",
						QY_VALUE3_IS : "Value3Is",
						QY_VALUE_EXCEPTION : "ValuesException",
						QY_VALUES_FORMATTED : "ValuesFormatted",
						QY_VALUEHELP_FOR_VARIABLE : "ValuehelpForVariable",
						QY_VALUES_ROUNDED : "ValuesRounded",
						QY_VALUE_TYPE : "ValueType",
						VA_VALUE_TYPE_NUMBER : "Number",
						VA_VALUE_TYPE_STRING : "String",
						VA_VALUE_TYPE_BOOL : "Bool",
						VA_VALUE_TYPE_DATE : "Date",
						VA_VALUE_TYPE_DATE_TIME : "DateTime",
						VA_VALUE_TYPE_VARIABLE : "Variable",
						QY_VARY_KEYS : "VaryKeys",
						QY_VERSION : "Version",
						QY_VERSIONS : "Versions",
						QY_VIEW_ATTRIBUTES : "ViewAttributes",
						QY_VISIBILITY_FILTER : "VisibilityFilter",
						QY_VARIABLE_READ_MODE : "VariableReadMode",
						QY_VARIABLE_VARIANT : "VariableVariant",
						QY_VARIABLE_VARIANTS : "VariableVariants",
						QY_VARIABLES : "Variables",
						QY_VARIABLES_MD : "VariablesMd",
						QY_VARIABLE_TYPE : "VariableType",
						VA_VAR_TYPE_DIM_MEMBER_VARIABLE : "DimensionMemberVariable",
						VA_VAR_TYPE_OPTION_LIST_VARIABLE : "OptionListVariable",
						VA_VAR_TYPE_SIMPLE_TYPE_VARIABLE : "SimpleTypeVariable",
						QY_VISIBILITY_SETTINGS : "VisibilitySettings",
						QY_VISIBILITY : "Visibility",
						VA_VISIBILITY_VISIBLE : "Visible",
						VA_VISIBILITY_ON_DEFAULT : "Default",
						QY_VISIBILITY_TYPE : "VisibilityType",
						VA_VISIBILITY_TYPE_CENTRAL : "C",
						VA_VISIBILITY_TYPE_CENTRAL_NOT_VISIBLE : "C/I",
						VA_VISIBILITY_TYPE_CENTRAL_DISPLAY_ONLY : "C/D",
						VA_VISIBILITY_TYPE_CENTRAL_CHANGE_TO_EXISTING : "C/C",
						VA_VISIBILITY_TYPE_CENTRAL_ADD_NEW : "C/A",
						VA_VISIBILITY_TYPE_LOCAL : "L",
						VA_VISIBILITY_TYPE_LOCAL_NOT_VISIBLE : "L/I",
						VA_VISIBILITY_TYPE_LOCAL_DISPLAY_ONLY : "L/D",
						VA_VISIBILITY_TYPE_LOCAL_CHANGE_TO_EXISTING : "L/C",
						VA_VISIBILITY_TYPE_LOCAL_ADD_NEW : "L/A",
						QY_WHAT : "What",
						QY_WHAT_ENVM : "ENVM",
						QY_WHAT_ACTY : "ACTY",
						QY_WHAT_BDAP : "BDAP",
						QY_WHAT_TEAM : "TEAM",
						QY_WHAT_USER : "USER",
						QY_WHAT_TMPL : "TMPL",
						QY_WHAT_INST : "INST",
						QY_WHAT_IOBJ : "IOBJ",
						QY_WHAT_MODL : "MODL",
						QY_WHAT_CUBE : "CUBE",
						QY_WHAT_PARA : "PARA",
						QY_WHAT_PS : "PS",
						QY_WHAT_FEED : "FEED",
						QY_WHAT_BOOK : "BOOK",
						QY_WHAT_SWLANGU : "SWITCH_LANGU",
						QY_WITH_ATTACHMENT : "WithAttachment",
						QY_WITH_DEADLINE : "WithDeadline",
						QY_WORKSPACE : "Workspace",
						QY_WORKSTATUS : "WorkStatus",
						QY_WORKSTATUS_TATTRIBUTE_CANCEL : "$$CANCEL$$",
						QY_WORKSTATUS_TATTRIBUTE_STATUS : "$$STATUS$$",
						QY_WORKSTATUS_TATTRIBUTE_AVAILABLE_STATUS : "$$AVAILABLE_STATUS$$",
						QY_WORKSTATUS_TATTRIBUTE_INCLUDE_CHILDREN : "$$INCLUDE_CHILDREN$$",
						QY_WORKSTATUS_TATTRIBUTE_EXPAND_TO_BASE : "$$EXPAND_TO_BASE$$",
						QY_WORKSTATUS_TATTRIBUTE_INCLUDE_AVAILABLE_STATUS : "$$INCLUDE_AVAILABLE_STATUS$$",
						QY_WKSP : "WKSP",
						QY_WORKSTATUS_ID : "WS",
						QY_WORKSTATUS_ID_RT : "WS_RUNTIME_DEF",
						QY_WS_EMAIL : "WS_EMAIL",
						QY_ZERO_SUPPRESSION_TYPE : "ZeroSuppressionType",
						VA_ZERO_SUPPRESSION_TYPE_NONE : 0,
						VA_ZERO_SUPPRESSION_TYPE_TOTAL_IS_ZERO : 1,
						VA_ZERO_SUPPRESSION_TYPE_ALL_CELLS_ARE_ZERO : 2,
						LC_ACTION : "action",
						LC_ACTIVE : "active",
						LC_ACTIONS : "actions",
						LC_ACTION_ID : "action_id",
						LC_ACTION_STATE : "action_state",
						LC_ACTION_ACTIVE : "action_active",
						LC_ACTION_END_TIME : "action_end_time",
						LC_ACTION_START_TIME : "action_start_time",
						LC_AVAILABLE_REDO : "available_redo",
						LC_AVAILABLE_UNDO : "available_undo",
						LC_BACKUP : "backup",
						LC_BACKUP_TIME : "backup_time",
						LC_CHANGES : "changes",
						LC_CLOSE : "close",
						LC_COMMAND : "command",
						LC_COMMANDS : "commands",
						LC_COUNT : "count",
						LC_CREATE_TIME : "create_time",
						VC_COMMAND_GET_MODELS : "get_models",
						VC_COMMAND_CLEANUP : "cleanup",
						VC_COMMAND_GET_ACTION_PARAMETERS : "get_action_parameters",
						VC_COMMAND_SHOW_VERSION_PRIVILEGES : "show_version_privileges",
						LC_DEFAULT : "default",
						LC_DEFAULT_OPTIONS : "defaultOptions",
						LC_DESCRIPTION : "description",
						LC_END_TIME : "end_time",
						LC_EPM_POPULATE_FROM_VERSION : "epmPopulate.fromVersion",
						LC_EXCEPTION_TEXT : "exception_text",
						LC_GET_QUERY_SOURCES : "get_query_sources",
						LC_GET_ACTIONS : "get_actions",
						LC_DELETE_ALL_VERSIONS : "delete_all_versions",
						LC_GET_PARAMETERS : "get_parameters",
						LC_GET_ACTION_PARAMETERS : "get_action_parameters",
						LC_GET_VERSIONS : "get_versions",
						LC_GET_VERSION_STATE : "get_version_state",
						LC_GRANTEE : "grantee",
						LC_HAS_VALUE : "hasValue",
						LC_ID : "id",
						LC_INIT : "init",
						LC_MESSAGE : "message",
						LC_MODE : "mode",
						LC_MODELS : "models",
						LC_MODEL : "model",
						LC_NAME : "name",
						LC_NUM_UNDO_REDO_STEPS : "num_undo_redo_steps",
						LC_OPTIONS : "options",
						LC_OPTION_OCCURENCE : "optionOccurrence",
						VC_OPTION_OCCURENCE_EXACTLY_ONE : "exactly-one",
						LC_OWNER : "owner",
						LC_PARAMETERS : "parameters",
						LC_PERSISTENT_PDCS : "persistent_pdcs",
						LC_POPULATE_SINGLE_VERSION : "populate_single_version",
						LC_PRIVILEGE : "privilege",
						LC_PUBLIC : "public",
						LC_PUBLISH : "publish",
						LC_QUERY_SOURCE_SCHEMA : "query_source_schema",
						LC_QUERY_SOURCE : "query_source",
						LC_QUERY_SOURCES : "query_sources",
						LC_RESTORE_BACKUP : "restore_backup",
						LC_RETURN_CODE : "return_code",
						LC_SCHEMA : "schema",
						LC_SAVE : "save",
						LC_SHOW_AS_PUBLIC_VERSION : "showAsPublicVersion",
						LC_START : "start",
						LC_START_TIME : "start_time",
						LC_STATE : "state",
						LC_STATES : "states",
						LC_SEQUENCE_ID : "sequence_id",
						LC_SEQUENCE_ACTIVE : "sequence_active",
						LC_SEQUENCE_CREATE_TIME : "sequence_create_time",
						LC_SOURCE_VERSION : "source version",
						LC_TIMEOUT_VALUE : "timeout_value",
						LC_TYPE : "type",
						LC_UNDO_CHANGES : "undo_changes",
						LC_USER_NAME : "user_name",
						LC_VALUE : "value",
						LC_VALUE_ALLOWED : "valueAllowed",
						LC_VERSION_ID : "version_id",
						LC_VERSION_STATE : "version_state",
						LC_VERSION_STATE_DESCRIPTIONS : "version_state_descriptions",
						LC_VERSIONS : "versions",
						LC_VERSION_PRIVILEGES : "version_privileges",
						QY_REFERENCE_INFO_OBJECTS : "ReferenceInfoObjects",
						QY_REFERENCE_INFO_OBJECT : "ReferenceInfoObject",
						QY_REFERENCE_INFO_OBJECT_DESCRIPTION : "ReferenceInfoObjectDescription",
						QY_REFERENCE_INFO_OBJECT_TYPE : "ReferenceInfoObjectType",
						QY_INFO_PROVIDER_DESCRIPTION : "InfoProviderDescription",
						QY_PART_PROVIDER : "PartProvider",
						QY_PART_PROVIDER_DESCRIPTION : "PartProviderDescription",
						QY_PART_PROVIDERS : "PartProviders",
						QY_PART_INFO_OBJECT : "PartInfoObject",
						QY_PART_INFO_OBJECT_DESCRIPTION : "PartInfoObjectDescription",
						QY_PARENT_PROVIDER : "ParentProvider",
						QY_COMPOSITE_PROVIDERS : "CompositeProviders",
						QY_IS_NAVIGATION_ATTRIBUTE : "IsNavigationAttribute",
						QY_NAVIGATION_ATTRIBUTES : "NavigationAttributes",
						QY_ACTION_IMPORT : "IMPORT",
						QY_ACTION_ACTIVATE : "ACTIVATE",
						QY_TO_BE_LOCAL : "ToBeLocal",
						QY_LOCAL_TECH_NAME : "LocalTechName",
						QY_LOCAL_NAME : "LocalName",
						QY_LOCAL_DESCRIPTION : "LocalDescription",
						QY_USED_IN_DYNAMIC_FILTER : "UsedInDynamicFilter",
						QY_USED_IN_FIXED_FILTER : "UsedInFixedFilter",
						QY_COMMAND_TYPE : "CommandType",
						QY_FILTER_NAME : "FilterName",
						QY_SELECTIONS : "Selections",
						QY_PARAMETER : "Parameter",
						QY_LOW_VALUE : "LowValue",
						QY_LOW_VALUE_TYPE : "LowValueType",
						QY_HIGH_VALUE : "HighValue",
						QY_HIGH_VALUE_TYPE : "HighValueType",
						QY_FACTOR : "Factor",
						QY_SAME_FACTOR : "SameFactor",
						QY_KEY_FIGURES : "KeyFigures",
						QY_FROM_TO : "FromTo",
						QY_TO_DATE : "ToDate",
						QY_FROM_TO_TYPE : "FromToType",
						QY_CONVERSION_TYPE : "ConversionType",
						QY_FROM : "From",
						QY_TO : "To",
						QY_WHAT_PLSQ : "PLSQ",
						QY_PLANNING_FUNCTION_NAME : "PlanningFunctionName",
						QY_ALTERNATIVE_FIELD_VALUES : "AlternativeFieldValues",
						QY_MEMBER_KEY : "MemberKey",
						QY_HIERARCHY_KEY : "HierarchyKey",
						QY_NAVIGATIONAL_ATTRIBUTE_DESCRIPTION : "NavigationalAttributeDescription",
						QY_ENVIRONMENT_DESCRIPTION : "EnvDescription",
						QY_MODEL_DESCRIPTION : "ModelDescription",
						QY_DIMENSION_SETTING : "DimensionSetting",
						QY_ADDITIONAL_DIMENSIONS : "AdditionalDimensions",
						QY_ADDITIONAL_MEASURES : "AdditionalMeasures",
						QY_ENABLE_COMMENT : "EnableComment",
						QY_ENFORCE_DYNAMIC_VALUE : "EnforceDynamicValue",
						QY_USED_LOCAL : "UsedLocal",
						QY_DIM_TYPE : "DimType",
						QY_SIMPLE_MODEL : "SimpleModel",
						QY_KEY_FIGURE_U : "KeyFigure",
						QY_PREFERRED_ALVL : "PreferredALVL",
						QY_LOCAL_PROVIDER : "LocalProvider",
						QY_DIMENSION_SCOPE : "DimensionScope",
						QY_ENTRY_TYPE : "EntryType",
						QY_SELECTION_OPTION : "SelectionOption",
						QY_PREFERRED_QUERY : "PreferredQuery",
						QY_LOW_VALUE_EXT : "LowValueExt",
						QY_HIGH_VALUE_EXT : "HighValueExt"
					}
				});
$Firefly
		.createClass(
				"sap.firefly.InAHelper",
				sap.firefly.XObject,
				{
					$statics : {
						importInaMessagesInternal : function(inaMessages,
								messageCollector) {
							var hasErrors;
							var messageSize;
							var text;
							var i;
							var inaMessage;
							var type;
							var code;
							var message;
							var context;
							if (sap.firefly.PrUtils.isListEmpty(inaMessages)) {
								return false;
							}
							hasErrors = false;
							messageSize = inaMessages.size();
							text = sap.firefly.XStringBuffer.create();
							for (i = 0; i < messageSize; i++) {
								inaMessage = inaMessages.getStructureByIndex(i);
								text
										.append(inaMessage
												.getStringByName(sap.firefly.InAConstants.QY_TEXT));
								type = inaMessage.getIntegerByNameWithDefault(
										sap.firefly.InAConstants.QY_TYPE, 0);
								code = inaMessage.getIntegerByNameWithDefault(
										sap.firefly.InAConstants.QY_NUMBER, 0);
								message = null;
								if (type === sap.firefly.InAConstants.VA_SEVERITY_INFO) {
									message = messageCollector.addInfoExt(
											sap.firefly.OriginLayer.SERVER,
											code, text.toString());
								} else {
									if (type === sap.firefly.InAConstants.VA_SEVERITY_WARNING) {
										message = messageCollector
												.addWarningExt(
														sap.firefly.OriginLayer.SERVER,
														code, text.toString());
									} else {
										if (type === sap.firefly.InAConstants.VA_SEVERITY_ERROR) {
											message = messageCollector
													.addErrorExt(
															sap.firefly.OriginLayer.SERVER,
															code,
															text.toString(),
															null);
											hasErrors = true;
										} else {
											if (type === sap.firefly.InAConstants.VA_SEVERITY_SEMANTICAL_ERROR) {
												message = messageCollector
														.addSemanticalError(
																sap.firefly.OriginLayer.SERVER,
																code,
																text.toString());
												hasErrors = hasErrors || false;
											}
										}
									}
								}
								if (message !== null) {
									context = sap.firefly.PrUtils
											.getStructureProperty(inaMessage,
													"Context");
									if (context !== null) {
										(message).setExtendendInfo(context);
										(message)
												.setExtendendInfoType(sap.firefly.ExtendedInfoType.CONTEXT_STRUCTURE);
									}
								}
								text.clear();
							}
							text.releaseObject();
							return hasErrors;
						},
						importProfiling : function(inaPerformance,
								messageCollector) {
							var buffer;
							var stepId;
							var engineRuntimeInSeconds;
							var engineRuntimeInMs;
							var engineRuntimeInMsLong;
							var engineProfileNode;
							var serverMeasurements;
							var size;
							var j;
							var singleMeasure;
							var calls;
							var measureText;
							var singleMeasureNode;
							if (inaPerformance !== null) {
								buffer = sap.firefly.XStringBuffer.create();
								buffer
										.append("Engine (SessionId=")
										.append(
												inaPerformance
														.getStringByName(sap.firefly.InAConstants.QY_SESSION_ID));
								stepId = inaPerformance
										.getStringByName(sap.firefly.InAConstants.QY_STEP_ID);
								if (sap.firefly.XStringUtils
										.isNotNullAndNotEmpty(stepId)) {
									buffer.append(", StepId=").append(stepId);
								}
								buffer
										.append(", Timestamp=")
										.append(
												inaPerformance
														.getStringByName(sap.firefly.InAConstants.QY_TIMESTAMP))
										.append(")");
								engineRuntimeInSeconds = inaPerformance
										.getDoubleByNameWithDefault(
												sap.firefly.InAConstants.QY_RUNTIME,
												0);
								engineRuntimeInMs = engineRuntimeInSeconds * 1000;
								engineRuntimeInMsLong = sap.firefly.XDouble
										.convertDoubleToLong(engineRuntimeInMs);
								engineProfileNode = sap.firefly.ProfileNode
										.createWithDuration(buffer.toString(),
												engineRuntimeInMsLong);
								buffer.releaseObject();
								serverMeasurements = inaPerformance
										.getListByName(sap.firefly.InAConstants.QY_MEASUREMENTS);
								if (serverMeasurements !== null) {
									size = serverMeasurements.size();
									for (j = 0; j < size; j++) {
										singleMeasure = serverMeasurements
												.getStructureByIndex(j);
										calls = singleMeasure
												.getIntegerByNameWithDefault(
														sap.firefly.InAConstants.QY_CALLS,
														1);
										if (calls > 1) {
											buffer = sap.firefly.XStringBuffer
													.create();
											buffer
													.append(
															singleMeasure
																	.getStringByName(sap.firefly.InAConstants.QY_DESCRIPTION))
													.append(" (").appendInt(
															calls).append("x)");
											measureText = buffer.toString();
											buffer.releaseObject();
										} else {
											measureText = singleMeasure
													.getStringByName(sap.firefly.InAConstants.QY_DESCRIPTION);
										}
										if (singleMeasure
												.hasValueByName(sap.firefly.InAConstants.QY_TIME)) {
											engineRuntimeInSeconds = singleMeasure
													.getDoubleByName(sap.firefly.InAConstants.QY_TIME);
											engineRuntimeInMs = engineRuntimeInSeconds * 1000;
											engineRuntimeInMsLong = sap.firefly.XDouble
													.convertDoubleToLong(engineRuntimeInMs);
											singleMeasureNode = sap.firefly.ProfileNode
													.createWithDuration(
															measureText,
															engineRuntimeInMsLong);
											if (engineProfileNode !== null) {
												engineProfileNode
														.addProfileNode(singleMeasureNode);
											}
										}
									}
								}
								messageCollector.detailProfileNode(
										"### SERVER ###", engineProfileNode,
										"Network");
							}
						},
						importMessages : function(inaElement, messageCollector) {
							var inaStructure;
							var inaMessages;
							var inaGrids;
							var inaGrid;
							var inaPlanningElement;
							var inaPlanningList;
							var i;
							var currentInaPlanning;
							var currentInaPlanningMessages;
							var currentInaPlanningMessages2;
							var hasErrors;
							var inaPerformance;
							if (inaElement.isStructure() === false) {
								return false;
							}
							inaStructure = inaElement;
							inaMessages = inaStructure
									.getListByName(sap.firefly.InAConstants.QY_MESSAGES);
							if (inaMessages === null) {
								inaGrids = inaStructure
										.getListByName(sap.firefly.InAConstants.QY_GRIDS);
								if (inaGrids !== null) {
									inaGrid = inaGrids.getStructureByIndex(0);
									if (inaGrid !== null) {
										inaMessages = inaGrid
												.getListByName(sap.firefly.InAConstants.QY_MESSAGES);
									}
								}
								if (inaMessages === null) {
									inaPlanningElement = inaStructure
											.getElementByName(sap.firefly.InAConstants.QY_PLANNING);
									if (inaPlanningElement !== null) {
										if (inaPlanningElement.isList()
												&& ((inaPlanningElement).size() > 0)) {
											inaPlanningList = inaPlanningElement;
											for (i = 0; i < inaPlanningList
													.size(); i++) {
												currentInaPlanning = inaPlanningList
														.getStructureByIndex(i);
												if (currentInaPlanning !== null) {
													currentInaPlanningMessages = currentInaPlanning
															.getListByName(sap.firefly.InAConstants.QY_MESSAGES);
													if (currentInaPlanningMessages !== null) {
														if (inaMessages === null) {
															inaMessages = currentInaPlanningMessages;
														} else {
															inaMessages
																	.addAll(currentInaPlanningMessages);
														}
													}
												}
											}
										} else {
											if (inaPlanningElement
													.isStructure()) {
												currentInaPlanningMessages2 = (inaPlanningElement)
														.getListByName(sap.firefly.InAConstants.QY_MESSAGES);
												if (currentInaPlanningMessages2 !== null) {
													inaMessages = currentInaPlanningMessages2;
												}
											}
										}
									}
								}
							}
							hasErrors = sap.firefly.InAHelper
									.importInaMessagesInternal(inaMessages,
											messageCollector);
							inaPerformance = inaStructure
									.getStructureByName(sap.firefly.InAConstants.QY_PERFORMANCE_DATA);
							sap.firefly.InAHelper.importProfiling(
									inaPerformance, messageCollector);
							return hasErrors;
						}
					}
				});
$Firefly.createClass("sap.firefly.VizDefConstants", sap.firefly.XObject, {
	$statics : {
		K_CHART : "chart",
		K_TYPE : "type",
		V_TYPE_BARCOLUMN : "barcolumn",
		V_TYPE_HIERCHY_PCH : "hierarchy.pch",
		V_TYPE_DATASET : "dataset",
		V_TYPE_MEMBER : "member",
		K_BINDINGS : "bindings",
		K_FEED : "feed",
		V_FEED_VALUE_AXIS : "valueAxis",
		V_FEED_CATEGORY_AXIS : "categoryAxis",
		V_FEED_COLOR : "color",
		V_FEED_PATTERN2 : "pattern2",
		V_FEED_TRELLIS : "trellis",
		V_FEED_TOOLTIP_VALUE_AXIS : "tooltipValueAxis",
		V_FEED_TOOLTIP_CATEGORY_AXIS : "tooltipCategoryAxis",
		K_SOURCE : "source",
		K_PARENT_KEY : "parentKey",
		K_ID : "id",
		K_DIMENSION : "dimension",
		K_PROPERTIES : "properties",
		K_GENERAL : "general",
		K_LAYOUT : "layout",
		K_PADDING_BOTTOM : "paddingBottom",
		K_LABEL : "label",
		K_DIRECTION : "automatic",
		K_VARIANCE_CHART : "varianceChart",
		K_VARIANCE_LABEL : "varianceLabel",
		K_RESPONSIVE : "responsive",
		K_BACKGROUND : "background",
		K_VISIBLE : "visible",
		K_INVERTED : "inverted",
		K_COLLISION_DETECTION : "collisionDetection",
		K_LEGEND : "legend",
		K_SHOW_FULL_LABEL : "showFullLabel",
		K_STYLE : "style",
		K_FONT_FAMILY : "fontFamily",
		K_FONT_SIZE : "fontSize",
		K_FONT_WEIGHT : "fontWeight",
		V_FONT_WEIGHT_NORMAL : "normal",
		V_FONT_WEIGHT_BOLD : "bold",
		K_LEGEND_GROUP : "legendGroup",
		K_POSITION : "position",
		V_POSITION_TOP : "top",
		K_PLOT_AREA : "plotArea",
		K_STACK_COLUMN_LABEL : "stackColumnLabel",
		K_COLOR : "color",
		K_DATA_LABEL : "dataLabel",
		K_FORMAT_STRING : "formatString",
		K_HIDE_WHEN_OVERLAP : "hideWhenOverlap",
		K_SHOW_LABEL_NAMES : "showLabelNames",
		K_GRIDLINE : "gridline",
		K_GAP : "gap",
		K_INNER_GROUP_SPACING : "innerGroupSpacing",
		K_CATEGORY_AXIS : "categoryAxis",
		K_AXIS_LINE : "axisLine",
		K_SIZE : "size",
		K_AXIS_TICK : "axisTick",
		K_SHOW_LABEL_GRIDS : "showLabelGrids",
		K_VALUE_AXIS : "valueAxis",
		K_TITLE : "title",
		K_SUGGESTED_TITLE : "suggestedTitle",
		K_IS_AUTO_TOP_N : "isAutoTopN",
		K_INCOMPLETE_DATA_INFO : "incompleteDataInfo",
		K_IS_INCOMPLETE : "isIncomplete",
		K_ROW_LIMIT : "rowLimit",
		K_SUB_TITLE : "subTitle",
		K_SUGGESTED_SUB_TITLE : "suggestedSubTitle",
		K_ORIGINAL_BINDINGS : "originalBindings"
	}
});
$Firefly
		.createClass(
				"sap.firefly.CommonsModule",
				sap.firefly.DfModule,
				{
					$statics : {
						s_module : null,
						getInstance : function() {
							return sap.firefly.CommonsModule
									.initVersion(sap.firefly.XVersion.API_DEFAULT);
						},
						initVersion : function(version) {
							if (sap.firefly.CommonsModule.s_module === null) {
								if (sap.firefly.RuntimeModule
										.initVersion(version) === null) {
									throw sap.firefly.XException
											.createInitializationException();
								}
								sap.firefly.CommonsModule.s_module = new sap.firefly.CommonsModule();
							}
							return sap.firefly.CommonsModule.s_module;
						}
					}
				});
sap.firefly.CommonsModule.getInstance();