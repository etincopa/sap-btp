$Firefly.createClass("sap.firefly.XComparatorName", sap.firefly.XObject, {
	$statics : {
		create : function() {
			var newObj = new sap.firefly.XComparatorName();
			return newObj;
		}
	},
	compare : function(o1, o2) {
		var s1 = o1.getName();
		var s2 = o2.getName();
		return sap.firefly.XString.compare(s1, s2);
	}
});
$Firefly.createClass("sap.firefly.XListUtils", sap.firefly.XObject, {
	$statics : {
		listAddAll : function(list, listToAdd) {
			var i;
			if ((list === null) || (listToAdd === null)) {
				return;
			}
			if (listToAdd === list) {
				return;
			}
			for (i = 0; i < listToAdd.size(); i++) {
				list.add(listToAdd.get(i));
			}
		},
		listIsValidIndex : function(list, index) {
			if (list === null) {
				return false;
			}
			if (index < 0) {
				return false;
			}
			if (list.size() >= (index + 1)) {
				return true;
			}
			return false;
		},
		listHasNext : function(list, index) {
			return sap.firefly.XListUtils.listIsValidIndex(list, index + 1);
		},
		listNextIndex : function(list, index) {
			if (sap.firefly.XListUtils.listHasNext(list, index) === false) {
				throw sap.firefly.XException
						.createIllegalStateException("no next index");
			}
			return index + 1;
		},
		listHasPrevious : function(list, index) {
			if (list === null) {
				return false;
			}
			if (index < 1) {
				return false;
			}
			if (list.size() < index) {
				return false;
			}
			return true;
		},
		listPreviousIndex : function(list, index) {
			if (sap.firefly.XListUtils.listHasPrevious(list, index) === false) {
				throw sap.firefly.XException
						.createIllegalStateException("no previous index");
			}
			return index - 1;
		},
		listBeforeFirstIndex : function(list) {
			if (list === null) {
				throw sap.firefly.XException
						.createIllegalStateException("no first index");
			}
			return -1;
		},
		listAtFirstIndex : function(list) {
			if ((list === null) || (list.isEmpty())) {
				throw sap.firefly.XException
						.createIllegalStateException("no first index");
			}
			return 0;
		},
		moveElement : function(list, fromIndex, toIndex) {
			var size = list.size();
			var element;
			if ((fromIndex < 0) || (fromIndex >= size) || (toIndex < 0)
					|| (toIndex >= size)) {
				throw sap.firefly.XException
						.createIllegalStateException("Index out of bounds");
			}
			if (fromIndex === toIndex) {
				return;
			}
			element = list.get(fromIndex);
			list.removeAt(fromIndex);
			list.insert(toIndex, element);
		},
		moveStringElement : function(list, fromIndex, toIndex) {
			var size = list.size();
			var element;
			if ((fromIndex < 0) || (fromIndex >= size) || (toIndex < 0)
					|| (toIndex >= size)) {
				throw sap.firefly.XException
						.createIllegalStateException("Index out of bounds");
			}
			if (fromIndex === toIndex) {
				return;
			}
			element = list.get(fromIndex);
			list.removeAt(fromIndex);
			list.insert(toIndex, element);
		}
	}
});
$Firefly.createClass("sap.firefly.PackagedIdentifier", sap.firefly.XObject, {
	$statics : {
		create : function(customIdentifier, callBack) {
			var newIdentifier = new sap.firefly.PackagedIdentifier();
			newIdentifier.setup(customIdentifier, callBack);
			return newIdentifier;
		}
	},
	m_customIdentifier : null,
	m_callBack : null,
	setup : function(customIdentifier, callBack) {
		this.m_customIdentifier = customIdentifier;
		this.m_callBack = callBack;
	},
	releaseObject : function() {
		this.m_customIdentifier = null;
		this.m_callBack = null;
		sap.firefly.PackagedIdentifier.$superclass.releaseObject.call(this);
	},
	getCustomIdentifier : function() {
		return this.m_customIdentifier;
	},
	setCustomIdentifier : function(customIdentifier) {
		this.m_customIdentifier = customIdentifier;
	},
	getCallBack : function() {
		return this.m_callBack;
	},
	setCallBack : function(callBack) {
		this.m_callBack = callBack;
	}
});
$Firefly.createClass("sap.firefly.XKeyValuePair", sap.firefly.XObject, {
	$statics : {
		create : function() {
			return new sap.firefly.XKeyValuePair();
		}
	},
	m_key : null,
	m_value : null,
	m_valueType : null,
	setKey : function(key) {
		this.m_key = key;
	},
	setValue : function(value) {
		this.m_value = value;
	},
	setKeyValue : function(key, value) {
		this.m_key = key;
		this.m_value = value;
	},
	getKey : function() {
		return this.m_key;
	},
	getValue : function() {
		return this.m_value;
	},
	setValueType : function(valueType) {
		this.m_valueType = valueType;
	},
	getValueType : function() {
		return this.m_valueType;
	},
	toString : function() {
		var str = sap.firefly.XStringBuffer.create();
		str.append("Key ");
		if (this.m_key !== null) {
			str.append(this.m_key.toString());
		}
		str.append("Value ");
		if (this.m_value !== null) {
			str.append(this.m_value.toString());
		}
		return str.toString();
	},
	releaseObject : function() {
		this.m_key = null;
		this.m_value = null;
		this.m_valueType = null;
		sap.firefly.XKeyValuePair.$superclass.releaseObject.call(this);
	},
	clone : function() {
		var clone = sap.firefly.XKeyValuePair.create();
		clone.setKey(this.m_key);
		clone.setValue(this.m_value);
		clone.setValueType(this.getValueType());
		return clone;
	},
	isEqualTo : function(other) {
		var otherPair;
		if (other === null) {
			return false;
		}
		if (this === other) {
			return true;
		}
		otherPair = other;
		if (otherPair.getValueType() !== this.getValueType()) {
			return false;
		}
		if (otherPair.getKey().isEqualTo(this.m_key) === false) {
			return false;
		}
		if (otherPair.getValue().isEqualTo(this.m_value) === false) {
			return false;
		}
		return true;
	}
});
$Firefly.createClass("sap.firefly.XDateTimeUtils", sap.firefly.XObject, {
	$statics : {
		compareDateTime : function(dateTime1, dateTime2) {
			var compareDate = sap.firefly.XDateTimeUtils.compareDate(dateTime1
					.getDate(), dateTime2.getDate());
			var compareTime;
			if (compareDate !== 0) {
				return compareDate;
			}
			compareTime = sap.firefly.XDateTimeUtils.compareTime(dateTime1
					.getTime(), dateTime2.getTime());
			return compareTime;
		},
		compareDate : function(firstDate, secondDate) {
			var yearCompare = sap.firefly.XDateTimeUtils.compareValues(
					firstDate.getYear(), secondDate.getYear());
			var monthCompare;
			var dayCompare;
			if (yearCompare !== 0) {
				return yearCompare;
			}
			monthCompare = sap.firefly.XDateTimeUtils.compareValues(firstDate
					.getMonthOfYear(), secondDate.getMonthOfYear());
			if (monthCompare !== 0) {
				return monthCompare;
			}
			dayCompare = sap.firefly.XDateTimeUtils.compareValues(firstDate
					.getDayOfMonth(), secondDate.getDayOfMonth());
			if (dayCompare !== 0) {
				return dayCompare;
			}
			return 0;
		},
		compareTime : function(firstTime, secondTime) {
			var hourCompare = sap.firefly.XDateTimeUtils.compareValues(
					firstTime.getHourOfDay(), secondTime.getHourOfDay());
			var minuteCompare;
			var secondCompare;
			var millisecondCompare;
			if (hourCompare !== 0) {
				return hourCompare;
			}
			minuteCompare = sap.firefly.XDateTimeUtils.compareValues(firstTime
					.getMinuteOfHour(), secondTime.getMinuteOfHour());
			if (minuteCompare !== 0) {
				return minuteCompare;
			}
			secondCompare = sap.firefly.XDateTimeUtils.compareValues(firstTime
					.getSecondOfMinute(), secondTime.getSecondOfMinute());
			if (secondCompare !== 0) {
				return secondCompare;
			}
			millisecondCompare = sap.firefly.XDateTimeUtils.compareValues(
					firstTime.getMillisecondOfSecond(), secondTime
							.getMillisecondOfSecond());
			return millisecondCompare;
		},
		compareValues : function(value, compareTo) {
			if ((value > compareTo)) {
				return 1;
			} else {
				if (value < compareTo) {
					return -1;
				} else {
					return 0;
				}
			}
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.XStringUtils",
				sap.firefly.XObject,
				{
					$statics : {
						s_buffer : null,
						staticSetup : function() {
							sap.firefly.XStringUtils.s_buffer = sap.firefly.XStringBuffer
									.create();
						},
						leftPad : function(value, spacer, count) {
							var i;
							sap.firefly.XStringUtils.s_buffer.clear();
							for (i = 0; i < count; i++) {
								sap.firefly.XStringUtils.s_buffer
										.append(spacer);
							}
							sap.firefly.XStringUtils.s_buffer.append(value);
							return sap.firefly.XStringUtils.s_buffer.toString();
						},
						rightPad : function(value, spacer, count) {
							var i;
							sap.firefly.XStringUtils.s_buffer.clear();
							sap.firefly.XStringUtils.s_buffer.append(value);
							for (i = 0; i < count; i++) {
								sap.firefly.XStringUtils.s_buffer
										.append(spacer);
							}
							return sap.firefly.XStringUtils.s_buffer.toString();
						},
						isNullOrEmpty : function(value) {
							return (value === null)
									|| sap.firefly.XString.isEqual(value, "");
						},
						isNotNullAndNotEmpty : function(value) {
							return (value !== null)
									&& (sap.firefly.XString.isEqual(value, "") === false);
						},
						concatenate2 : function(s1, s2) {
							sap.firefly.XStringUtils.s_buffer.clear();
							if (s1 !== null) {
								sap.firefly.XStringUtils.s_buffer.append(s1);
							}
							if (s2 !== null) {
								sap.firefly.XStringUtils.s_buffer.append(s2);
							}
							return sap.firefly.XStringUtils.s_buffer.toString();
						},
						concatenate3 : function(s1, s2, s3) {
							return sap.firefly.XStringUtils.concatenate2(
									sap.firefly.XStringUtils.concatenate2(s1,
											s2), s3);
						},
						concatenate4 : function(s1, s2, s3, s4) {
							return sap.firefly.XStringUtils.concatenate2(
									sap.firefly.XStringUtils.concatenate2(s1,
											s2), sap.firefly.XStringUtils
											.concatenate2(s3, s4));
						},
						concatenate5 : function(s1, s2, s3, s4, s5) {
							return sap.firefly.XStringUtils.concatenate2(
									sap.firefly.XStringUtils.concatenate4(s1,
											s2, s3, s4), s5);
						},
						concatenateWithInt : function(s1, s2) {
							sap.firefly.XStringUtils.s_buffer.clear();
							if (s1 !== null) {
								sap.firefly.XStringUtils.s_buffer.append(s1);
							}
							sap.firefly.XStringUtils.s_buffer.appendInt(s2);
							return sap.firefly.XStringUtils.s_buffer.toString();
						},
						normalizeLineEndings : function(value) {
							var normalizedString;
							if (sap.firefly.XStringUtils.isNullOrEmpty(value)) {
								return value;
							}
							normalizedString = sap.firefly.XString.replace(
									value, "\r\n", "\n");
							return sap.firefly.XString.replace(
									normalizedString, "\r", "\n");
						},
						normalizeLineEndingsToUnix : function(value) {
							return sap.firefly.XStringUtils
									.normalizeLineEndings(value);
						},
						normalizeLineEndingsToWindows : function(value) {
							var normalizedString;
							if (sap.firefly.XStringUtils.isNullOrEmpty(value)) {
								return value;
							}
							normalizedString = sap.firefly.XString.replace(
									value, "\r\n", "\n");
							normalizedString = sap.firefly.XString.replace(
									normalizedString, "\r", "\n");
							return sap.firefly.XString.replace(
									normalizedString, "\n", "\r\n");
						},
						isAlphaNumeric : function(value) {
							var isCharPresent;
							var isNumPresent;
							var safeDefault;
							var len;
							var i;
							var s;
							var convertStringToIntegerWithDefault;
							if (sap.firefly.XStringUtils.isNullOrEmpty(value)) {
								return true;
							}
							isCharPresent = false;
							isNumPresent = false;
							safeDefault = -999;
							len = sap.firefly.XString.size(value);
							for (i = 0; i < len; i++) {
								s = sap.firefly.XString.substring(value, i,
										i + 1);
								convertStringToIntegerWithDefault = sap.firefly.XInteger
										.convertStringToIntegerWithDefault(s,
												safeDefault);
								if (convertStringToIntegerWithDefault === safeDefault) {
									isCharPresent = true;
								} else {
									isNumPresent = true;
								}
								if (isNumPresent && isCharPresent) {
									return true;
								}
							}
							return false;
						},
						containsString : function(s1, s2, ignoreCase) {
							var isS1Empty;
							var isS2Empty;
							var s1UC;
							var s2UC;
							if (ignoreCase === false) {
								return sap.firefly.XString.containsString(s1,
										s2);
							}
							isS1Empty = sap.firefly.XStringUtils
									.isNullOrEmpty(s1);
							isS2Empty = sap.firefly.XStringUtils
									.isNullOrEmpty(s2);
							if (isS1Empty && isS2Empty) {
								return true;
							}
							if (isS1Empty !== isS2Empty) {
								return false;
							}
							s1UC = sap.firefly.XString.convertToUpperCase(s1);
							s2UC = sap.firefly.XString.convertToUpperCase(s2);
							return sap.firefly.XString.containsString(s1UC,
									s2UC);
						},
						escapeHtml : function(text) {
							var result = sap.firefly.XString.replace(text, "&",
									"&#38;");
							result = sap.firefly.XString.replace(result, "<",
									"&#60;");
							result = sap.firefly.XString.replace(result, ">",
									"&#62;");
							result = sap.firefly.XString.replace(result, '"',
									"&#34;");
							return result;
						}
					}
				});
$Firefly.createClass("sap.firefly.DfMemoryManager", sap.firefly.XObject, {
	$statics : {
		statisticsEnabled : false
	},
	getObjectCount : function() {
		return -1;
	},
	getAllocatedMemory : function() {
		return -1;
	},
	getFreeMemory : function() {
		return -1;
	},
	getObjectTrace : function() {
		return null;
	},
	resetObjectTraceStatistics : function() {
	},
	enableStatistics : function(enable) {
		sap.firefly.DfMemoryManager.statisticsEnabled = enable;
	},
	isStatisticsEnabled : function() {
		return sap.firefly.DfMemoryManager.statisticsEnabled;
	}
});
$Firefly.createClass("sap.firefly.XAutoReleaseManager", sap.firefly.XObject, {
	$statics : {
		s_manager : null,
		staticSetup : function() {
			sap.firefly.XAutoReleaseManager
					.setInstance(new sap.firefly.XAutoReleaseManager());
		},
		getInstance : function() {
			return sap.firefly.XAutoReleaseManager.s_manager;
		},
		setInstance : function(manager) {
			sap.firefly.XAutoReleaseManager.s_manager = manager;
		}
	},
	execute : function(autoReleaseBlock) {
		autoReleaseBlock.executeAutoReleaseBlock();
	}
});
$Firefly.createClass("sap.firefly.XWeakReferenceUtil", sap.firefly.XObject, {
	$statics : {
		getHardRef : function(weakReference) {
			var reference;
			if (weakReference === null) {
				return null;
			}
			reference = weakReference.getReference();
			if ((reference === null) || reference.isReleased()) {
				return null;
			}
			return reference;
		},
		getWeakRef : function(context) {
			if ((context === null) || (context.isReleased())) {
				return null;
			}
			return sap.firefly.XWeakReference.create(context);
		}
	}
});
$Firefly.createClass("sap.firefly.ErrorCodes", sap.firefly.XObject, {
	$statics : {
		OTHER_ERROR : 0,
		PARSER_ERROR : 10,
		IMPORT_FILTER_CAPABILITY_NOT_FOUND : 20,
		IMPORT_FILTER_CAPABILITY_UNSUPPORTED_OPERATORS : 21,
		IMPORT_VARIABE_NO_DIMENSION : 30,
		IMPORT_EXCEPTION_INACTIVE : 40,
		IMPORT_EXCEPTION_NO_THRESHOLDS : 41,
		IMPORT_EXCEPTION_INVALID_EVALUATE : 42,
		INVALID_STATE : 50,
		INVALID_DATATYPE : 51,
		INVALID_TOKEN : 52,
		INVALID_OPERATOR : 53,
		INVALID_DIMENSION : 54,
		INVALID_PARAMETER : 55,
		INVALID_URL : 60,
		SYSTEM_IO : 70,
		SYSTEM_IO_READ_ACCESS : 71,
		SYSTEM_IO_WRITE_ACCESS : 72,
		SYSTEM_IO_HTTP : 73,
		INVALID_SYSTEM : 80,
		PARSING_ERROR_DOUBLE_VALUE : 85,
		PARSING_ERROR_INT_VALUE : 86,
		PARSING_ERROR_LONG_VALUE : 87,
		PARSING_ERROR_BOOLEAN_VALUE : 88,
		PARSING_ERROR_DATE_VALUE : 89,
		PARSING_ERROR_TIME_VALUE : 90,
		PARSING_ERROR_DATE_TIME_VALUE : 91,
		PARSING_ERROR_TIMESPAN : 92,
		PARSING_ERROR_LINESTRING : 93,
		PARSING_ERROR_MULTILINESTRING : 94,
		PARSING_ERROR_POINT : 95,
		PARSING_ERROR_MULTI_POINT : 96,
		PARSING_ERROR_POLYGON : 97,
		PARSING_ERROR_MULTI_POLYGON : 98,
		MODEL_INFRASTRUCTURE_TERMINATED : 300,
		TMX : 7000,
		TMX_SYNTAX : 7001,
		TMX_FUNCTION : 7002,
		TMX_FUNCTION_PARAMS : 7003,
		TMX_PARSE : 7200,
		TMX_TRANSFORM : 7400,
		TMX_APPLY : 7600,
		TMX_INCOMPLETE_SYNTAX : 7601,
		TMX_UNEXPECTED_SYNTAX : 7602,
		TMX_SYNTAX_ERROR : 7603,
		TMX_UNSUPPORTED_ACTION : 7604,
		SERVICE_ROOT_EXCEPTION : 2500,
		SERVICE_NOT_FOUND : 2501,
		SERVER_METADATA_NOT_FOUND : 2502,
		ET_WRONG_TYPE : 2600,
		ET_WRONG_VALUE : 2601,
		ET_ELEMENT_NOT_FOUND : 2602,
		ET_INVALID_CHILDREN : 2603,
		ET_INVALID_VALUE : 2604,
		ET_BLACK_CAP : 2605,
		ET_WHITE_CAP : 2606,
		QM_CUBE_ENTRY_NOT_FOUND : 2700,
		ABAP_PASSWORD_IS_INITIAL : 10023,
		NO_VARIABLE_PROCESSOR_AFFECTED : 3000
	}
});
$Firefly.createClass("sap.firefly.DfModule", sap.firefly.XObject, {
	$statics : {
		USE_NATIVE_UI : true
	}
});
$Firefly
		.createClass(
				"sap.firefly.XVersion",
				sap.firefly.XObject,
				{
					$statics : {
						LIBRARY : 17120401,
						GIT_COMMIT_ID : "$$GitCommitId$$",
						MIN : 69,
						MAX : 85,
						DEFAULT_VALUE : 69,
						V69_PLANNING_MODE : 69,
						V70_FAST_ACTION_PARAMS : 70,
						V71_FAST_PRIVILEGE_INIT : 71,
						V72_VAR_SUBMIT_MODEL_COPY : 72,
						V73_BACKUP_TIMESTAMP : 73,
						V74_HIERARCHICAL_BW_KEYFIGURES : 74,
						V75_UNDO_REDO_STACK : 75,
						V76_ACTION_STATE : 76,
						V77_RETURNED_DATA_SELECTION : 77,
						V78_PLANNING_STRICT_ERROR_HANDLING : 78,
						V79_XCMD_STRICT_ERROR_HANDLING : 79,
						V80_INPUT_READINESS_STATES : 80,
						V81_CARTESIAN_FILTER_INTERSECT : 81,
						V82_NEW_VALUES_AS_BATCH : 82,
						V83_VISUAL_AGGREGATION : 83,
						V84_MDS_CONDITIONS : 84,
						V85_MDS_IGNORE_UNIT_ZEROVALUE_IN_AGGREGATION : 85,
						V999_NEW_VAR_VALUE_HELP : 999,
						API_ACTIVE : 0,
						API_MAX : 3,
						API_MIN : 2,
						API_DEFAULT : 2,
						API_V2_COLLECTIONS : 2,
						API_V3_SYNC_ACTION : 3,
						checkCleanOlapConstructors : function(index) {
							if (index <= 39) {
								throw sap.firefly.XException
										.createUnsupportedOperationException();
							}
						},
						staticSetupByVersion : function(version) {
							if (version === -1) {
								sap.firefly.XVersion.API_ACTIVE = sap.firefly.XVersion.API_MAX;
							} else {
								if (version === 0) {
									sap.firefly.XVersion.API_ACTIVE = sap.firefly.XVersion.API_MIN;
								} else {
									if (version > sap.firefly.XVersion.API_MAX) {
										sap.firefly.XVersion.API_ACTIVE = sap.firefly.XVersion.API_MAX;
									} else {
										if (version < sap.firefly.XVersion.API_MIN) {
											sap.firefly.XVersion.API_ACTIVE = sap.firefly.XVersion.API_MIN;
										} else {
											sap.firefly.XVersion.API_ACTIVE = version;
										}
									}
								}
							}
						},
						check : function(trigger, replacement) {
							if (sap.firefly.XVersion.API_ACTIVE >= trigger) {
								throw sap.firefly.XException
										.createRuntimeException(sap.firefly.XString
												.concatenate2(
														"Method is deprecated, suggested replacement: ",
														replacement));
							}
						}
					}
				});
$Firefly.createClass("sap.firefly.XEnvironmentConstants", sap.firefly.XObject,
		{
			$statics : {
				HTTP_PROXY_HOST : "http.proxy.host",
				HTTP_PROXY_PORT : "http.proxy.port",
				HTTP_USE_GZIP_ENCODING : "http_use_post_gzip",
				HTTP_DISPATCHER_URI : "http_dispatcher_uri",
				HTTP_ALLOW_URI_SESSION : "http_allow_uri_session",
				HTTP_DISPATCHER_URI_DOT : "http.dispatcher.uri",
				HTTP_ACCEPT_ENCODING_GZIP : "http.accept.encoding.gzip",
				ENABLE_HTTP_FILE_TRACING : "com.sap.firefly.tracing.enable",
				HTTP_FILE_TRACING_FOLDER : "com.sap.firefly.tracing.folder",
				SYSTEM_LANDSCAPE_URI : "system_landscape_uri",
				XVERSION : "xversion"
			}
		});
$Firefly.createClass("sap.firefly.XReflectionParam", sap.firefly.XObject, {
	$statics : {
		create : function(obj) {
			var param = new sap.firefly.XReflectionParam();
			param.m_value = obj;
			return param;
		},
		createBoolean : function(value) {
			var param = new sap.firefly.XReflectionParam();
			param.m_value = sap.firefly.XBooleanValue.create(value);
			param.m_isWrapped = true;
			return param;
		},
		createInteger : function(value) {
			var param = new sap.firefly.XReflectionParam();
			param.m_value = sap.firefly.XIntegerValue.create(value);
			param.m_isWrapped = true;
			return param;
		},
		createDouble : function(value) {
			var param = new sap.firefly.XReflectionParam();
			param.m_value = sap.firefly.XDoubleValue.create(value);
			param.m_isWrapped = true;
			return param;
		},
		createLong : function(value) {
			var param = new sap.firefly.XReflectionParam();
			param.m_value = sap.firefly.XLongValue.create(value);
			param.m_isWrapped = true;
			return param;
		},
		createString : function(value) {
			var param = new sap.firefly.XReflectionParam();
			param.m_value = sap.firefly.XStringValue.create(value);
			param.m_isWrapped = true;
			return param;
		}
	},
	m_value : null,
	m_isWrapped : false,
	isWrapped : function() {
		return this.m_isWrapped;
	},
	getValue : function() {
		return this.m_value;
	}
});
$Firefly.createClass("sap.firefly.XDateTimeProvider", sap.firefly.XObject, {
	$statics : {
		s_nativeInstance : null,
		getInstance : function() {
			return sap.firefly.XDateTimeProvider.s_nativeInstance;
		},
		setInstance : function(prompt) {
			sap.firefly.XDateTimeProvider.s_nativeInstance = prompt;
		},
		staticSetup : function() {
			var dateTimeProvider = new sap.firefly.XDateTimeProvider();
			sap.firefly.XDateTimeProvider.setInstance(dateTimeProvider);
		}
	},
	getCurrentDateAtLocalTimezone : function() {
		return sap.firefly.XDate.createDate();
	},
	getCurrentDateTimeAtLocalTimezone : function() {
		return sap.firefly.XDateTime.createDateTime();
	},
	getCurrentTimeAtLocalTimezone : function() {
		return sap.firefly.XTime.createTime();
	}
});
$Firefly.createClass("sap.firefly.XIteratorWrapper", sap.firefly.XObject, {
	$statics : {
		create : function(list) {
			var newObject = new sap.firefly.XIteratorWrapper();
			newObject.m_iterator = list;
			return newObject;
		}
	},
	m_iterator : null,
	releaseObject : function() {
		this.m_iterator = null;
		sap.firefly.XIteratorWrapper.$superclass.releaseObject.call(this);
	},
	hasNext : function() {
		return this.m_iterator.hasNext();
	},
	next : function() {
		return this.m_iterator.next();
	}
});
$Firefly.createClass("sap.firefly.XObjectIterator", sap.firefly.XObject, {
	$statics : {
		create : function(list) {
			var newObject = new sap.firefly.XObjectIterator();
			newObject.m_list = list;
			newObject.m_index = -1;
			return newObject;
		}
	},
	m_list : null,
	m_index : 0,
	releaseObject : function() {
		this.m_list = null;
		sap.firefly.XObjectIterator.$superclass.releaseObject.call(this);
	},
	getList : function() {
		return this.m_list;
	},
	hasNext : function() {
		return (this.m_index + 1) < this.getList().size();
	},
	next : function() {
		this.m_index++;
		return this.getList().get(this.m_index);
	}
});
$Firefly.createClass("sap.firefly.XUniversalIterator", sap.firefly.XObject, {
	$statics : {
		create : function(list) {
			var newObject = new sap.firefly.XUniversalIterator();
			newObject.m_list = list;
			newObject.m_index = -1;
			return newObject;
		}
	},
	m_list : null,
	m_index : 0,
	releaseObject : function() {
		this.m_list = null;
		sap.firefly.XUniversalIterator.$superclass.releaseObject.call(this);
	},
	getList : function() {
		return this.m_list;
	},
	hasNext : function() {
		return (this.m_index + 1) < this.getList().size();
	},
	next : function() {
		this.m_index++;
		return this.getList().get(this.m_index);
	}
});
$Firefly.createClass("sap.firefly.DfNameObject", sap.firefly.XObject, {
	m_name : null,
	getName : function() {
		return this.m_name;
	},
	setName : function(name) {
		this.m_name = name;
	},
	toString : function() {
		return this.m_name;
	},
	releaseObject : function() {
		this.m_name = null;
		sap.firefly.DfNameObject.$superclass.releaseObject.call(this);
	}
});
$Firefly.createClass("sap.firefly.XPair", sap.firefly.XObject, {
	$statics : {
		create : function(firstObject, secondObject) {
			var newObject = new sap.firefly.XPair();
			newObject.m_firstObject = firstObject;
			newObject.m_secondObject = secondObject;
			return newObject;
		}
	},
	m_firstObject : null,
	m_secondObject : null,
	releaseObject : function() {
		this.m_firstObject = null;
		this.m_secondObject = null;
		sap.firefly.XPair.$superclass.releaseObject.call(this);
	},
	getFirstObject : function() {
		return this.m_firstObject;
	},
	getSecondObject : function() {
		return this.m_secondObject;
	},
	setFirstObject : function(firstObject) {
		this.m_firstObject = firstObject;
	},
	setSecondObject : function(secondObject) {
		this.m_secondObject = secondObject;
	}
});
$Firefly.createClass("sap.firefly.XStringBufferExt", sap.firefly.XObject, {
	$statics : {
		create : function() {
			var buffer = new sap.firefly.XStringBufferExt();
			buffer.setup();
			return buffer;
		}
	},
	m_buffer : null,
	m_indent : 0,
	m_indentString : null,
	m_isNewLine : false,
	setup : function() {
		this.m_buffer = sap.firefly.XStringBuffer.create();
		this.m_indent = 0;
		this.m_indentString = " ";
		this.m_isNewLine = true;
	},
	releaseObject : function() {
		this.m_buffer = sap.firefly.XObject.releaseIfNotNull(this.m_buffer);
		this.m_indentString = null;
		sap.firefly.XStringBufferExt.$superclass.releaseObject.call(this);
	},
	setupNewLine : function() {
		var i;
		for (i = 0; i < this.m_indent; i++) {
			this.m_buffer.append(this.m_indentString);
		}
		this.m_isNewLine = false;
	},
	append : function(value) {
		if (this.m_isNewLine) {
			this.setupNewLine();
		}
		this.m_buffer.append(value);
		return this;
	},
	appendChar : function(value) {
		if (this.m_isNewLine) {
			this.setupNewLine();
		}
		this.m_buffer.appendChar(value);
		return this;
	},
	appendBoolean : function(value) {
		if (this.m_isNewLine) {
			this.setupNewLine();
		}
		this.m_buffer.appendBoolean(value);
		return this;
	},
	appendInt : function(value) {
		if (this.m_isNewLine) {
			this.setupNewLine();
		}
		this.m_buffer.appendInt(value);
		return this;
	},
	appendLong : function(value) {
		if (this.m_isNewLine) {
			this.setupNewLine();
		}
		this.m_buffer.appendLong(value);
		return this;
	},
	appendDouble : function(value) {
		if (this.m_isNewLine) {
			this.setupNewLine();
		}
		this.m_buffer.appendDouble(value);
		return this;
	},
	appendNewLine : function() {
		this.m_buffer.appendNewLine();
		this.m_isNewLine = true;
		return this;
	},
	setIndentationString : function(indentationString) {
		this.m_indentString = indentationString;
	},
	getIndentationString : function() {
		return this.m_indentString;
	},
	indent : function() {
		this.m_indent++;
		return this;
	},
	outdent : function() {
		this.m_indent--;
		return this;
	},
	getIndentation : function() {
		return this.m_indent;
	},
	toString : function() {
		return this.m_buffer.toString();
	},
	length : function() {
		return this.m_buffer.length();
	},
	clear : function() {
		this.m_buffer.clear();
	}
});
$Firefly.createClass("sap.firefly.XConstant", sap.firefly.DfNameObject, {
	setupConstant : function(name) {
		this.setName(name);
	},
	releaseObject : function() {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	clone : function() {
		throw sap.firefly.XException.createUnsupportedOperationException();
	}
});
$Firefly.createClass("sap.firefly.DfNameTextObject", sap.firefly.DfNameObject,
		{
			$statics : {
				createNameTextObject : function(name, text) {
					var obj = new sap.firefly.DfNameTextObject();
					obj.setName(name);
					obj.setText(text);
					return obj;
				}
			},
			m_text : null,
			getText : function() {
				return this.m_text;
			},
			setText : function(text) {
				this.m_text = text;
			},
			releaseObject : function() {
				this.m_text = null;
				sap.firefly.DfNameTextObject.$superclass.releaseObject
						.call(this);
			}
		});
$Firefly.createClass("sap.firefly.XNameValuePair", sap.firefly.DfNameObject, {
	$statics : {
		create : function() {
			return new sap.firefly.XNameValuePair();
		},
		createWithValues : function(name, value) {
			var object = new sap.firefly.XNameValuePair();
			object.setName(name);
			object.setValue(value);
			return object;
		}
	},
	m_value : null,
	releaseObject : function() {
		this.m_value = null;
		sap.firefly.XNameValuePair.$superclass.releaseObject.call(this);
	},
	getValue : function() {
		return this.m_value;
	},
	setValue : function(value) {
		this.m_value = value;
	},
	toString : function() {
		var tmp;
		if (this.m_value === null) {
			return this.getName();
		}
		tmp = sap.firefly.XString.concatenate2(this.getName(), "=");
		return sap.firefly.XString.concatenate2(tmp, this.m_value);
	}
});
$Firefly.createClass("sap.firefly.XNameWeakGenericPair", sap.firefly.XObject, {
	$statics : {
		create : function(name, object) {
			var newObject = new sap.firefly.XNameWeakGenericPair();
			newObject.m_name = name;
			newObject.m_object = sap.firefly.XWeakReferenceUtil
					.getWeakRef(object);
			return newObject;
		}
	},
	m_name : null,
	m_object : null,
	releaseObject : function() {
		this.m_name = null;
		this.m_object = sap.firefly.XObject.releaseIfNotNull(this.m_object);
		sap.firefly.XNameWeakGenericPair.$superclass.releaseObject.call(this);
	},
	getName : function() {
		return this.m_name;
	},
	getObject : function() {
		return sap.firefly.XWeakReferenceUtil.getHardRef(this.m_object);
	},
	setName : function(name) {
		this.m_name = name;
	},
	setObject : function(object) {
		this.m_object = sap.firefly.XWeakReferenceUtil.getWeakRef(object);
	}
});
$Firefly.createClass("sap.firefly.XClassElement", sap.firefly.DfNameObject, {
	m_accessModifier : null,
	getAccessModifier : function() {
		return this.m_accessModifier;
	}
});
$Firefly.createClass("sap.firefly.XReadOnlyListWrapper", sap.firefly.XObject, {
	$statics : {
		create : function(list) {
			var newObject = new sap.firefly.XReadOnlyListWrapper();
			newObject.m_originList = list;
			return newObject;
		}
	},
	m_originList : null,
	releaseObject : function() {
		this.m_originList = null;
		sap.firefly.XReadOnlyListWrapper.$superclass.releaseObject.call(this);
	},
	getValuesAsReadOnlyList : function() {
		return this;
	},
	getIterator : function() {
		return sap.firefly.XUniversalIterator.create(this.m_originList);
	},
	contains : function(element) {
		return this.m_originList.contains(element);
	},
	size : function() {
		return this.m_originList.size();
	},
	isEmpty : function() {
		return this.m_originList.isEmpty();
	},
	hasElements : function() {
		return this.m_originList.hasElements();
	},
	get : function(index) {
		return this.m_originList.get(index);
	},
	getIndex : function(element) {
		return this.m_originList.getIndex(element);
	},
	toString : function() {
		return this.m_originList.toString();
	}
});
$Firefly.createClass("sap.firefly.ConstantValue", sap.firefly.XConstant, {
	$statics : {
		THE_NULL : null,
		staticSetup : function() {
			sap.firefly.ConstantValue.THE_NULL = sap.firefly.ConstantValue
					.create("null");
		},
		create : function(name) {
			var newConstant = new sap.firefly.ConstantValue();
			newConstant.setName(name);
			return newConstant;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.SignPresentation",
				sap.firefly.XConstant,
				{
					$statics : {
						BEFORE_NUMBER : null,
						AFTER_NUMBER : null,
						BRACKETS : null,
						staticSetup : function() {
							sap.firefly.SignPresentation.BEFORE_NUMBER = sap.firefly.SignPresentation
									.create("BEFORE_NUMBER");
							sap.firefly.SignPresentation.AFTER_NUMBER = sap.firefly.SignPresentation
									.create("AFTER_NUMBER");
							sap.firefly.SignPresentation.BRACKETS = sap.firefly.SignPresentation
									.create("BRACKETS");
						},
						create : function(constant) {
							var sp = new sap.firefly.SignPresentation();
							sp.setName(constant);
							return sp;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.TraceType",
				sap.firefly.XConstant,
				{
					$statics : {
						NONE : null,
						URL : null,
						FILE : null,
						JSON : null,
						BW_STD : null,
						BW_CATT : null,
						staticSetup : function() {
							sap.firefly.TraceType.NONE = sap.firefly.TraceType
									.create("None");
							sap.firefly.TraceType.URL = sap.firefly.TraceType
									.create("Url");
							sap.firefly.TraceType.FILE = sap.firefly.TraceType
									.create("File");
							sap.firefly.TraceType.JSON = sap.firefly.TraceType
									.create("JsonEmbedded");
							sap.firefly.TraceType.BW_STD = sap.firefly.TraceType
									.create("BWStd");
							sap.firefly.TraceType.BW_CATT = sap.firefly.TraceType
									.create("BWCATT");
						},
						create : function(name) {
							var object = new sap.firefly.TraceType();
							object.setName(name);
							return object;
						},
						lookup : function(name) {
							if (sap.firefly.XString.isEqual("None", name)) {
								return sap.firefly.TraceType.NONE;
							} else {
								if (sap.firefly.XString.isEqual("Url", name)) {
									return sap.firefly.TraceType.URL;
								} else {
									if (sap.firefly.XString.isEqual("File",
											name)) {
										return sap.firefly.TraceType.FILE;
									} else {
										if (sap.firefly.XString.isEqual(
												"JsonEmbedded", name)) {
											return sap.firefly.TraceType.JSON;
										} else {
											if (sap.firefly.XString.isEqual(
													"BWStd", name)) {
												return sap.firefly.TraceType.BW_CATT;
											} else {
												if (sap.firefly.XString
														.isEqual("BWCATT", name)) {
													return sap.firefly.TraceType.BW_STD;
												} else {
													return null;
												}
											}
										}
									}
								}
							}
						}
					}
				});
$Firefly.createClass("sap.firefly.TriStateBool", sap.firefly.XConstant, {
	$statics : {
		_TRUE : null,
		_FALSE : null,
		_DEFAULT : null,
		staticSetup : function() {
			sap.firefly.TriStateBool._TRUE = sap.firefly.TriStateBool.create(
					"TRUE", true);
			sap.firefly.TriStateBool._FALSE = sap.firefly.TriStateBool.create(
					"FALSE", false);
			sap.firefly.TriStateBool._DEFAULT = sap.firefly.TriStateBool
					.create("DEFAULT", false);
		},
		create : function(constant, aequivalent) {
			var object = new sap.firefly.TriStateBool();
			object.setup(constant, aequivalent);
			return object;
		},
		lookup : function(value) {
			if (value) {
				return sap.firefly.TriStateBool._TRUE;
			}
			return sap.firefly.TriStateBool._FALSE;
		}
	},
	m_boolAequivalent : false,
	setup : function(constant, aequivalent) {
		this.setupConstant(constant);
		this.m_boolAequivalent = aequivalent;
	},
	getBoolean : function() {
		return this.m_boolAequivalent;
	}
});
$Firefly.createClass("sap.firefly.XConstantWithParent", sap.firefly.XConstant,
		{
			m_parent : null,
			getParent : function() {
				return this.m_parent;
			},
			setParent : function(type) {
				this.m_parent = type;
			},
			isTypeOf : function(type) {
				if (type === null) {
					return false;
				}
				if (this === type) {
					return true;
				}
				if (this.m_parent === null) {
					return false;
				}
				return this.m_parent.isTypeOf(type);
			}
		});
$Firefly.createClass("sap.firefly.XLanguage", sap.firefly.XConstant, {
	$statics : {
		JAVA : null,
		JAVASCRIPT : null,
		OBJECTIVE_C : null,
		CPP : null,
		CSHARP : null,
		ABAP : null,
		s_language : null,
		staticSetup : function() {
			sap.firefly.XLanguage.JAVA = sap.firefly.XLanguage.create("JAVA");
			sap.firefly.XLanguage.JAVASCRIPT = sap.firefly.XLanguage
					.create("JAVASCRIPT");
			sap.firefly.XLanguage.OBJECTIVE_C = sap.firefly.XLanguage
					.create("OBJECTIVE_C");
			sap.firefly.XLanguage.CPP = sap.firefly.XLanguage.create("CPP");
			sap.firefly.XLanguage.CSHARP = sap.firefly.XLanguage
					.create("CSHARP");
			sap.firefly.XLanguage.ABAP = sap.firefly.XLanguage.create("ABAP");
		},
		create : function(name) {
			var pt = new sap.firefly.XLanguage();
			pt.setName(name);
			return pt;
		},
		getLanguage : function() {
			return sap.firefly.XLanguage.s_language;
		},
		setLanguage : function(language) {
			if (sap.firefly.XLanguage.s_language === null) {
				sap.firefly.XLanguage.s_language = language;
			}
		}
	}
});
$Firefly.createClass("sap.firefly.XPlatform", sap.firefly.XConstant, {
	$statics : {
		GENERIC : null,
		HANA : null,
		s_platform : null,
		staticSetup : function() {
			sap.firefly.XPlatform.GENERIC = sap.firefly.XPlatform
					.create("Generic");
			sap.firefly.XPlatform.HANA = sap.firefly.XPlatform.create("Hana");
			sap.firefly.XPlatform.s_platform = sap.firefly.XPlatform.GENERIC;
		},
		create : function(name) {
			var pt = new sap.firefly.XPlatform();
			pt.setName(name);
			return pt;
		},
		getPlatform : function() {
			return sap.firefly.XPlatform.s_platform;
		},
		setPlatform : function(platform) {
			sap.firefly.XPlatform.s_platform = platform;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.XSortDirection",
				sap.firefly.XConstant,
				{
					$statics : {
						ASCENDING : null,
						DESCENDING : null,
						NONE : null,
						DISABLED : null,
						DEFAULT_VALUE : null,
						staticSetup : function() {
							sap.firefly.XSortDirection.ASCENDING = sap.firefly.XSortDirection
									.create("ASCENDING");
							sap.firefly.XSortDirection.DESCENDING = sap.firefly.XSortDirection
									.create("DESCENDING");
							sap.firefly.XSortDirection.DEFAULT_VALUE = sap.firefly.XSortDirection
									.create("DEFAULT");
							sap.firefly.XSortDirection.NONE = sap.firefly.XSortDirection
									.create("NONE");
							sap.firefly.XSortDirection.DISABLED = sap.firefly.XSortDirection
									.create("DISABLED");
						},
						create : function(constant) {
							var sp = new sap.firefly.XSortDirection();
							sp.setName(constant);
							return sp;
						}
					}
				});
$Firefly.createClass("sap.firefly.XSyncEnv", sap.firefly.XConstant, {
	$statics : {
		EXTERNAL_MAIN_LOOP : null,
		INTERNAL_MAIN_LOOP : null,
		s_syncEnv : null,
		staticSetup : function() {
			sap.firefly.XSyncEnv.EXTERNAL_MAIN_LOOP = sap.firefly.XSyncEnv
					.create("EXTERNAL");
			sap.firefly.XSyncEnv.INTERNAL_MAIN_LOOP = sap.firefly.XSyncEnv
					.create("INTERNAL");
		},
		create : function(name) {
			var pt = new sap.firefly.XSyncEnv();
			pt.setName(name);
			return pt;
		},
		getSyncEnv : function() {
			return sap.firefly.XSyncEnv.s_syncEnv;
		},
		setSyncEnv : function(syncEnv) {
			if (sap.firefly.XSyncEnv.s_syncEnv === null) {
				sap.firefly.XSyncEnv.s_syncEnv = syncEnv;
			}
		}
	}
});
$Firefly.createClass("sap.firefly.XNameObjectPair", sap.firefly.DfNameObject,
		{
			$statics : {
				create : function() {
					return new sap.firefly.XNameObjectPair();
				}
			},
			m_value : null,
			m_valueType : null,
			releaseObject : function() {
				this.m_value = null;
				this.m_valueType = null;
				sap.firefly.XNameObjectPair.$superclass.releaseObject
						.call(this);
			},
			clone : function() {
				var clone = sap.firefly.XNameObjectPair.create();
				clone.setName(this.getName());
				clone.setObject(this.m_value);
				clone.setValueType(this.m_valueType);
				return clone;
			},
			setObject : function(object) {
				this.m_value = object;
			},
			setNameAndObject : function(name, object) {
				this.setName(name);
				this.m_value = object;
			},
			getObject : function() {
				return this.m_value;
			},
			setValueType : function(valueType) {
				this.m_valueType = valueType;
			},
			getComponentType : function() {
				return this.getValueType();
			},
			getValueType : function() {
				return this.m_valueType;
			},
			toString : function() {
				var response = sap.firefly.XStringBuffer.create();
				response.append("Key ").append(this.getName());
				response.append("Value ");
				if (this.m_value !== null) {
					response.append(this.m_value.toString());
				}
				return response.toString();
			},
			isEqualTo : function(other) {
				var otherPair;
				if (other === null) {
					return false;
				}
				if (this === other) {
					return true;
				}
				otherPair = other;
				if (otherPair.getValueType() !== this.m_valueType) {
					return false;
				}
				if (sap.firefly.XString.isEqual(this.getName(), otherPair
						.getName()) === false) {
					return false;
				}
				if (otherPair.getObject().isEqualTo(this.m_value) === false) {
					return false;
				}
				return true;
			}
		});
$Firefly.createClass("sap.firefly.XAccessModifier", sap.firefly.XConstant, {
	$statics : {
		PRIVATE : null,
		PROTECTED : null,
		PUBLIC : null,
		staticSetup : function() {
			sap.firefly.XAccessModifier.PRIVATE = sap.firefly.XAccessModifier
					.create("Private");
			sap.firefly.XAccessModifier.PROTECTED = sap.firefly.XAccessModifier
					.create("Protected");
			sap.firefly.XAccessModifier.PUBLIC = sap.firefly.XAccessModifier
					.create("Public");
		},
		create : function(name) {
			var drillState = new sap.firefly.XAccessModifier();
			drillState.setName(name);
			return drillState;
		}
	}
});
$Firefly.createClass("sap.firefly.XAmountValue", sap.firefly.XObject, {
	$statics : {
		create : function(value) {
			var object = new sap.firefly.XAmountValue();
			object.setAmountValue(value);
			return object;
		}
	},
	m_amountValue : null,
	releaseObject : function() {
		this.m_amountValue = null;
		sap.firefly.XAmountValue.$superclass.releaseObject.call(this);
	},
	getAmountValue : function() {
		return this.m_amountValue;
	},
	setAmountValue : function(amountValue) {
		this.m_amountValue = amountValue;
	},
	getComponentType : function() {
		return this.getValueType();
	},
	getValueType : function() {
		return sap.firefly.XValueType.AMOUNT;
	},
	isEqualTo : function(other) {
		var otherValue;
		if (other === null) {
			return false;
		}
		if (this === other) {
			return true;
		}
		if (this.getValueType() !== (other).getValueType()) {
			return false;
		}
		otherValue = other;
		return sap.firefly.XString.isEqual(this.m_amountValue,
				otherValue.m_amountValue);
	},
	resetValue : function(value) {
		var otherValue;
		if (value === null) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		if (this === value) {
			return;
		}
		if (this.getValueType() !== value.getValueType()) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		otherValue = value;
		this.m_amountValue = otherValue.m_amountValue;
	},
	clone : function() {
		return sap.firefly.XAmountValue.create(this.m_amountValue);
	},
	getStringRepresentation : function() {
		return this.m_amountValue;
	},
	toString : function() {
		return this.m_amountValue;
	}
});
$Firefly.createClass("sap.firefly.XBooleanValue", sap.firefly.XObject,
		{
			$statics : {
				create : function(value) {
					var objectBoolean = new sap.firefly.XBooleanValue();
					objectBoolean.setBooleanValue(value);
					return objectBoolean;
				}
			},
			m_booleanValue : false,
			getBooleanValue : function() {
				return this.m_booleanValue;
			},
			setBooleanValue : function(booleanValue) {
				this.m_booleanValue = booleanValue;
			},
			getComponentType : function() {
				return this.getValueType();
			},
			getValueType : function() {
				return sap.firefly.XValueType.BOOLEAN;
			},
			resetValue : function(value) {
				var otherValue;
				if (value === null) {
					throw sap.firefly.XException
							.createIllegalArgumentException("illegal value");
				}
				if (this === value) {
					return;
				}
				if (this.getValueType() !== value.getValueType()) {
					throw sap.firefly.XException
							.createIllegalArgumentException("illegal value");
				}
				otherValue = value;
				this.m_booleanValue = otherValue.m_booleanValue;
			},
			isEqualTo : function(other) {
				var otherValue;
				if (other === null) {
					return false;
				}
				if (this === other) {
					return true;
				}
				if (this.getValueType() !== (other).getValueType()) {
					return false;
				}
				otherValue = other;
				return this.m_booleanValue === otherValue.m_booleanValue;
			},
			clone : function() {
				return sap.firefly.XBooleanValue.create(this.m_booleanValue);
			},
			getStringRepresentation : function() {
				return sap.firefly.XBoolean
						.convertBooleanToString(this.m_booleanValue);
			},
			toString : function() {
				return sap.firefly.XBoolean
						.convertBooleanToString(this.m_booleanValue);
			}
		});
$Firefly.createClass("sap.firefly.XDoubleValue", sap.firefly.XObject, {
	$statics : {
		create : function(value) {
			var objectDouble = new sap.firefly.XDoubleValue();
			objectDouble.setDoubleValue(value);
			return objectDouble;
		}
	},
	m_doubleValue : 0,
	getDoubleValue : function() {
		return this.m_doubleValue;
	},
	setDoubleValue : function(doubleValue) {
		this.m_doubleValue = doubleValue;
	},
	getComponentType : function() {
		return this.getValueType();
	},
	getValueType : function() {
		return sap.firefly.XValueType.DOUBLE;
	},
	isEqualTo : function(other) {
		var otherValue;
		if (other === null) {
			return false;
		}
		if (this === other) {
			return true;
		}
		if (this.getValueType() !== (other).getValueType()) {
			return false;
		}
		otherValue = other;
		return this.m_doubleValue === otherValue.m_doubleValue;
	},
	resetValue : function(value) {
		var otherValue;
		if (value === null) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		if (this === value) {
			return;
		}
		if (this.getValueType() !== value.getValueType()) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		otherValue = value;
		this.m_doubleValue = otherValue.m_doubleValue;
	},
	clone : function() {
		return sap.firefly.XDoubleValue.create(this.m_doubleValue);
	},
	getStringRepresentation : function() {
		return sap.firefly.XDouble.convertDoubleToString(this.m_doubleValue);
	},
	toString : function() {
		return sap.firefly.XDouble.convertDoubleToString(this.m_doubleValue);
	}
});
$Firefly.createClass("sap.firefly.XIntegerValue", sap.firefly.XObject,
		{
			$statics : {
				create : function(value) {
					var objectInteger = new sap.firefly.XIntegerValue();
					objectInteger.setIntegerValue(value);
					return objectInteger;
				}
			},
			m_integerValue : 0,
			getIntegerValue : function() {
				return this.m_integerValue;
			},
			setIntegerValue : function(integerValue) {
				this.m_integerValue = integerValue;
			},
			getComponentType : function() {
				return this.getValueType();
			},
			getValueType : function() {
				return sap.firefly.XValueType.INTEGER;
			},
			isEqualTo : function(other) {
				var othervalue;
				if (other === null) {
					return false;
				}
				if (this === other) {
					return true;
				}
				if (this.getValueType() !== (other).getValueType()) {
					return false;
				}
				othervalue = other;
				return this.m_integerValue === othervalue.m_integerValue;
			},
			resetValue : function(value) {
				var othervalue;
				if (value === null) {
					throw sap.firefly.XException
							.createIllegalArgumentException("illegal value");
				}
				if (this === value) {
					return;
				}
				if (this.getValueType() !== value.getValueType()) {
					throw sap.firefly.XException
							.createIllegalArgumentException("illegal value");
				}
				othervalue = value;
				this.m_integerValue = othervalue.m_integerValue;
			},
			clone : function() {
				return sap.firefly.XIntegerValue.create(this.m_integerValue);
			},
			getStringRepresentation : function() {
				return sap.firefly.XInteger
						.convertIntegerToString(this.m_integerValue);
			},
			toString : function() {
				return sap.firefly.XInteger
						.convertIntegerToString(this.m_integerValue);
			}
		});
$Firefly.createClass("sap.firefly.XLongValue", sap.firefly.XObject, {
	$statics : {
		create : function(value) {
			var objectLong = new sap.firefly.XLongValue();
			objectLong.setLongValue(value);
			return objectLong;
		}
	},
	m_longValue : 0,
	getLongValue : function() {
		return this.m_longValue;
	},
	setLongValue : function(longValue) {
		this.m_longValue = longValue;
	},
	getComponentType : function() {
		return this.getValueType();
	},
	getValueType : function() {
		return sap.firefly.XValueType.LONG;
	},
	isEqualTo : function(other) {
		var otherValue;
		if (other === null) {
			return false;
		}
		if (this === other) {
			return true;
		}
		if (this.getValueType() !== (other).getValueType()) {
			return false;
		}
		otherValue = other;
		return this.m_longValue === otherValue.m_longValue;
	},
	resetValue : function(value) {
		var otherValue;
		if (value === null) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		if (this === value) {
			return;
		}
		if (this.getValueType() !== value.getValueType()) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		otherValue = value;
		this.m_longValue = otherValue.m_longValue;
	},
	clone : function() {
		return sap.firefly.XLongValue.create(this.m_longValue);
	},
	getStringRepresentation : function() {
		return sap.firefly.XLong.convertLongToString(this.m_longValue);
	},
	toString : function() {
		return sap.firefly.XLong.convertLongToString(this.m_longValue);
	}
});
$Firefly.createClass("sap.firefly.XMember", sap.firefly.XClassElement, {
	$statics : {
		create : function(name, accessModifier) {
			var member = new sap.firefly.XMember();
			member.setName(name);
			member.m_accessModifier = accessModifier;
			return member;
		}
	}
});
$Firefly.createClass("sap.firefly.XMethod", sap.firefly.XClassElement, {
	$statics : {
		create : function(name, accessModifier) {
			var method = new sap.firefly.XMethod();
			method.setName(name);
			method.m_accessModifier = accessModifier;
			return method;
		}
	}
});
$Firefly.createClass("sap.firefly.XNumcValue", sap.firefly.XObject, {
	$statics : {
		create : function(value) {
			var object = new sap.firefly.XNumcValue();
			object.setNumcValue(value);
			return object;
		}
	},
	m_numcValue : null,
	releaseObject : function() {
		this.m_numcValue = null;
		sap.firefly.XNumcValue.$superclass.releaseObject.call(this);
	},
	getNumcValue : function() {
		return this.m_numcValue;
	},
	setNumcValue : function(numcValue) {
		this.m_numcValue = numcValue;
	},
	getComponentType : function() {
		return this.getValueType();
	},
	getValueType : function() {
		return sap.firefly.XValueType.NUMC;
	},
	isEqualTo : function(other) {
		var otherValue;
		if (other === null) {
			return false;
		}
		if (this === other) {
			return true;
		}
		if (this.getValueType() !== (other).getValueType()) {
			return false;
		}
		otherValue = other;
		return sap.firefly.XString.isEqual(this.m_numcValue,
				otherValue.m_numcValue);
	},
	resetValue : function(value) {
		var otherValue;
		if (value === null) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		if (this === value) {
			return;
		}
		if (this.getValueType() !== value.getValueType()) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		otherValue = value;
		this.m_numcValue = otherValue.m_numcValue;
	},
	clone : function() {
		return sap.firefly.XNumcValue.create(this.m_numcValue);
	},
	toString : function() {
		return this.m_numcValue;
	},
	getStringRepresentation : function() {
		return this.m_numcValue;
	}
});
$Firefly.createClass("sap.firefly.XStringValue", sap.firefly.XObject, {
	$statics : {
		create : function(value) {
			var object = new sap.firefly.XStringValue();
			object.setStringValue(value);
			return object;
		}
	},
	m_stringValue : null,
	releaseObject : function() {
		this.m_stringValue = null;
		sap.firefly.XStringValue.$superclass.releaseObject.call(this);
	},
	getStringValue : function() {
		return this.m_stringValue;
	},
	setStringValue : function(stringValue) {
		this.m_stringValue = stringValue;
	},
	getComponentType : function() {
		return this.getValueType();
	},
	getValueType : function() {
		return sap.firefly.XValueType.STRING;
	},
	isEqualTo : function(other) {
		var otherValue;
		if (other === null) {
			return false;
		}
		if (this === other) {
			return true;
		}
		if (this.getValueType() !== (other).getValueType()) {
			return false;
		}
		otherValue = other;
		return sap.firefly.XString.isEqual(this.m_stringValue,
				otherValue.m_stringValue);
	},
	resetValue : function(value) {
		var otherValue;
		if (value === null) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		if (this === value) {
			return;
		}
		if (this.getValueType() !== value.getValueType()) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		otherValue = value;
		this.m_stringValue = otherValue.m_stringValue;
	},
	clone : function() {
		return sap.firefly.XStringValue.create(this.m_stringValue);
	},
	getStringRepresentation : function() {
		return this.m_stringValue;
	},
	toString : function() {
		return this.m_stringValue;
	}
});
$Firefly.createClass("sap.firefly.OriginLayer", sap.firefly.XConstant, {
	$statics : {
		SERVER : null,
		PROTOCOL : null,
		IOLAYER : null,
		DRIVER : null,
		APPLICATION : null,
		UTILITY : null,
		staticSetup : function() {
			sap.firefly.OriginLayer.SERVER = sap.firefly.OriginLayer
					.create("Server");
			sap.firefly.OriginLayer.PROTOCOL = sap.firefly.OriginLayer
					.create("Protocol");
			sap.firefly.OriginLayer.IOLAYER = sap.firefly.OriginLayer
					.create("IOLayer");
			sap.firefly.OriginLayer.DRIVER = sap.firefly.OriginLayer
					.create("Driver");
			sap.firefly.OriginLayer.APPLICATION = sap.firefly.OriginLayer
					.create("Application");
			sap.firefly.OriginLayer.UTILITY = sap.firefly.OriginLayer
					.create("Utility");
		},
		create : function(constant) {
			var sp = new sap.firefly.OriginLayer();
			sp.setName(constant);
			return sp;
		}
	}
});
$Firefly.createClass("sap.firefly.Severity", sap.firefly.XConstant, {
	$statics : {
		INFO : null,
		WARNING : null,
		ERROR : null,
		SEMANTICAL_ERROR : null,
		staticSetup : function() {
			sap.firefly.Severity.INFO = sap.firefly.Severity.create("Info");
			sap.firefly.Severity.WARNING = sap.firefly.Severity
					.create("Warning");
			sap.firefly.Severity.ERROR = sap.firefly.Severity.create("Error");
			sap.firefly.Severity.SEMANTICAL_ERROR = sap.firefly.Severity
					.create("SemanticalError");
		},
		create : function(constant) {
			var sp = new sap.firefly.Severity();
			sp.setName(constant);
			return sp;
		}
	}
});
$Firefly.createClass("sap.firefly.XValueFormat", sap.firefly.XConstant, {
	$statics : {
		ISO_DATE : null,
		SAP_DATE : null,
		staticSetup : function() {
			sap.firefly.XValueFormat.ISO_DATE = sap.firefly.XValueFormat
					.create("IsoDate");
			sap.firefly.XValueFormat.SAP_DATE = sap.firefly.XValueFormat
					.create("SapDate");
		},
		create : function(constant) {
			var vt = new sap.firefly.XValueFormat();
			vt.setupConstant(constant);
			return vt;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.XDate",
				sap.firefly.XObject,
				{
					$statics : {
						createDate : function() {
							return new sap.firefly.XDate();
						},
						createCurrentLocalDate : function() {
							return sap.firefly.XDateTimeProvider.getInstance()
									.getCurrentDateAtLocalTimezone();
						},
						createDateWithValues : function(year, month, day) {
							var date = new sap.firefly.XDate();
							date.setYear(year);
							date.setMonthOfYear(month);
							date.setDayOfMonth(day);
							return date;
						},
						createDateFromStringWithFlag : function(date,
								isSapFormat) {
							if ((date === null)
									|| sap.firefly.XString.isEqual(date, "")) {
								return null;
							}
							if (isSapFormat) {
								return sap.firefly.XDate
										.createDateFromSAPFormat(date);
							}
							return sap.firefly.XDate
									.createDateFromIsoFormat(date);
						},
						createDateFromString : function(date, valueFormat) {
							var strLen;
							if (date === null) {
								return null;
							}
							if (valueFormat === sap.firefly.XValueFormat.ISO_DATE) {
								return sap.firefly.XDate
										.createDateFromIsoFormat(date);
							} else {
								if (valueFormat === sap.firefly.XValueFormat.SAP_DATE) {
									return sap.firefly.XDate
											.createDateFromSAPFormat(date);
								}
							}
							strLen = sap.firefly.XString.size(date);
							if (strLen === 8) {
								return sap.firefly.XDate
										.createDateFromSAPFormat(date);
							} else {
								if (strLen === 10) {
									return sap.firefly.XDate
											.createDateFromIsoFormat(date);
								}
							}
							return null;
						},
						createDateFromIsoFormat : function(date) {
							var posDateTimeDelim;
							var yearString;
							var year;
							var monthString;
							var month;
							var dayString;
							var day;
							if (sap.firefly.XString.size(date) !== 10) {
								posDateTimeDelim = sap.firefly.XString.indexOf(
										date, "T");
								if (posDateTimeDelim > 0) {
									return sap.firefly.XDate
											.createDateFromIsoFormat(sap.firefly.XString
													.substring(date, 0,
															posDateTimeDelim));
								}
								return null;
							}
							yearString = sap.firefly.XString.substring(date, 0,
									4);
							year = sap.firefly.XInteger
									.convertStringToIntegerWithRadix(
											yearString, 10);
							monthString = sap.firefly.XString.substring(date,
									5, 7);
							month = sap.firefly.XInteger
									.convertStringToIntegerWithRadix(
											monthString, 10);
							dayString = sap.firefly.XString.substring(date, 8,
									10);
							day = sap.firefly.XInteger
									.convertStringToIntegerWithRadix(dayString,
											10);
							return sap.firefly.XDate.createDateWithValues(year,
									month, day);
						},
						createDateFromSAPFormat : function(date) {
							var yearString;
							var year;
							var monthString;
							var month;
							var dayString;
							var day;
							if (sap.firefly.XString.size(date) !== 8) {
								return null;
							}
							yearString = sap.firefly.XString.substring(date, 0,
									4);
							year = sap.firefly.XInteger
									.convertStringToIntegerWithRadix(
											yearString, 10);
							monthString = sap.firefly.XString.substring(date,
									4, 6);
							month = sap.firefly.XInteger
									.convertStringToIntegerWithRadix(
											monthString, 10);
							dayString = sap.firefly.XString.substring(date, 6,
									8);
							day = sap.firefly.XInteger
									.convertStringToIntegerWithRadix(dayString,
											10);
							return sap.firefly.XDate.createDateWithValues(year,
									month, day);
						},
						padWithZeros : function(buffer, start, end) {
							var i;
							for (i = start; i < end; i++) {
								buffer.append("0");
							}
						}
					},
					m_year : 0,
					m_month : 0,
					m_day : 0,
					toIsoFormat : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						var year = sap.firefly.XInteger
								.convertIntegerToString(this.m_year);
						var size = sap.firefly.XString.size(year);
						var month;
						var day;
						sap.firefly.XDate.padWithZeros(buffer, size, 4);
						buffer.append(year);
						buffer.append("-");
						month = sap.firefly.XInteger
								.convertIntegerToString(this.m_month);
						size = sap.firefly.XString.size(month);
						sap.firefly.XDate.padWithZeros(buffer, size, 2);
						buffer.append(month);
						buffer.append("-");
						day = sap.firefly.XInteger
								.convertIntegerToString(this.m_day);
						size = sap.firefly.XString.size(day);
						sap.firefly.XDate.padWithZeros(buffer, size, 2);
						buffer.append(day);
						return buffer.toString();
					},
					toSAPFormat : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						var year = sap.firefly.XInteger
								.convertIntegerToString(this.m_year);
						var size = sap.firefly.XString.size(year);
						var month;
						var day;
						sap.firefly.XDate.padWithZeros(buffer, size, 4);
						buffer.append(year);
						month = sap.firefly.XInteger
								.convertIntegerToString(this.m_month);
						size = sap.firefly.XString.size(month);
						sap.firefly.XDate.padWithZeros(buffer, size, 2);
						buffer.append(month);
						day = sap.firefly.XInteger
								.convertIntegerToString(this.m_day);
						size = sap.firefly.XString.size(day);
						sap.firefly.XDate.padWithZeros(buffer, size, 2);
						buffer.append(day);
						return buffer.toString();
					},
					getMonthOfYear : function() {
						return this.m_month;
					},
					setMonthOfYear : function(month) {
						if ((month < 0) || (month > 12)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal month of year");
						}
						this.m_month = month;
					},
					getYear : function() {
						return this.m_year;
					},
					setYear : function(year) {
						if (year < 0) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal year");
						}
						this.m_year = year;
					},
					getDayOfMonth : function() {
						return this.m_day;
					},
					setDayOfMonth : function(day) {
						if ((day < 0) || (day > 31)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal day of month");
						}
						this.m_day = day;
					},
					getComponentType : function() {
						return this.getValueType();
					},
					getValueType : function() {
						return sap.firefly.XValueType.DATE;
					},
					clone : function() {
						return sap.firefly.XDate.createDateWithValues(
								this.m_year, this.m_month, this.m_day);
					},
					resetValue : function(value) {
						var otherValue;
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						if (this === value) {
							return;
						}
						if (this.getValueType() !== value.getValueType()) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						otherValue = value;
						this.setYear(otherValue.m_year);
						this.setMonthOfYear(otherValue.m_month);
						this.setDayOfMonth(otherValue.m_day);
					},
					isEqualTo : function(other) {
						var otherValue;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						if (this.getValueType() !== (other).getValueType()) {
							return false;
						}
						otherValue = other;
						return ((this.m_year === otherValue.m_year)
								&& (this.m_month === otherValue.m_month) && (this.m_day === otherValue.m_day));
					},
					getStringRepresentation : function() {
						return this.toIsoFormat();
					},
					toString : function() {
						return this.toIsoFormat();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XTime",
				sap.firefly.XObject,
				{
					$statics : {
						MILLISECONDS_MAX_VALUE : 9999999,
						MILLISECONDS_FRACTIONS_SIZE : 7,
						createCurrentLocalTime : function() {
							return sap.firefly.XDateTimeProvider.getInstance()
									.getCurrentTimeAtLocalTimezone();
						},
						createTime : function() {
							return new sap.firefly.XTime();
						},
						createTimeWithValues : function(hour, minute, second,
								millisecond) {
							var time = new sap.firefly.XTime();
							time.setHourOfDay(hour);
							time.setMinuteOfHour(minute);
							time.setSecondOfMinute(second);
							time.setMillisecondOfSecond(millisecond);
							return time;
						},
						createTimeFromStringWithFlag : function(time,
								isSapFormat) {
							if (sap.firefly.XStringUtils.isNullOrEmpty(time)) {
								return null;
							}
							if (isSapFormat) {
								return sap.firefly.XTime
										.createTimeFromSAPFormat(time);
							}
							return sap.firefly.XTime
									.createTimeFromIsoFormat(time);
						},
						createTimeFromString : function(time, valueFormat) {
							var timeLength;
							if (sap.firefly.XStringUtils.isNullOrEmpty(time)) {
								return null;
							}
							if (valueFormat === sap.firefly.XValueFormat.ISO_DATE) {
								return sap.firefly.XTime
										.createTimeFromIsoFormat(time);
							} else {
								if (valueFormat === sap.firefly.XValueFormat.SAP_DATE) {
									return sap.firefly.XTime
											.createTimeFromSAPFormat(time);
								}
							}
							timeLength = sap.firefly.XString.size(time);
							if (timeLength === 8) {
								return sap.firefly.XTime
										.createTimeFromIsoFormat(time);
							} else {
								if (timeLength === 6) {
									return sap.firefly.XTime
											.createTimeFromSAPFormat(time);
								}
							}
							return null;
						},
						createTimeFromIsoFormat : function(time) {
							var size;
							var hourString;
							var hour;
							var minuteString;
							var minute;
							var secondString;
							var second;
							var millis;
							var firstFractionPosition;
							var fractionLastPosition;
							var exponent;
							var fraction;
							var i;
							if (sap.firefly.XStringUtils.isNullOrEmpty(time)) {
								return null;
							}
							size = sap.firefly.XString.size(time);
							if (size < 8) {
								throw sap.firefly.XException
										.createIllegalArgumentException(sap.firefly.XString
												.concatenate2(
														"Not the ISO time format, expected HH:MM:SS.0000000, but is ",
														time));
							}
							hourString = sap.firefly.XString.substring(time, 0,
									2);
							hour = sap.firefly.XInteger
									.convertStringToIntegerWithRadix(
											hourString, 10);
							minuteString = sap.firefly.XString.substring(time,
									3, 5);
							minute = sap.firefly.XInteger
									.convertStringToIntegerWithRadix(
											minuteString, 10);
							secondString = sap.firefly.XString.substring(time,
									6, 8);
							second = sap.firefly.XInteger
									.convertStringToIntegerWithRadix(
											secondString, 10);
							millis = 0;
							if (size > 8) {
								if (sap.firefly.XString.isEqual(
										sap.firefly.XString.substring(time, 8,
												9), ".")) {
									firstFractionPosition = 9;
									if (size > firstFractionPosition) {
										fractionLastPosition = firstFractionPosition
												+ sap.firefly.XString
														.size(sap.firefly.XString
																.substring(
																		time,
																		firstFractionPosition,
																		size));
										exponent = sap.firefly.XTime.MILLISECONDS_FRACTIONS_SIZE - 1;
										fraction = -1;
										for (i = firstFractionPosition; i < fractionLastPosition; i++) {
											if (exponent < 0) {
												break;
											}
											fraction = sap.firefly.XInteger
													.convertStringToIntegerWithDefault(
															sap.firefly.XString
																	.substring(
																			time,
																			i,
																			i + 1),
															-1);
											if (fraction > -1) {
												millis = sap.firefly.XDouble
														.convertDoubleToInt((millis + (sap.firefly.XMath
																.pow(10,
																		exponent) * fraction)));
												exponent = exponent - 1;
											}
										}
									}
								}
							}
							return sap.firefly.XTime.createTimeWithValues(hour,
									minute, second, millis);
						},
						createTimeFromSAPFormat : function(time) {
							var hourString;
							var hour;
							var minuteString;
							var minute;
							var secondString;
							var second;
							if (sap.firefly.XStringUtils.isNullOrEmpty(time)) {
								return null;
							}
							if (sap.firefly.XString.size(time) !== 6) {
								throw sap.firefly.XException
										.createIllegalArgumentException(sap.firefly.XString
												.concatenate2(
														"Not the SAP time format, expected HHMMSS, but is ",
														time));
							}
							hourString = sap.firefly.XString.substring(time, 0,
									2);
							hour = sap.firefly.XInteger
									.convertStringToInteger(hourString);
							minuteString = sap.firefly.XString.substring(time,
									2, 4);
							minute = sap.firefly.XInteger
									.convertStringToInteger(minuteString);
							secondString = sap.firefly.XString.substring(time,
									4, 6);
							second = sap.firefly.XInteger
									.convertStringToInteger(secondString);
							return sap.firefly.XTime.createTimeWithValues(hour,
									minute, second, 0);
						},
						addNumberPadded : function(buffer, number, digits) {
							var numberAsString = sap.firefly.XInteger
									.convertIntegerToString(number);
							var size = sap.firefly.XString.size(numberAsString);
							var i;
							for (i = size; i < digits; i++) {
								buffer.append("0");
							}
							buffer.append(numberAsString);
						}
					},
					m_hour : 0,
					m_minute : 0,
					m_second : 0,
					m_millisecond : 0,
					getHourOfDay : function() {
						return this.m_hour;
					},
					setHourOfDay : function(hour) {
						if ((hour < 0) || (hour > 23)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal hour of day");
						}
						this.m_hour = hour;
					},
					getMinuteOfHour : function() {
						return this.m_minute;
					},
					setMinuteOfHour : function(minute) {
						if ((minute < 0) || (minute > 59)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal minute of hour");
						}
						this.m_minute = minute;
					},
					getSecondOfMinute : function() {
						return this.m_second;
					},
					setSecondOfMinute : function(second) {
						if ((second < 0) || (second > 59)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal second of minute");
						}
						this.m_second = second;
					},
					getMillisecondOfSecond : function() {
						return this.m_millisecond;
					},
					setMillisecondOfSecond : function(millisecond) {
						if ((millisecond < 0)
								|| (millisecond > sap.firefly.XTime.MILLISECONDS_MAX_VALUE)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal millisecond of second");
						}
						this.m_millisecond = millisecond;
					},
					getComponentType : function() {
						return this.getValueType();
					},
					getValueType : function() {
						return sap.firefly.XValueType.TIME;
					},
					toIsoFormat : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						sap.firefly.XTime.addNumberPadded(buffer, this.m_hour,
								2);
						buffer.append(":");
						sap.firefly.XTime.addNumberPadded(buffer,
								this.m_minute, 2);
						buffer.append(":");
						sap.firefly.XTime.addNumberPadded(buffer,
								this.m_second, 2);
						if (this.m_millisecond > 0) {
							buffer.append(".");
							sap.firefly.XTime
									.addNumberPadded(
											buffer,
											this.m_millisecond,
											sap.firefly.XTime.MILLISECONDS_FRACTIONS_SIZE);
						}
						return buffer.toString();
					},
					toSAPFormat : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						sap.firefly.XTime.addNumberPadded(buffer, this.m_hour,
								2);
						sap.firefly.XTime.addNumberPadded(buffer,
								this.m_minute, 2);
						sap.firefly.XTime.addNumberPadded(buffer,
								this.m_second, 2);
						return buffer.toString();
					},
					resetValue : function(value) {
						var otherValue;
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						if (this === value) {
							return;
						}
						if (this.getValueType() !== value.getValueType()) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						otherValue = value;
						this.setHourOfDay(otherValue.m_hour);
						this.setMinuteOfHour(otherValue.m_minute);
						this.setSecondOfMinute(otherValue.m_second);
						this.setMillisecondOfSecond(otherValue.m_millisecond);
					},
					clone : function() {
						return sap.firefly.XTime.createTimeWithValues(
								this.m_hour, this.m_minute, this.m_second,
								this.m_millisecond);
					},
					isEqualTo : function(other) {
						var otherValue;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						if (this.getValueType() !== (other).getValueType()) {
							return false;
						}
						otherValue = other;
						return ((this.m_hour === otherValue.m_hour)
								&& (this.m_minute === otherValue.m_minute)
								&& (this.m_second === otherValue.m_second) && (this.m_millisecond === otherValue.m_millisecond));
					},
					getStringRepresentation : function() {
						return this.toIsoFormat();
					},
					toString : function() {
						return this.toIsoFormat();
					}
				});
$Firefly.createClass("sap.firefly.XTimeSpan", sap.firefly.XObject, {
	$statics : {
		create : function(timespan) {
			var object = new sap.firefly.XTimeSpan();
			object.setTimeSpan(timespan);
			return object;
		}
	},
	m_timeSpan : 0,
	getComponentType : function() {
		return this.getValueType();
	},
	getValueType : function() {
		return sap.firefly.XValueType.TIMESPAN;
	},
	getTimeSpan : function() {
		return this.m_timeSpan;
	},
	setTimeSpan : function(value) {
		this.m_timeSpan = value;
	},
	resetValue : function(value) {
		var otherValue;
		if (value === null) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		if (this === value) {
			return;
		}
		if (this.getValueType() !== value.getValueType()) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		otherValue = value;
		this.m_timeSpan = otherValue.m_timeSpan;
	},
	clone : function() {
		return sap.firefly.XTimeSpan.create(this.m_timeSpan);
	},
	isEqualTo : function(other) {
		var otherValue;
		if (other === null) {
			return false;
		}
		if (this === other) {
			return true;
		}
		if (this.getValueType() !== (other).getValueType()) {
			return false;
		}
		otherValue = other;
		return this.m_timeSpan === otherValue.m_timeSpan;
	},
	getStringRepresentation : function() {
		return sap.firefly.XLong.convertLongToString(this.m_timeSpan);
	},
	toString : function() {
		return sap.firefly.XLong.convertLongToString(this.m_timeSpan);
	}
});
$Firefly.createClass("sap.firefly.XLanguageValue", sap.firefly.XObject, {
	$statics : {
		create : function(value) {
			var object = new sap.firefly.XLanguageValue();
			object.setLanguageValue(value);
			return object;
		}
	},
	m_languageValue : null,
	releaseObject : function() {
		this.m_languageValue = null;
		sap.firefly.XLanguageValue.$superclass.releaseObject.call(this);
	},
	getLanguageValue : function() {
		return this.m_languageValue;
	},
	setLanguageValue : function(languageValue) {
		this.m_languageValue = languageValue;
	},
	getComponentType : function() {
		return this.getValueType();
	},
	getValueType : function() {
		return sap.firefly.XValueType.LANGUAGE;
	},
	isEqualTo : function(other) {
		var otherValue;
		if (other === null) {
			return false;
		}
		if (this === other) {
			return true;
		}
		if (this.getValueType() !== (other).getValueType()) {
			return false;
		}
		otherValue = other;
		return sap.firefly.XString.isEqual(this.m_languageValue,
				otherValue.m_languageValue);
	},
	resetValue : function(value) {
		var otherValue;
		if (value === null) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		if (this === value) {
			return;
		}
		if (this.getValueType() !== value.getValueType()) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		otherValue = value;
		this.m_languageValue = otherValue.m_languageValue;
	},
	clone : function() {
		return sap.firefly.XLanguageValue.create(this.m_languageValue);
	},
	getStringRepresentation : function() {
		return this.m_languageValue;
	},
	toString : function() {
		return this.m_languageValue;
	}
});
$Firefly
		.createClass(
				"sap.firefly.LifeCycleState",
				sap.firefly.XConstant,
				{
					$statics : {
						INITIAL : null,
						STARTING_UP : null,
						ACTIVE : null,
						SHUTTING_DOWN : null,
						TERMINATED : null,
						RELEASED : null,
						staticSetup : function() {
							sap.firefly.LifeCycleState.INITIAL = sap.firefly.LifeCycleState
									.create("Initial", 0);
							sap.firefly.LifeCycleState.STARTING_UP = sap.firefly.LifeCycleState
									.create("StartingUp", 1);
							sap.firefly.LifeCycleState.ACTIVE = sap.firefly.LifeCycleState
									.create("Active", 2);
							sap.firefly.LifeCycleState.SHUTTING_DOWN = sap.firefly.LifeCycleState
									.create("ShuttingDown", 3);
							sap.firefly.LifeCycleState.TERMINATED = sap.firefly.LifeCycleState
									.create("Terminated", 4);
							sap.firefly.LifeCycleState.RELEASED = sap.firefly.LifeCycleState
									.create("Released", 5);
						},
						create : function(name, code) {
							var newConstant = new sap.firefly.LifeCycleState();
							newConstant.setName(name);
							newConstant.m_code = code;
							return newConstant;
						}
					},
					m_code : 0,
					getCode : function() {
						return this.m_code;
					}
				});
$Firefly.createClass("sap.firefly.SyncState", sap.firefly.XConstant, {
	$statics : {
		OUT_OF_SYNC : null,
		PROCESSING : null,
		IN_SYNC : null,
		staticSetup : function() {
			sap.firefly.SyncState.OUT_OF_SYNC = sap.firefly.SyncState.create(
					"OUT_OF_SYNC", 0);
			sap.firefly.SyncState.PROCESSING = sap.firefly.SyncState.create(
					"PROCESSING", 1);
			sap.firefly.SyncState.IN_SYNC = sap.firefly.SyncState.create(
					"IN_SYNC", 2);
		},
		create : function(name, level) {
			var newConstant = new sap.firefly.SyncState();
			newConstant.setName(name);
			newConstant.setLevel(level);
			return newConstant;
		}
	},
	m_level : 0,
	getLevel : function() {
		return this.m_level;
	},
	setLevel : function(level) {
		this.m_level = level;
	}
});
$Firefly.createClass("sap.firefly.SyncType", sap.firefly.XConstant, {
	$statics : {
		BLOCKING : null,
		NON_BLOCKING : null,
		DELAYED : null,
		REGISTER : null,
		UNREGISTER : null,
		staticSetup : function() {
			sap.firefly.SyncType.BLOCKING = sap.firefly.SyncType
					.create("Blocking");
			sap.firefly.SyncType.NON_BLOCKING = sap.firefly.SyncType
					.create("NonBlocking");
			sap.firefly.SyncType.DELAYED = sap.firefly.SyncType
					.create("Delayed");
			sap.firefly.SyncType.REGISTER = sap.firefly.SyncType
					.create("Register");
			sap.firefly.SyncType.UNREGISTER = sap.firefly.SyncType
					.create("Unregister");
		},
		create : function(name) {
			var newConstant = new sap.firefly.SyncType();
			newConstant.setName(name);
			return newConstant;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.WorkingTaskManagerType",
				sap.firefly.XConstant,
				{
					$statics : {
						SINGLE_THREADED : null,
						MULTI_THREADED : null,
						UI_DRIVER : null,
						staticSetup : function() {
							sap.firefly.WorkingTaskManagerType.SINGLE_THREADED = sap.firefly.WorkingTaskManagerType
									.create("SingleThreaded");
							sap.firefly.WorkingTaskManagerType.MULTI_THREADED = sap.firefly.WorkingTaskManagerType
									.create("MultiThreaded");
							sap.firefly.WorkingTaskManagerType.UI_DRIVER = sap.firefly.WorkingTaskManagerType
									.create("UiDriver");
						},
						create : function(name) {
							var newConstant = new sap.firefly.WorkingTaskManagerType();
							newConstant.setName(name);
							return newConstant;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XComponentType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						_ROOT : null,
						_ACTION : null,
						_UI : null,
						_DATASOURCE : null,
						_MODEL : null,
						_VALUE : null,
						_GENERIC : null,
						s_lookupAll : null,
						createType : function(name, parent) {
							var newConstant = new sap.firefly.XComponentType();
							newConstant.setup(name, parent);
							return newConstant;
						},
						staticSetupComponentType : function(set) {
							sap.firefly.XComponentType.s_lookupAll = set;
							sap.firefly.XComponentType._ROOT = sap.firefly.XComponentType
									.createType("_root", null);
							sap.firefly.XComponentType._ACTION = sap.firefly.XComponentType
									.createType("_action",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.XComponentType._UI = sap.firefly.XComponentType
									.createType("_ui",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.XComponentType._DATASOURCE = sap.firefly.XComponentType
									.createType("_datasource",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.XComponentType._MODEL = sap.firefly.XComponentType
									.createType("_model",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.XComponentType._VALUE = sap.firefly.XComponentType
									.createType("_value",
											sap.firefly.XComponentType._ROOT);
							sap.firefly.XComponentType._GENERIC = sap.firefly.XComponentType
									.createType("_generic",
											sap.firefly.XComponentType._ROOT);
						},
						lookupComponentType : function(name) {
							return sap.firefly.XComponentType.s_lookupAll
									.getByKey(name);
						}
					},
					setup : function(name, parent) {
						this.setParent(parent);
						this.setName(name);
						sap.firefly.XComponentType.s_lookupAll.put(this);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ExtendedInfoType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						UNKNOWN : null,
						CONTEXT_STRUCTURE : null,
						staticSetup : function() {
							sap.firefly.ExtendedInfoType.UNKNOWN = sap.firefly.ExtendedInfoType
									.create("UNKNOWN", null);
							sap.firefly.ExtendedInfoType.CONTEXT_STRUCTURE = sap.firefly.ExtendedInfoType
									.create("CONTEXT_STRUCTURE", null);
						},
						create : function(constant, parent) {
							var sp = new sap.firefly.ExtendedInfoType();
							sp.setName(constant);
							sp.setParent(parent);
							return sp;
						}
					}
				});
$Firefly.createClass("sap.firefly.XDateTime", sap.firefly.XObject, {
	$statics : {
		createCurrentLocalDateTime : function() {
			return sap.firefly.XDateTimeProvider.getInstance()
					.getCurrentDateTimeAtLocalTimezone();
		},
		createDateTime : function() {
			var result = new sap.firefly.XDateTime();
			result.m_date = sap.firefly.XDate.createDate();
			result.m_time = sap.firefly.XTime.createTime();
			return result;
		},
		createDateTimeWithValues : function(year, month, day, hour, minute,
				second, millisecond) {
			var result = sap.firefly.XDateTime.createDateTime();
			result.setYear(year);
			result.setMonthOfYear(month);
			result.setDayOfMonth(day);
			result.setHourOfDay(hour);
			result.setMinuteOfHour(minute);
			result.setSecondOfMinute(second);
			result.setMillisecondOfSecond(millisecond);
			return result;
		},
		createDateTimeFromStringWithFlag : function(dateTime, isSapFormat) {
			if ((dateTime === null)
					|| sap.firefly.XString.isEqual(dateTime, "")) {
				return null;
			}
			if (isSapFormat) {
				return sap.firefly.XDateTime
						.createDateTimeFromSAPFormat(dateTime);
			}
			return sap.firefly.XDateTime.createDateTimeFromIsoFormat(dateTime);
		},
		createDateTimeFromString : function(dateTime, valueFormat) {
			if ((valueFormat === sap.firefly.XValueFormat.ISO_DATE)
					|| (valueFormat === null)) {
				return sap.firefly.XDateTime
						.createDateTimeFromIsoFormat(dateTime);
			}
			return sap.firefly.XDateTime.createDateTimeFromSAPFormat(dateTime);
		},
		createDateTimeFromIsoFormat : function(dateTime) {
			var result = new sap.firefly.XDateTime();
			var dateString = sap.firefly.XString.substring(dateTime, 0, 10);
			var timeString;
			result.m_date = sap.firefly.XDate
					.createDateFromIsoFormat(dateString);
			if (result.m_date === null) {
				return null;
			}
			if (sap.firefly.XString.size(dateTime) <= sap.firefly.XString
					.size(dateString)) {
				result.m_time = sap.firefly.XTime.createTime();
			} else {
				timeString = sap.firefly.XString.substring(dateTime, 11,
						sap.firefly.XString.size(dateTime));
				result.m_time = sap.firefly.XTime
						.createTimeFromIsoFormat(timeString);
			}
			return result;
		},
		createDateTimeFromSAPFormat : function(dateTime) {
			var result = new sap.firefly.XDateTime();
			var dateString = sap.firefly.XString.substring(dateTime, 0, 8);
			var timeString;
			result.m_date = sap.firefly.XDate
					.createDateFromSAPFormat(dateString);
			if (result.m_date === null) {
				return null;
			}
			timeString = sap.firefly.XString.substring(dateTime, 8, 14);
			result.m_time = sap.firefly.XTime
					.createTimeFromSAPFormat(timeString);
			return result;
		}
	},
	m_date : null,
	m_time : null,
	releaseObject : function() {
		this.m_date = sap.firefly.XObject.releaseIfNotNull(this.m_date);
		this.m_time = sap.firefly.XObject.releaseIfNotNull(this.m_time);
		sap.firefly.XDateTime.$superclass.releaseObject.call(this);
	},
	getYear : function() {
		return this.m_date.getYear();
	},
	setYear : function(year) {
		this.m_date.setYear(year);
	},
	getMonthOfYear : function() {
		return this.m_date.getMonthOfYear();
	},
	setMonthOfYear : function(month) {
		this.m_date.setMonthOfYear(month);
	},
	getDayOfMonth : function() {
		return this.m_date.getDayOfMonth();
	},
	setDayOfMonth : function(day) {
		this.m_date.setDayOfMonth(day);
	},
	getHourOfDay : function() {
		return this.m_time.getHourOfDay();
	},
	setHourOfDay : function(hour) {
		this.m_time.setHourOfDay(hour);
	},
	getMinuteOfHour : function() {
		return this.m_time.getMinuteOfHour();
	},
	setMinuteOfHour : function(minute) {
		this.m_time.setMinuteOfHour(minute);
	},
	getSecondOfMinute : function() {
		return this.m_time.getSecondOfMinute();
	},
	setSecondOfMinute : function(second) {
		this.m_time.setSecondOfMinute(second);
	},
	getMillisecondOfSecond : function() {
		return this.m_time.getMillisecondOfSecond();
	},
	setMillisecondOfSecond : function(millisecond) {
		this.m_time.setMillisecondOfSecond(millisecond);
	},
	toIsoFormat : function() {
		return sap.firefly.XStringUtils.concatenate3(this.m_date.toIsoFormat(),
				"T", this.m_time.toIsoFormat());
	},
	toIso8601Format : function() {
		return sap.firefly.XStringUtils.concatenate4(this.m_date.toIsoFormat(),
				"T", this.m_time.toIsoFormat(), "Z");
	},
	toSAPFormat : function() {
		var sb = sap.firefly.XStringBuffer.create();
		sb.append(this.m_date.toSAPFormat());
		sb.append(this.m_time.toSAPFormat());
		return sb.toString();
	},
	getComponentType : function() {
		return this.getValueType();
	},
	getValueType : function() {
		return sap.firefly.XValueType.DATE_TIME;
	},
	clone : function() {
		var result = new sap.firefly.XDateTime();
		result.m_date = this.m_date.clone();
		result.m_time = this.m_time.clone();
		return result;
	},
	resetValue : function(value) {
		var otherValueType;
		var otherValue;
		if (value === null) {
			throw sap.firefly.XException
					.createIllegalArgumentException("illegal value");
		}
		if (this === value) {
			return;
		}
		otherValueType = value.getValueType();
		if (this.getValueType() !== otherValueType) {
			if (otherValueType === sap.firefly.XValueType.DATE) {
				this.m_date.resetValue(value);
			} else {
				if (otherValueType === sap.firefly.XValueType.TIME) {
					this.m_time.resetValue(value);
				} else {
					throw sap.firefly.XException
							.createIllegalArgumentException("illegal value");
				}
			}
		} else {
			otherValue = value;
			this.m_date.resetValue(otherValue.m_date);
			this.m_time.resetValue(otherValue.m_time);
		}
	},
	isEqualTo : function(other) {
		var otherValue;
		if (other === null) {
			return false;
		}
		if (this === other) {
			return true;
		}
		if (this.getValueType() !== (other).getValueType()) {
			return false;
		}
		otherValue = other;
		return ((this.m_date.isEqualTo(otherValue.m_date)) && (this.m_time
				.isEqualTo(otherValue.m_time)));
	},
	getStringRepresentation : function() {
		return this.toIsoFormat();
	},
	toString : function() {
		return this.toIsoFormat();
	},
	getDate : function() {
		return this.m_date;
	},
	getTime : function() {
		return this.m_time;
	}
});
$Firefly
		.createClass(
				"sap.firefly.XValueType",
				sap.firefly.XComponentType,
				{
					$statics : {
						BOOLEAN : null,
						KEY_VALUE : null,
						BYTE_ARRAY : null,
						LIST : null,
						INTEGER : null,
						DOUBLE : null,
						LONG : null,
						NUMC : null,
						DATE_TIME : null,
						DATE : null,
						TIME : null,
						LANGUAGE : null,
						DECIMAL_FLOAT : null,
						CALENDAR_DAY : null,
						TIMESPAN : null,
						PERCENT : null,
						STRING : null,
						PROPERTIES : null,
						STRUCTURE : null,
						STRUCTURE_LIST : null,
						UNSUPPORTED : null,
						ERROR_VALUE : null,
						POLYGON : null,
						MULTI_POLYGON : null,
						MULTI_POINT : null,
						POINT : null,
						LINE_STRING : null,
						MULTI_LINE_STRING : null,
						LOWER_CASE_STRING : null,
						UPPER_CASE_STRING : null,
						URI : null,
						VARIABLE : null,
						AMOUNT : null,
						QUANTITY : null,
						PRICE : null,
						DIMENSION_MEMBER : null,
						ENUM_CONSTANT : null,
						CURRENT_MEMBER : null,
						OPTION_LIST : null,
						OPTION_VALUE : null,
						ARRAY : null,
						staticSetup : function() {
							sap.firefly.XValueType.BOOLEAN = sap.firefly.XValueType
									.create("Boolean", 0, 0);
							sap.firefly.XValueType.NUMC = sap.firefly.XValueType
									.create("Numc", 0, 0);
							sap.firefly.XValueType.INTEGER = sap.firefly.XValueType
									.create("Integer", 0, 0);
							sap.firefly.XValueType.DOUBLE = sap.firefly.XValueType
									.create("Double", 7, 2);
							sap.firefly.XValueType.DECIMAL_FLOAT = sap.firefly.XValueType
									.create("DecimalFloat", 7, 2);
							sap.firefly.XValueType.LONG = sap.firefly.XValueType
									.create("Long", 0, 0);
							sap.firefly.XValueType.PERCENT = sap.firefly.XValueType
									.create("Percent", 7, 3);
							sap.firefly.XValueType.STRING = sap.firefly.XValueType
									.create("String", 0, 0);
							sap.firefly.XValueType.LOWER_CASE_STRING = sap.firefly.XValueType
									.create("LowerCaseString", 0, 0);
							sap.firefly.XValueType.UPPER_CASE_STRING = sap.firefly.XValueType
									.create("UpperCaseString", 0, 0);
							sap.firefly.XValueType.DATE = sap.firefly.XValueType
									.create("Date", 0, 0);
							sap.firefly.XValueType.DATE_TIME = sap.firefly.XValueType
									.create("DateTime", 0, 0);
							sap.firefly.XValueType.CALENDAR_DAY = sap.firefly.XValueType
									.create("CalendarDay", 0, 0);
							sap.firefly.XValueType.AMOUNT = sap.firefly.XValueType
									.create("Amount", 7, 2);
							sap.firefly.XValueType.QUANTITY = sap.firefly.XValueType
									.create("Quantity", 7, 2);
							sap.firefly.XValueType.PRICE = sap.firefly.XValueType
									.create("Price", 7, 2);
							sap.firefly.XValueType.DIMENSION_MEMBER = sap.firefly.XValueType
									.create("DimensionMember", 0, 0);
							sap.firefly.XValueType.TIMESPAN = sap.firefly.XValueType
									.create("TimeSpan", 0, 0);
							sap.firefly.XValueType.TIME = sap.firefly.XValueType
									.create("Time", 0, 0);
							sap.firefly.XValueType.LANGUAGE = sap.firefly.XValueType
									.create("Language", 0, 0);
							sap.firefly.XValueType.PROPERTIES = sap.firefly.XValueType
									.create("Properties", 0, 0);
							sap.firefly.XValueType.STRUCTURE = sap.firefly.XValueType
									.create("Structure", 0, 0);
							sap.firefly.XValueType.STRUCTURE_LIST = sap.firefly.XValueType
									.create("StructureList", 0, 0);
							sap.firefly.XValueType.KEY_VALUE = sap.firefly.XValueType
									.create("KeyValue", 0, 0);
							sap.firefly.XValueType.BYTE_ARRAY = sap.firefly.XValueType
									.create("ByteArray", 0, 0);
							sap.firefly.XValueType.URI = sap.firefly.XValueType
									.create("Uri", 0, 0);
							sap.firefly.XValueType.VARIABLE = sap.firefly.XValueType
									.create("Variable", 0, 0);
							sap.firefly.XValueType.UNSUPPORTED = sap.firefly.XValueType
									.create("Unsupported", 0, 0);
							sap.firefly.XValueType.ENUM_CONSTANT = sap.firefly.XValueType
									.create("EnumConstant", 0, 0);
							sap.firefly.XValueType.POLYGON = sap.firefly.XValueType
									.create("Polygon", 0, 0);
							sap.firefly.XValueType.MULTI_POLYGON = sap.firefly.XValueType
									.create("MultiPolygon", 0, 0);
							sap.firefly.XValueType.POINT = sap.firefly.XValueType
									.create("Point", 0, 0);
							sap.firefly.XValueType.MULTI_POINT = sap.firefly.XValueType
									.create("MultiPoint", 0, 0);
							sap.firefly.XValueType.LINE_STRING = sap.firefly.XValueType
									.create("LineString", 0, 0);
							sap.firefly.XValueType.MULTI_LINE_STRING = sap.firefly.XValueType
									.create("MultiLineString", 0, 0);
							sap.firefly.XValueType.CURRENT_MEMBER = sap.firefly.XValueType
									.create("CurrentMember", 0, 0);
							sap.firefly.XValueType.ARRAY = sap.firefly.XValueType
									.create("Array", 0, 0);
							sap.firefly.XValueType.OPTION_LIST = sap.firefly.XValueType
									.create("OptionList", 0, 0);
							sap.firefly.XValueType.OPTION_VALUE = sap.firefly.XValueType
									.create("OptionValue", 0, 0);
						},
						create : function(constant, defaultPrecision,
								defaultDecimals) {
							var vt = new sap.firefly.XValueType();
							vt.setup(constant,
									sap.firefly.XComponentType._VALUE);
							vt.m_decimals = defaultDecimals;
							vt.m_precision = defaultPrecision;
							return vt;
						}
					},
					m_decimals : 0,
					m_precision : 0,
					isBoolean : function() {
						return (this === sap.firefly.XValueType.BOOLEAN);
					},
					isNumber : function() {
						return ((this === sap.firefly.XValueType.INTEGER)
								|| (this === sap.firefly.XValueType.DOUBLE)
								|| (this === sap.firefly.XValueType.LONG)
								|| (this === sap.firefly.XValueType.PERCENT)
								|| (this === sap.firefly.XValueType.NUMC) || (this === sap.firefly.XValueType.DECIMAL_FLOAT));
					},
					isString : function() {
						return ((this === sap.firefly.XValueType.STRING)
								|| (this === sap.firefly.XValueType.LOWER_CASE_STRING) || (this === sap.firefly.XValueType.UPPER_CASE_STRING));
					},
					isDateBased : function() {
						return ((this === sap.firefly.XValueType.DATE)
								|| (this === sap.firefly.XValueType.DATE_TIME) || (this === sap.firefly.XValueType.CALENDAR_DAY));
					},
					isDateTime : function() {
						return ((this.isDateBased())
								|| (this === sap.firefly.XValueType.TIMESPAN) || (this === sap.firefly.XValueType.TIME));
					},
					isSpatial : function() {
						return ((this === sap.firefly.XValueType.POINT)
								|| (this === sap.firefly.XValueType.MULTI_POINT)
								|| (this === sap.firefly.XValueType.POLYGON)
								|| (this === sap.firefly.XValueType.MULTI_POLYGON)
								|| (this === sap.firefly.XValueType.LINE_STRING) || (this === sap.firefly.XValueType.MULTI_LINE_STRING));
					},
					isVariable : function() {
						return (this === sap.firefly.XValueType.VARIABLE);
					},
					getDefaultDecimalPlaces : function() {
						return this.m_decimals;
					},
					getDefaultPrecision : function() {
						return this.m_precision;
					}
				});
$Firefly.createClass("sap.firefly.CoreModule", sap.firefly.DfModule, {
	$statics : {
		s_module : null,
		getInstance : function() {
			return sap.firefly.CoreModule
					.initVersion(sap.firefly.XVersion.API_DEFAULT);
		},
		initVersion : function(version) {
			if (sap.firefly.CoreModule.s_module === null) {
				sap.firefly.CoreModule.s_module = new sap.firefly.CoreModule();
				sap.firefly.XVersion.staticSetupByVersion(version);
				sap.firefly.XSyncEnv.staticSetup();
				sap.firefly.XLanguage.staticSetup();
				sap.firefly.XSortDirection.staticSetup();
				sap.firefly.Severity.staticSetup();
				sap.firefly.XValueFormat.staticSetup();
				sap.firefly.XAutoReleaseManager.staticSetup();
				sap.firefly.ConstantValue.staticSetup();
				sap.firefly.XPlatform.staticSetup();
				sap.firefly.TraceType.staticSetup();
				sap.firefly.OriginLayer.staticSetup();
				sap.firefly.TriStateBool.staticSetup();
				sap.firefly.WorkingTaskManagerType.staticSetup();
				sap.firefly.XStringUtils.staticSetup();
				sap.firefly.ExtendedInfoType.staticSetup();
				sap.firefly.XAccessModifier.staticSetup();
			}
			return sap.firefly.CoreModule.s_module;
		}
	}
});
sap.firefly.CoreModule.getInstance();