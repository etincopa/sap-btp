$Firefly.createClass("sap.firefly.DfXFileSystem", sap.firefly.XObject, {
	getFileSystemType : function() {
		return sap.firefly.XFileSystemType.OS;
	},
	isExisting : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	isHidden : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	mkdir : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	mkdirs : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	canHaveChildren : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	getChildren : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	hasChildren : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	getRoots : function() {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	setLastModified : function(nativePath, time) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	getLastModified : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	isWriteable : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	setWritable : function(nativePath, writable, ownerOnly) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	isReadable : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	setReadable : function(nativePath, readable, ownerOnly) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	setReadOnly : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	isExecutable : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	setExecutable : function(nativePath, executable, ownerOnly) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	length : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	save : function(nativePath, data) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	saveGzipped : function(nativePath, data) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	deleteFile : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	createNewFile : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	renameTo : function(sourceNativePath, destNativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	isDirectory : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	isFile : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	getLastModifiedTimestamp : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	loadExt : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	loadGzipped : function(nativePath) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	}
});
$Firefly.createClass("sap.firefly.JsonParserErrorCode", sap.firefly.XObject, {
	$statics : {
		JSON_PARSER_ROOT_ERROR : 2000,
		JSON_PARSER_ILLEGAL_STATE : 2001,
		staticSetup : function() {
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.JsonParserFactory",
				sap.firefly.XObject,
				{
					$statics : {
						s_jsonParserFactory : null,
						staticSetupJsonParserFactory : function() {
							var defaultFactory = new sap.firefly.JsonParserFactory();
							sap.firefly.JsonParserFactory
									.setJsonParserFactory(defaultFactory);
						},
						newInstance : function() {
							return sap.firefly.JsonParserFactory.s_jsonParserFactory
									.newParserInstance();
						},
						createFromString : function(simpleJson) {
							var json = sap.firefly.XString.replace(simpleJson,
									"'", '"');
							var parser = sap.firefly.JsonParserFactory
									.newInstance();
							var rootElement = parser.parse(json);
							if (parser.isValid() && (rootElement !== null)) {
								return rootElement;
							}
							throw sap.firefly.XException
									.createIllegalArgumentException(parser
											.getSummary());
						},
						createFromSafeString : function(simpleJson) {
							var parser = sap.firefly.JsonParserFactory
									.newInstance();
							var rootElement = parser.parseUnsafe(simpleJson);
							if (parser.isValid() && (rootElement !== null)) {
								return rootElement;
							}
							throw sap.firefly.XException
									.createIllegalArgumentException(parser
											.getSummary());
						},
						setJsonParserFactory : function(jsonParserFactory) {
							sap.firefly.JsonParserFactory.s_jsonParserFactory = jsonParserFactory;
						}
					},
					newParserInstance : function() {
						return null;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.JxJsonParserStackElement",
				sap.firefly.XObject,
				{
					$statics : {
						create : function() {
							var jsonLevelInfo = new sap.firefly.JxJsonParserStackElement();
							jsonLevelInfo.reset();
							return jsonLevelInfo;
						}
					},
					m_element : null,
					m_name : null,
					m_valueSet : false,
					m_hasElements : false,
					m_isPreparedForNextElement : false,
					reset : function() {
						this.m_element = null;
						this.m_name = null;
						this.m_valueSet = false;
						this.m_hasElements = false;
						this.m_isPreparedForNextElement = false;
					},
					getElement : function() {
						return this.m_element;
					},
					setElement : function(element) {
						this.m_element = element;
					},
					getName : function() {
						return this.m_name;
					},
					setName : function(name) {
						this.m_name = name;
					},
					isNameSet : function() {
						return (this.m_name !== null);
					},
					setValueSet : function(valueSet) {
						this.m_valueSet = valueSet;
					},
					isValueSet : function() {
						return this.m_valueSet;
					},
					addElement : function() {
						if (this.m_hasElements === false) {
							if (this.m_isPreparedForNextElement) {
								return false;
							}
							this.m_hasElements = true;
							return true;
						}
						if (this.m_isPreparedForNextElement === false) {
							return false;
						}
						this.m_isPreparedForNextElement = false;
						return true;
					},
					nextElement : function() {
						if (this.m_isPreparedForNextElement) {
							return false;
						}
						if (this.m_hasElements === false) {
							return false;
						}
						this.m_isPreparedForNextElement = true;
						return true;
					},
					finishElements : function() {
						if (this.m_isPreparedForNextElement) {
							return false;
						}
						return true;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.JsonSerializerFactory",
				sap.firefly.XObject,
				{
					$statics : {
						s_jsonSerializerToNativeFactory : null,
						staticSetupJsonSerializerFactory : function() {
							var defaultFactory = new sap.firefly.JsonSerializerFactory();
							sap.firefly.JsonSerializerFactory
									.setSerializerToNativeFactory(defaultFactory);
						},
						newInstance : function() {
							return sap.firefly.JsonSerializerToString.create();
						},
						newInstanceForNative : function() {
							return sap.firefly.JsonSerializerFactory.s_jsonSerializerToNativeFactory
									.newInstanceToNative();
						},
						setSerializerToNativeFactory : function(
								jsonSerializerFactory) {
							sap.firefly.JsonSerializerFactory.s_jsonSerializerToNativeFactory = jsonSerializerFactory;
						}
					},
					newInstanceToNative : function() {
						return null;
					}
				});
$Firefly.createClass("sap.firefly.JsonSerializerToString", sap.firefly.XObject,
		{
			$statics : {
				create : function() {
					var object = new sap.firefly.JsonSerializerToString();
					return object;
				}
			},
			serialize : function(element) {
				if (element === null) {
					throw sap.firefly.XException
							.createIllegalStateException("element is null");
				}
				return sap.firefly.PrToString.serialize(element, false, false,
						0);
			},
			serializePrettyPrint : function(element, sortStructureElements,
					prettyPrint, indentation) {
				if (element === null) {
					throw sap.firefly.XException
							.createIllegalStateException("element is null");
				}
				return sap.firefly.PrToString.serialize(element,
						sortStructureElements, prettyPrint, indentation);
			}
		});
$Firefly.createClass("sap.firefly.JsonUtils", sap.firefly.XObject, {
	$statics : {
		parseJsonString : function(jsonString) {
			var parser;
			var rootElement;
			if (sap.firefly.XStringUtils.isNullOrEmpty(jsonString)) {
				return null;
			}
			parser = sap.firefly.JsonParserFactory.newInstance();
			rootElement = parser.parse(jsonString);
			if (parser.isValid() === false) {
				return null;
			}
			return rootElement;
		}
	}
});
$Firefly.createClass("sap.firefly.SystemMapping", sap.firefly.XObject, {
	$statics : {
		create : function(serializeTable, serializeSchema, deserializeTable,
				deserializeSchema) {
			var systemMappingData = new sap.firefly.SystemMapping();
			systemMappingData.m_serializeTable = serializeTable;
			systemMappingData.m_serializeSchema = serializeSchema;
			systemMappingData.m_deserializeTable = deserializeTable;
			systemMappingData.m_deserializeSchema = deserializeSchema;
			return systemMappingData;
		}
	},
	m_serializeTable : null,
	m_serializeSchema : null,
	m_deserializeTable : null,
	m_deserializeSchema : null,
	releaseObject : function() {
		sap.firefly.SystemMapping.$superclass.releaseObject.call(this);
		this.m_serializeTable = null;
		this.m_serializeSchema = null;
		this.m_deserializeTable = null;
		this.m_deserializeSchema = null;
	},
	getSerializeTable : function() {
		return this.m_serializeTable;
	},
	getSerializeSchema : function() {
		return this.m_serializeSchema;
	},
	getDeserializeTable : function() {
		return this.m_deserializeTable;
	},
	getDeserializeSchema : function() {
		return this.m_deserializeSchema;
	},
	toString : function() {
		var s = sap.firefly.XStringBuffer.create();
		s.append("{serializeTable=").append(this.m_serializeTable);
		s.append(", serializeSchema=").append(this.m_serializeSchema);
		s.append(", deserializeTable=").append(this.m_deserializeTable);
		s.append(", deserializeSchema=").append(this.m_deserializeSchema);
		return s.append("}").toString();
	}
});
$Firefly.createClass("sap.firefly.TraceInfo", sap.firefly.XObject, {
	$statics : {
		create : function() {
			var newObject = new sap.firefly.TraceInfo();
			newObject.m_traceType = sap.firefly.TraceType.NONE;
			return newObject;
		}
	},
	m_traceType : null,
	m_traceName : null,
	m_traceFolderPath : null,
	m_traceFolderInternal : null,
	m_traceIndex : 0,
	releaseObject : function() {
		this.m_traceFolderInternal = null;
		this.m_traceFolderPath = null;
		this.m_traceName = null;
		this.m_traceType = null;
		sap.firefly.TraceInfo.$superclass.releaseObject.call(this);
	},
	getTraceType : function() {
		return this.m_traceType;
	},
	setTraceType : function(traceType) {
		this.m_traceType = traceType;
	},
	getTraceName : function() {
		return this.m_traceName;
	},
	setTraceName : function(traceName) {
		this.m_traceName = traceName;
	},
	getTraceFolderPath : function() {
		return this.m_traceFolderPath;
	},
	setTraceFolderPath : function(traceFolderPath) {
		this.m_traceFolderPath = traceFolderPath;
	},
	getTraceFolderInternal : function() {
		return this.m_traceFolderInternal;
	},
	setTraceFolderInternal : function(traceFolderInternal) {
		this.m_traceFolderInternal = traceFolderInternal;
	},
	getTraceIndex : function() {
		return this.m_traceIndex;
	},
	incrementTraceIndex : function() {
		this.m_traceIndex++;
	}
});
$Firefly.createClass("sap.firefly.XAuthenticationToken", sap.firefly.XObject, {
	$statics : {
		create : function(accessToken) {
			var token = new sap.firefly.XAuthenticationToken();
			token.m_accessToken = accessToken;
			return token;
		}
	},
	m_accessToken : null,
	getAccessToken : function() {
		return this.m_accessToken;
	}
});
$Firefly.createClass("sap.firefly.HtmlForm", sap.firefly.XObject, {
	$statics : {
		create : function(originSite, html) {
			var newObject = new sap.firefly.HtmlForm();
			newObject.setupHttpForm(originSite, html);
			return newObject;
		},
		findHtmlValue : function(html, offset, prefixMarker, parameter) {
			var myOffset = offset;
			var value;
			var fullParameter;
			var valueStart;
			var valueEnd;
			if (prefixMarker !== null) {
				myOffset = sap.firefly.XString.indexOfFrom(html, prefixMarker,
						myOffset);
			}
			value = null;
			if (myOffset >= 0) {
				fullParameter = sap.firefly.XString.concatenate2(parameter,
						'="');
				valueStart = sap.firefly.XString.indexOfFrom(html,
						fullParameter, myOffset);
				if (valueStart >= 0) {
					valueStart = valueStart
							+ sap.firefly.XString.size(fullParameter);
					valueEnd = sap.firefly.XString.indexOfFrom(html, '"',
							valueStart);
					if (valueEnd !== -1) {
						value = sap.firefly.XString.substring(html, valueStart,
								valueEnd);
					}
				} else {
					fullParameter = sap.firefly.XString.concatenate2(parameter,
							"='");
					valueStart = sap.firefly.XString.indexOfFrom(html,
							fullParameter, myOffset);
					if (valueStart >= 0) {
						valueStart = valueStart
								+ sap.firefly.XString.size(fullParameter);
						valueEnd = sap.firefly.XString.indexOfFrom(html, "'",
								valueStart);
						if (valueEnd !== -1) {
							value = sap.firefly.XString.substring(html,
									valueStart, valueEnd);
						}
					}
				}
			}
			return value;
		}
	},
	m_isValid : false,
	m_values : null,
	m_types : null,
	m_action : null,
	m_target : null,
	m_originSite : null,
	setupHttpForm : function(originSite, html) {
		var formStart;
		var formEnd;
		var theForm;
		var offset;
		var nextOffset;
		var endOffset;
		var inputTag;
		var inputType;
		var inputName;
		var inputValue;
		this.m_originSite = originSite;
		this.m_values = sap.firefly.XProperties.create();
		this.m_types = sap.firefly.XProperties.create();
		formStart = sap.firefly.XString.indexOf(html, "<form");
		if (formStart !== -1) {
			formEnd = sap.firefly.XString.indexOfFrom(html, "</form>",
					formStart);
			if (formEnd !== -1) {
				theForm = sap.firefly.XString.substring(html, formStart,
						formEnd);
				this.m_action = sap.firefly.HtmlForm.findHtmlValue(theForm, 0,
						null, "action");
				if (sap.firefly.XStringUtils
						.isNotNullAndNotEmpty(this.m_action)) {
					this.m_isValid = true;
					offset = sap.firefly.XString.indexOf(theForm, ">");
					while (offset !== -1) {
						nextOffset = sap.firefly.XString.indexOfFrom(theForm,
								"<input", offset);
						if (nextOffset === -1) {
							break;
						}
						endOffset = sap.firefly.XString.indexOfFrom(theForm,
								">", nextOffset);
						inputTag = sap.firefly.XString.substring(theForm,
								nextOffset, endOffset);
						inputType = sap.firefly.HtmlForm.findHtmlValue(
								inputTag, 0, null, "type");
						if (inputType === null) {
							inputType = "";
						}
						inputName = sap.firefly.HtmlForm.findHtmlValue(
								inputTag, 0, null, "name");
						inputValue = sap.firefly.HtmlForm.findHtmlValue(
								inputTag, 0, null, "value");
						if (inputValue === null) {
							inputValue = "";
						}
						if (inputName !== null) {
							this.m_values.put(inputName, inputValue);
							this.m_types.put(inputName, inputType);
						}
						offset = endOffset;
					}
				}
			}
		}
	},
	getParameters : function() {
		return this.m_values;
	},
	getAction : function() {
		return this.m_action;
	},
	getParameterValue : function(key) {
		return this.m_values.getByKey(key);
	},
	getParameterType : function(key) {
		return this.m_types.getByKey(key);
	},
	getNames : function() {
		return this.m_values.getKeysAsIteratorOfString();
	},
	getTarget : function() {
		if (this.m_target === null) {
			this.m_target = sap.firefly.XUri.createFromUriWithParent(
					this.m_action, this.m_originSite, false);
		}
		return this.m_target;
	},
	setTarget : function(target) {
		this.m_target = target;
	},
	getOriginSite : function() {
		return this.m_originSite;
	},
	set : function(name, value) {
		this.m_values.put(name, value);
	},
	isValid : function() {
		return this.m_isValid;
	},
	toString : function() {
		var buffer = sap.firefly.XStringBuffer.create();
		var iterator;
		var key;
		var type;
		buffer.append("action=");
		buffer.append(this.m_action);
		buffer.appendNewLine();
		iterator = this.m_values.getKeysAsIteratorOfString();
		while (iterator.hasNext()) {
			key = iterator.next();
			type = this.m_types.getByKey(key);
			buffer.append(key);
			buffer.append("[");
			buffer.append(type);
			buffer.append("]=");
			buffer.append(this.m_values.getByKey(key));
			buffer.appendNewLine();
		}
		return buffer.toString();
	}
});
$Firefly
		.createClass(
				"sap.firefly.HttpClientFactory",
				sap.firefly.XObject,
				{
					$statics : {
						s_clientFactoryMap : null,
						staticSetup : function() {
							sap.firefly.HttpClientFactory.s_clientFactoryMap = sap.firefly.XHashMapByString
									.create();
						},
						newInstanceByProtocol : function(session, protocolType) {
							var clientFactory = sap.firefly.HttpClientFactory.s_clientFactoryMap
									.getByKey(protocolType.getUriName());
							if (clientFactory !== null) {
								return clientFactory
										.newHttpClientInstance(session);
							}
							return null;
						},
						newInstanceByConnection : function(session, connection) {
							var uri = connection.getUriStringExt(true, false,
									false, true, false, false, false);
							var clientFactory = sap.firefly.HttpClientFactory.s_clientFactoryMap
									.getByKey(uri);
							if (clientFactory !== null) {
								return clientFactory
										.newHttpClientInstance(session);
							}
							uri = connection.getUriStringExt(true, false, true,
									false, false, false, false);
							clientFactory = sap.firefly.HttpClientFactory.s_clientFactoryMap
									.getByKey(uri);
							if (clientFactory !== null) {
								return clientFactory
										.newHttpClientInstance(session);
							}
							return null;
						},
						setHttpClientFactoryForProtocol : function(
								protocolType, httpClientFactory) {
							sap.firefly.HttpClientFactory.s_clientFactoryMap
									.put(protocolType.getUriName(),
											httpClientFactory);
						},
						setHttpClientFactoryForConnection : function(
								connection, httpClientFactory) {
							var uriValue = connection.getUriStringExt(true,
									false, true, true, false, false, false);
							sap.firefly.HttpClientFactory.s_clientFactoryMap
									.put(uriValue, httpClientFactory);
						}
					},
					newHttpClientInstance : function(session) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.HttpConstants",
				sap.firefly.XObject,
				{
					$statics : {
						FIREFLY_USER_AGENT : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
						HTTP_11 : "HTTP/1.1",
						UTF_8 : "UTF-8",
						GZIP : "GZIP",
						HTTP_CRLF : "\r\n",
						HD_CONTENT_LENGTH : "Content-Length",
						HD_SET_COOKIE : "Set-Cookie",
						HD_COOKIE : "Cookie",
						HD_HOST : "Host",
						HD_ACCEPT : "Accept",
						HD_ACCEPT_LANGUAGE : "Accept-Language",
						HD_ACCEPT_CHARSET : "Accept-Charset",
						VA_LANGUAGE_ENGLISH : "en",
						HD_ACCEPT_ENCODING : "Accept-Encoding",
						HD_USER_AGENT : "User-Agent",
						HD_CACHE_CONTROL : "Cache-Control",
						HD_CONNECTION : "Connection",
						HD_REFERER : "Referer",
						HD_ORIGIN : "Origin",
						VA_CONNECTION_CLOSE : "close",
						VA_CONNECTION_KEEP_ALIVE : "keep-alive",
						HD_CONTENT_TYPE : "Content-Type",
						HD_CONTENT_ENCODING : "Content-Encoding",
						HD_LOCATION : "Location",
						HD_AUTHORIZATION : "Authorization",
						VA_AUTHORIZATION_BASIC : "Basic",
						VA_AUTHORIZATION_BEARER : "Bearer",
						HD_TRANSFER_ENCODING : "Transfer-Encoding",
						VA_TRANSFER_ENCODING_CHUNKED : "Chunked",
						HD_WWW_AUTHENTICATE : "WWW-Authenticate",
						HD_CSRF_TOKEN : "X-Csrf-Token",
						HD_BOE_SESSION_TOKEN : "X-Boe-Session-Token",
						VA_CSRF_FETCH : "Fetch",
						VA_CSRF_REQUIRED : "Required",
						HD_SAP_URL_SESSION_ID : "sap-url-session-id",
						HD_E_TAG : "ETag",
						HD_LAST_MODIFIED : "Last-Modified",
						HD_MYSAPSSO2 : "mysapsso2",
						HD_SAP_CLIENT_ID : "x-sap-cid",
						s_camelCaseLookupByLowerCase : null,
						staticSetup : function() {
							sap.firefly.HttpConstants.s_camelCaseLookupByLowerCase = sap.firefly.XHashMapOfStringByString
									.create();
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_CONTENT_LENGTH);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_SET_COOKIE);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_COOKIE);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_HOST);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_ACCEPT);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_ACCEPT_LANGUAGE);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_ACCEPT_CHARSET);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.VA_LANGUAGE_ENGLISH);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_ACCEPT_ENCODING);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_USER_AGENT);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_CACHE_CONTROL);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_CONNECTION);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_REFERER);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_ORIGIN);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.VA_CONNECTION_CLOSE);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.VA_CONNECTION_KEEP_ALIVE);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_CONTENT_TYPE);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_CONTENT_ENCODING);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_LOCATION);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_AUTHORIZATION);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_TRANSFER_ENCODING);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.VA_TRANSFER_ENCODING_CHUNKED);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.VA_AUTHORIZATION_BASIC);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.VA_AUTHORIZATION_BEARER);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_WWW_AUTHENTICATE);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_CSRF_TOKEN);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_BOE_SESSION_TOKEN);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.VA_CSRF_FETCH);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.VA_CSRF_REQUIRED);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_SAP_URL_SESSION_ID);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_E_TAG);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_LAST_MODIFIED);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_MYSAPSSO2);
							sap.firefly.HttpConstants
									.store(sap.firefly.HttpConstants.HD_SAP_CLIENT_ID);
						},
						store : function(theConstant) {
							sap.firefly.HttpConstants.s_camelCaseLookupByLowerCase
									.put(sap.firefly.XString
											.convertToLowerCase(theConstant),
											theConstant);
						},
						lookupCamelCase : function(anyCaseConstant) {
							var lowerCaseConstant = sap.firefly.XString
									.convertToLowerCase(anyCaseConstant);
							var camelCaseKey = sap.firefly.HttpConstants.s_camelCaseLookupByLowerCase
									.getByKey(lowerCaseConstant);
							if (camelCaseKey === null) {
								return anyCaseConstant;
							}
							return camelCaseKey;
						}
					}
				});
$Firefly.createClass("sap.firefly.HttpEncodings", sap.firefly.XObject, {
	$statics : {
		EN_DEFLATE : "deflate",
		EN_GZIP : "gzip"
	}
});
$Firefly.createClass("sap.firefly.HttpErrorCode", sap.firefly.XObject, {
	$statics : {
		HTTP_ROOT_EXCEPTION : 1000,
		HTTP_MISSING_NATIVE_DRIVER : 1001,
		HTTP_MISSING_BLOCKING_SUPPORT : 1002,
		HTTP_TIMEOUT : 1003,
		HTTP_CLIENT_CANCEL_REQUEST : 1004,
		HTTP_IO_EXCEPTION : 1005,
		HTTP_UNKNOWN_HOST_EXCEPTION : 1006,
		HTTP_WRONG_STATUS_CODE : 1007,
		HTTP_WRONG_CONTENT_TYPE : 1008,
		HTTP_EXCEPTION_WITH_NATIVE_CAUSE : 1009
	}
});
$Firefly
		.createClass(
				"sap.firefly.HttpServerFactory",
				sap.firefly.XObject,
				{
					$statics : {
						s_httpServerFactory : null,
						staticSetupHttpClientFactory : function() {
							var defaultFactory = new sap.firefly.HttpServerFactory();
							sap.firefly.HttpServerFactory
									.setHttpServerFactory(defaultFactory);
						},
						newInstance : function(session, serverConfig,
								useLocalLoop) {
							var localLoopFactory;
							var uri;
							var port;
							var host;
							if (useLocalLoop === false) {
								sap.firefly.HttpServerFactory.s_httpServerFactory
										.newHttpServerInstance(session,
												serverConfig);
							} else {
								localLoopFactory = sap.firefly.HttpLocalLoopFactory
										.create(serverConfig);
								uri = sap.firefly.XUri
										.createFromConnection(serverConfig);
								if (uri.getProtocolType() === null) {
									uri
											.setProtocolType(sap.firefly.ProtocolType.HTTP);
								}
								sap.firefly.HttpClientFactory
										.setHttpClientFactoryForConnection(uri,
												localLoopFactory);
								port = uri.getPort();
								if (port !== 0) {
									host = uri.getHost();
									if (((host === null))
											|| (sap.firefly.XString.isEqual(
													"0.0.0.0", host))) {
										uri.setHost("localhost");
										sap.firefly.HttpClientFactory
												.setHttpClientFactoryForConnection(
														uri, localLoopFactory);
									}
								}
							}
						},
						setHttpServerFactory : function(httpServerFactory) {
							sap.firefly.HttpServerFactory.s_httpServerFactory = httpServerFactory;
						}
					},
					newHttpServerInstance : function(session, serverConfig) {
					}
				});
$Firefly.createClass("sap.firefly.HttpStatusCode", sap.firefly.XObject, {
	$statics : {
		SC_CONTINUE : 100,
		SC_SWITCHING : 101,
		SC_PROCESSING : 102,
		SC_OK : 200,
		SC_CREATED : 201,
		SC_ACCEPTED : 202,
		SC_NON_AUTHORITATIVE : 203,
		SC_NO_CONTENT : 204,
		SC_RESET_CONTENT : 205,
		SC_PARTIAL_CONTENT : 206,
		SC_MULTI_STATUS : 207,
		SC_ALREADY_REPORTED : 208,
		SC_IM_USED : 226,
		SC_MULTIPLE_CHOICES : 300,
		SC_MOVED_PERMANENTLY : 301,
		SC_FOUND : 302,
		SC_SEE_OTHER : 303,
		SC_NOT_FOUND : 404,
		SC_NOT_ACCEPTABLE : 406,
		SC_INTERNAL_SERVER_ERROR : 500,
		SC_JSON_PARSE_ERROR : 607,
		isOk : function(code) {
			return (code >= 200) && (code < 300);
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.HttpCookiesMasterStore",
				sap.firefly.XObject,
				{
					$statics : {
						create : function() {
							var newObj = new sap.firefly.HttpCookiesMasterStore();
							newObj.m_domains = sap.firefly.XHashMapByString
									.create();
							return newObj;
						}
					},
					m_domains : null,
					getCookies : function(domain, path) {
						var cookiesStorage = sap.firefly.HttpCookies.create();
						var currentDomain = domain;
						var domainCookies;
						var folders;
						var buffer;
						var k;
						var currentPath;
						var pathCookies;
						var cookies;
						var i;
						var cookie;
						var nextSubDomain;
						var lastSubDomain;
						while ((currentDomain !== null) && (path !== null)) {
							domainCookies = this.m_domains
									.getByKey(currentDomain);
							if (domainCookies !== null) {
								folders = sap.firefly.XStringTokenizer
										.splitString(path, "/");
								while (folders.size() > 0) {
									buffer = sap.firefly.XStringBuffer.create();
									for (k = 0; k < folders.size(); k++) {
										buffer.append(folders.get(k));
										buffer.append("/");
									}
									currentPath = buffer.toString();
									pathCookies = domainCookies
											.getByKey(currentPath);
									if (pathCookies !== null) {
										cookies = pathCookies
												.getValuesAsReadOnlyList();
										for (i = 0; i < cookies.size(); i++) {
											cookie = cookies.get(i);
											cookiesStorage.addCookie(cookie);
										}
									}
									folders.removeAt(folders.size() - 1);
								}
							}
							nextSubDomain = sap.firefly.XString.indexOfFrom(
									currentDomain, ".", 1);
							lastSubDomain = sap.firefly.XString.lastIndexOf(
									currentDomain, ".");
							if (nextSubDomain === lastSubDomain) {
								break;
							}
							currentDomain = sap.firefly.XString.substring(
									currentDomain, nextSubDomain, -1);
						}
						return cookiesStorage;
					},
					applyCookies : function(domain, path, cookies) {
						var defaultPath = path;
						var allNewCookies;
						var i;
						var cookie;
						var currentDomain;
						var domainCookies;
						var currentPath;
						var pathCookies;
						if ((defaultPath !== null)
								&& (sap.firefly.XString.endsWith(defaultPath,
										"/") === false)) {
							defaultPath = sap.firefly.XString.concatenate2(
									path, "/");
						}
						allNewCookies = cookies.getCookies();
						for (i = 0; i < allNewCookies.size(); i++) {
							cookie = allNewCookies.get(i);
							currentDomain = cookie.getDomain();
							if (currentDomain === null) {
								currentDomain = domain;
							}
							domainCookies = this.m_domains
									.getByKey(currentDomain);
							if (domainCookies === null) {
								domainCookies = sap.firefly.XHashMapByString
										.create();
								this.m_domains
										.put(currentDomain, domainCookies);
							}
							currentPath = cookie.getPath();
							if (currentPath === null) {
								currentPath = path;
							}
							if (sap.firefly.XString.endsWith(currentPath, "/") === false) {
								currentPath = sap.firefly.XString.concatenate2(
										currentPath, "/");
							}
							pathCookies = domainCookies.getByKey(currentPath);
							if (pathCookies === null) {
								pathCookies = sap.firefly.XHashMapByString
										.create();
								domainCookies.put(currentPath, pathCookies);
							}
							pathCookies.put(cookie.getName(), cookie);
						}
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						var domains = this.m_domains
								.getKeysAsReadOnlyListOfString();
						var sortedDomains = sap.firefly.XListOfString
								.createFromReadOnlyList(domains);
						var i;
						var domain;
						var currentDomainStore;
						var paths;
						var sortedPath;
						var k;
						var path;
						var currentPathStore;
						var names;
						var sortedNames;
						var m;
						var name;
						var cookie;
						sortedDomains
								.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
						for (i = 0; i < sortedDomains.size(); i++) {
							if (i > 0) {
								buffer.appendNewLine();
							}
							domain = sortedDomains.get(i);
							buffer.append(domain);
							buffer.appendNewLine();
							buffer
									.append("=====================================");
							buffer.appendNewLine();
							currentDomainStore = this.m_domains
									.getByKey(domain);
							paths = currentDomainStore
									.getKeysAsReadOnlyListOfString();
							sortedPath = sap.firefly.XListOfString
									.createFromReadOnlyList(paths);
							for (k = 0; k < sortedPath.size(); k++) {
								path = sortedPath.get(k);
								buffer.append(path);
								buffer.appendNewLine();
								buffer
										.append("-------------------------------------");
								buffer.appendNewLine();
								currentPathStore = currentDomainStore
										.getByKey(path);
								names = currentPathStore
										.getKeysAsReadOnlyListOfString();
								sortedNames = sap.firefly.XListOfString
										.createFromReadOnlyList(names);
								for (m = 0; m < sortedNames.size(); m++) {
									name = sortedNames.get(m);
									cookie = currentPathStore.getByKey(name);
									buffer.append(cookie.toString());
									buffer.appendNewLine();
								}
							}
						}
						return buffer.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.HttpCoreUtils",
				sap.firefly.XObject,
				{
					$statics : {
						setAuthentication : function(connectionInfo, httpHeader) {
							var authenticationType = connectionInfo
									.getAuthenticationType();
							var base64EncodeValue;
							var userPwdValue;
							var byteArray;
							var base64Encoded;
							var authentication;
							var authenticationToken;
							var authentication2;
							if (authenticationType === sap.firefly.AuthenticationType.BASIC) {
								base64EncodeValue = sap.firefly.XStringBuffer
										.create();
								base64EncodeValue.append(connectionInfo
										.getUser());
								base64EncodeValue.append(":");
								base64EncodeValue.append(connectionInfo
										.getPassword());
								userPwdValue = base64EncodeValue.toString();
								byteArray = sap.firefly.XByteArray
										.convertStringToXByteArrayWithCharset(
												userPwdValue,
												sap.firefly.XCharset.USASCII);
								base64Encoded = sap.firefly.XHttpUtils
										.encodeByteArrayToBase64(byteArray);
								authentication = sap.firefly.XStringBuffer
										.create();
								authentication
										.append(sap.firefly.HttpConstants.VA_AUTHORIZATION_BASIC);
								authentication.append(" ");
								authentication.append(base64Encoded);
								httpHeader
										.setStringValue(
												sap.firefly.HttpConstants.HD_AUTHORIZATION,
												authentication.toString());
							} else {
								if (authenticationType === sap.firefly.AuthenticationType.BEARER) {
									authenticationToken = connectionInfo
											.getAuthenticationToken();
									authentication2 = sap.firefly.XStringBuffer
											.create();
									authentication2
											.append(sap.firefly.HttpConstants.VA_AUTHORIZATION_BEARER);
									authentication2.append(" ");
									authentication2.append(authenticationToken
											.getAccessToken());
									httpHeader
											.setStringValue(
													sap.firefly.HttpConstants.HD_AUTHORIZATION,
													authentication2.toString());
								}
							}
						},
						setHostName : function(systemDescription, httpHeader) {
							var hostNameBuf = sap.firefly.XStringBuffer
									.create();
							var port;
							var protocolType;
							var isHttp80;
							var isHttps443;
							hostNameBuf.append(systemDescription.getHost());
							port = systemDescription.getPort();
							if (port !== 0) {
								protocolType = systemDescription
										.getProtocolType();
								isHttp80 = (protocolType === sap.firefly.ProtocolType.HTTP)
										&& (port === 80);
								isHttps443 = (protocolType === sap.firefly.ProtocolType.HTTPS)
										&& (port === 443);
								if (!isHttp80 && !isHttps443) {
									hostNameBuf.append(":");
									hostNameBuf.append(sap.firefly.XInteger
											.convertIntegerToString(port));
								}
							}
							httpHeader.setStringValue(
									sap.firefly.HttpConstants.HD_HOST,
									hostNameBuf.toString());
						},
						setLanguage : function(systemDescription, httpHeader) {
							var lang = systemDescription.getLanguage();
							if (sap.firefly.XStringUtils.isNullOrEmpty(lang)) {
								lang = sap.firefly.HttpConstants.VA_LANGUAGE_ENGLISH;
							}
							httpHeader
									.setStringValue(
											sap.firefly.HttpConstants.HD_ACCEPT_LANGUAGE,
											lang);
						},
						setAccept : function(httpHeader, request) {
							var acceptContentType = request
									.getAcceptContentType();
							var httpAcceptEncodingGzip;
							httpHeader.setStringValue(
									sap.firefly.HttpConstants.HD_ACCEPT,
									acceptContentType.getName());
							httpHeader
									.setStringValue(
											sap.firefly.HttpConstants.HD_ACCEPT_CHARSET,
											sap.firefly.HttpConstants.UTF_8);
							httpAcceptEncodingGzip = sap.firefly.XEnvironment
									.getVariable(sap.firefly.XEnvironmentConstants.HTTP_ACCEPT_ENCODING_GZIP);
							if ((httpAcceptEncodingGzip !== null)
									&& (sap.firefly.XBoolean
											.convertStringToBoolean(sap.firefly.XString
													.convertToLowerCase(httpAcceptEncodingGzip)))) {
								httpHeader
										.setStringValue(
												sap.firefly.HttpConstants.HD_ACCEPT_ENCODING,
												sap.firefly.HttpEncodings.EN_GZIP);
							}
						},
						addCookies : function(request, httpHeader) {
							var cookies = request.getCookies();
							var cookieNames = cookies.getCookieNames();
							var buffer;
							var hasEntry;
							var k;
							var name;
							var selectedCookies;
							var j;
							var selectedCookie;
							var cookiePath;
							var requestPath;
							var cookiePathLength;
							var nextRequestPathChar;
							var value;
							if (cookieNames.isEmpty()) {
								return;
							}
							buffer = sap.firefly.XStringBuffer.create();
							hasEntry = false;
							for (k = 0; k < cookieNames.size(); k++) {
								name = cookieNames.get(k);
								selectedCookies = cookies
										.getCookiesByName(name);
								for (j = 0; j < selectedCookies.size(); j++) {
									selectedCookie = selectedCookies.get(j);
									cookiePath = selectedCookie.getPath();
									if (sap.firefly.XStringUtils
											.isNullOrEmpty(cookiePath) === false) {
										requestPath = request.getPath();
										if (sap.firefly.XStringUtils
												.isNullOrEmpty(requestPath)) {
											throw sap.firefly.XException
													.createIllegalStateException("no request path");
										}
										if (sap.firefly.XString.isEqual(
												requestPath, cookiePath) === false) {
											if (sap.firefly.XString.startsWith(
													requestPath, cookiePath) === false) {
												continue;
											}
											if (sap.firefly.XString.endsWith(
													cookiePath, "/") === false) {
												cookiePathLength = sap.firefly.XString
														.size(cookiePath);
												nextRequestPathChar = sap.firefly.XString
														.substring(
																requestPath,
																cookiePathLength,
																cookiePathLength + 1);
												if (sap.firefly.XString
														.isEqual(
																nextRequestPathChar,
																"/") === false) {
													continue;
												}
											}
										}
									}
									if (hasEntry) {
										buffer.append(";");
									} else {
										hasEntry = true;
									}
									value = selectedCookies.get(j).getValue();
									buffer.append(name);
									buffer.append("=");
									buffer.append(value);
								}
							}
							httpHeader.setStringValue(
									sap.firefly.HttpConstants.HD_COOKIE, buffer
											.toString());
						},
						populateHeaderFromRequest : function(systemDescription,
								httpHeader, request, postDataUtf8Len,
								handleAuthentication) {
							var requestMethod;
							var bufferContentType;
							var headerFields;
							var keys;
							var key;
							if (handleAuthentication) {
								sap.firefly.HttpCoreUtils.setAuthentication(
										systemDescription, httpHeader);
							}
							sap.firefly.HttpCoreUtils.setHostName(
									systemDescription, httpHeader);
							sap.firefly.HttpCoreUtils.setLanguage(
									systemDescription, httpHeader);
							sap.firefly.HttpCoreUtils.setAccept(httpHeader,
									request);
							httpHeader
									.setStringValue(
											sap.firefly.HttpConstants.HD_USER_AGENT,
											sap.firefly.HttpConstants.FIREFLY_USER_AGENT);
							httpHeader
									.setStringValue(
											sap.firefly.HttpConstants.HD_CONNECTION,
											sap.firefly.HttpConstants.VA_CONNECTION_CLOSE);
							requestMethod = request.getMethod();
							if (((requestMethod === sap.firefly.HttpRequestMethod.HTTP_POST) || (requestMethod === sap.firefly.HttpRequestMethod.HTTP_PUT))
									&& ((request.getStringContent() !== null) || (request
											.getBinaryContent() !== null))) {
								bufferContentType = sap.firefly.XStringBuffer
										.create();
								bufferContentType.append(request
										.getHttpContentType().getName());
								bufferContentType.append(";charset=utf-8");
								httpHeader
										.setStringValue(
												sap.firefly.HttpConstants.HD_CONTENT_TYPE,
												bufferContentType.toString());
								httpHeader
										.setIntegerValue(
												sap.firefly.HttpConstants.HD_CONTENT_LENGTH,
												postDataUtf8Len);
							}
							if (request.getCookies() !== null) {
								sap.firefly.HttpCoreUtils.addCookies(request,
										httpHeader);
							}
							headerFields = request.getHeaderFields();
							keys = headerFields.getKeysAsIteratorOfString();
							while (keys.hasNext()) {
								key = keys.next();
								httpHeader.setStringValue(key, headerFields
										.getByKey(key));
							}
							return httpHeader;
						},
						createHttpRequestString : function(request, httpHeader) {
							var httpBuffer = sap.firefly.XStringBuffer.create();
							var escapedQuery;
							httpBuffer.append(request.getMethod().getName());
							httpBuffer.append(" ");
							httpBuffer.append(request.getPath());
							escapedQuery = request.getQuery();
							if (escapedQuery !== null) {
								httpBuffer.append("?");
								httpBuffer.append(escapedQuery);
							}
							httpBuffer.append(" ");
							httpBuffer
									.append(sap.firefly.HttpConstants.HTTP_11);
							httpBuffer
									.append(sap.firefly.HttpConstants.HTTP_CRLF);
							httpBuffer.append(httpHeader
									.generateHttpHeaderString());
							httpBuffer
									.append(sap.firefly.HttpConstants.HTTP_CRLF);
							httpBuffer
									.append(sap.firefly.HttpConstants.HTTP_CRLF);
							return httpBuffer.toString();
						}
					}
				});
$Firefly.createClass("sap.firefly.HttpErrorCause", sap.firefly.XObject, {
	m_httpResponse : null,
	m_extendedInfo : null,
	m_errorCode : 0,
	m_httpRequest : null,
	releaseObject : function() {
		this.m_httpRequest = null;
		sap.firefly.HttpErrorCause.$superclass.releaseObject.call(this);
	},
	setHttpRequest : function(httpRequest) {
		this.m_httpRequest = httpRequest;
	},
	getHttpRequest : function() {
		return this.m_httpRequest;
	},
	setHttpResponse : function(httpResponse) {
		this.m_httpResponse = httpResponse;
	},
	getHttpResponse : function() {
		return this.m_httpResponse;
	},
	setExtendedInfo : function(extendedInfo) {
		this.m_extendedInfo = extendedInfo;
	},
	getExtendedInfo : function() {
		return this.m_extendedInfo;
	},
	setErrorCode : function(errorCode) {
		this.m_errorCode = errorCode;
	},
	getErrorCode : function() {
		return this.m_errorCode;
	},
	toString : function() {
		var sb = sap.firefly.XStringBuffer.create();
		var requestString;
		var responseString;
		if (this.m_errorCode !== 0) {
			sb.appendInt(this.m_errorCode);
			sb.appendNewLine();
		}
		if (this.m_httpRequest !== null) {
			requestString = this.m_httpRequest.toString();
			if (requestString !== null) {
				sb.append(requestString);
				sb.appendNewLine();
			}
		}
		if (this.m_httpResponse !== null) {
			responseString = this.m_httpResponse.toString();
			if (responseString !== null) {
				sb.append(responseString);
				sb.appendNewLine();
			}
		}
		if (this.m_extendedInfo !== null) {
			sb.append("Native error cause is available.");
			sb.appendNewLine();
		}
		return sb.toString();
	}
});
$Firefly.createClass("sap.firefly.HttpFileFactory", sap.firefly.XObject, {
	$statics : {
		staticSetup : function() {
			var httpFileFactory = sap.firefly.HttpFileFactory.create();
			sap.firefly.HttpClientFactory.setHttpClientFactoryForProtocol(
					sap.firefly.ProtocolType.FILE, httpFileFactory);
		},
		create : function() {
			var newObj = new sap.firefly.HttpFileFactory();
			return newObj;
		}
	},
	newHttpClientInstance : function(session) {
		return sap.firefly.HttpFileClient.create(session);
	}
});
$Firefly.createClass("sap.firefly.HttpHeader", sap.firefly.XObject, {
	$statics : {
		create : function() {
			var header = new sap.firefly.HttpHeader();
			header.setupHttpHeader();
			return header;
		}
	},
	m_headerMap : null,
	setupHttpHeader : function() {
		this.m_headerMap = sap.firefly.XProperties.create();
	},
	releaseObject : function() {
		this.m_headerMap = sap.firefly.XObject
				.releaseIfNotNull(this.m_headerMap);
		sap.firefly.HttpHeader.$superclass.releaseObject.call(this);
	},
	getStringValue : function(propertyName) {
		return this.m_headerMap.getByKey(propertyName);
	},
	setStringValue : function(propertyName, value) {
		this.m_headerMap.put(propertyName, value);
	},
	setIntegerValue : function(propertyName, value) {
		this.m_headerMap.put(propertyName, sap.firefly.XInteger
				.convertIntegerToString(value));
	},
	getIntValue : function(propertyName) {
		var value = this.m_headerMap.getByKey(propertyName);
		return sap.firefly.XInteger.convertStringToInteger(value);
	},
	getProperties : function() {
		return this.m_headerMap;
	},
	generateHttpHeaderString : function() {
		var sb;
		var iterator;
		var i;
		var key;
		var value;
		if ((this.m_headerMap === null) || (this.m_headerMap.isEmpty())) {
			return "";
		}
		sb = sap.firefly.XStringBuffer.create();
		iterator = this.m_headerMap.getKeysAsIteratorOfString();
		for (i = 0; iterator.hasNext(); i++) {
			if (i > 0) {
				sb.append(sap.firefly.HttpConstants.HTTP_CRLF);
			}
			key = iterator.next();
			value = this.m_headerMap.getByKey(key);
			sb.append(key);
			sb.append(": ");
			sb.append(value);
		}
		return sb.toString();
	},
	toString : function() {
		return this.generateHttpHeaderString();
	}
});
$Firefly.createClass("sap.firefly.HttpLocalLoopFactory", sap.firefly.XObject, {
	$statics : {
		create : function(serverConfig) {
			var newObj = new sap.firefly.HttpLocalLoopFactory();
			newObj.m_serverConfig = serverConfig;
			return newObj;
		}
	},
	m_serverConfig : null,
	releaseObject : function() {
		this.m_serverConfig = null;
		sap.firefly.HttpLocalLoopFactory.$superclass.releaseObject.call(this);
	},
	newHttpClientInstance : function(session) {
		return sap.firefly.HttpLocalLoopClient.create(session,
				this.m_serverConfig);
	}
});
$Firefly.createClass("sap.firefly.HttpRawData", sap.firefly.XObject, {
	$statics : {
		create : function(protocol, host, port, data) {
			var object = new sap.firefly.HttpRawData();
			object.setup(protocol, host, port, data);
			return object;
		}
	},
	m_host : null,
	m_port : 0,
	m_protocolType : null,
	m_data : null,
	setup : function(protocol, host, port, data) {
		this.m_protocolType = protocol;
		this.m_host = host;
		this.m_port = port;
		this.m_data = data;
	},
	releaseObject : function() {
		this.m_host = null;
		this.m_protocolType = null;
		this.m_data = null;
		sap.firefly.HttpRawData.$superclass.releaseObject.call(this);
	},
	getHost : function() {
		return this.m_host;
	},
	getPort : function() {
		return this.m_port;
	},
	getProtocolType : function() {
		return this.m_protocolType;
	},
	getByteArray : function() {
		return this.m_data;
	}
});
$Firefly.createClass("sap.firefly.RpcFunctionFactory", sap.firefly.XObject,
		{
			$statics : {
				s_functionFactory : null,
				staticSetupRcpFunctionFactory : function() {
					var defaultFactory = new sap.firefly.RpcFunctionFactory();
					sap.firefly.RpcFunctionFactory
							.setRpcFunctionFactory(defaultFactory);
				},
				newInstance : function(session, connectionInfo, name,
						protocolType) {
					return sap.firefly.RpcFunctionFactory.s_functionFactory
							.newRpcFunctionByProtocol(session, connectionInfo,
									name, protocolType);
				},
				setRpcFunctionFactory : function(factory) {
					sap.firefly.RpcFunctionFactory.s_functionFactory = factory;
				},
				getRpcFunctionFactory : function() {
					return sap.firefly.RpcFunctionFactory.s_functionFactory;
				}
			},
			newRpcFunction : function(session, connectionInfo, name) {
				var protocolType;
				var rpcFunctionByProtocol;
				if (connectionInfo !== null) {
					protocolType = connectionInfo.getProtocolType();
					rpcFunctionByProtocol = this.newRpcFunctionByProtocol(
							session, connectionInfo, name, protocolType);
					if (rpcFunctionByProtocol !== null) {
						return rpcFunctionByProtocol;
					}
				}
				return null;
			},
			newRpcFunctionByProtocol : function(session, connectionInfo, name,
					protocolType) {
				var theProtocolType;
				var protocolTypeName;
				var registrationService;
				var clazz;
				var rpcFunctionObject;
				var rpcFunction;
				if (connectionInfo === null) {
					return null;
				}
				theProtocolType = protocolType;
				if (theProtocolType === null) {
					theProtocolType = connectionInfo.getProtocolType();
					if (theProtocolType === null) {
						return null;
					}
				}
				protocolTypeName = theProtocolType.getName();
				if (sap.firefly.XStringUtils.isNullOrEmpty(protocolTypeName)) {
					return null;
				}
				registrationService = sap.firefly.RegistrationService
						.getInstance();
				if (registrationService === null) {
					return null;
				}
				clazz = registrationService.getFirstReference(
						sap.firefly.RegistrationService.RPC_FUNCTION,
						protocolTypeName);
				if (clazz === null) {
					return null;
				}
				rpcFunctionObject = clazz.newInstance(this);
				if (rpcFunctionObject === null) {
					return null;
				}
				rpcFunction = rpcFunctionObject;
				rpcFunction.setupRpcFunction(session, connectionInfo, name);
				return rpcFunction;
			}
		});
$Firefly
		.createClass(
				"sap.firefly.RpcRequest",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(ocpFunction, connectionInfo) {
							var request = new sap.firefly.RpcRequest();
							request.setup(ocpFunction, connectionInfo);
							return request;
						}
					},
					m_function : null,
					m_connectionInfo : null,
					m_mainParameterStructure : null,
					m_requestStructureName : null,
					m_method : null,
					m_additionalParameters : null,
					m_acceptContentType : null,
					m_requestContentType : null,
					setup : function(ocpFunction, connectionInfo) {
						this.m_method = sap.firefly.HttpRequestMethod.HTTP_POST;
						this.m_acceptContentType = sap.firefly.HttpContentType.APPLICATION_JSON;
						this.m_requestContentType = sap.firefly.HttpContentType.APPLICATION_JSON;
						this.m_additionalParameters = sap.firefly.XProperties
								.create();
						this.setFunction(ocpFunction);
						this.setConnectionInfo(connectionInfo);
					},
					releaseObject : function() {
						this.m_function = null;
						this.m_connectionInfo = null;
						this.m_mainParameterStructure = null;
						this.m_requestStructureName = null;
						this.m_method = null;
						this.m_acceptContentType = null;
						this.m_requestContentType = null;
						this.m_additionalParameters = sap.firefly.XObject
								.releaseIfNotNull(this.m_additionalParameters);
						sap.firefly.RpcRequest.$superclass.releaseObject
								.call(this);
					},
					getRequestStructure : function() {
						if (this.m_mainParameterStructure === null) {
							this.m_mainParameterStructure = sap.firefly.PrStructure
									.create();
						}
						return this.m_mainParameterStructure;
					},
					setRequestStructure : function(requestStructure) {
						this.m_mainParameterStructure = requestStructure;
					},
					getMethod : function() {
						return this.m_method;
					},
					setMethod : function(method) {
						this.m_method = method;
					},
					getRequestStructureName : function() {
						return this.m_requestStructureName;
					},
					setRequestStructureName : function(name) {
						this.m_requestStructureName = name;
					},
					getAdditionalParameters : function() {
						return this.m_additionalParameters;
					},
					getAcceptContentType : function() {
						return this.m_acceptContentType;
					},
					setAcceptContentType : function(contentType) {
						this.m_acceptContentType = contentType;
					},
					getRequestContentType : function() {
						return this.m_requestContentType;
					},
					setRequestContentType : function(contentType) {
						this.m_requestContentType = contentType;
					},
					getFunction : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_function);
					},
					setFunction : function(ocpFunction) {
						this.m_function = sap.firefly.XWeakReferenceUtil
								.getWeakRef(ocpFunction);
					},
					getConnectionInfo : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_connectionInfo);
					},
					setConnectionInfo : function(connectionInfo) {
						this.m_connectionInfo = sap.firefly.XWeakReferenceUtil
								.getWeakRef(connectionInfo);
					}
				});
$Firefly.createClass("sap.firefly.RpcResponse", sap.firefly.XObject,
		{
			$statics : {
				create : function(ocpFunction) {
					var request = new sap.firefly.RpcResponse();
					request.setup(ocpFunction);
					return request;
				}
			},
			m_function : null,
			m_rootElement : null,
			m_rootElementString : null,
			setup : function(ocpFunction) {
				this.setFunction(ocpFunction);
			},
			releaseObject : function() {
				this.m_function = null;
				this.m_rootElement = null;
				this.m_rootElementString = null;
				sap.firefly.RpcResponse.$superclass.releaseObject.call(this);
			},
			getRootElement : function() {
				if ((this.m_rootElement !== null)
						&& (this.m_rootElement.isStructure())) {
					return this.m_rootElement;
				}
				return null;
			},
			getRootElementGeneric : function() {
				return this.m_rootElement;
			},
			setRootElement : function(rootElement, rootElementAsString) {
				this.m_rootElement = rootElement;
				this.m_rootElementString = rootElementAsString;
			},
			getRootElementAsString : function() {
				if ((this.m_rootElementString === null)
						&& (this.m_rootElement !== null)) {
					this.m_rootElementString = this.m_rootElement.toString();
				}
				return this.m_rootElementString;
			},
			getFunction : function() {
				return sap.firefly.XWeakReferenceUtil
						.getHardRef(this.m_function);
			},
			setFunction : function(ocpFunction) {
				this.m_function = sap.firefly.XWeakReferenceUtil
						.getWeakRef(ocpFunction);
			},
			toString : function() {
				var sb = sap.firefly.XStringBuffer.create();
				if (this.m_rootElement === null) {
					sb.append("Ocp response: No element defined.");
				} else {
					sb.append(this.m_rootElement.toString());
				}
				sb.appendNewLine();
				return sb.toString();
			}
		});
$Firefly.createClass("sap.firefly.SqlDriverFactory", sap.firefly.XObject, {
	$statics : {
		s_driverFactory : null,
		create : function(driverName) {
			if (sap.firefly.SqlDriverFactory.s_driverFactory !== null) {
				return sap.firefly.SqlDriverFactory.s_driverFactory
						.newSqlDriver(driverName);
			}
			return null;
		},
		setDriver : function(driverFactory) {
			sap.firefly.SqlDriverFactory.s_driverFactory = driverFactory;
		}
	},
	newSqlDriver : function(driverName) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	}
});
$Firefly.createClass("sap.firefly.XmlConstants", sap.firefly.XObject, {
	$statics : {
		XML_LOCAL_NAME : "_0Name",
		XML_Q_NAME : "_1QName",
		XML_URI : "_2Uri",
		XML_ATTRIBUTES : "_3Attributes",
		XML_CHILDREN : "_4Children"
	}
});
$Firefly.createClass("sap.firefly.XmlParserFactory", sap.firefly.XObject, {
	$statics : {
		s_xmlParserFactory : null,
		staticSetupXmlParserFactory : function() {
			var defaultFactory = new sap.firefly.XmlParserFactory();
			sap.firefly.XmlParserFactory.setXmlParserFactory(defaultFactory);
		},
		newInstance : function() {
			return sap.firefly.XmlParserFactory.s_xmlParserFactory
					.newParserInstance();
		},
		createFromString : function(xml) {
			var parser = sap.firefly.XmlParserFactory.newInstance();
			var rootElement = parser.parse(xml);
			if ((parser.isValid()) && (rootElement !== null)) {
				return rootElement;
			}
			throw sap.firefly.XException.createIllegalArgumentException(parser
					.getSummary());
		},
		setXmlParserFactory : function(xmlParserFactory) {
			sap.firefly.XmlParserFactory.s_xmlParserFactory = xmlParserFactory;
		}
	},
	newParserInstance : function() {
		return null;
	}
});
$Firefly.createClass("sap.firefly.XFileContent", sap.firefly.XObject, {
	$statics : {
		create : function() {
			return new sap.firefly.XFileContent();
		},
		copy : function(source, target) {
			if (source.isBinaryContentSet()) {
				target.setBinaryContent(source.getBinaryContent());
			}
			if (source.isStringContentSet()) {
				target.setStringContent(source.getStringContent());
			}
			if (source.isJsonContentSet()) {
				target.setJsonObject(source.getJsonContent());
			}
		}
	},
	m_contentType : null,
	m_stringContent : null,
	m_binaryContent : null,
	m_jsonContent : null,
	m_messageCollection : null,
	releaseObject : function() {
		this.m_binaryContent = null;
		this.m_contentType = null;
		this.m_stringContent = null;
		this.m_messageCollection = null;
		this.m_jsonContent = sap.firefly.XObject
				.releaseIfNotNull(this.m_jsonContent);
		sap.firefly.XFileContent.$superclass.releaseObject.call(this);
	},
	getContentType : function() {
		return this.m_contentType;
	},
	setContentType : function(contentType) {
		this.m_contentType = contentType;
	},
	getStringContent : function() {
		return this.getStringContentWithCharset(sap.firefly.XCharset.UTF8);
	},
	getStringContentWithCharset : function(encoding) {
		if (this.m_stringContent === null) {
			if (this.m_binaryContent !== null) {
				this.m_stringContent = sap.firefly.XByteArray
						.convertXByteArrayToStringWithCharset(
								this.m_binaryContent, encoding);
			}
		}
		return this.m_stringContent;
	},
	setStringContent : function(content) {
		this.m_stringContent = content;
	},
	getBinaryContent : function() {
		return this.m_binaryContent;
	},
	setBinaryContent : function(content) {
		this.m_binaryContent = content;
	},
	getJsonContent : function() {
		var content;
		if (this.m_jsonContent === null) {
			content = this
					.getStringContentWithCharset(sap.firefly.XCharset.UTF8);
			if (content !== null) {
				this.m_jsonContent = sap.firefly.JsonParserFactory
						.createFromString(content);
			}
		}
		return this.m_jsonContent;
	},
	setJsonObject : function(json) {
		this.m_jsonContent = json;
	},
	getMessageCollection : function() {
		return this.m_messageCollection;
	},
	setMessageCollection : function(messageCollection) {
		this.m_messageCollection = messageCollection;
	},
	isStringContentSet : function() {
		return this.m_stringContent !== null;
	},
	isBinaryContentSet : function() {
		return this.m_binaryContent !== null;
	},
	isJsonContentSet : function() {
		return this.m_jsonContent !== null;
	}
});
$Firefly.createClass("sap.firefly.XWebDAV", sap.firefly.DfXFileSystem, {
	$statics : {
		createWebDav : function(Session, uri) {
			var newObject = new sap.firefly.XWebDAV();
			newObject.setup(Session, uri);
			return newObject;
		}
	},
	m_uri : null,
	m_Session : null,
	m_httpClient : null,
	releaseObject : function() {
		this.m_uri = null;
		this.m_Session = null;
		this.m_httpClient = sap.firefly.XObject
				.releaseIfNotNull(this.m_httpClient);
		sap.firefly.XWebDAV.$superclass.releaseObject.call(this);
	},
	setup : function(Session, uri) {
		this.setSession(Session);
		this.m_uri = uri;
		this.m_httpClient = sap.firefly.HttpClientFactory
				.newInstanceByConnection(this.getSession(), uri);
	},
	getSession : function() {
		return sap.firefly.XWeakReferenceUtil.getHardRef(this.m_Session);
	},
	setSession : function(Session) {
		this.m_Session = sap.firefly.XWeakReferenceUtil.getWeakRef(Session);
	},
	getUri : function() {
		return this.m_uri;
	},
	loadExt : function(nativePath) {
		var request = this.m_httpClient.getRequest();
		var extResponse;
		var fileContent;
		request.setUri(this.m_uri);
		extResponse = this.m_httpClient.processHttpRequest(
				sap.firefly.SyncType.BLOCKING, null, null);
		if (extResponse.isValid()) {
			return extResponse.getData();
		}
		fileContent = sap.firefly.XFileContent.create();
		fileContent.setMessageCollection(extResponse);
		return fileContent;
	},
	getFileSystemType : function() {
		return sap.firefly.XFileSystemType.WEBDAV;
	}
});
$Firefly
		.createClass(
				"sap.firefly.JxJsonParserFactory",
				sap.firefly.JsonParserFactory,
				{
					$statics : {
						staticSetup : function() {
							var factory = new sap.firefly.JxJsonParserFactory();
							sap.firefly.JsonParserFactory
									.setJsonParserFactory(factory);
						}
					},
					newParserInstance : function() {
						return sap.firefly.JxJsonParser.create();
					}
				});
$Firefly.createClass("sap.firefly.XStringBufferJson", sap.firefly.XObject, {
	$statics : {
		create : function() {
			var buffer = new sap.firefly.XStringBufferJson();
			buffer.setup();
			return buffer;
		}
	},
	m_buffer : null,
	m_isFirstElement : false,
	m_isFirstLine : false,
	setup : function() {
		this.m_buffer = sap.firefly.XStringBufferExt.create();
		this.m_buffer.setIndentationString("    ");
		this.m_isFirstLine = true;
		this.m_isFirstElement = true;
	},
	releaseObject : function() {
		this.m_buffer = sap.firefly.XObject.releaseIfNotNull(this.m_buffer);
		sap.firefly.XStringBufferJson.$superclass.releaseObject.call(this);
	},
	append : function(value) {
		this.m_buffer.append('"');
		this.m_buffer.append(value);
		this.m_buffer.append('"');
		return this;
	},
	appendChar : function(value) {
		this.m_buffer.append('"');
		this.m_buffer.appendChar(value);
		this.m_buffer.append('"');
		return this;
	},
	appendBoolean : function(value) {
		this.m_buffer.appendBoolean(value);
		return this;
	},
	appendInt : function(value) {
		this.m_buffer.appendInt(value);
		return this;
	},
	appendLong : function(value) {
		this.m_buffer.appendLong(value);
		return this;
	},
	appendDouble : function(value) {
		this.m_buffer.appendDouble(value);
		return this;
	},
	appendNewLine : function() {
		if (this.m_isFirstLine === false) {
			this.m_buffer.appendNewLine();
		}
		this.m_isFirstLine = false;
		return this;
	},
	appendLabel : function(label) {
		if (this.m_isFirstElement === false) {
			this.m_buffer.append(",");
			this.appendNewLine();
		}
		this.m_buffer.append('"');
		this.m_buffer.append(label);
		this.m_buffer.append('":');
		this.m_isFirstElement = false;
		return this;
	},
	openArrayWithLabel : function(label) {
		this.appendLabel(label);
		this.openArray();
		return this;
	},
	openArray : function() {
		this.appendNewLine();
		this.m_buffer.append("[");
		this.appendNewLine();
		this.m_buffer.indent();
		this.m_isFirstElement = true;
		return this;
	},
	closeArray : function() {
		this.appendNewLine();
		this.m_buffer.outdent();
		this.m_buffer.append("]");
		this.m_isFirstElement = false;
		return this;
	},
	openStructureWithLabel : function(label) {
		this.appendLabel(label);
		this.openStructure();
		return this;
	},
	openStructure : function() {
		if (this.m_isFirstElement === false) {
			this.m_buffer.append(",");
			this.appendNewLine();
		}
		this.m_buffer.append("{");
		this.appendNewLine();
		this.m_buffer.indent();
		this.m_isFirstElement = true;
		return this;
	},
	closeStructure : function() {
		this.appendNewLine();
		this.m_buffer.outdent();
		this.m_buffer.append("}");
		this.m_isFirstElement = false;
		return this;
	},
	appendLabelAndString : function(label, value) {
		this.appendLabel(label);
		this.append(value);
		return this;
	},
	appendLabelAndBoolean : function(label, value) {
		this.appendLabel(label);
		this.appendBoolean(value);
		return this;
	},
	appendLabelAndInt : function(label, value) {
		this.appendLabel(label);
		this.appendInt(value);
		return this;
	},
	appendLabelAndLong : function(label, value) {
		this.appendLabel(label);
		this.appendLong(value);
		return this;
	},
	appendLabelAndDouble : function(label, value) {
		this.appendLabel(label);
		this.appendDouble(value);
		return this;
	},
	toString : function() {
		return this.m_buffer.toString();
	},
	appendString : function(label) {
		if (this.m_isFirstElement === false) {
			this.m_buffer.append(",");
			this.appendNewLine();
		}
		this.m_buffer.append('"');
		this.m_buffer.append(label);
		this.m_buffer.append('"');
		this.m_isFirstElement = false;
		return this;
	},
	appendRawString : function(label) {
		this.m_buffer.append(label);
		return this;
	},
	length : function() {
		return this.m_buffer.length();
	},
	clear : function() {
		this.m_buffer.clear();
	}
});
$Firefly.createClass("sap.firefly.HttpCookies", sap.firefly.XObject,
		{
			$statics : {
				create : function() {
					var cookies = new sap.firefly.HttpCookies();
					cookies.setup();
					return cookies;
				}
			},
			m_cookies : null,
			setup : function() {
				this.m_cookies = sap.firefly.XHashMapByString.create();
			},
			releaseObject : function() {
				var iterator;
				var next;
				if (this.m_cookies !== null) {
					iterator = this.m_cookies.getIterator();
					while (iterator.hasNext()) {
						next = iterator.next();
						sap.firefly.XCollectionUtils
								.releaseEntriesFromCollection(next);
						next.releaseObject();
					}
					iterator.releaseObject();
					this.m_cookies.releaseObject();
					this.m_cookies = null;
				}
				sap.firefly.HttpCookies.$superclass.releaseObject.call(this);
			},
			isEmpty : function() {
				if (this.m_cookies === null) {
					return true;
				}
				return this.m_cookies.isEmpty();
			},
			hasElements : function() {
				return !this.isEmpty();
			},
			clear : function() {
				this.m_cookies.clear();
			},
			getCookieNames : function() {
				return this.m_cookies.getKeysAsReadOnlyListOfString();
			},
			getCookieValueByName : function(name) {
				var values = this.m_cookies.getByKey(name);
				if ((values !== null) && (values.size() > 0)) {
					return values.get(0).getValue();
				}
				return null;
			},
			getCookiesByName : function(name) {
				return this.m_cookies.getByKey(name);
			},
			add : function(name, value) {
				var cookie = sap.firefly.HttpCookie.createCookie();
				cookie.setName(name);
				cookie.setValue(value);
				return this.addCookie(cookie);
			},
			addByHttpServerResponseValue : function(httpHeaderValue) {
				var cookie = sap.firefly.HttpCookie.createCookie();
				cookie.setByHttpServerResponseValue(httpHeaderValue);
				return this.addCookie(cookie);
			},
			addByHttpClientRequestValue : function(httpHeaderValue) {
				var start;
				var end;
				var subValue;
				var assignIndex;
				var cookieName;
				var cookieValue;
				var newCookie;
				if (httpHeaderValue !== null) {
					start = 0;
					while (true) {
						end = sap.firefly.XString.indexOfFrom(httpHeaderValue,
								";", start);
						subValue = sap.firefly.XString.substring(
								httpHeaderValue, start, end);
						assignIndex = sap.firefly.XString
								.indexOf(subValue, "=");
						if (assignIndex === -1) {
							cookieName = subValue;
							cookieValue = "";
						} else {
							cookieName = sap.firefly.XString.substring(
									subValue, 0, assignIndex);
							cookieValue = sap.firefly.XString.substring(
									subValue, assignIndex + 1, -1);
						}
						cookieName = sap.firefly.XString.trim(cookieName);
						cookieValue = sap.firefly.XString.trim(cookieValue);
						newCookie = sap.firefly.HttpCookie.createCookie();
						newCookie.setName(cookieName);
						newCookie.setValue(cookieValue);
						this.addCookie(newCookie);
						if (end === -1) {
							break;
						}
						start = end + 1;
					}
				}
			},
			addCookie : function(cookie) {
				var name = cookie.getName();
				var valueList = this.m_cookies.getByKey(name);
				if (valueList === null) {
					valueList = sap.firefly.XList.create();
					this.m_cookies.put(name, valueList);
				}
				valueList.add(cookie);
				return cookie;
			},
			merge : function(cookies) {
				var cookieNames = cookies.getCookieNames();
				var i;
				var name;
				var valueList;
				var cookieValuesByName;
				var j;
				for (i = 0; i < cookieNames.size(); i++) {
					name = cookieNames.get(i);
					valueList = this.m_cookies.getByKey(name);
					if (valueList === null) {
						valueList = sap.firefly.XList.create();
						this.m_cookies.put(name, valueList);
					} else {
						valueList.clear();
					}
					cookieValuesByName = cookies.getCookiesByName(name);
					for (j = 0; j < cookieValuesByName.size(); j++) {
						valueList.add(cookieValuesByName.get(j));
					}
				}
			},
			getCookies : function() {
				var allCookies = sap.firefly.XList.create();
				var cookieNames = this.getCookieNames();
				var i;
				var name;
				var valueList;
				var k;
				for (i = 0; i < cookieNames.size(); i++) {
					name = cookieNames.get(i);
					valueList = this.m_cookies.getByKey(name);
					for (k = 0; k < valueList.size(); k++) {
						allCookies.add(valueList.get(k));
					}
				}
				return allCookies;
			},
			toString : function() {
				var buffer = sap.firefly.XStringBuffer.create();
				var cookieNames = this.getCookieNames();
				var i;
				var name;
				var valueList;
				var j;
				for (i = 0; i < cookieNames.size(); i++) {
					if (i > 0) {
						buffer.append("\r\n");
					}
					name = cookieNames.get(i);
					buffer.append(name);
					buffer.append("=");
					valueList = this.m_cookies.getByKey(name);
					for (j = 0; j < valueList.size(); j++) {
						if (j > 0) {
							buffer.append(";");
						}
						buffer.append(valueList.get(j).getValue());
					}
				}
				return buffer.toString();
			}
		});
$Firefly
		.createClass(
				"sap.firefly.HttpSamlClientFactory",
				sap.firefly.HttpClientFactory,
				{
					$statics : {
						staticSetupSamlFactory : function() {
							var factory = new sap.firefly.HttpSamlClientFactory();
							var samlPwd = sap.firefly.XUri.create();
							var samlCert;
							samlPwd
									.setProtocolType(sap.firefly.ProtocolType.HTTPS);
							samlPwd
									.setAuthenticationType(sap.firefly.AuthenticationType.SAML_WITH_PASSWORD);
							sap.firefly.HttpClientFactory
									.setHttpClientFactoryForConnection(samlPwd,
											factory);
							samlCert = sap.firefly.XUri.create();
							samlCert
									.setProtocolType(sap.firefly.ProtocolType.HTTPS);
							samlCert
									.setAuthenticationType(sap.firefly.AuthenticationType.SAML_WITH_CERTIFICATE);
							sap.firefly.HttpClientFactory
									.setHttpClientFactoryForConnection(
											samlCert, factory);
						}
					},
					newHttpClientInstance : function(session) {
						return sap.firefly.HttpSamlClient.create(session);
					}
				});
$Firefly.createClass("sap.firefly.XConnection", sap.firefly.XObject, {
	m_host : null,
	m_port : 0,
	m_scheme : null,
	m_authenticationType : null,
	m_password : null,
	m_user : null,
	m_token : null,
	setup : function() {
		this.m_authenticationType = sap.firefly.AuthenticationType.NONE;
	},
	setFromConnection : function(connection) {
		this.setScheme(connection.getScheme());
		this.setHost(connection.getHost());
		this.setPort(connection.getPort());
		this.setUser(connection.getUser());
		this.setPassword(connection.getPassword());
		this.setAuthenticationType(connection.getAuthenticationType());
	},
	releaseObject : function() {
		this.m_host = null;
		this.m_scheme = null;
		this.m_authenticationType = null;
		this.m_password = null;
		this.m_user = null;
		sap.firefly.XConnection.$superclass.releaseObject.call(this);
	},
	getHost : function() {
		return this.m_host;
	},
	setHost : function(host) {
		this.m_host = host;
	},
	getScheme : function() {
		return this.m_scheme;
	},
	setScheme : function(scheme) {
		this.m_scheme = scheme;
	},
	getProtocolType : function() {
		if (this.m_scheme === null) {
			return null;
		}
		return sap.firefly.ProtocolType.lookup(this.m_scheme);
	},
	setProtocolType : function(type) {
		if (type !== null) {
			this.m_scheme = type.getName();
		}
	},
	getPort : function() {
		return this.m_port;
	},
	setPort : function(port) {
		this.m_port = port;
	},
	getAuthenticationType : function() {
		return this.m_authenticationType;
	},
	setAuthenticationType : function(type) {
		this.setAuthenticationInternal(type);
	},
	setAuthentication : function(type) {
		this.setAuthenticationInternal(type);
	},
	setAuthenticationInternal : function(type) {
		this.m_authenticationType = type;
	},
	getPassword : function() {
		return this.m_password;
	},
	setPassword : function(password) {
		this.m_password = password;
	},
	getAuthenticationToken : function() {
		return this.m_token;
	},
	setAuthenticationToken : function(token) {
		this.m_token = token;
	},
	getUser : function() {
		return this.m_user;
	},
	setUser : function(user) {
		this.m_user = user;
	},
	getUriString : function() {
		return sap.firefly.XUri.getUriStringStatic(this, null, true, true,
				true, true, true, true, true);
	},
	getUriStringWithoutAuthentication : function() {
		return sap.firefly.XUri.getUriStringStatic(this, null, true, false,
				false, true, true, true, true);
	},
	getUriStringExt : function(withSchema, withUserPwd, withAuthenticationType,
			withHostPort, withPath, withQuery, withFragment) {
		return sap.firefly.XUri.getUriStringStatic(this, null, withSchema,
				withUserPwd, withAuthenticationType, withHostPort, withPath,
				withQuery, withFragment);
	},
	toString : function() {
		var buffer = sap.firefly.XStringBuffer.create();
		buffer.append("Protocol: ");
		buffer.append(this.m_scheme);
		buffer.appendNewLine();
		buffer.append("Host: ");
		buffer.append(this.m_host);
		buffer.appendNewLine();
		buffer.append("Port: ");
		buffer.appendInt(this.m_port);
		buffer.appendNewLine();
		buffer.append("User: ");
		buffer.append(this.m_user);
		buffer.appendNewLine();
		buffer.append("Authentication: ");
		buffer.append(this.m_authenticationType.getName());
		buffer.appendNewLine();
		return buffer.toString();
	}
});
$Firefly
		.createClass(
				"sap.firefly.HttpExchange",
				sap.firefly.XObject,
				{
					m_properties : null,
					m_headerLines : null,
					m_cookies : null,
					m_cookiesMasterStore : null,
					m_stringContent : null,
					m_binaryContent : null,
					m_jsonContent : null,
					m_httpContentType : null,
					m_contentTypeValue : null,
					m_textContentEncoding : null,
					m_gzipContentEncoding : false,
					m_binaryMode : false,
					m_rawSummary : null,
					setupProtocol : function() {
						this.m_properties = sap.firefly.XProperties.create();
						this.m_headerLines = sap.firefly.XListOfString.create();
						this.m_httpContentType = sap.firefly.HttpContentType.APPLICATION_JSON;
					},
					releaseObject : function() {
						this.m_properties = sap.firefly.XObject
								.releaseIfNotNull(this.m_properties);
						this.m_headerLines = sap.firefly.XObject
								.releaseIfNotNull(this.m_headerLines);
						this.m_cookies = sap.firefly.XObject
								.releaseIfNotNull(this.m_cookies);
						this.m_httpContentType = null;
						this.m_stringContent = null;
						this.m_binaryContent = null;
						this.m_jsonContent = null;
						this.m_contentTypeValue = null;
						this.m_textContentEncoding = null;
						this.m_rawSummary = null;
						sap.firefly.HttpExchange.$superclass.releaseObject
								.call(this);
					},
					setFromHttpExchange : function(httpExchange) {
						var sourceHeaders;
						var targetHeaders;
						var iterator;
						var key;
						var value;
						this.setHttpContentType(httpExchange
								.getHttpContentType());
						this.setTextContentEncoding(httpExchange
								.getTextContentEncoding());
						this.setStringContent(httpExchange.getStringContent());
						this.setBinaryContent(httpExchange.getBinaryContent());
						this.setJsonObject(httpExchange.getJsonContent());
						this.setCookiesMasterStore(httpExchange
								.getCookiesMasterStore());
						sourceHeaders = httpExchange.getHeaderFields();
						targetHeaders = this.getHeaderFieldsBase();
						iterator = sourceHeaders.getKeysAsIteratorOfString();
						while (iterator.hasNext()) {
							key = iterator.next();
							value = sourceHeaders.getByKey(key);
							targetHeaders.put(key, value);
						}
					},
					getHeaderFieldsBase : function() {
						return this.m_properties;
					},
					getHeaderFields : function() {
						return this.m_properties;
					},
					getHeaderLines : function() {
						return this.m_headerLines;
					},
					setHeaderLines : function(headerLines) {
						this.m_headerLines = headerLines;
					},
					addHeaderLine : function(headerLine) {
						this.m_headerLines.add(headerLine);
					},
					setCookies : function(cookies) {
						this.m_cookies = cookies;
					},
					getCookies : function() {
						return this.m_cookies;
					},
					addCookie : function(cookie) {
						if (this.m_cookies === null) {
							this.m_cookies = sap.firefly.HttpCookies.create();
						}
						this.m_cookies.addCookie(cookie);
					},
					getStringContent : function() {
						var serializer;
						var textContentEncoding;
						if (this.m_stringContent === null) {
							if (this.getHttpContentType() === sap.firefly.HttpContentType.APPLICATION_JSON) {
								if (this.m_jsonContent !== null) {
									serializer = sap.firefly.JsonSerializerToString
											.create();
									this.m_stringContent = serializer
											.serializePrettyPrint(
													this.m_jsonContent, false,
													false, 0);
								} else {
									if (this.m_binaryContent !== null) {
										textContentEncoding = this
												.getTextContentEncoding();
										if (textContentEncoding !== null) {
											textContentEncoding = sap.firefly.XString
													.convertToUpperCase(textContentEncoding);
										}
										if (sap.firefly.XString.isEqual(
												textContentEncoding, "UTF-8")
												|| (textContentEncoding === null)) {
											this.m_stringContent = sap.firefly.XByteArray
													.convertXByteArrayToStringWithCharset(
															this.m_binaryContent,
															sap.firefly.XCharset.UTF8);
										}
									}
								}
							}
						}
						return this.m_stringContent;
					},
					getStringContentWithCharset : function(encoding) {
						return this.getStringContent();
					},
					setStringContent : function(content) {
						this.m_stringContent = content;
						this.setIsBinaryMode(false);
					},
					getBinaryContent : function() {
						return this.m_binaryContent;
					},
					setBinaryContent : function(content) {
						this.m_binaryContent = content;
					},
					getJsonContent : function() {
						var parser;
						var rootElementJson;
						var stringContent;
						var rootElement;
						if (this.m_jsonContent === null) {
							if (this.getHttpContentType() === sap.firefly.HttpContentType.APPLICATION_JSON) {
								parser = sap.firefly.JsonParserFactory
										.newInstance();
								if (this.isBinaryMode()) {
									rootElementJson = parser
											.parseByteArray(this.m_binaryContent);
									if (parser.isValid()) {
										this.m_jsonContent = rootElementJson;
									}
									this.setIsBinaryMode(false);
								} else {
									stringContent = this.getStringContent();
									if (sap.firefly.XStringUtils
											.isNotNullAndNotEmpty(stringContent)) {
										rootElement = parser
												.parse(stringContent);
										if (parser.isValid()) {
											this.m_jsonContent = rootElement;
										}
									}
								}
							}
						}
						return this.m_jsonContent;
					},
					setJsonObject : function(json) {
						this.m_jsonContent = json;
					},
					isStringContentSet : function() {
						return this.m_stringContent !== null;
					},
					isBinaryContentSet : function() {
						return this.m_binaryContent !== null;
					},
					isJsonContentSet : function() {
						return this.m_jsonContent !== null;
					},
					getHttpContentType : function() {
						return this.m_httpContentType;
					},
					getContentType : function() {
						if (this.m_httpContentType === null) {
							return null;
						}
						return this.m_httpContentType.getGenericContentType();
					},
					setContentType : function(contentType) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setHttpContentType : function(contentType) {
						this.m_httpContentType = contentType;
						if (contentType !== null) {
							this.m_contentTypeValue = contentType.getName();
						}
					},
					getContentTypeValue : function() {
						return this.m_contentTypeValue;
					},
					setContentTypeValue : function(contentType) {
						this.m_contentTypeValue = contentType;
					},
					getTextContentEncoding : function() {
						return this.m_textContentEncoding;
					},
					setTextContentEncoding : function(encoding) {
						this.m_textContentEncoding = encoding;
					},
					getGzipContentEncoding : function() {
						return this.m_gzipContentEncoding;
					},
					setGzipContentEncoding : function(encoding) {
						this.m_gzipContentEncoding = encoding;
					},
					getRawSummary : function() {
						var buffer;
						var i;
						var content;
						var jsonContent;
						var serializer;
						if (this.m_rawSummary === null) {
							buffer = sap.firefly.XStringBuffer.create();
							for (i = 0; i < this.m_headerLines.size(); i++) {
								buffer.append(this.m_headerLines.get(i));
								buffer.appendNewLine();
							}
							buffer.appendNewLine();
							content = null;
							if (this.getHttpContentType() === sap.firefly.HttpContentType.APPLICATION_JSON) {
								jsonContent = this.getJsonContent();
								if (jsonContent !== null) {
									serializer = sap.firefly.JsonSerializerToString
											.create();
									content = serializer.serializePrettyPrint(
											jsonContent, true, true, 2);
								}
							}
							if (content === null) {
								content = this.getStringContent();
							}
							if (content !== null) {
								buffer.append(content);
							}
							this.m_rawSummary = buffer.toString();
						}
						return this.m_rawSummary;
					},
					createRawData : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getMessageCollection : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setMessageCollection : function(messageCollection) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getCookiesMasterStore : function() {
						return this.m_cookiesMasterStore;
					},
					setCookiesMasterStore : function(masterStore) {
						this.m_cookiesMasterStore = masterStore;
					},
					isBinaryMode : function() {
						return this.m_binaryMode;
					},
					setIsBinaryMode : function(isBinaryMode) {
						this.m_binaryMode = isBinaryMode;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DocumentFormatType",
				sap.firefly.XConstant,
				{
					$statics : {
						JSON : null,
						XML : null,
						staticSetup : function() {
							sap.firefly.DocumentFormatType.JSON = sap.firefly.DocumentFormatType
									.create("Json");
							sap.firefly.DocumentFormatType.XML = sap.firefly.DocumentFormatType
									.create("Xml");
						},
						create : function(name) {
							var object = new sap.firefly.DocumentFormatType();
							object.setupConstant(name);
							return object;
						}
					}
				});
$Firefly.createClass("sap.firefly.DfDocumentParser",
		sap.firefly.MessageManager, {
			parse : function(content) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			parseByteArray : function(byteContent) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			parseUnsafe : function(content) {
				return this.parse(content);
			},
			parseNativeObject : function(content) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			supportsNative : function() {
				return false;
			}
		});
$Firefly
		.createClass(
				"sap.firefly.XFileSystemType",
				sap.firefly.XConstant,
				{
					$statics : {
						OS : null,
						WEBDAV : null,
						SIMPLE_WEB : null,
						staticSetup : function() {
							sap.firefly.XFileSystemType.OS = sap.firefly.XFileSystemType
									.create("OperatingSystem");
							sap.firefly.XFileSystemType.WEBDAV = sap.firefly.XFileSystemType
									.create("WebDAV");
							sap.firefly.XFileSystemType.SIMPLE_WEB = sap.firefly.XFileSystemType
									.create("SimpleWeb");
						},
						create : function(name) {
							var object = new sap.firefly.XFileSystemType();
							object.setupConstant(name);
							return object;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ContentType",
				sap.firefly.XConstant,
				{
					$statics : {
						JSON : null,
						XML : null,
						URI_PARAMETER : null,
						TEXT_HTML : null,
						BINARY : null,
						s_instances : null,
						create : function(name) {
							var newConstant = new sap.firefly.ContentType();
							newConstant.setName(name);
							sap.firefly.ContentType.s_instances.put(name,
									newConstant);
							return newConstant;
						},
						lookup : function(name) {
							var type = sap.firefly.ContentType.s_instances
									.getByKey(name);
							return type;
						},
						staticSetup : function() {
							sap.firefly.ContentType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.ContentType.JSON = sap.firefly.ContentType
									.create("json");
							sap.firefly.ContentType.XML = sap.firefly.ContentType
									.create("xml");
							sap.firefly.ContentType.TEXT_HTML = sap.firefly.ContentType
									.create("text_html");
							sap.firefly.ContentType.URI_PARAMETER = sap.firefly.ContentType
									.create("uri_parameter");
							sap.firefly.ContentType.BINARY = sap.firefly.ContentType
									.create("binary");
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XUri",
				sap.firefly.XConnection,
				{
					$statics : {
						SCHEME_SEPARATOR : "://",
						PORT_SEPARATOR : ":",
						PATH_SEPARATOR : "/",
						QUERY_SEPARATOR : "?",
						QUERY_AND : "&",
						QUERY_ASSIGN : "=",
						FRAGMENT_SEPARATOR : "#",
						FRAGMENT_QUERY_START : "!",
						AUTHORITY_SEPARATOR : "@",
						USER_PWD_SEPARATOR : ":",
						SAML_USER_PWD : "saml",
						SAML_CERT : "samlcert",
						create : function() {
							var uri = new sap.firefly.XUri();
							uri.setup();
							return uri;
						},
						createFromConnection : function(connection) {
							var uri = sap.firefly.XUri.create();
							uri.setFromConnection(connection);
							return uri;
						},
						createFromOther : function(otherUri) {
							var uri = sap.firefly.XUri.create();
							uri.setFromUri(otherUri);
							return uri;
						},
						createFromUri : function(uriString) {
							return sap.firefly.XUri.createFromUriWithParent(
									uriString, null, false);
						},
						createFromUriWithParent : function(uriString,
								parentUri, mergeQueries) {
							var uri = sap.firefly.XUri.create();
							uri.setFromUriWithParent(uriString, parentUri,
									mergeQueries);
							return uri;
						},
						getMinimumPositive4 : function(a, b, c, d) {
							var min = sap.firefly.XUri
									.getMinimumPositive2(a, b);
							min = sap.firefly.XUri.getMinimumPositive2(min, c);
							min = sap.firefly.XUri.getMinimumPositive2(min, d);
							return min;
						},
						getMinimumPositive3 : function(a, b, c) {
							var min = sap.firefly.XUri
									.getMinimumPositive2(a, b);
							min = sap.firefly.XUri.getMinimumPositive2(min, c);
							return min;
						},
						getMinimumPositive2 : function(a, b) {
							if ((a < 0) && (b < 0)) {
								return -2;
							} else {
								if (a < 0) {
									return b;
								} else {
									if (b < 0) {
										return a;
									}
								}
							}
							if (a < b) {
								return a;
							}
							return b;
						},
						createFromRelativePath : function(path, parentPath) {
							var buffer;
							var pathSepIndex;
							var parentDirectory;
							if (sap.firefly.XString.startsWith(path,
									sap.firefly.XUri.PATH_SEPARATOR)) {
								return path;
							}
							buffer = sap.firefly.XStringBuffer.create();
							if (sap.firefly.XString.endsWith(parentPath,
									sap.firefly.XUri.PATH_SEPARATOR)) {
								buffer.append(parentPath);
							} else {
								pathSepIndex = sap.firefly.XString.lastIndexOf(
										parentPath,
										sap.firefly.XUri.PATH_SEPARATOR);
								parentDirectory = sap.firefly.XString
										.substring(parentPath, 0,
												pathSepIndex + 1);
								buffer.append(parentDirectory);
							}
							buffer.append(path);
							return buffer.toString();
						},
						encodeQuery : function(queryElements) {
							var httpBuffer;
							var i;
							var element;
							if (queryElements.isEmpty()) {
								return null;
							}
							httpBuffer = sap.firefly.XStringBuffer.create();
							for (i = 0; i < queryElements.size(); i++) {
								element = queryElements.get(i);
								if (i > 0) {
									httpBuffer
											.append(sap.firefly.XUri.QUERY_AND);
								}
								httpBuffer.append(sap.firefly.XHttpUtils
										.encodeURIComponent(element.getName()));
								httpBuffer
										.append(sap.firefly.XUri.QUERY_ASSIGN);
								httpBuffer
										.append(sap.firefly.XHttpUtils
												.encodeURIComponent(element
														.getValue()));
							}
							return httpBuffer.toString();
						},
						decodeQuery : function(query) {
							var queryPairs = sap.firefly.XList.create();
							var queryElements;
							var i;
							var element;
							var delimiter;
							var key;
							var value;
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(query)) {
								queryElements = sap.firefly.XStringTokenizer
										.splitString(query,
												sap.firefly.XUri.QUERY_AND);
								for (i = 0; i < queryElements.size(); i++) {
									element = queryElements.get(i);
									delimiter = sap.firefly.XString.indexOf(
											element,
											sap.firefly.XUri.QUERY_ASSIGN);
									if (delimiter === -1) {
										key = sap.firefly.XHttpUtils
												.decodeURIComponent(element);
										value = "";
									} else {
										key = sap.firefly.XString.substring(
												element, 0, delimiter);
										value = sap.firefly.XString.substring(
												element, delimiter + 1, -1);
										key = sap.firefly.XHttpUtils
												.decodeURIComponent(key);
										value = sap.firefly.XHttpUtils
												.decodeURIComponent(value);
									}
									queryPairs.add(sap.firefly.XNameValuePair
											.createWithValues(key, value));
								}
							}
							return queryPairs;
						},
						getUriStringStatic : function(connection, uri,
								withSchema, withUserPwd,
								withAuthenticationType, withHostPort, withPath,
								withQuery, withFragment) {
							var sb = sap.firefly.XStringBuffer.create();
							var scheme;
							var hasAuthority;
							var authenticationType;
							var user;
							var pwd;
							var host;
							var port;
							var path;
							var query;
							var fragment;
							if (withSchema) {
								scheme = connection.getScheme();
								if (sap.firefly.XStringUtils
										.isNotNullAndNotEmpty(scheme)) {
									sb.append(scheme);
									sb
											.append(sap.firefly.XUri.SCHEME_SEPARATOR);
								}
							}
							hasAuthority = 0;
							authenticationType = connection
									.getAuthenticationType();
							if (withUserPwd) {
								if ((authenticationType === sap.firefly.AuthenticationType.BASIC)
										|| (authenticationType === sap.firefly.AuthenticationType.SAML_WITH_PASSWORD)) {
									user = connection.getUser();
									pwd = connection.getPassword();
									if (sap.firefly.XStringUtils
											.isNotNullAndNotEmpty(user)) {
										sb.append(sap.firefly.XHttpUtils
												.encodeURIComponent(user));
										hasAuthority = 1;
									}
									if (sap.firefly.XStringUtils
											.isNotNullAndNotEmpty(pwd)) {
										sb
												.append(sap.firefly.XUri.USER_PWD_SEPARATOR);
										sb.append(sap.firefly.XHttpUtils
												.encodeURIComponent(pwd));
										hasAuthority = 2;
									}
								}
							}
							if (withAuthenticationType) {
								if ((authenticationType === sap.firefly.AuthenticationType.SAML_WITH_PASSWORD)
										|| (authenticationType === sap.firefly.AuthenticationType.SAML_WITH_CERTIFICATE)) {
									if (hasAuthority < 2) {
										sb
												.append(sap.firefly.XUri.USER_PWD_SEPARATOR);
									}
									sb
											.append(sap.firefly.XUri.USER_PWD_SEPARATOR);
									if (authenticationType === sap.firefly.AuthenticationType.SAML_WITH_PASSWORD) {
										sb
												.append(sap.firefly.XUri.SAML_USER_PWD);
									} else {
										if (authenticationType === sap.firefly.AuthenticationType.SAML_WITH_CERTIFICATE) {
											sb
													.append(sap.firefly.XUri.SAML_CERT);
										}
									}
									hasAuthority = 3;
								}
							}
							if (hasAuthority > 0) {
								sb.append(sap.firefly.XUri.AUTHORITY_SEPARATOR);
							}
							if (withHostPort) {
								host = connection.getHost();
								if (sap.firefly.XStringUtils
										.isNotNullAndNotEmpty(host)) {
									sb.append(host);
									port = connection.getPort();
									if (port > 0) {
										sb
												.append(sap.firefly.XUri.PORT_SEPARATOR);
										sb.append(sap.firefly.XInteger
												.convertIntegerToString(port));
									}
								}
							}
							if (uri !== null) {
								if (withPath) {
									path = uri.getPath();
									if (sap.firefly.XStringUtils
											.isNotNullAndNotEmpty(path)) {
										sb.append(path);
									}
								}
								if (withQuery) {
									query = uri.getQuery();
									if (sap.firefly.XStringUtils
											.isNotNullAndNotEmpty(query)) {
										sb
												.append(sap.firefly.XUri.QUERY_SEPARATOR);
										sb.append(query);
									}
								}
								if (withFragment) {
									fragment = uri.getFragment();
									if (sap.firefly.XStringUtils
											.isNotNullAndNotEmpty(fragment)) {
										sb
												.append(sap.firefly.XUri.FRAGMENT_SEPARATOR);
										sb.append(fragment);
									}
								}
							}
							return sb.toString();
						}
					},
					m_path : null,
					m_queryPairs : null,
					m_fragment : null,
					m_fragmentQueryPairs : null,
					setup : function() {
						sap.firefly.XUri.$superclass.setup.call(this);
						this.m_queryPairs = sap.firefly.XList.create();
					},
					releaseObject : function() {
						this.m_queryPairs = sap.firefly.XObject
								.releaseIfNotNull(this.m_queryPairs);
						this.m_fragmentQueryPairs = sap.firefly.XObject
								.releaseIfNotNull(this.m_fragmentQueryPairs);
						this.m_fragment = null;
						this.m_path = null;
						sap.firefly.XUri.$superclass.releaseObject.call(this);
					},
					setUriString : function(uriString) {
						this.setFromUriWithParent(uriString, null, false);
					},
					setFromConnection : function(connection) {
						var authenticationType;
						this.setScheme(connection.getScheme());
						this.setHost(connection.getHost());
						this.setPort(connection.getPort());
						authenticationType = connection.getAuthenticationType();
						this.setAuthenticationType(authenticationType);
						this.setUser(connection.getUser());
						this.setPassword(connection.getPassword());
					},
					setFromUri : function(uri) {
						this.setFromConnection(uri);
						this.setPath(uri.getPath());
						this.setQuery(uri.getQuery());
						this.setFragment(uri.getFragment());
					},
					setFromUriWithParent : function(uriString, parentUri,
							mergeQueries) {
						var start;
						var size;
						var parentQuery;
						var isRelative;
						var schemaIndex;
						var scheme;
						var pathIndex;
						var querySeparator;
						var fragmentIndex;
						var min;
						var authIndex;
						var auth;
						var userPwdIndex;
						var user;
						var authType;
						var pwdEnd;
						var authTypeIndex;
						var pwd;
						var portIndex;
						var host;
						var port;
						var portValue;
						var path;
						var query;
						var existingQuery;
						var queryBuffer;
						var fragment;
						if (uriString !== null) {
							start = 0;
							size = sap.firefly.XString.size(uriString);
							if ((parentUri !== null) && (mergeQueries)) {
								parentQuery = parentUri.getQuery();
								if (sap.firefly.XStringUtils
										.isNullOrEmpty(parentQuery) === false) {
									this.setQuery(parentQuery);
								}
							}
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(uriString) === false) {
								isRelative = true;
								schemaIndex = sap.firefly.XString.indexOf(
										uriString,
										sap.firefly.XUri.SCHEME_SEPARATOR);
								if (schemaIndex > -1) {
									scheme = sap.firefly.XString.substring(
											uriString, start, schemaIndex);
									start = schemaIndex + 3;
									if (sap.firefly.XStringUtils
											.isNullOrEmpty(scheme) === false) {
										this.setScheme(scheme);
									}
									isRelative = false;
								}
								pathIndex = sap.firefly.XString.indexOfFrom(
										uriString,
										sap.firefly.XUri.PATH_SEPARATOR, start);
								querySeparator = sap.firefly.XString
										.indexOfFrom(
												uriString,
												sap.firefly.XUri.QUERY_SEPARATOR,
												start);
								fragmentIndex = sap.firefly.XString
										.indexOfFrom(
												uriString,
												sap.firefly.XUri.FRAGMENT_SEPARATOR,
												start);
								if (isRelative) {
									if (parentUri !== null) {
										this.setScheme(parentUri.getScheme());
										this.setHost(parentUri.getHost());
										this.setPort(parentUri.getPort());
										this.setPath(parentUri.getPath());
									}
									if ((start !== querySeparator)
											&& (start !== fragmentIndex)) {
										pathIndex = start;
									}
								} else {
									authIndex = sap.firefly.XString
											.indexOfFrom(
													uriString,
													sap.firefly.XUri.AUTHORITY_SEPARATOR,
													start);
									min = sap.firefly.XUri.getMinimumPositive4(
											authIndex, pathIndex,
											querySeparator, size);
									if (authIndex === min) {
										auth = sap.firefly.XString.substring(
												uriString, start, authIndex);
										userPwdIndex = sap.firefly.XString
												.indexOf(
														auth,
														sap.firefly.XUri.USER_PWD_SEPARATOR);
										user = null;
										authType = null;
										if (userPwdIndex > -1) {
											user = sap.firefly.XString
													.substring(auth, 0,
															userPwdIndex);
											pwdEnd = -1;
											authTypeIndex = sap.firefly.XString
													.indexOfFrom(
															auth,
															sap.firefly.XUri.USER_PWD_SEPARATOR,
															userPwdIndex + 1);
											if (authTypeIndex !== -1) {
												pwdEnd = authTypeIndex;
												authType = sap.firefly.XString
														.substring(
																auth,
																authTypeIndex + 1,
																-1);
											}
											pwd = sap.firefly.XString
													.substring(auth,
															userPwdIndex + 1,
															pwdEnd);
											pwd = sap.firefly.XHttpUtils
													.decodeURIComponent(pwd);
											this.setPassword(pwd);
										} else {
											user = auth;
										}
										user = sap.firefly.XHttpUtils
												.decodeURIComponent(user);
										this.setUser(user);
										if (sap.firefly.XString.isEqual(
												sap.firefly.XUri.SAML_USER_PWD,
												authType)) {
											this
													.setAuthenticationType(sap.firefly.AuthenticationType.SAML_WITH_PASSWORD);
										} else {
											if (sap.firefly.XString.isEqual(
													sap.firefly.XUri.SAML_CERT,
													authType)) {
												this
														.setAuthenticationType(sap.firefly.AuthenticationType.SAML_WITH_CERTIFICATE);
											}
										}
										start = authIndex + 1;
										pathIndex = sap.firefly.XString
												.indexOfFrom(
														uriString,
														sap.firefly.XUri.PATH_SEPARATOR,
														start);
										querySeparator = sap.firefly.XString
												.indexOfFrom(
														uriString,
														sap.firefly.XUri.QUERY_SEPARATOR,
														start);
									}
									portIndex = sap.firefly.XString
											.indexOfFrom(
													uriString,
													sap.firefly.XUri.PORT_SEPARATOR,
													start);
									min = sap.firefly.XUri.getMinimumPositive4(
											portIndex, pathIndex,
											querySeparator, size);
									host = sap.firefly.XString.substring(
											uriString, start, min);
									start = min;
									if (sap.firefly.XStringUtils
											.isNullOrEmpty(host) === false) {
										this.setHost(host);
									}
									if (portIndex === min) {
										min = sap.firefly.XUri
												.getMinimumPositive3(pathIndex,
														querySeparator, size);
										port = null;
										port = sap.firefly.XString.substring(
												uriString, portIndex + 1, min);
										start = min;
										if (sap.firefly.XStringUtils
												.isNullOrEmpty(port) === false) {
											portValue = sap.firefly.XInteger
													.convertStringToIntegerWithDefault(
															port, 0);
											if (portValue > 0) {
												this.setPort(portValue);
											}
										}
									}
								}
								if (pathIndex === start) {
									min = sap.firefly.XUri
											.getMinimumPositive3(
													querySeparator,
													fragmentIndex, size);
									path = sap.firefly.XString.substring(
											uriString, start, min);
									start = min;
									if (sap.firefly.XStringUtils
											.isNullOrEmpty(path) === false) {
										if ((isRelative)
												&& (parentUri !== null)) {
											path = sap.firefly.XUri
													.createFromRelativePath(
															path, parentUri
																	.getPath());
										}
										this.setPath(path);
									}
								}
								if (querySeparator === start) {
									min = sap.firefly.XUri.getMinimumPositive2(
											fragmentIndex, size);
									query = sap.firefly.XString.substring(
											uriString, start + 1, min);
									start = min;
									if (sap.firefly.XStringUtils
											.isNullOrEmpty(query) === false) {
										existingQuery = this.getQuery();
										if ((isRelative)
												&& mergeQueries
												&& sap.firefly.XStringUtils
														.isNotNullAndNotEmpty(existingQuery)) {
											queryBuffer = sap.firefly.XStringBuffer
													.create();
											queryBuffer.append(existingQuery);
											queryBuffer
													.append(sap.firefly.XUri.QUERY_AND);
											queryBuffer.append(query);
											query = queryBuffer.toString();
										}
										this.setQuery(query);
									}
								}
								if (fragmentIndex === start) {
									fragment = sap.firefly.XString.substring(
											uriString, start + 1, -1);
									if (sap.firefly.XStringUtils
											.isNullOrEmpty(fragment) === false) {
										this.setFragment(fragment);
									}
								}
							}
						}
					},
					getQuery : function() {
						return sap.firefly.XUri.encodeQuery(this
								.getQueryElements());
					},
					setQuery : function(query) {
						this.m_queryPairs = sap.firefly.XUri.decodeQuery(query);
					},
					addQueryElement : function(name, value) {
						this.m_queryPairs.add(sap.firefly.XNameValuePair
								.createWithValues(name, value));
					},
					getQueryElements : function() {
						return this.m_queryPairs;
					},
					getQueryMap : function() {
						var elements = this.getQueryElements();
						var map = sap.firefly.XHashMapOfStringByString.create();
						var i;
						var nameValuePair;
						for (i = 0; i < elements.size(); i++) {
							nameValuePair = elements.get(i);
							map.put(nameValuePair.getName(), nameValuePair
									.getValue());
						}
						return map;
					},
					setFragment : function(fragment) {
						this.m_fragment = fragment;
						this.m_fragmentQueryPairs = null;
					},
					getFragment : function() {
						var buffer;
						if (this.m_fragmentQueryPairs === null) {
							return this.m_fragment;
						}
						buffer = sap.firefly.XStringBuffer.create();
						buffer.append(sap.firefly.XUri.FRAGMENT_QUERY_START);
						buffer.append(sap.firefly.XUri
								.encodeQuery(this.m_fragmentQueryPairs));
						return buffer.toString();
					},
					addFragmentQueryElement : function(name, value) {
						if (this.m_fragmentQueryPairs === null) {
							this.m_fragmentQueryPairs = sap.firefly.XList
									.create();
							this.m_fragment = null;
						}
						this.m_fragmentQueryPairs
								.add(sap.firefly.XNameValuePair
										.createWithValues(name, value));
					},
					getFragmentQueryElements : function() {
						var fragmentQuery;
						if (this.m_fragmentQueryPairs === null) {
							if ((this.m_fragment !== null)
									&& sap.firefly.XString
											.startsWith(
													this.m_fragment,
													sap.firefly.XUri.FRAGMENT_QUERY_START)) {
								fragmentQuery = sap.firefly.XString.substring(
										this.m_fragment, 1, -1);
								this.m_fragmentQueryPairs = sap.firefly.XUri
										.decodeQuery(fragmentQuery);
								this.m_fragment = null;
							}
						}
						return this.m_fragmentQueryPairs;
					},
					getFragmentQueryMap : function() {
						var map = sap.firefly.XHashMapOfStringByString.create();
						var elements = this.getFragmentQueryElements();
						var i;
						var nameValuePair;
						if (elements !== null) {
							for (i = 0; i < elements.size(); i++) {
								nameValuePair = elements.get(i);
								map.put(nameValuePair.getName(), nameValuePair
										.getValue());
							}
						}
						return map;
					},
					getPath : function() {
						return this.m_path;
					},
					setPath : function(path) {
						this.m_path = path;
					},
					setUser : function(user) {
						var authenticationType;
						sap.firefly.XUri.$superclass.setUser.call(this, user);
						authenticationType = this.getAuthenticationType();
						if (authenticationType === sap.firefly.AuthenticationType.NONE) {
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(user)) {
								this
										.setAuthenticationInternal(sap.firefly.AuthenticationType.BASIC);
							}
						}
					},
					setAuthenticationType : function(type) {
						if ((type !== sap.firefly.AuthenticationType.BASIC)
								&& (type !== sap.firefly.AuthenticationType.NONE)
								&& (type !== sap.firefly.AuthenticationType.SAML_WITH_CERTIFICATE)
								&& (type !== sap.firefly.AuthenticationType.SAML_WITH_PASSWORD)) {
							throw sap.firefly.XException
									.createUnsupportedOperationException();
						}
						this.setAuthenticationInternal(type);
					},
					isRelativeUri : function() {
						return ((this.getProtocolType() === null) && (this
								.getHost() === null));
					},
					getUriString : function() {
						return sap.firefly.XUri.getUriStringStatic(this, this,
								true, true, false, true, true, true, true);
					},
					getUriStringWithoutAuthentication : function() {
						return sap.firefly.XUri.getUriStringStatic(this, this,
								true, false, false, true, true, true, true);
					},
					getUriStringExt : function(withSchema, withUserPwd,
							withAuthenticationType, withHostPort, withPath,
							withQuery, withFragment) {
						return sap.firefly.XUri.getUriStringStatic(this, this,
								withSchema, withUserPwd,
								withAuthenticationType, withHostPort, withPath,
								withQuery, withFragment);
					},
					toString : function() {
						return this.getUriStringExt(true, true, true, true,
								true, true, true);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.AuthenticationType",
				sap.firefly.XConstant,
				{
					$statics : {
						NONE : null,
						BASIC : null,
						BEARER : null,
						CERTIFICATES : null,
						KERBEROS : null,
						SECURE_LOGIN_PROFILE : null,
						SAML_WITH_PASSWORD : null,
						SAML_WITH_CERTIFICATE : null,
						s_instances : null,
						staticSetup : function() {
							sap.firefly.AuthenticationType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.AuthenticationType.NONE = sap.firefly.AuthenticationType
									.create("NONE");
							sap.firefly.AuthenticationType.BASIC = sap.firefly.AuthenticationType
									.create("BASIC");
							sap.firefly.AuthenticationType.BEARER = sap.firefly.AuthenticationType
									.create("BEARER");
							sap.firefly.AuthenticationType.CERTIFICATES = sap.firefly.AuthenticationType
									.create("CERTIFICATES");
							sap.firefly.AuthenticationType.KERBEROS = sap.firefly.AuthenticationType
									.create("KERBEROS");
							sap.firefly.AuthenticationType.SECURE_LOGIN_PROFILE = sap.firefly.AuthenticationType
									.create("SECURE_LOGIN_PROFILE");
							sap.firefly.AuthenticationType.SAML_WITH_PASSWORD = sap.firefly.AuthenticationType
									.create("SAML_WITH_PASSWORD");
							sap.firefly.AuthenticationType.SAML_WITH_CERTIFICATE = sap.firefly.AuthenticationType
									.create("SAML_WITH_CERTIFICATE");
						},
						create : function(name) {
							var newConstant = new sap.firefly.AuthenticationType();
							newConstant.setName(name);
							sap.firefly.AuthenticationType.s_instances.put(
									name, newConstant);
							return newConstant;
						},
						lookup : function(name) {
							var type = sap.firefly.AuthenticationType.s_instances
									.getByKey(name);
							return type;
						}
					}
				});
$Firefly.createClass("sap.firefly.ProtocolType", sap.firefly.XConstant, {
	$statics : {
		HTTP : null,
		HTTPS : null,
		FILE : null,
		INA_DB : null,
		SQL : null,
		s_instances : null,
		staticSetup : function() {
			sap.firefly.ProtocolType.s_instances = sap.firefly.XHashMapByString
					.create();
			sap.firefly.ProtocolType.HTTP = sap.firefly.ProtocolType
					.create("http");
			sap.firefly.ProtocolType.HTTPS = sap.firefly.ProtocolType
					.create("https");
			sap.firefly.ProtocolType.FILE = sap.firefly.ProtocolType
					.create("file");
			sap.firefly.ProtocolType.INA_DB = sap.firefly.ProtocolType
					.create("ina_db");
			sap.firefly.ProtocolType.SQL = sap.firefly.ProtocolType
					.create("sql");
		},
		create : function(name) {
			var newConstant = new sap.firefly.ProtocolType();
			newConstant.setName(name);
			newConstant.m_uriName = sap.firefly.XString.concatenate2(name,
					"://");
			sap.firefly.ProtocolType.s_instances.put(name, newConstant);
			sap.firefly.ProtocolType.s_instances.put(sap.firefly.XString
					.convertToLowerCase(name), newConstant);
			return newConstant;
		},
		lookup : function(name) {
			var lowerCase;
			if (name === null) {
				return null;
			}
			lowerCase = sap.firefly.XString.convertToLowerCase(name);
			return sap.firefly.ProtocolType.s_instances.getByKey(lowerCase);
		},
		lookupAll : function() {
			var iterator = sap.firefly.ProtocolType.s_instances.getIterator();
			return iterator;
		}
	},
	m_uriName : null,
	getUriName : function() {
		return this.m_uriName;
	}
});
$Firefly
		.createClass(
				"sap.firefly.HttpContentType",
				sap.firefly.XConstant,
				{
					$statics : {
						WILDCARD : null,
						APPLICATION_JSON : null,
						APPLICATION_FORM : null,
						APPLICATION_XJAVASCRIPT : null,
						APPLICATION_JAVASCRIPT : null,
						APPLICATION_XML : null,
						APPLICATION_ATOM_XML : null,
						APPLICATION_FLASH : null,
						APPLICATION_OCTETSTREAM : null,
						APPLICATION_XFONT_TTF : null,
						TEXT_HTML : null,
						TEXT_CSS : null,
						TEXT_CSV : null,
						TEXT_PLAIN : null,
						TEXT_XML : null,
						TEXT_JAVASCRIPT : null,
						IMAGE_GIF : null,
						IMAGE_JPEG : null,
						IMAGE_PNG : null,
						IMAGE_XICON : null,
						FONT_WOFF : null,
						s_instances : null,
						s_mimeTypeMapping : null,
						staticSetup : function() {
							sap.firefly.HttpContentType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.HttpContentType.s_mimeTypeMapping = sap.firefly.XHashMapByString
									.create();
							sap.firefly.HttpContentType.WILDCARD = sap.firefly.HttpContentType
									.create("*/*",
											sap.firefly.ContentType.BINARY,
											true);
							sap.firefly.HttpContentType.TEXT_HTML = sap.firefly.HttpContentType
									.create("text/html",
											sap.firefly.ContentType.TEXT_HTML,
											true);
							sap.firefly.HttpContentType.TEXT_CSS = sap.firefly.HttpContentType
									.create("text/css", null, true);
							sap.firefly.HttpContentType.TEXT_CSV = sap.firefly.HttpContentType
									.create("text/csv", null, true);
							sap.firefly.HttpContentType.TEXT_PLAIN = sap.firefly.HttpContentType
									.create("text/plain", null, true);
							sap.firefly.HttpContentType.TEXT_JAVASCRIPT = sap.firefly.HttpContentType
									.create("text/javascript", null, true);
							sap.firefly.HttpContentType.TEXT_XML = sap.firefly.HttpContentType
									.create("text/xml",
											sap.firefly.ContentType.XML, true);
							sap.firefly.HttpContentType.APPLICATION_JSON = sap.firefly.HttpContentType
									.create("application/json",
											sap.firefly.ContentType.JSON, true);
							sap.firefly.HttpContentType.APPLICATION_FORM = sap.firefly.HttpContentType
									.create(
											"application/x-www-form-urlencoded",
											sap.firefly.ContentType.URI_PARAMETER,
											true);
							sap.firefly.HttpContentType.APPLICATION_XJAVASCRIPT = sap.firefly.HttpContentType
									.create("application/x-javascript", null,
											true);
							sap.firefly.HttpContentType.APPLICATION_JAVASCRIPT = sap.firefly.HttpContentType
									.create("application/javascript", null,
											true);
							sap.firefly.HttpContentType.APPLICATION_XML = sap.firefly.HttpContentType
									.create("application/xml",
											sap.firefly.ContentType.XML, true);
							sap.firefly.HttpContentType.APPLICATION_FLASH = sap.firefly.HttpContentType
									.create("application/x-shockwave-flash",
											null, false);
							sap.firefly.HttpContentType.APPLICATION_XFONT_TTF = sap.firefly.HttpContentType
									.create("application/x-font-ttf", null,
											false);
							sap.firefly.HttpContentType.APPLICATION_ATOM_XML = sap.firefly.HttpContentType
									.create("application/atom+xml",
											sap.firefly.ContentType.XML, true);
							sap.firefly.HttpContentType.IMAGE_GIF = sap.firefly.HttpContentType
									.create("image/gif", null, false);
							sap.firefly.HttpContentType.IMAGE_JPEG = sap.firefly.HttpContentType
									.create("image/jpeg", null, false);
							sap.firefly.HttpContentType.IMAGE_PNG = sap.firefly.HttpContentType
									.create("image/png", null, false);
							sap.firefly.HttpContentType.IMAGE_XICON = sap.firefly.HttpContentType
									.create("image/x-icon", null, false);
							sap.firefly.HttpContentType.FONT_WOFF = sap.firefly.HttpContentType
									.create("font/woff", null, false);
							sap.firefly.HttpContentType.APPLICATION_OCTETSTREAM = sap.firefly.HttpContentType
									.create("application/octet-stream", null,
											true);
							sap.firefly.HttpContentType.s_mimeTypeMapping.put(
									"txt",
									sap.firefly.HttpContentType.TEXT_PLAIN);
							sap.firefly.HttpContentType.s_mimeTypeMapping.put(
									"html",
									sap.firefly.HttpContentType.TEXT_HTML);
							sap.firefly.HttpContentType.s_mimeTypeMapping.put(
									"htm",
									sap.firefly.HttpContentType.TEXT_HTML);
							sap.firefly.HttpContentType.s_mimeTypeMapping
									.put(
											"css",
											sap.firefly.HttpContentType.TEXT_CSS);
							sap.firefly.HttpContentType.s_mimeTypeMapping
									.put(
											"js",
											sap.firefly.HttpContentType.TEXT_JAVASCRIPT);
							sap.firefly.HttpContentType.s_mimeTypeMapping
									.put(
											"xml",
											sap.firefly.HttpContentType.TEXT_XML);
							sap.firefly.HttpContentType.s_mimeTypeMapping.put(
									"png",
									sap.firefly.HttpContentType.IMAGE_PNG);
							sap.firefly.HttpContentType.s_mimeTypeMapping.put(
									"jpg",
									sap.firefly.HttpContentType.IMAGE_JPEG);
							sap.firefly.HttpContentType.s_mimeTypeMapping.put(
									"jpeg",
									sap.firefly.HttpContentType.IMAGE_JPEG);
							sap.firefly.HttpContentType.s_mimeTypeMapping.put(
									"jpe",
									sap.firefly.HttpContentType.IMAGE_JPEG);
							sap.firefly.HttpContentType.s_mimeTypeMapping.put(
									"gif",
									sap.firefly.HttpContentType.IMAGE_GIF);
							sap.firefly.HttpContentType.s_mimeTypeMapping.put(
									"woff",
									sap.firefly.HttpContentType.FONT_WOFF);
							sap.firefly.HttpContentType.s_mimeTypeMapping.put(
									"properties",
									sap.firefly.HttpContentType.TEXT_PLAIN);
							sap.firefly.HttpContentType.s_mimeTypeMapping
									.put(
											"json",
											sap.firefly.HttpContentType.APPLICATION_JSON);
						},
						create : function(name, genericContentType, isText) {
							var newConstant = new sap.firefly.HttpContentType();
							newConstant.setup(name, genericContentType, isText);
							sap.firefly.HttpContentType.s_instances.put(name,
									newConstant);
							return newConstant;
						},
						lookup : function(name) {
							var type = sap.firefly.HttpContentType.s_instances
									.getByKey(name);
							return type;
						},
						lookupByFileEnding : function(name) {
							var type = sap.firefly.HttpContentType.s_mimeTypeMapping
									.getByKey(name);
							return type;
						}
					},
					m_genericContentType : null,
					m_isText : false,
					setup : function(name, genericContentType, isText) {
						this.setName(name);
						this.m_genericContentType = genericContentType;
						this.m_isText = isText;
					},
					getGenericContentType : function() {
						return this.m_genericContentType;
					},
					isText : function() {
						return this.m_isText;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.HttpRequestMethod",
				sap.firefly.XConstant,
				{
					$statics : {
						HTTP_GET : null,
						HTTP_POST : null,
						HTTP_PUT : null,
						HTTP_DELETE : null,
						s_instances : null,
						create : function(name) {
							var newConstant = new sap.firefly.HttpRequestMethod();
							newConstant.setName(name);
							sap.firefly.HttpRequestMethod.s_instances.put(name,
									newConstant);
							return newConstant;
						},
						lookup : function(name) {
							var type = sap.firefly.HttpRequestMethod.s_instances
									.getByKey(name);
							return type;
						},
						staticSetup : function() {
							sap.firefly.HttpRequestMethod.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.HttpRequestMethod.HTTP_GET = sap.firefly.HttpRequestMethod
									.create("GET");
							sap.firefly.HttpRequestMethod.HTTP_POST = sap.firefly.HttpRequestMethod
									.create("POST");
							sap.firefly.HttpRequestMethod.HTTP_PUT = sap.firefly.HttpRequestMethod
									.create("PUT");
							sap.firefly.HttpRequestMethod.HTTP_DELETE = sap.firefly.HttpRequestMethod
									.create("DELETE");
						}
					}
				});
$Firefly.createClass("sap.firefly.HttpCookie", sap.firefly.XNameValuePair, {
	$statics : {
		createCookie : function() {
			var cookie = new sap.firefly.HttpCookie();
			return cookie;
		},
		createCopy : function(cookie) {
			var newCookie = new sap.firefly.HttpCookie();
			newCookie.setFromCookie(cookie);
			return newCookie;
		}
	},
	m_comment : null,
	m_domain : null,
	m_path : null,
	m_version : 0,
	m_maxAge : 0,
	m_isSecure : false,
	m_isHttpOnly : false,
	releaseObject : function() {
		this.m_comment = null;
		this.m_domain = null;
		this.m_path = null;
		sap.firefly.HttpCookie.$superclass.releaseObject.call(this);
	},
	setByHttpServerResponseValue : function(httpHeaderValue) {
		var cookieAttributes;
		var start;
		var cookieName;
		var cookieValue;
		var end;
		var subValue;
		var assignIndex;
		var attributeName;
		var attributeValue;
		var path;
		var domain;
		var secure;
		var isHttpOnly;
		if (httpHeaderValue !== null) {
			cookieAttributes = sap.firefly.XProperties.create();
			start = 0;
			cookieName = null;
			cookieValue = null;
			while (true) {
				end = sap.firefly.XString.indexOfFrom(httpHeaderValue, ";",
						start);
				subValue = sap.firefly.XString.substring(httpHeaderValue,
						start, end);
				assignIndex = sap.firefly.XString.indexOf(subValue, "=");
				if (assignIndex === -1) {
					attributeName = subValue;
					attributeValue = "";
				} else {
					attributeName = sap.firefly.XString.substring(subValue, 0,
							assignIndex);
					attributeValue = sap.firefly.XString.substring(subValue,
							assignIndex + 1, -1);
				}
				attributeName = sap.firefly.XString.trim(attributeName);
				attributeValue = sap.firefly.XString.trim(attributeValue);
				if (cookieName === null) {
					cookieName = attributeName;
					cookieValue = attributeValue;
				} else {
					attributeName = sap.firefly.XString
							.convertToLowerCase(attributeName);
					cookieAttributes.setStringByName(attributeName,
							attributeValue);
				}
				if (end === -1) {
					break;
				}
				start = end + 1;
			}
			this.setName(cookieName);
			this.setValue(cookieValue);
			path = cookieAttributes.getStringByName("path");
			this.setPath(path);
			domain = cookieAttributes.getStringByName("domain");
			this.setDomain(domain);
			secure = cookieAttributes.getStringByName("secure");
			if (secure !== null) {
				this.setIsSecure(true);
			}
			isHttpOnly = cookieAttributes.getStringByName("httponly");
			if (isHttpOnly !== null) {
				this.setIsHttpOnly(true);
			}
		}
	},
	getComment : function() {
		return this.m_comment;
	},
	setComment : function(comment) {
		this.m_comment = comment;
	},
	getDomain : function() {
		return this.m_domain;
	},
	setDomain : function(domain) {
		this.m_domain = domain;
	},
	getPath : function() {
		return this.m_path;
	},
	setPath : function(path) {
		this.m_path = path;
	},
	getVersion : function() {
		return this.m_version;
	},
	setVersion : function(version) {
		this.m_version = version;
	},
	getMaxAge : function() {
		return this.m_maxAge;
	},
	setMaxAge : function(maxAge) {
		this.m_maxAge = maxAge;
	},
	isSecure : function() {
		return this.m_isSecure;
	},
	setIsSecure : function(isSecure) {
		this.m_isSecure = isSecure;
	},
	isHttpOnly : function() {
		return this.m_isHttpOnly;
	},
	setIsHttpOnly : function(isHttpOnly) {
		this.m_isHttpOnly = isHttpOnly;
	},
	setFromCookie : function(cookie) {
		this.setName(cookie.getName());
		this.setValue(cookie.getValue());
		this.setPath(cookie.getPath());
		this.setComment(cookie.getComment());
		this.setDomain(cookie.getDomain());
		this.setIsSecure(cookie.isSecure());
		this.setMaxAge(cookie.getMaxAge());
		this.setVersion(cookie.getVersion());
		this.setIsHttpOnly(cookie.isHttpOnly());
	},
	toString : function() {
		var buffer = sap.firefly.XStringBuffer.create();
		buffer.append(this.getName());
		if (this.getValue() !== null) {
			buffer.append("=");
			buffer.append(this.getValue());
		}
		if (this.getPath() !== null) {
			buffer.append("; Path=");
			buffer.append(this.getPath());
		}
		if (this.getDomain() !== null) {
			buffer.append("; Domain=");
			buffer.append(this.getDomain());
		}
		if (this.isSecure()) {
			buffer.append("; Secure");
		}
		if (this.isHttpOnly()) {
			buffer.append("; HttpOnly");
		}
		return buffer.toString();
	}
});
$Firefly.createClass("sap.firefly.HttpResponse", sap.firefly.HttpExchange, {
	$statics : {
		createResponse : function(httpRequest) {
			var response = new sap.firefly.HttpResponse();
			response.setupResponse(httpRequest);
			return response;
		}
	},
	m_statusCode : 0,
	m_statusCodeDetails : null,
	m_httpMethodWithVersion : null,
	m_httpRequest : null,
	setupResponse : function(httpRequest) {
		var cookiesMasterStore;
		this.setupProtocol();
		this.m_httpRequest = httpRequest;
		cookiesMasterStore = httpRequest.getCookiesMasterStore();
		this.setCookiesMasterStore(cookiesMasterStore);
	},
	releaseObject : function() {
		this.m_statusCodeDetails = null;
		this.m_httpMethodWithVersion = null;
		sap.firefly.HttpResponse.$superclass.releaseObject.call(this);
	},
	getStatusCode : function() {
		return this.m_statusCode;
	},
	setStatusCode : function(statusCode) {
		this.m_statusCode = statusCode;
	},
	getStatusCodeDetails : function() {
		return this.m_statusCodeDetails;
	},
	setStatusCodeDetails : function(details) {
		this.m_statusCodeDetails = details;
	},
	getHttpMethodWithVersion : function() {
		return this.m_httpMethodWithVersion;
	},
	setHttpMethodWithVersion : function(httpMethod) {
		this.m_httpMethodWithVersion = httpMethod;
	},
	getLocation : function() {
		return this.getHeaderFields().getByKey(
				sap.firefly.HttpConstants.HD_LOCATION);
	},
	setLocation : function(location) {
		this.getHeaderFieldsBase().setStringByName(
				sap.firefly.HttpConstants.HD_LOCATION, location);
	},
	createRawData : function() {
		var httpBuffer = sap.firefly.XStringBuffer.create();
		var contentType;
		var data;
		var isDataSet;
		var postData;
		var binaryContent;
		var httpGetResponse;
		var bytes;
		var full;
		httpBuffer.append(sap.firefly.HttpConstants.HTTP_11);
		httpBuffer.append(" ");
		httpBuffer.append(sap.firefly.XInteger.convertIntegerToString(this
				.getStatusCode()));
		httpBuffer.append(" ");
		httpBuffer.append(this.getStatusCodeDetails());
		httpBuffer.append(sap.firefly.HttpConstants.HTTP_CRLF);
		if (this.getLocation() !== null) {
			httpBuffer.append(sap.firefly.HttpConstants.HD_LOCATION);
			httpBuffer.append(": ");
			httpBuffer.append(this.getLocation());
			httpBuffer.append(sap.firefly.HttpConstants.HTTP_CRLF);
		}
		httpBuffer.append(sap.firefly.HttpConstants.HD_CONTENT_TYPE);
		httpBuffer.append(": ");
		contentType = this.getHttpContentType();
		data = null;
		isDataSet = false;
		if (contentType === null) {
			httpBuffer.append(this.getContentTypeValue());
		} else {
			httpBuffer.append(contentType.getName());
			if (contentType.isText()) {
				httpBuffer.append(";charset=utf-8");
				postData = this.getStringContent();
				if (postData !== null) {
					data = sap.firefly.XByteArray
							.convertStringToXByteArray(postData);
				}
				isDataSet = true;
			}
		}
		httpBuffer.append(sap.firefly.HttpConstants.HTTP_CRLF);
		this.appendCookies(httpBuffer);
		if (isDataSet === false) {
			binaryContent = this.getBinaryContent();
			if (binaryContent !== null) {
				data = binaryContent;
			}
		}
		httpBuffer.append(sap.firefly.HttpConstants.HD_CONTENT_LENGTH);
		httpBuffer.append(": ");
		if (data === null) {
			httpBuffer.append("0");
		} else {
			httpBuffer.appendInt(data.size());
		}
		httpBuffer.append(sap.firefly.HttpConstants.HTTP_CRLF);
		this.appendHeadFields(httpBuffer);
		httpBuffer.append(sap.firefly.HttpConstants.HTTP_CRLF);
		httpGetResponse = httpBuffer.toString();
		bytes = sap.firefly.XByteArray.convertStringToXByteArrayWithCharset(
				httpGetResponse, sap.firefly.XCharset.USASCII);
		full = bytes;
		if (data !== null) {
			full = sap.firefly.XByteArray.create(null, bytes.size()
					+ data.size());
			sap.firefly.XByteArray.copy(bytes, 0, full, 0, bytes.size());
			sap.firefly.XByteArray.copy(data, 0, full, bytes.size(), data
					.size());
		}
		return sap.firefly.HttpRawData.create(null, null, 0, full);
	},
	appendCookies : function(httpBuffer) {
		var cookieContainer = this.getCookies();
		var cookies;
		var i;
		var currentCookie;
		if (cookieContainer !== null) {
			cookies = cookieContainer.getCookies();
			for (i = 0; i < cookies.size(); i++) {
				currentCookie = cookies.get(i);
				httpBuffer.append(sap.firefly.HttpConstants.HD_SET_COOKIE);
				httpBuffer.append(": ");
				httpBuffer.append(currentCookie.getName());
				httpBuffer.append("=");
				httpBuffer.append(currentCookie.getValue());
				httpBuffer.append(";Path=");
				httpBuffer.append(currentCookie.getPath());
				httpBuffer.append(sap.firefly.HttpConstants.HTTP_CRLF);
			}
		}
	},
	appendHeadFields : function(httpBuffer) {
		var headerFields = this.getHeaderFields();
		var keysAsIteratorOfString = headerFields.getKeysAsIteratorOfString();
		var headerName;
		var headerValue;
		while (keysAsIteratorOfString.hasNext()) {
			headerName = keysAsIteratorOfString.next();
			headerValue = headerFields.getByKey(headerName);
			httpBuffer.append(headerName);
			httpBuffer.append(": ");
			httpBuffer.append(headerValue);
			httpBuffer.append(sap.firefly.HttpConstants.HTTP_CRLF);
		}
	},
	getHttpRequest : function() {
		return this.m_httpRequest;
	},
	applyCookiesToMasterStorage : function() {
		var httpRequest;
		var host;
		var path;
		var cookies;
		if ((this.m_cookiesMasterStore !== null) && (this.m_cookies !== null)) {
			httpRequest = this.getHttpRequest();
			host = httpRequest.getHost();
			path = httpRequest.getPath();
			cookies = this.getCookies();
			this.m_cookiesMasterStore.applyCookies(host, path, cookies);
		}
	},
	toString : function() {
		var sb = sap.firefly.XStringBuffer.create();
		var contentType;
		var postData;
		var cookieContainer;
		var cookies;
		var currentCookie;
		var i;
		var headerFields;
		var keysAsIteratorOfString;
		var headerName;
		var headerValue;
		sb.appendNewLine();
		sb.append("*************");
		sb.appendNewLine();
		sb.append("HTTP Response");
		sb.appendNewLine();
		sb.append("*************");
		sb.appendNewLine();
		sb.append(sap.firefly.HttpConstants.HTTP_11);
		sb.append(" ");
		sb.append(sap.firefly.XInteger.convertIntegerToString(this
				.getStatusCode()));
		sb.append(" ");
		sb.append(this.getStatusCodeDetails());
		sb.append(sap.firefly.HttpConstants.HTTP_CRLF);
		if (this.getLocation() !== null) {
			sb.append(sap.firefly.HttpConstants.HD_LOCATION);
			sb.append(": ");
			sb.append(this.getLocation());
			sb.append(sap.firefly.HttpConstants.HTTP_CRLF);
		}
		contentType = this.getHttpContentType();
		postData = null;
		if (contentType !== null) {
			if (contentType.isText()) {
				postData = this.getStringContent();
			}
		}
		cookieContainer = this.getCookies();
		if (cookieContainer !== null) {
			cookies = cookieContainer.getCookies();
			for (i = 0; i < cookies.size(); i++) {
				currentCookie = cookies.get(i);
				sb.append(sap.firefly.HttpConstants.HD_SET_COOKIE);
				sb.append(": ");
				sb.append(currentCookie.getName());
				sb.append("=");
				sb.append(currentCookie.getValue());
				sb.append(";Path=");
				sb.append(currentCookie.getPath());
				sb.append(sap.firefly.HttpConstants.HTTP_CRLF);
			}
		}
		headerFields = this.getHeaderFields();
		keysAsIteratorOfString = headerFields.getKeysAsIteratorOfString();
		while (keysAsIteratorOfString.hasNext()) {
			headerName = keysAsIteratorOfString.next();
			headerValue = headerFields.getByKey(headerName);
			sb.append(headerName);
			sb.append(": ");
			sb.append(headerValue);
			sb.append(sap.firefly.HttpConstants.HTTP_CRLF);
		}
		if (postData !== null) {
			sb.append(sap.firefly.HttpConstants.HTTP_CRLF);
			sb.append(postData);
			sb.append(sap.firefly.HttpConstants.HTTP_CRLF);
		}
		return sb.toString();
	}
});
$Firefly.createClass("sap.firefly.HttpServerConfig", sap.firefly.XConnection, {
	$statics : {
		create : function() {
			var obj = new sap.firefly.HttpServerConfig();
			obj.setup();
			return obj;
		}
	},
	m_listener : null,
	releaseObject : function() {
		this.m_listener = null;
		sap.firefly.HttpServerConfig.$superclass.releaseObject.call(this);
	},
	getCallback : function() {
		return this.m_listener;
	},
	setCallback : function(listener) {
		this.m_listener = listener;
	}
});
$Firefly.createClass("sap.firefly.XPrompt", sap.firefly.MessageManager, {
	$statics : {
		s_nativePrompt : null,
		getInstance : function() {
			return sap.firefly.XPrompt.s_nativePrompt;
		},
		setInstance : function(prompt) {
			sap.firefly.XPrompt.s_nativePrompt = prompt;
		},
		staticSetup : function() {
			var prompt = new sap.firefly.XPrompt();
			prompt.setup();
			sap.firefly.XPrompt.setInstance(prompt);
		}
	},
	getComponentName : function() {
		return "XPrompt";
	},
	readLine : function() {
		return null;
	},
	println : function(line) {
		sap.firefly.XLogger.println(line);
	},
	print : function(text) {
		sap.firefly.XLogger.println(text);
	}
});
$Firefly
		.createClass(
				"sap.firefly.XFile",
				sap.firefly.MessageManager,
				{
					$statics : {
						GZIP_EXTENSION : ".gz",
						SLASH : "/",
						NATIVE_SLASH : null,
						IS_SUPPORTED : false,
						DEBUG_MODE : false,
						s_fileSystem : null,
						s_fileSystems : null,
						createVirtualRoot : function() {
							var file;
							if (sap.firefly.XFile.s_fileSystem === null) {
								return null;
							}
							file = new sap.firefly.XFile();
							file.setupFile(sap.firefly.XFile.s_fileSystem,
									null, null);
							return file;
						},
						create : function(normalizedPath) {
							var file;
							if (sap.firefly.XFile.s_fileSystem === null) {
								return null;
							}
							file = new sap.firefly.XFile();
							file.setupFile(sap.firefly.XFile.s_fileSystem,
									normalizedPath, null);
							return file;
						},
						createByUri : function(session, uri) {
							var protocolType = uri.getProtocolType();
							var path;
							if (protocolType === sap.firefly.ProtocolType.FILE) {
								path = uri.getPath();
								return sap.firefly.XFile.create(path);
							} else {
								if ((protocolType === sap.firefly.ProtocolType.HTTP)
										|| (protocolType === sap.firefly.ProtocolType.HTTPS)) {
									return sap.firefly.XHttpFile._create(
											session, uri);
								} else {
									return null;
								}
							}
						},
						createByNativePath : function(nativePath) {
							var file;
							if (sap.firefly.XFile.s_fileSystem === null) {
								return null;
							}
							file = new sap.firefly.XFile();
							file.setupFile(sap.firefly.XFile.s_fileSystem,
									null, nativePath);
							return file;
						},
						createByFileSystem : function(fileSystem,
								normalizedPath, nativePath) {
							var file = new sap.firefly.XFile();
							file.setupFile(fileSystem, normalizedPath,
									nativePath);
							return file;
						},
						createByFileSystemType : function(fileSystemType,
								normalizedPath, nativePath) {
							var file;
							if (sap.firefly.XFile.s_fileSystems
									.containsKey(fileSystemType.getName())) {
								file = new sap.firefly.XFile();
								file.setupFile(sap.firefly.XFile.s_fileSystems
										.getByKey(fileSystemType.getName()),
										normalizedPath, nativePath);
								return file;
							}
							return null;
						},
						createFileObjects : function(fileSystem, nativePathList) {
							var fileList = sap.firefly.XList.create();
							var i;
							var nativePath;
							var file;
							for (i = 0; i < nativePathList.size(); i++) {
								nativePath = nativePathList.get(i);
								file = new sap.firefly.XFile();
								file.setupFile(fileSystem, null, nativePath);
								fileList.add(file);
							}
							return fileList;
						},
						convertNativeToNormalizedPath : function(nativePath) {
							var normalized = nativePath;
							if (sap.firefly.XString.isEqual(
									sap.firefly.XFile.NATIVE_SLASH, "/") === false) {
								normalized = sap.firefly.XString.replace(
										normalized,
										sap.firefly.XFile.NATIVE_SLASH, "/");
								if (sap.firefly.XString.startsWith(normalized,
										"/") === false) {
									normalized = sap.firefly.XString
											.concatenate2("/", normalized);
								}
							}
							return normalized;
						},
						convertNormalizedToNativePath : function(normalizedPath) {
							var nativePath = normalizedPath;
							if (sap.firefly.XString.isEqual(
									sap.firefly.XFile.NATIVE_SLASH, "/") === false) {
								nativePath = sap.firefly.XString.substring(
										nativePath, 1, -1);
								nativePath = sap.firefly.XString.replace(
										nativePath, "/",
										sap.firefly.XFile.NATIVE_SLASH);
							}
							return nativePath;
						},
						setFileSystem : function(fileSystem) {
							sap.firefly.XFile.s_fileSystem = fileSystem;
							if (sap.firefly.XFile.s_fileSystems === null) {
								sap.firefly.XFile.s_fileSystems = sap.firefly.XHashMapByString
										.create();
							}
							sap.firefly.XFile.s_fileSystems.putIfNotNull(
									fileSystem.getFileSystemType().getName(),
									fileSystem);
						},
						getFileSystem : function() {
							return sap.firefly.XFile.s_fileSystem;
						}
					},
					m_activeFileSystem : null,
					m_name : null,
					m_nativePath : null,
					m_normalizedPath : null,
					m_pathElements : null,
					m_fileSystemType : null,
					releaseObject : function() {
						if (this.m_activeFileSystem !== null) {
							this.m_activeFileSystem.releaseObject();
							this.m_activeFileSystem = null;
						}
						sap.firefly.XFile.$superclass.releaseObject.call(this);
					},
					setupFile : function(fileSystem, normalizedPath, nativePath) {
						var endsWithSlash;
						var size;
						var cutted;
						var elementCount;
						this.setup();
						this.m_activeFileSystem = fileSystem;
						this.m_fileSystemType = this.m_activeFileSystem
								.getFileSystemType();
						this.m_nativePath = nativePath;
						this.m_normalizedPath = normalizedPath;
						if (nativePath !== null) {
							this.m_normalizedPath = sap.firefly.XFile
									.convertNativeToNormalizedPath(nativePath);
						} else {
							if (normalizedPath !== null) {
								this.m_nativePath = sap.firefly.XFile
										.convertNormalizedToNativePath(normalizedPath);
							}
						}
						if (this.m_normalizedPath !== null) {
							endsWithSlash = sap.firefly.XString.endsWith(
									this.m_normalizedPath,
									sap.firefly.XFile.SLASH);
							size = sap.firefly.XString
									.size(this.m_normalizedPath);
							if (endsWithSlash) {
								cutted = sap.firefly.XString.substring(
										this.m_normalizedPath, 1, size - 1);
							} else {
								cutted = sap.firefly.XString.substring(
										this.m_normalizedPath, 1, size);
							}
							this.m_pathElements = sap.firefly.XStringTokenizer
									.splitString(cutted,
											sap.firefly.XFile.SLASH);
							elementCount = this.m_pathElements.size();
							this.m_name = this.m_pathElements
									.get(elementCount - 1);
						}
						if (sap.firefly.XFile.DEBUG_MODE) {
							this.writeDebugMessage("set up");
						}
					},
					writeDebugMessage : function(message) {
						if (sap.firefly.XFile.DEBUG_MODE === false) {
							return;
						}
						if (sap.firefly.XStringUtils
								.isNullOrEmpty(this.m_nativePath) === false) {
							sap.firefly.XLogger
									.println(sap.firefly.XStringUtils
											.concatenate4("XFile: ", message,
													" ", this.m_nativePath));
						} else {
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(this.m_normalizedPath) === false) {
								sap.firefly.XLogger
										.println(sap.firefly.XStringUtils
												.concatenate4("XFile: ",
														message, " ",
														this.m_normalizedPath));
							} else {
								sap.firefly.XLogger
										.println(sap.firefly.XStringUtils
												.concatenate2("XFile: ",
														message));
							}
						}
					},
					createChild : function(relativePath) {
						var buffer;
						var relativePathCutted;
						if (sap.firefly.XFile.DEBUG_MODE) {
							this
									.writeDebugMessage(sap.firefly.XString
											.concatenate2("create child ",
													relativePath));
						}
						buffer = sap.firefly.XStringBuffer.create();
						buffer.append(this.m_normalizedPath);
						if (sap.firefly.XString.endsWith(this.m_normalizedPath,
								sap.firefly.XFile.SLASH)) {
							if (sap.firefly.XString.startsWith(relativePath,
									sap.firefly.XFile.SLASH) === false) {
								buffer.append(relativePath);
							} else {
								relativePathCutted = sap.firefly.XString
										.substring(relativePath, 1, -1);
								buffer.append(relativePathCutted);
							}
						} else {
							if (sap.firefly.XString.startsWith(relativePath,
									sap.firefly.XFile.SLASH)) {
								buffer.append(relativePath);
							} else {
								buffer.append(sap.firefly.XFile.SLASH);
								buffer.append(relativePath);
							}
						}
						return sap.firefly.XFile.create(buffer.toString());
					},
					createSibling : function(name) {
						var buffer = sap.firefly.XStringBuffer.create();
						var endOfDirectory = sap.firefly.XString.lastIndexOf(
								this.m_normalizedPath, "/");
						var directory;
						if (endOfDirectory !== -1) {
							directory = sap.firefly.XString.substring(
									this.m_normalizedPath, 0,
									endOfDirectory + 1);
							buffer.append(directory);
						}
						buffer.append(name);
						return sap.firefly.XFile.create(buffer.toString());
					},
					isDirectory : function() {
						var result = false;
						if (this.m_nativePath === null) {
							result = true;
						} else {
							result = this.m_activeFileSystem
									.isDirectory(this.m_nativePath);
						}
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (result) {
								this.writeDebugMessage("is directory");
							}
						}
						return result;
					},
					isFile : function() {
						var result = false;
						if (this.m_nativePath === null) {
							result = false;
						} else {
							result = this.m_activeFileSystem
									.isFile(this.m_nativePath);
						}
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (result) {
								this.writeDebugMessage("is file");
							}
						}
						return result;
					},
					isExisting : function() {
						var result = this.m_activeFileSystem
								.isExisting(this.m_nativePath);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (result) {
								this.writeDebugMessage("is existing");
							}
						}
						return result;
					},
					isHidden : function() {
						var result = this.m_activeFileSystem
								.isHidden(this.m_nativePath);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (result) {
								this.writeDebugMessage("is hidden");
							}
						}
						return result;
					},
					mkdir : function() {
						var messages;
						if (sap.firefly.XFile.DEBUG_MODE) {
							this.writeDebugMessage("mkdir");
						}
						this.clearMessages();
						messages = this.m_activeFileSystem
								.mkdir(this.m_nativePath);
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					mkdirs : function() {
						var messages;
						if (sap.firefly.XFile.DEBUG_MODE) {
							this.writeDebugMessage("mkdirs");
						}
						this.clearMessages();
						messages = this.m_activeFileSystem
								.mkdirs(this.m_nativePath);
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					getChildren : function() {
						var roots;
						if (sap.firefly.XFile.DEBUG_MODE) {
							this.writeDebugMessage("get children");
						}
						roots = this.m_activeFileSystem
								.getChildren(this.m_nativePath);
						return sap.firefly.XFile.createFileObjects(
								this.m_activeFileSystem, roots);
					},
					getChildElements : function() {
						return sap.firefly.XReadOnlyListWrapper.create(this
								.getChildren());
					},
					hasChildren : function() {
						var result = this.m_activeFileSystem
								.hasChildren(this.m_nativePath);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (result) {
								this.writeDebugMessage("has children");
							}
						}
						return result;
					},
					supportsSetLastModified : function() {
						var result = true;
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (result) {
								this
										.writeDebugMessage("supports set last modified");
							}
						}
						return result;
					},
					setLastModified : function(time) {
						var timeString;
						var messages;
						if (sap.firefly.XFile.DEBUG_MODE) {
							timeString = null;
							if (time !== null) {
								timeString = time.toIsoFormat();
							}
							this.writeDebugMessage(sap.firefly.XString
									.concatenate2("set last modified ",
											timeString));
						}
						this.clearMessages();
						messages = this.m_activeFileSystem.setLastModified(
								this.m_nativePath, time);
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					getLastModified : function() {
						var result = this.m_activeFileSystem
								.getLastModified(this.m_nativePath);
						var timeString;
						if (sap.firefly.XFile.DEBUG_MODE) {
							timeString = null;
							if (result !== null) {
								timeString = result.toIsoFormat();
							}
							this.writeDebugMessage(sap.firefly.XString
									.concatenate2("get last modified ",
											timeString));
						}
						return result;
					},
					deleteFile : function() {
						var messages;
						if (sap.firefly.XFile.DEBUG_MODE) {
							this.writeDebugMessage("delete file");
						}
						this.clearMessages();
						messages = this.m_activeFileSystem
								.deleteFile(this.m_nativePath);
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					isWriteable : function() {
						var result = this.m_activeFileSystem
								.isWriteable(this.m_nativePath);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (result) {
								this.writeDebugMessage("is writeable");
							}
						}
						return result;
					},
					setWritable : function(writable, ownerOnly) {
						var sb;
						var messages;
						if (sap.firefly.XFile.DEBUG_MODE) {
							sb = sap.firefly.XStringBuffer.create();
							sb.append("set writeable ");
							sb.appendBoolean(writable);
							if (ownerOnly) {
								sb.append(" owner only");
							}
							this.writeDebugMessage(sb.toString());
						}
						this.clearMessages();
						messages = this.m_activeFileSystem.setWritable(
								this.m_nativePath, writable, ownerOnly);
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					setReadOnly : function() {
						var messages;
						if (sap.firefly.XFile.DEBUG_MODE) {
							this.writeDebugMessage("set readonly");
						}
						this.clearMessages();
						messages = this.m_activeFileSystem
								.setReadOnly(this.m_nativePath);
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					isReadable : function() {
						var result = this.m_activeFileSystem
								.isReadable(this.m_nativePath);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (result) {
								this.writeDebugMessage("is readable");
							}
						}
						return result;
					},
					setReadable : function(readable, ownerOnly) {
						var messages;
						if (sap.firefly.XFile.DEBUG_MODE) {
							this.writeDebugMessage("set readable");
						}
						this.clearMessages();
						messages = this.m_activeFileSystem.setReadable(
								this.m_nativePath, readable, ownerOnly);
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					isExecutable : function() {
						var result = this.m_activeFileSystem
								.isExecutable(this.m_nativePath);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (result) {
								this.writeDebugMessage("is executable");
							}
						}
						return result;
					},
					setExecutable : function(executable, ownerOnly) {
						var messages;
						if (sap.firefly.XFile.DEBUG_MODE) {
							this.writeDebugMessage("set executable");
						}
						this.clearMessages();
						messages = this.m_activeFileSystem.setExecutable(
								this.m_nativePath, executable, ownerOnly);
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					supportsRenameTo : function() {
						var result = true;
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (result) {
								this.writeDebugMessage("supports rename to");
							}
						}
						return result;
					},
					rename : function(dest) {
						var buffer;
						var i;
						var normalizedPath;
						var destFile;
						var messages;
						if (sap.firefly.XFile.DEBUG_MODE) {
							this.writeDebugMessage(sap.firefly.XString
									.concatenate2("rename ", dest));
						}
						buffer = sap.firefly.XStringBuffer.create();
						for (i = 0; i < (this.m_pathElements.size() - 1); i++) {
							buffer.append(sap.firefly.XFile.SLASH);
							buffer.append(this.m_pathElements.get(i));
						}
						buffer.append(sap.firefly.XFile.SLASH);
						buffer.append(dest);
						normalizedPath = buffer.toString();
						destFile = sap.firefly.XFile.create(normalizedPath);
						this.clearMessages();
						messages = this.m_activeFileSystem.renameTo(
								this.m_nativePath, destFile.getNativePath());
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					renameTo : function(dest) {
						var sb;
						var messages;
						if (dest === null) {
							if (sap.firefly.XFile.DEBUG_MODE) {
								this.writeDebugMessage("Destination was null");
							}
							return;
						}
						if (sap.firefly.XFile.DEBUG_MODE) {
							sb = sap.firefly.XStringBuffer.create();
							sb.append("rename to ");
							sb.append(dest.getNativePath());
							this.writeDebugMessage(sb.toString());
						}
						this.clearMessages();
						messages = this.m_activeFileSystem.renameTo(
								this.m_nativePath, dest.getNativePath());
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					length : function() {
						var result = this.m_activeFileSystem
								.length(this.m_nativePath);
						if (sap.firefly.XFile.DEBUG_MODE) {
							sap.firefly.XLogger.println(sap.firefly.XString
									.concatenate2("length ", sap.firefly.XLong
											.convertLongToString(result)));
						}
						return result;
					},
					getLastModifiedTimestamp : function() {
						var result = this.m_activeFileSystem
								.getLastModifiedTimestamp(this.m_nativePath);
						if (sap.firefly.XFile.DEBUG_MODE) {
							this
									.writeDebugMessage(sap.firefly.XString
											.concatenate2(
													"get last modified timestamp ",
													sap.firefly.XLong
															.convertLongToString(result)));
						}
						return result;
					},
					createNewFile : function() {
						var messages;
						if (sap.firefly.XFile.DEBUG_MODE) {
							this.writeDebugMessage("create new file");
						}
						this.clearMessages();
						messages = this.m_activeFileSystem
								.createNewFile(this.m_nativePath);
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					load : function() {
						var content = this.loadExt();
						var result = content.getBinaryContent();
						return result;
					},
					processLoading : function(syncType, listener,
							customIdentifier) {
						return null;
					},
					loadExt : function() {
						return this.loadInternal(this.m_nativePath, false);
					},
					loadGzipped : function() {
						return this.loadInternal(this.m_nativePath, true);
					},
					loadInternal : function(path, isGzipped) {
						var content;
						var contentType;
						var data;
						var sb;
						if (sap.firefly.XFile.DEBUG_MODE) {
							this.writeDebugMessage("load ext");
						}
						this.clearMessages();
						content = null;
						if (isGzipped) {
							content = this.m_activeFileSystem.loadGzipped(path);
						} else {
							content = this.m_activeFileSystem
									.loadExt(this.m_nativePath);
						}
						this.addAllMessages(content.getMessageCollection());
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (content.getMessageCollection().hasErrors()) {
								sap.firefly.XLogger.println(content
										.getMessageCollection().getSummary());
							} else {
								contentType = content.getContentType();
								if (contentType !== null) {
									sap.firefly.XLogger
											.println(sap.firefly.XString
													.concatenate2(
															"content type: ",
															contentType
																	.getName()));
									if (contentType === sap.firefly.ContentType.BINARY) {
										data = content.getBinaryContent();
										if (data !== null) {
											sb = sap.firefly.XStringBuffer
													.create();
											sb.append("data with ");
											sb.appendInt(data.size());
											sb.append(" bytes");
											sap.firefly.XLogger.println(sb
													.toString());
										}
									}
								}
							}
						}
						return content;
					},
					save : function(data) {
						this.saveInternal(data, this.m_nativePath, false);
					},
					saveGzipped : function(data) {
						this.saveInternal(data, this.m_nativePath, true);
					},
					saveInternal : function(data, path, isGzipped) {
						var sb;
						var messages;
						if (sap.firefly.XFile.DEBUG_MODE) {
							sb = sap.firefly.XStringBuffer.create();
							sb.append("save");
							if (data !== null) {
								sb.append(" data with ");
								sb.appendInt(data.size());
								sb.append(" bytes");
							}
							this.writeDebugMessage(sb.toString());
						}
						this.clearMessages();
						messages = null;
						if (isGzipped) {
							messages = this.m_activeFileSystem.saveGzipped(
									path, data);
						} else {
							messages = this.m_activeFileSystem.save(path, data);
						}
						this.addAllMessages(messages);
						if (sap.firefly.XFile.DEBUG_MODE) {
							if (messages.hasErrors()) {
								sap.firefly.XLogger.println(messages
										.getSummary());
							}
						}
					},
					getNormalizedPath : function() {
						return this.m_normalizedPath;
					},
					getNativePath : function() {
						return this.m_nativePath;
					},
					getName : function() {
						return this.m_name;
					},
					getUri : function() {
						var uri = sap.firefly.XUri.create();
						uri.setScheme("file");
						uri.setPath(this.getNormalizedPath());
						return uri;
					},
					getParent : function() {
						return sap.firefly.XFile.create(this.getParentPath());
					},
					getParentPath : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						var size = this.m_pathElements.size();
						var i;
						var normalizedParentPath;
						buffer.append(sap.firefly.XFile.SLASH);
						for (i = 0; i < (size - 1); i++) {
							buffer.append(this.m_pathElements.get(i));
							buffer.append(sap.firefly.XFile.SLASH);
						}
						normalizedParentPath = buffer.toString();
						return normalizedParentPath;
					},
					getPathElements : function() {
						return this.m_pathElements;
					},
					getFileSystemType : function() {
						return this.m_fileSystemType;
					},
					isLeaf : function() {
						return !this.isNode();
					},
					isNode : function() {
						return this.isDirectory();
					},
					getChildSetState : function() {
						return sap.firefly.ChildSetState.INITIAL;
					},
					processChildFetch : function(syncType, listener,
							customIdentifier) {
						var result = sap.firefly.XHierarchyResult.create(this,
								this.getChildElements());
						return sap.firefly.XHierarchyAction.createAndRun(null,
								result, listener, customIdentifier);
					},
					getText : function() {
						return this.getName();
					},
					getComponentType : function() {
						return sap.firefly.IoComponentType.FILE;
					},
					getTagValue : function(tagName) {
						return null;
					},
					getContentElement : function() {
						return this;
					},
					getContentConstant : function() {
						return null;
					},
					compareTo : function(objectToCompare) {
						var other = objectToCompare;
						var otherName = other.getName();
						var myName = this.getName();
						return sap.firefly.XString.compare(myName, otherName);
					},
					toString : function() {
						return this.m_normalizedPath;
					}
				});
$Firefly.createClass("sap.firefly.XHttpFile", sap.firefly.MessageManager,
		{
			$statics : {
				_create : function(session, uri) {
					var file = new sap.firefly.XHttpFile();
					file.setupHttpFile(session, uri);
					return file;
				}
			},
			m_uri : null,
			m_session : null,
			m_directoryInfo : null,
			setupHttpFile : function(session, uri) {
				sap.firefly.XHttpFile.$superclass.setup.call(this);
				this.setSession(session);
				this.m_uri = uri;
			},
			getSession : function() {
				return sap.firefly.XWeakReferenceUtil
						.getHardRef(this.m_session);
			},
			setSession : function(session) {
				this.m_session = sap.firefly.XWeakReferenceUtil
						.getWeakRef(session);
			},
			getUri : function() {
				return this.m_uri;
			},
			load : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			loadExt : function() {
				var syncAction = this.processLoading(
						sap.firefly.SyncType.BLOCKING, null, null);
				return syncAction.getData();
			},
			loadGzipped : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			processLoading : function(syncType, listener, customIdentifier) {
				return sap.firefly.XHttpFileLoadAction.createAndRun(syncType,
						this, listener, customIdentifier);
			},
			getChildren : function() {
				var session = this.getSession();
				var extResponse;
				var fileList;
				var children;
				var i;
				var fileStructure;
				var name;
				var childUri;
				var childFile;
				if (this.m_directoryInfo === null) {
					extResponse = sap.firefly.XHttpFileDirAction.createAndRun(
							sap.firefly.SyncType.BLOCKING, this, null, null,
							false);
					this.addAllMessages(extResponse);
				}
				fileList = this.m_directoryInfo.getListByName("Files");
				children = sap.firefly.XList.create();
				for (i = 0; i < fileList.size(); i++) {
					fileStructure = fileList.getStructureByIndex(i);
					name = fileStructure.getStringByName("Name");
					childUri = sap.firefly.XUri.createFromUriWithParent(name,
							this.m_uri, false);
					childFile = sap.firefly.XHttpFile
							._create(session, childUri);
					children.add(childFile);
				}
				return children;
			},
			createFileList : function() {
				var children = null;
				var session;
				var fileList;
				var i;
				var fileStructure;
				var name;
				var type;
				var childUri;
				var childFile;
				if (this.m_directoryInfo !== null) {
					session = this.getSession();
					fileList = this.m_directoryInfo.getListByName("Files");
					children = sap.firefly.XList.create();
					for (i = 0; i < fileList.size(); i++) {
						fileStructure = fileList.getStructureByIndex(i);
						name = fileStructure.getStringByName("Name");
						type = fileStructure.getStringByNameWithDefault("Type",
								"File");
						if (sap.firefly.XString.isEqual("Dir", type)) {
							childUri = sap.firefly.XUri
									.createFromUriWithParent(
											sap.firefly.XString.concatenate2(
													name, "/"), this.m_uri,
											false);
						} else {
							childUri = sap.firefly.XUri
									.createFromUriWithParent(name, this.m_uri,
											false);
						}
						childFile = sap.firefly.XHttpFile._create(session,
								childUri);
						children.add(childFile);
					}
				}
				return children;
			},
			processChildFetch : function(syncType, listener, customIdentifier) {
				return sap.firefly.XHttpFileDirAction.createAndRun(syncType,
						this, listener, customIdentifier, true);
			},
			getChildSetState : function() {
				if (this.isFile()) {
					return sap.firefly.ChildSetState.COMPLETE;
				}
				if (this.m_directoryInfo !== null) {
					return sap.firefly.ChildSetState.COMPLETE;
				}
				return sap.firefly.ChildSetState.INITIAL;
			},
			getText : function() {
				return this.getName();
			},
			getName : function() {
				var path = this.m_uri.getPath();
				var size;
				var endSlash;
				var name;
				if (sap.firefly.XString.endsWith(path, "/")) {
					size = sap.firefly.XString.size(path);
					if (size === 1) {
						return "/";
					}
					path = sap.firefly.XString.substring(path, 0, size - 1);
				}
				endSlash = sap.firefly.XString.lastIndexOf(path, "/");
				name = sap.firefly.XString.substring(path, endSlash + 1, -1);
				return name;
			},
			isDirectory : function() {
				var path = this.m_uri.getPath();
				return sap.firefly.XString.endsWith(path, "/");
			},
			isFile : function() {
				return this.isDirectory() === false;
			},
			getNormalizedPath : function() {
				return this.m_uri.toString();
			},
			getNativePath : function() {
				return this.m_uri.toString();
			},
			getPathElements : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			mkdir : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			mkdirs : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			getChildElements : function() {
				return sap.firefly.XReadOnlyListWrapper.create(this
						.getChildren());
			},
			hasChildren : function() {
				return true;
			},
			createChild : function(relativePath) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			createSibling : function(name) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			getParentPath : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			getParent : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			supportsSetLastModified : function() {
				return false;
			},
			setLastModified : function(time) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			getLastModified : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			isWriteable : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			setWritable : function(writable, ownerOnly) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			setReadOnly : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			isReadable : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			setReadable : function(readable, ownerOnly) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			isExecutable : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			setExecutable : function(executable, ownerOnly) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			length : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			save : function(data) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			saveGzipped : function(data) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			deleteFile : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			createNewFile : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			supportsRenameTo : function() {
				return false;
			},
			renameTo : function(dest) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			getLastModifiedTimestamp : function() {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			getFileSystemType : function() {
				return sap.firefly.XFileSystemType.SIMPLE_WEB;
			},
			rename : function(dest) {
				throw sap.firefly.XException
						.createUnsupportedOperationException();
			},
			isLeaf : function() {
				return !this.isNode();
			},
			isNode : function() {
				return this.isDirectory();
			},
			getComponentType : function() {
				return sap.firefly.IoComponentType.FILE;
			},
			getTagValue : function(tagName) {
				return null;
			},
			getContentElement : function() {
				return this;
			},
			getContentConstant : function() {
				return null;
			},
			isExisting : function() {
				return true;
			},
			isHidden : function() {
				return false;
			},
			getDirectoryInfo : function() {
				return this.m_directoryInfo;
			},
			setDirectoryInfo : function(directoryInfo) {
				this.m_directoryInfo = directoryInfo;
			}
		});
$Firefly
		.createClass(
				"sap.firefly.JxJsonParser",
				sap.firefly.DfDocumentParser,
				{
					$statics : {
						CHECK_UNIQUE_NAMES : false,
						create : function() {
							var object = new sap.firefly.JxJsonParser();
							object.setupParser(null, false);
							return object;
						},
						createEmbedded : function(source) {
							var object = new sap.firefly.JxJsonParser();
							object.setupParser(source, true);
							return object;
						}
					},
					m_source : null,
					m_isEmbedded : false,
					m_stringDelimiter : 0,
					m_rootElement : null,
					m_elementStack : null,
					m_currentStackIndex : 0,
					m_pos : 0,
					m_isInsideString : false,
					m_isInsideVariable : false,
					m_isInsideEscape : false,
					m_isInsideNumber : false,
					m_isInsideDoubleNumber : false,
					m_isInsideUnicode : false,
					m_unicodePos : 0,
					m_stringStartPos : 0,
					m_escapedString : null,
					m_numberStartPos : 0,
					m_structureDepth : 0,
					setupParser : function(source, isEmbedded) {
						this.setup();
						this.m_isEmbedded = isEmbedded;
						if (this.m_isEmbedded) {
							this.m_stringDelimiter = 39;
						} else {
							this.m_stringDelimiter = 34;
						}
						if (source !== null) {
							this.resetParsing(source);
						}
					},
					releaseObject : function() {
						sap.firefly.JxJsonParser.$superclass.releaseObject
								.call(this);
						this.resetParsing(null);
					},
					resetParsing : function(source) {
						this.m_rootElement = null;
						this.m_elementStack = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_elementStack);
						if (source !== null) {
							this.m_elementStack = sap.firefly.XList.create();
						}
						this.m_currentStackIndex = -1;
						this.m_pos = 0;
						this.m_isInsideString = false;
						this.m_isInsideVariable = false;
						this.m_isInsideEscape = false;
						this.m_isInsideNumber = false;
						this.m_isInsideDoubleNumber = false;
						this.m_isInsideUnicode = false;
						this.m_unicodePos = 0;
						this.m_stringStartPos = 0;
						this.m_escapedString = sap.firefly.XObject
								.releaseIfNotNull(this.m_escapedString);
						this.m_numberStartPos = 0;
						this.m_structureDepth = 0;
						this.m_source = source;
					},
					parse : function(content) {
						var ok;
						this.resetParsing(content);
						ok = this.runWalker();
						if (ok) {
							return this.m_rootElement;
						}
						return null;
					},
					enterStructure : function() {
						var structure = sap.firefly.PrStructure.create();
						return this.enter(structure);
					},
					raiseWrongCommaError : function() {
						this
								.raiseError("Object properties and array items must be separated by single comma.");
					},
					leaveStructure : function() {
						var topStackElement = this.getTopStackElement();
						if (topStackElement.finishElements() === false) {
							this.raiseWrongCommaError();
							return false;
						}
						this.m_currentStackIndex--;
						return true;
					},
					enterArray : function() {
						var list = sap.firefly.PrList.create();
						return this.enter(list);
					},
					leaveArray : function() {
						var topStackElement = this.getTopStackElement();
						if (topStackElement.finishElements() === false) {
							this.raiseWrongCommaError();
							return false;
						}
						this.m_currentStackIndex--;
						return true;
					},
					checkStructure : function(jsonStackElement) {
						if (jsonStackElement.isNameSet() === false) {
							this.raiseError("Name in structure is not set");
							return false;
						}
						if (jsonStackElement.isValueSet()) {
							this
									.raiseError("Value in structure is already set");
							return false;
						}
						jsonStackElement.setValueSet(true);
						return true;
					},
					checkList : function(jsonStackElement) {
						if (jsonStackElement.isNameSet()) {
							this.raiseError("Name cannot be set in list");
							return false;
						}
						if (jsonStackElement.isValueSet()) {
							this.raiseError("Value in list is already set");
							return false;
						}
						jsonStackElement.setValueSet(true);
						return true;
					},
					enter : function(nextElement) {
						var jsonStackElement;
						var element;
						var type;
						var name;
						var structure;
						var list;
						var nextStackElement;
						if (this.m_currentStackIndex === -1) {
							this.m_rootElement = nextElement;
						} else {
							jsonStackElement = this.getTopStackElement();
							if (jsonStackElement.addElement() === false) {
								this.raiseWrongCommaError();
								return false;
							}
							element = jsonStackElement.getElement();
							type = element.getType();
							if (type === sap.firefly.PrElementType.STRUCTURE) {
								if (this.checkStructure(jsonStackElement) === false) {
									return false;
								}
								name = jsonStackElement.getName();
								structure = element;
								structure.setElementByName(name, nextElement);
							} else {
								if (type === sap.firefly.PrElementType.LIST) {
									if (this.checkList(jsonStackElement) === false) {
										return false;
									}
									list = element;
									list.add(nextElement);
								} else {
									this.raiseError("Illegal type");
									return false;
								}
							}
						}
						if (this.m_currentStackIndex === (this.m_elementStack
								.size() - 1)) {
							nextStackElement = sap.firefly.JxJsonParserStackElement
									.create();
							this.m_elementStack.add(nextStackElement);
						} else {
							nextStackElement = this.m_elementStack
									.get(this.m_currentStackIndex + 1);
							nextStackElement.reset();
						}
						nextStackElement.setElement(nextElement);
						this.m_currentStackIndex++;
						return true;
					},
					enterVariable : function() {
						return true;
					},
					setVariable : function(value) {
						var newElement = null;
						var jsonStackElement;
						var element;
						var type;
						var name;
						var structure;
						var list;
						if (sap.firefly.XString.isEqual("true", value)) {
							newElement = sap.firefly.PrFactory
									.createBooleanParameter(true);
						} else {
							if (sap.firefly.XString.isEqual("false", value)) {
								newElement = sap.firefly.PrFactory
										.createBooleanParameter(false);
							} else {
								if (sap.firefly.XString.isEqual("null", value)) {
									newElement = sap.firefly.PrFactory
											.createNullParameter();
								}
							}
						}
						if (newElement === null) {
							if (this.m_isEmbedded) {
								return this.setString(value);
							}
							this.raiseError(sap.firefly.XString.concatenate2(
									"Unknown value: ", value));
							return false;
						}
						jsonStackElement = this.getTopStackElement();
						if (jsonStackElement.addElement() === false) {
							this.raiseWrongCommaError();
							return false;
						}
						element = jsonStackElement.getElement();
						type = element.getType();
						if (type === sap.firefly.PrElementType.STRUCTURE) {
							if (this.checkStructure(jsonStackElement) === false) {
								return false;
							}
							name = jsonStackElement.getName();
							structure = element;
							structure.setElementByName(name, newElement);
						} else {
							if (type === sap.firefly.PrElementType.LIST) {
								if (this.checkList(jsonStackElement) === false) {
									return false;
								}
								list = element;
								list.add(newElement);
							} else {
								this.raiseError("Illegal type");
								return false;
							}
						}
						return true;
					},
					leaveVariable : function() {
						return true;
					},
					enterString : function() {
						return true;
					},
					setString : function(value) {
						var jsonStackElement = this.getTopStackElement();
						var element = jsonStackElement.getElement();
						var type = element.getType();
						var name;
						var structure;
						var list;
						if (type === sap.firefly.PrElementType.STRUCTURE) {
							if (jsonStackElement.isNameSet() === false) {
								if (jsonStackElement.isValueSet()) {
									this
											.raiseError("Name in structure is not set");
									return false;
								}
								jsonStackElement.setName(value);
							} else {
								if (jsonStackElement.addElement() === false) {
									this.raiseWrongCommaError();
									return false;
								}
								if (this.checkStructure(jsonStackElement) === false) {
									return false;
								}
								name = jsonStackElement.getName();
								structure = element;
								structure.setStringByName(name, value);
							}
						} else {
							if (type === sap.firefly.PrElementType.LIST) {
								if (jsonStackElement.addElement() === false) {
									return false;
								}
								if (this.checkList(jsonStackElement) === false) {
									return false;
								}
								list = element;
								list.add(sap.firefly.PrString
										.createWithValue(value));
							} else {
								this.raiseError("Illegal type");
								return false;
							}
						}
						return true;
					},
					leaveString : function() {
						return true;
					},
					enterNumber : function() {
						return true;
					},
					leaveNumber : function() {
						return true;
					},
					setDouble : function(value) {
						var jsonStackElement = this.getTopStackElement();
						var element;
						var type;
						var name;
						var structure;
						var list;
						if (jsonStackElement.addElement() === false) {
							this.raiseWrongCommaError();
							return false;
						}
						element = jsonStackElement.getElement();
						type = element.getType();
						if (type === sap.firefly.PrElementType.STRUCTURE) {
							if (this.checkStructure(jsonStackElement) === false) {
								return false;
							}
							name = jsonStackElement.getName();
							structure = element;
							structure.setDoubleByName(name, value);
						} else {
							if (type === sap.firefly.PrElementType.LIST) {
								if (this.checkList(jsonStackElement) === false) {
									return false;
								}
								list = element;
								list.add(sap.firefly.PrDouble
										.createWithValue(value));
							} else {
								this.raiseError("Illegal type");
								return false;
							}
						}
						return true;
					},
					setInteger : function(value) {
						var jsonStackElement = this.getTopStackElement();
						var element;
						var type;
						var name;
						var structure;
						var list;
						if (jsonStackElement.addElement() === false) {
							this.raiseWrongCommaError();
							return false;
						}
						element = jsonStackElement.getElement();
						type = element.getType();
						if (type === sap.firefly.PrElementType.STRUCTURE) {
							if (this.checkStructure(jsonStackElement) === false) {
								return false;
							}
							name = jsonStackElement.getName();
							structure = element;
							structure.setIntegerByName(name, value);
						} else {
							if (type === sap.firefly.PrElementType.LIST) {
								if (this.checkList(jsonStackElement) === false) {
									return false;
								}
								list = element;
								list.add(sap.firefly.PrInteger
										.createWithValue(value));
							} else {
								this.raiseError("Illegal type");
								return false;
							}
						}
						return true;
					},
					setLong : function(value) {
						var jsonStackElement = this.getTopStackElement();
						var element;
						var type;
						var name;
						var structure;
						var list;
						if (jsonStackElement.addElement() === false) {
							this.raiseWrongCommaError();
							return false;
						}
						element = jsonStackElement.getElement();
						type = element.getType();
						if (type === sap.firefly.PrElementType.STRUCTURE) {
							if (this.checkStructure(jsonStackElement) === false) {
								return false;
							}
							name = jsonStackElement.getName();
							structure = element;
							structure.setLongByName(name, value);
						} else {
							if (type === sap.firefly.PrElementType.LIST) {
								if (this.checkList(jsonStackElement) === false) {
									return false;
								}
								list = element;
								list.add(sap.firefly.PrLong
										.createWithValue(value));
							} else {
								this.raiseError("Illegal type");
								return false;
							}
						}
						return true;
					},
					enterValueZone : function() {
						return true;
					},
					nextItem : function() {
						var jsonStackElement = this.getTopStackElement();
						jsonStackElement.setName(null);
						jsonStackElement.setValueSet(false);
						if (jsonStackElement.nextElement() === false) {
							this.raiseWrongCommaError();
							return false;
						}
						return true;
					},
					getTopStackElement : function() {
						return this.m_elementStack
								.get(this.m_currentStackIndex);
					},
					getRootElement : function() {
						return this.m_rootElement;
					},
					endParsing : function() {
						this.m_escapedString = sap.firefly.XObject
								.releaseIfNotNull(this.m_escapedString);
						if (this.m_currentStackIndex === -1) {
							return true;
						}
						this
								.addParserError(
										sap.firefly.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE,
										"Json does not close correctly");
						return false;
					},
					runWalker : function() {
						var charArray = sap.firefly.XCharArray
								.create(this.m_source);
						var len = charArray.size();
						var c;
						var isValid = true;
						var pos;
						for (pos = 0; (pos < len) && (isValid);) {
							c = charArray.get(pos);
							isValid = this.parseSingleCharacter(c, pos);
							pos++;
						}
						if (isValid) {
							this.endParsing();
						}
						return isValid;
					},
					unicode4 : function(pos) {
						var value = sap.firefly.XString.substring(
								this.m_source, pos - 3, pos + 1);
						try {
							var intValue = sap.firefly.XInteger
									.convertStringToIntegerWithRadix(value, 16);
							this.m_escapedString.appendChar(intValue);
						} catch (nfe3) {
							this
									.addParserError(
											sap.firefly.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE,
											"");
							return false;
						}
						this.m_isInsideUnicode = false;
						this.m_isInsideEscape = false;
						this.m_stringStartPos = pos + 1;
						return true;
					},
					escapedString : function(c, pos) {
						if (c === 114) {
							this.m_escapedString.append("\r");
						} else {
							if (c === 110) {
								this.m_escapedString.append("\n");
							} else {
								if (c === 116) {
									this.m_escapedString.append("\t");
								} else {
									if (c === 102) {
										this.m_escapedString.append("\f");
									} else {
										if (c === 98) {
											this.m_escapedString.append("\b");
										} else {
											if (c === 34) {
												this.m_escapedString
														.append('"');
											} else {
												if (c === 92) {
													this.m_escapedString
															.append("\\");
												} else {
													if (c === 47) {
														this.m_escapedString
																.append("/");
													} else {
														this
																.addParserError(
																		sap.firefly.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE,
																		"Parser Error");
														return false;
													}
												}
											}
										}
									}
								}
							}
						}
						this.m_isInsideEscape = false;
						this.m_stringStartPos = pos + 1;
						return true;
					},
					parseSingleCharacter : function(c, pos) {
						var value;
						var placeHolder = true;
						this.m_pos = pos;
						while (true) {
							if (this.m_isInsideString) {
								if (this.m_isInsideEscape) {
									if (this.m_isInsideUnicode) {
										this.m_unicodePos++;
										if (this.m_unicodePos === 4) {
											if (this.unicode4(pos) === false) {
												return false;
											}
										}
									} else {
										if (c === 117) {
											this.m_isInsideUnicode = true;
											this.m_unicodePos = 0;
										} else {
											if (this.escapedString(c, pos) === false) {
												return false;
											}
										}
									}
								} else {
									if (c === this.m_stringDelimiter) {
										if (this.insideString(pos) === false) {
											return false;
										}
									} else {
										if (c === 92) {
											this.enterEscapedString(pos);
										}
									}
								}
							} else {
								if (this.m_isInsideNumber) {
									if (((c >= 48) && (c <= 57)) || (c === 43)
											|| (c === 45)) {
										placeHolder = true;
									} else {
										if ((c === 46) || (c === 101)
												|| (c === 69)) {
											this.m_isInsideDoubleNumber = true;
										} else {
											value = sap.firefly.XString
													.substring(
															this.m_source,
															this.m_numberStartPos,
															pos);
											if (this.m_isInsideDoubleNumber) {
												if (this.insideDouble(value) === false) {
													return false;
												}
											} else {
												if (this.insideInt(value) === false) {
													return false;
												}
											}
											this.m_isInsideNumber = false;
											this.m_isInsideDoubleNumber = false;
											if (this.leaveNumber() === false) {
												return false;
											}
											continue;
										}
									}
								} else {
									if (this.m_isInsideVariable) {
										if ((c === 58) || (c === 123)
												|| (c === 125) || (c === 91)
												|| (c === 93) || (c === 44)
												|| (c === 9) || (c === 13)
												|| (c === 10) || (c === 32)) {
											value = sap.firefly.XString
													.substring(
															this.m_source,
															this.m_stringStartPos,
															pos);
											if (this.setVariable(value) === false) {
												return false;
											}
											this.m_isInsideVariable = false;
											if (this.leaveVariable() === false) {
												return false;
											}
											continue;
										}
									} else {
										if (((c >= 48) && (c <= 57))
												|| (c === 45)) {
											if (this.enterNumber() === false) {
												return false;
											}
											this.m_isInsideNumber = true;
											this.m_numberStartPos = pos;
										} else {
											if (c === 46) {
												if (this.enterNumber() === false) {
													return false;
												}
												this.m_isInsideNumber = true;
												this.m_isInsideDoubleNumber = true;
												this.m_numberStartPos = pos;
											} else {
												if (c === 123) {
													if (this.enterStructure() === false) {
														return false;
													}
													this.m_structureDepth++;
												} else {
													if (c === 125) {
														if (this
																.leaveStructure() === false) {
															return false;
														}
														this.m_structureDepth--;
													} else {
														if (c === 91) {
															if (this
																	.enterArray() === false) {
																return false;
															}
														} else {
															if (c === 93) {
																if (this
																		.leaveArray() === false) {
																	return false;
																}
															} else {
																if (c === 58) {
																	if (this
																			.enterValueZone() === false) {
																		return false;
																	}
																} else {
																	if (c === 44) {
																		if (this
																				.nextItem() === false) {
																			return false;
																		}
																	} else {
																		if ((c === 32)
																				|| (c === 9)
																				|| (c === 10)
																				|| (c === 13)) {
																			placeHolder = true;
																		} else {
																			if (c === this.m_stringDelimiter) {
																				if (this
																						.enterString() === false) {
																					return false;
																				}
																				this.m_isInsideString = true;
																				this.m_stringStartPos = pos + 1;
																			} else {
																				if (this
																						.enterVariable() === false) {
																					return false;
																				}
																				this.m_isInsideVariable = true;
																				this.m_stringStartPos = pos;
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
							break;
						}
						return placeHolder;
					},
					enterEscapedString : function(pos) {
						var value;
						this.m_isInsideEscape = true;
						if (this.m_escapedString === null) {
							this.m_escapedString = sap.firefly.XStringBuffer
									.create();
						}
						value = sap.firefly.XString.substring(this.m_source,
								this.m_stringStartPos, pos);
						this.m_escapedString.append(value);
					},
					insideInt : function(value) {
						var intValue;
						var longValue;
						try {
							var isInt = true;
							var leni = sap.firefly.XString.size(value);
							var minus = sap.firefly.XString.getCharAt(value, 0);
							if (minus === 45) {
								isInt = (leni <= 10);
							} else {
								isInt = (leni <= 9);
							}
							if (isInt) {
								intValue = sap.firefly.XInteger
										.convertStringToInteger(value);
								if (this.setInteger(intValue) === false) {
									return false;
								}
							} else {
								longValue = sap.firefly.XLong
										.convertStringToLong(value);
								if (this.setLong(longValue) === false) {
									return false;
								}
							}
						} catch (nfe2) {
							this
									.addParserError(
											sap.firefly.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE,
											"");
							return false;
						}
						return true;
					},
					insideDouble : function(value) {
						try {
							var doubleValue = sap.firefly.XDouble
									.convertStringToDouble(value);
							if (this.setDouble(doubleValue) === false) {
								return false;
							}
						} catch (nfe) {
							this
									.addParserError(
											sap.firefly.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE,
											"");
							return false;
						}
						return true;
					},
					insideString : function(pos) {
						var value = sap.firefly.XString.substring(
								this.m_source, this.m_stringStartPos, pos);
						if (this.m_escapedString !== null) {
							this.m_escapedString.append(value);
							value = this.m_escapedString.toString();
							this.m_escapedString = sap.firefly.XObject
									.releaseIfNotNull(this.m_escapedString);
						}
						if (this.setString(value) === false) {
							return false;
						}
						if (this.leaveString() === false) {
							return false;
						}
						this.m_isInsideString = false;
						return true;
					},
					addParserError : function(code, message) {
						var start = this.m_pos - 10;
						var end;
						var errorValue;
						var buffer;
						var messageExt;
						if (start < 0) {
							start = 0;
						}
						end = this.m_pos + 10;
						if (end > sap.firefly.XString.size(this.m_source)) {
							end = sap.firefly.XString.size(this.m_source);
						}
						errorValue = sap.firefly.XString.substring(
								this.m_source, start, end);
						buffer = sap.firefly.XStringBuffer.create();
						buffer.append("Json Parser Error at position ");
						buffer.appendInt(this.m_pos);
						buffer.append(": ");
						buffer.append(message);
						buffer.appendNewLine();
						buffer.append("...");
						buffer.append(errorValue);
						buffer.append("...");
						messageExt = buffer.toString();
						return sap.firefly.JxJsonParser.$superclass.addErrorExt
								.call(this, sap.firefly.OriginLayer.IOLAYER,
										code, messageExt, null);
					},
					raiseError : function(errorText) {
						this
								.addParserError(
										sap.firefly.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE,
										errorText);
					},
					isEmbeddedParsingFinished : function() {
						return this.m_structureDepth === 0;
					}
				});
$Firefly.createClass("sap.firefly.UriConnection", sap.firefly.XUri, {
	$statics : {
		createUriConnection : function(uri) {
			var object = new sap.firefly.UriConnection();
			var uriObj;
			object.setup();
			if (uri !== null) {
				uriObj = sap.firefly.XUri.createFromUri(uri);
				object.setFromConnection(uriObj);
			}
			return object;
		}
	},
	m_name : null,
	m_text : null,
	m_language : null,
	m_x509Certificate : null,
	m_secureLoginProfile : null,
	m_timeout : 0,
	m_systemType : null,
	setup : function() {
		sap.firefly.UriConnection.$superclass.setup.call(this);
		this.m_timeout = -1;
	},
	releaseObject : function() {
		this.m_name = null;
		this.m_text = null;
		this.m_language = null;
		this.m_x509Certificate = null;
		this.m_secureLoginProfile = null;
		this.m_systemType = null;
		sap.firefly.UriConnection.$superclass.releaseObject.call(this);
	},
	setFromConnectionInfo : function(origin) {
		this.setFromConnection(origin);
		this.setLanguage(origin.getLanguage());
		this.setTimeout(origin.getTimeout());
		this.setName(origin.getName());
		this.setText(origin.getText());
		this.setX509Certificate(origin.getX509Certificate());
		this.setAuthenticationToken(origin.getAuthenticationToken());
		this.setSecureLoginProfile(origin.getSecureLoginProfile());
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
	getLanguage : function() {
		return this.m_language;
	},
	setLanguage : function(language) {
		this.m_language = language;
	},
	getX509Certificate : function() {
		return this.m_x509Certificate;
	},
	setX509Certificate : function(x509Certificate) {
		this.m_x509Certificate = x509Certificate;
	},
	getSecureLoginProfile : function() {
		return this.m_secureLoginProfile;
	},
	setSecureLoginProfile : function(secureLoginProfile) {
		this.m_secureLoginProfile = secureLoginProfile;
	},
	getTimeout : function() {
		return this.m_timeout;
	},
	setTimeout : function(milliseconds) {
		this.m_timeout = milliseconds;
	},
	setAuthenticationType : function(type) {
		this.setAuthenticationInternal(type);
	},
	getSystemType : function() {
		return this.m_systemType;
	},
	setSystemType : function(systemType) {
		this.m_systemType = systemType;
	},
	toString : function() {
		var buffer = sap.firefly.XStringBuffer.create();
		buffer
				.append(sap.firefly.UriConnection.$superclass.toString
						.call(this));
		buffer.appendNewLine();
		buffer.append("Language: ");
		buffer.append(this.m_language);
		buffer.appendNewLine();
		buffer.append("Timeout: ");
		buffer.appendInt(this.m_timeout);
		buffer.appendNewLine();
		return buffer.toString();
	}
});
$Firefly
		.createClass(
				"sap.firefly.SystemType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						GENERIC : null,
						HANA : null,
						ABAP : null,
						BW : null,
						BPCS : null,
						UNV : null,
						s_instances : null,
						staticSetup : function() {
							sap.firefly.SystemType.s_instances = sap.firefly.XHashMapByString
									.create();
							sap.firefly.SystemType.GENERIC = sap.firefly.SystemType
									.create("GENERIC", null, false);
							sap.firefly.SystemType.HANA = sap.firefly.SystemType
									.create("HANA",
											sap.firefly.SystemType.GENERIC,
											true);
							sap.firefly.SystemType.ABAP = sap.firefly.SystemType
									.create("ABAP",
											sap.firefly.SystemType.GENERIC,
											true);
							sap.firefly.SystemType.BW = sap.firefly.SystemType
									.create("BW", sap.firefly.SystemType.ABAP,
											true);
							sap.firefly.SystemType.BPCS = sap.firefly.SystemType
									.create("BPCS",
											sap.firefly.SystemType.ABAP, true);
							sap.firefly.SystemType.UNV = sap.firefly.SystemType
									.create("UNV",
											sap.firefly.SystemType.GENERIC,
											true);
						},
						create : function(name, parent,
								isCapabilityMetadataRequired) {
							var newConstant = new sap.firefly.SystemType();
							newConstant.setName(name);
							newConstant.setParent(parent);
							newConstant.m_isCapabilityMetadataRequired = isCapabilityMetadataRequired;
							sap.firefly.SystemType.s_instances.put(name,
									newConstant);
							return newConstant;
						},
						lookup : function(name) {
							var type = sap.firefly.SystemType.s_instances
									.getByKey(name);
							return type;
						}
					},
					m_isCapabilityMetadataRequired : false,
					isCapabilityMetadataRequired : function() {
						return this.m_isCapabilityMetadataRequired;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.IoComponentType",
				sap.firefly.XComponentType,
				{
					$statics : {
						FILE : null,
						staticSetupIoType : function() {
							sap.firefly.IoComponentType.FILE = sap.firefly.IoComponentType
									.createOlapType("File",
											sap.firefly.XComponentType._ROOT);
						},
						createOlapType : function(constant, parent) {
							var mt = new sap.firefly.IoComponentType();
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
				"sap.firefly.XHttpFileDirAction",
				sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, context, listener,
								customIdentifier, setData) {
							var object = new sap.firefly.XHttpFileDirAction();
							object.m_setData = setData;
							object.setupActionAndRun(syncType, context,
									listener, customIdentifier);
							return object;
						}
					},
					m_setData : false,
					processSynchronization : function(syncType) {
						var session = this.getSession();
						var context = this.getActionContext();
						var dirUri;
						var path;
						var newPath;
						var httpClient;
						var request;
						if (context.getDirectoryInfo() === null) {
							dirUri = sap.firefly.XUri.createFromOther(context
									.getUri());
							path = dirUri.getPath();
							if (sap.firefly.XString.endsWith(path, "/")) {
								newPath = sap.firefly.XString.concatenate2(
										path, ".index.json");
								dirUri.setPath(newPath);
							} else {
								throw sap.firefly.XException
										.createRuntimeException("Uri does not denote a directory");
							}
							httpClient = sap.firefly.HttpClientFactory
									.newInstanceByProtocol(session, dirUri
											.getProtocolType());
							request = httpClient.getRequest();
							request.setUri(dirUri);
							httpClient.processHttpRequest(syncType, this, null);
							return true;
						}
						this.prepareData();
						return false;
					},
					onHttpResponse : function(extResult, response,
							customIdentifier) {
						var jsonContent;
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							if (sap.firefly.HttpStatusCode.isOk(response
									.getStatusCode()) === false) {
								this.addErrorExt(
										sap.firefly.OriginLayer.IOLAYER,
										sap.firefly.ErrorCodes.SYSTEM_IO_HTTP,
										response.getStatusCodeDetails(), null);
							} else {
								jsonContent = response.getJsonContent();
								if ((jsonContent !== null)
										&& jsonContent.isStructure()) {
									this.getActionContext().setDirectoryInfo(
											jsonContent);
									this.prepareData();
								} else {
									this.addErrorExt(
											sap.firefly.OriginLayer.IOLAYER,
											sap.firefly.ErrorCodes.SYSTEM_IO,
											"Missing json content", null);
								}
							}
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						var children = null;
						if (data !== null) {
							children = data.getChildren();
						}
						listener.onChildFetched(this, data, children,
								customIdentifier);
					},
					prepareData : function() {
						var context;
						var children;
						var list;
						var i;
						var data;
						if (this.m_setData) {
							context = this.getActionContext();
							children = context.createFileList();
							list = sap.firefly.XList.create();
							for (i = 0; i < children.size(); i++) {
								list.add(children.get(i));
							}
							data = sap.firefly.XHierarchyResult.create(context,
									list);
							this.setData(data);
						}
					}
				});
$Firefly
		.createClass("sap.firefly.XHttpFileLoadAction", sap.firefly.SyncAction,
				{
					$statics : {
						createAndRun : function(syncType, context, listener,
								customIdentifier) {
							var object = new sap.firefly.XHttpFileLoadAction();
							object.setupActionAndRun(syncType, context,
									listener, customIdentifier);
							return object;
						}
					},
					processSynchronization : function(syncType) {
						var context = this.getActionContext();
						var uri = context.getUri();
						var httpClient = sap.firefly.HttpClientFactory
								.newInstanceByProtocol(this.getSession(), uri
										.getProtocolType());
						var request = httpClient.getRequest();
						request.setUri(uri);
						httpClient.processHttpRequest(syncType, this, null);
						return true;
					},
					onHttpResponse : function(extResult, response,
							customIdentifier) {
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							if (sap.firefly.HttpStatusCode.isOk(response
									.getStatusCode()) === false) {
								this.addErrorExt(
										sap.firefly.OriginLayer.IOLAYER,
										sap.firefly.ErrorCodes.SYSTEM_IO_HTTP,
										response.getStatusCodeDetails(), null);
							} else {
								this.setData(response);
							}
						}
						this.endSync();
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onFileLoaded(this, data, customIdentifier);
					}
				});
$Firefly.createClass("sap.firefly.DfHttpClient", sap.firefly.SyncAction, {
	m_request : null,
	setupHttpClient : function(sessionContext) {
		this.setupSynchronizingObject(sessionContext);
		this.m_request = sap.firefly.HttpRequest.create();
	},
	releaseObject : function() {
		if ((this.m_request !== null) && (this.m_isSyncCanceled === false)) {
			this.m_request.releaseObject();
			this.m_request = null;
		}
		sap.firefly.DfHttpClient.$superclass.releaseObject.call(this);
	},
	getComponentName : function() {
		return "DfHttpClient";
	},
	getDefaultMessageLayer : function() {
		return sap.firefly.OriginLayer.IOLAYER;
	},
	getRequest : function() {
		return this.m_request;
	},
	setRequest : function(request) {
		this.m_request = request;
	},
	getResponse : function() {
		return this.getData();
	},
	processHttpRequest : function(syncType, listener, customIdentifier) {
		return this.processSyncAction(syncType, listener, customIdentifier);
	},
	processSynchronization : function(syncType) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	callListener : function(extResult, listener, data, customIdentifier) {
		listener.onHttpResponse(extResult, data, customIdentifier);
	}
});
$Firefly
		.createClass(
				"sap.firefly.HttpRequest",
				sap.firefly.HttpExchange,
				{
					$statics : {
						create : function() {
							var response = new sap.firefly.HttpRequest();
							response.setup();
							return response;
						}
					},
					m_uriConnection : null,
					m_acceptContentType : null,
					m_method : null,
					m_proxyHost : null,
					m_proxyPort : 0,
					m_useGzipPostEncoding : false,
					setup : function() {
						var environment;
						var proxyPort;
						var useGzipValue;
						this.setupProtocol();
						this.m_uriConnection = sap.firefly.UriConnection
								.createUriConnection(null);
						this.m_method = sap.firefly.HttpRequestMethod.HTTP_GET;
						this.m_acceptContentType = sap.firefly.HttpContentType.WILDCARD;
						environment = sap.firefly.XEnvironment.getVariables();
						this.m_proxyHost = environment
								.getByKey(sap.firefly.XEnvironmentConstants.HTTP_PROXY_HOST);
						proxyPort = environment
								.getByKey(sap.firefly.XEnvironmentConstants.HTTP_PROXY_PORT);
						if (proxyPort === null) {
							this.m_proxyPort = 80;
						} else {
							this.m_proxyPort = sap.firefly.XInteger
									.convertStringToInteger(proxyPort);
						}
						this.m_useGzipPostEncoding = false;
						useGzipValue = environment
								.getByKey(sap.firefly.XEnvironmentConstants.HTTP_USE_GZIP_ENCODING);
						if ((useGzipValue !== null)
								&& (sap.firefly.XString.isEqual("true",
										useGzipValue) || sap.firefly.XString
										.isEqual("TRUE", useGzipValue))) {
							this.m_useGzipPostEncoding = true;
						}
					},
					releaseObject : function() {
						if (this.m_uriConnection !== null) {
							this.m_uriConnection.releaseObject();
							this.m_uriConnection = null;
						}
						this.m_acceptContentType = null;
						this.m_method = null;
						this.m_proxyHost = null;
						sap.firefly.HttpRequest.$superclass.releaseObject
								.call(this);
					},
					setFromHttpRequest : function(httpRequest) {
						this.setFromHttpExchange(httpRequest);
						this.m_uriConnection.setFromUri(httpRequest);
						this.setMethod(httpRequest.getMethod());
						this.setTimeout(httpRequest.getTimeout());
						this.setAcceptContentType(httpRequest
								.getAcceptContentType());
						this.setUseGzipPostEncoding(httpRequest
								.useGzipPostEncoding());
						this.setProxyHost(httpRequest.getProxyHost());
						this.setProxyPort(httpRequest.getProxyPort());
						this.setX509Certificate(httpRequest
								.getX509Certificate());
						this.setSecureLoginProfile(httpRequest
								.getSecureLoginProfile());
						this.setName(httpRequest.getName());
						this.setText(httpRequest.getText());
					},
					setUri : function(uri) {
						this.m_uriConnection.setFromUri(uri);
					},
					setConnectionInfo : function(connectionInfo) {
						this.m_uriConnection
								.setFromConnectionInfo(connectionInfo);
					},
					getTimeout : function() {
						return this.m_uriConnection.getTimeout();
					},
					setTimeout : function(milliseconds) {
						this.m_uriConnection.setTimeout(milliseconds);
					},
					getAcceptContentType : function() {
						return this.m_acceptContentType;
					},
					setAcceptContentType : function(contentType) {
						this.m_acceptContentType = contentType;
					},
					setMethod : function(method) {
						this.m_method = method;
					},
					getMethod : function() {
						return this.m_method;
					},
					getQuery : function() {
						return this.m_uriConnection.getQuery();
					},
					createRawData : function() {
						var postData;
						var postDataSize = 0;
						var postDataUtf8 = this.getBinaryContent();
						var httpHeader;
						var httpGetRequest;
						var rawSummary;
						var bytes;
						var full;
						var requestMethod;
						var host;
						var port;
						var rawData;
						if (postDataUtf8 === null) {
							postData = this.getStringContent();
							if (postData !== null) {
								postDataUtf8 = sap.firefly.XByteArray
										.convertStringToXByteArray(postData);
								postDataSize = postDataUtf8.size();
							}
						} else {
							postData = sap.firefly.XByteArray
									.convertXByteArrayToString(postDataUtf8);
							postDataSize = postDataUtf8.size();
						}
						httpHeader = sap.firefly.HttpCoreUtils
								.populateHeaderFromRequest(this,
										sap.firefly.HttpHeader.create(), this,
										postDataSize, true);
						httpGetRequest = sap.firefly.HttpCoreUtils
								.createHttpRequestString(this, httpHeader);
						rawSummary = sap.firefly.XStringBuffer.create();
						rawSummary.append(httpGetRequest);
						bytes = sap.firefly.XByteArray
								.convertStringToXByteArrayWithCharset(
										httpGetRequest,
										sap.firefly.XCharset.USASCII);
						full = bytes;
						requestMethod = this.getMethod();
						if ((requestMethod === sap.firefly.HttpRequestMethod.HTTP_POST)
								|| (requestMethod === sap.firefly.HttpRequestMethod.HTTP_PUT)) {
							if (postDataUtf8 !== null) {
								rawSummary.append(postData);
								full = sap.firefly.XByteArray.create(null,
										bytes.size() + postDataUtf8.size());
								sap.firefly.XByteArray.copy(bytes, 0, full, 0,
										bytes.size());
								sap.firefly.XByteArray
										.copy(postDataUtf8, 0, full, bytes
												.size(), postDataUtf8.size());
							}
						}
						this.m_rawSummary = rawSummary.toString();
						host = this.getHost();
						port = this.getPort();
						if (this.m_proxyHost !== null) {
							host = this.m_proxyHost;
							port = this.m_proxyPort;
						}
						rawData = sap.firefly.HttpRawData.create(this
								.getProtocolType(), host, port, full);
						return rawData;
					},
					getProxyHost : function() {
						return this.m_proxyHost;
					},
					getProxyPort : function() {
						return this.m_proxyPort;
					},
					setProxyHost : function(host) {
						this.m_proxyHost = host;
					},
					setProxyPort : function(port) {
						this.m_proxyPort = port;
					},
					useGzipPostEncoding : function() {
						return this.m_useGzipPostEncoding;
					},
					setUseGzipPostEncoding : function(useGzipPostEncoding) {
						this.m_useGzipPostEncoding = useGzipPostEncoding;
					},
					setPath : function(path) {
						this.m_uriConnection.setPath(path);
					},
					getPath : function() {
						return this.m_uriConnection.getPath();
					},
					getQueryMap : function() {
						return this.m_uriConnection.getQueryMap();
					},
					addQueryElement : function(name, value) {
						this.m_uriConnection.addQueryElement(name, value);
					},
					getQueryElements : function() {
						return this.m_uriConnection.getQueryElements();
					},
					getFragment : function() {
						return this.m_uriConnection.getFragment();
					},
					getFragmentQueryElements : function() {
						return this.m_uriConnection.getFragmentQueryElements();
					},
					getFragmentQueryMap : function() {
						return this.m_uriConnection.getFragmentQueryMap();
					},
					addFragmentQueryElement : function(name, value) {
						this.m_uriConnection.addFragmentQueryElement(name,
								value);
					},
					getUriString : function() {
						return this.m_uriConnection.getUriString();
					},
					getUriStringWithoutAuthentication : function() {
						return this.m_uriConnection
								.getUriStringWithoutAuthentication();
					},
					getUriStringExt : function(withSchema, withUserPwd,
							withAuthenticationType, withHostPort, withPath,
							withQuery, withFragment) {
						return this.m_uriConnection
								.getUriStringExt(withSchema, withUserPwd,
										withAuthenticationType, withHostPort,
										withPath, withQuery, withFragment);
					},
					getScheme : function() {
						return this.m_uriConnection.getScheme();
					},
					getProtocolType : function() {
						return this.m_uriConnection.getProtocolType();
					},
					getUser : function() {
						return this.m_uriConnection.getUser();
					},
					getPassword : function() {
						return this.m_uriConnection.getPassword();
					},
					getAuthenticationType : function() {
						return this.m_uriConnection.getAuthenticationType();
					},
					getHost : function() {
						return this.m_uriConnection.getHost();
					},
					getPort : function() {
						return this.m_uriConnection.getPort();
					},
					getLanguage : function() {
						return this.m_uriConnection.getLanguage();
					},
					getX509Certificate : function() {
						return this.m_uriConnection.getX509Certificate();
					},
					getSecureLoginProfile : function() {
						return this.m_uriConnection.getSecureLoginProfile();
					},
					getName : function() {
						return this.m_uriConnection.getName();
					},
					getText : function() {
						return this.m_uriConnection.getText();
					},
					setUriString : function(uriString) {
						this.m_uriConnection.setUriString(uriString);
					},
					setFromUriWithParent : function(uriString, parentUri,
							mergeQueries) {
						this.m_uriConnection.setFromUriWithParent(uriString,
								parentUri, mergeQueries);
					},
					setFragment : function(fragment) {
						this.m_uriConnection.setFragment(fragment);
					},
					setQuery : function(query) {
						this.m_uriConnection.setQuery(query);
					},
					setFromConnection : function(connection) {
						this.m_uriConnection.setFromConnection(connection);
					},
					setFromUri : function(uri) {
						this.m_uriConnection.setFromUri(uri);
					},
					setScheme : function(scheme) {
						this.m_uriConnection.setScheme(scheme);
					},
					setProtocolType : function(type) {
						this.m_uriConnection.setProtocolType(type);
					},
					setUser : function(user) {
						this.m_uriConnection.setUser(user);
					},
					setPassword : function(password) {
						this.m_uriConnection.setPassword(password);
					},
					getAuthenticationToken : function() {
						return this.m_uriConnection.getAuthenticationToken();
					},
					setAuthenticationToken : function(token) {
						this.m_uriConnection.setAuthenticationToken(token);
					},
					setAuthenticationType : function(type) {
						this.m_uriConnection.setAuthenticationType(type);
					},
					setAuthentication : function(type) {
						this.m_uriConnection.setAuthenticationType(type);
					},
					setHost : function(host) {
						this.m_uriConnection.setHost(host);
					},
					setPort : function(port) {
						this.m_uriConnection.setPort(port);
					},
					setFromConnectionInfo : function(origin) {
						this.m_uriConnection.setFromConnectionInfo(origin);
					},
					setLanguage : function(language) {
						this.m_uriConnection.setLanguage(language);
					},
					setX509Certificate : function(x509Certificate) {
						this.m_uriConnection
								.setX509Certificate(x509Certificate);
					},
					setSecureLoginProfile : function(secureLoginProfile) {
						this.m_uriConnection
								.setSecureLoginProfile(secureLoginProfile);
					},
					setName : function(name) {
						this.m_uriConnection.setName(name);
					},
					setText : function(text) {
						this.m_uriConnection.setText(text);
					},
					getSystemType : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setSystemType : function(systemType) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					isRelativeUri : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					setReferer : function(referer) {
						this.getHeaderFieldsBase().setStringByName(
								sap.firefly.HttpConstants.HD_REFERER, referer);
					},
					getReferer : function() {
						return this.getHeaderFields().getByKey(
								sap.firefly.HttpConstants.HD_REFERER);
					},
					setOrigin : function(origin) {
						this.getHeaderFieldsBase().setStringByName(
								sap.firefly.HttpConstants.HD_ORIGIN, origin);
					},
					getOrigin : function() {
						return this.getHeaderFields().getByKey(
								sap.firefly.HttpConstants.HD_ORIGIN);
					},
					retrieveCookiesFromMasterStorage : function() {
						if ((this.m_cookiesMasterStore !== null)
								&& (this.m_cookies === null)) {
							this.m_cookies = this.m_cookiesMasterStore
									.getCookies(this.getHost(), this.getPath());
						}
					},
					toString : function() {
						this.createRawData();
						return this.m_rawSummary;
					}
				});
$Firefly
		.createClass("sap.firefly.DfRpcFunction", sap.firefly.SyncAction,
				{
					m_relativeUri : null,
					m_rpcRequest : null,
					m_rpcResponse : null,
					m_traceInfo : null,
					setupFunction : function(context, connectionInfo,
							relativeUri) {
						this.setupSynchronizingObject(context);
						this.m_relativeUri = relativeUri;
						this.m_rpcRequest = sap.firefly.RpcRequest.create(this,
								connectionInfo);
						this.m_rpcResponse = sap.firefly.RpcResponse
								.create(this);
					},
					releaseObject : function() {
						this.m_relativeUri = null;
						this.m_rpcRequest = sap.firefly.XObject
								.releaseIfNotNull(this.m_rpcRequest);
						this.m_rpcResponse = sap.firefly.XObject
								.releaseIfNotNull(this.m_rpcResponse);
						this.m_traceInfo = sap.firefly.XObject
								.releaseIfNotNull(this.m_traceInfo);
						sap.firefly.DfRpcFunction.$superclass.releaseObject
								.call(this);
					},
					getName : function() {
						return this.m_relativeUri.toString();
					},
					getRequest : function() {
						return this.m_rpcRequest;
					},
					getResponse : function() {
						return this.m_rpcResponse;
					},
					getExtResult : function() {
						return this;
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						listener.onFunctionExecuted(extResult, data,
								customIdentifier);
					},
					processFunctionExecution : function(syncType, listener,
							customIdentifier) {
						return this.processSyncAction(syncType, listener,
								customIdentifier);
					},
					getTraceInfo : function() {
						return this.m_traceInfo;
					},
					setTraceInfo : function(traceInfo) {
						this.m_traceInfo = traceInfo;
					},
					getTraceType : function() {
						if (this.m_traceInfo === null) {
							return sap.firefly.TraceType.NONE;
						}
						return this.m_traceInfo.getTraceType();
					}
				});
$Firefly.createClass("sap.firefly.HttpFileClient", sap.firefly.DfHttpClient, {
	$statics : {
		create : function(session) {
			var newObj = new sap.firefly.HttpFileClient();
			newObj.setupHttpClient(session);
			return newObj;
		}
	},
	processSynchronization : function(syncType) {
		var request = this.getRequest();
		var path = request.getPath();
		var response = sap.firefly.HttpResponse.createResponse(request);
		var file;
		var mimeType;
		var fileTypeIndex;
		var fileEnding;
		var fileMimeType;
		var data;
		var content;
		this.setData(response);
		file = sap.firefly.XFile.create(path);
		if (file.isFile()) {
			mimeType = sap.firefly.HttpContentType.TEXT_PLAIN;
			fileTypeIndex = sap.firefly.XString.lastIndexOf(path, ".");
			if (fileTypeIndex !== -1) {
				fileEnding = sap.firefly.XString.substring(path,
						fileTypeIndex + 1, -1);
				fileMimeType = sap.firefly.HttpContentType
						.lookupByFileEnding(fileEnding);
				if (fileMimeType !== null) {
					mimeType = fileMimeType;
				}
			}
			response.setHttpContentType(mimeType);
			data = file.load();
			response.setBinaryContent(data);
			if (mimeType.isText()) {
				content = sap.firefly.XByteArray
						.convertXByteArrayToString(data);
				response.setStringContent(content);
			}
			response.setStatusCode(sap.firefly.HttpStatusCode.SC_OK);
		} else {
			response.setStatusCode(sap.firefly.HttpStatusCode.SC_NOT_FOUND);
		}
		return false;
	}
});
$Firefly.createClass("sap.firefly.HttpLocalLoopClient",
		sap.firefly.DfHttpClient, {
			$statics : {
				create : function(session, serverConfig) {
					var newObj = new sap.firefly.HttpLocalLoopClient();
					newObj.setupLocalLoop(session, serverConfig);
					return newObj;
				}
			},
			m_serverConfig : null,
			setupLocalLoop : function(session, serverConfig) {
				this.setupHttpClient(session);
				this.m_serverConfig = serverConfig;
			},
			releaseObject : function() {
				this.m_serverConfig = null;
				sap.firefly.HttpLocalLoopClient.$superclass.releaseObject
						.call(this);
			},
			processSynchronization : function(syncType) {
				var request = this.getRequest();
				var listener;
				request.retrieveCookiesFromMasterStorage();
				listener = this.m_serverConfig.getCallback();
				listener.onHttpRequest(this);
				return false;
			},
			getClientRequest : function() {
				return this.getRequest();
			},
			setResponse : function(serverResponse) {
				(serverResponse).applyCookiesToMasterStorage();
				this.setData(serverResponse);
			}
		});
$Firefly
		.createClass(
				"sap.firefly.HttpSamlClient",
				sap.firefly.DfHttpClient,
				{
					$statics : {
						create : function(session) {
							var client = new sap.firefly.HttpSamlClient();
							client.setupHttpClient(session);
							return client;
						}
					},
					m_step : 0,
					processSynchronization : function(syncType) {
						var request = this.getRequest();
						var serviceRequestClient = sap.firefly.HttpClientFactory
								.newInstanceByProtocol(this.getSession(),
										request.getProtocolType());
						var serviceRequest = serviceRequestClient.getRequest();
						serviceRequest.setFromHttpRequest(request);
						serviceRequest
								.setAuthenticationType(sap.firefly.AuthenticationType.NONE);
						serviceRequest
								.setAcceptContentType(sap.firefly.HttpContentType.WILDCARD);
						serviceRequest.setUser(null);
						serviceRequest.setPassword(null);
						this.m_step = 1;
						serviceRequestClient.processHttpRequest(syncType, this,
								null);
						return true;
					},
					onHttpResponse : function(extResult, response,
							customIdentifier) {
						var statusCode;
						var httpContentType;
						var session;
						var originSite;
						var location;
						var locationUri;
						var httpClient;
						var redirectRequest;
						var cookiesMasterStore;
						var contentType;
						var html;
						var identityProviderForm;
						var masterRequest;
						this.addAllMessages(extResult);
						if (this.hasErrors()) {
							this.endSync();
						} else {
							statusCode = response.getStatusCode();
							httpContentType = response.getHttpContentType();
							if ((statusCode === sap.firefly.HttpStatusCode.SC_OK)
									&& (httpContentType === sap.firefly.HttpContentType.APPLICATION_JSON)) {
								this.setData(response);
								this.endSync();
							} else {
								session = this.getSession();
								originSite = response.getHttpRequest();
								if ((statusCode === sap.firefly.HttpStatusCode.SC_SEE_OTHER)
										|| (statusCode === sap.firefly.HttpStatusCode.SC_FOUND)) {
									location = response.getLocation();
									if (location !== null) {
										locationUri = sap.firefly.XUri
												.createFromUriWithParent(
														location, originSite,
														false);
										httpClient = sap.firefly.HttpClientFactory
												.newInstanceByConnection(
														session, locationUri);
										redirectRequest = httpClient
												.getRequest();
										redirectRequest.setUri(locationUri);
										redirectRequest
												.setAcceptContentType(sap.firefly.HttpContentType.WILDCARD);
										redirectRequest
												.setMethod(sap.firefly.HttpRequestMethod.HTTP_GET);
										cookiesMasterStore = this.getRequest()
												.getCookiesMasterStore();
										redirectRequest
												.setCookiesMasterStore(cookiesMasterStore);
										this.m_step = this.m_step + 1;
										httpClient.processHttpRequest(this
												.getActiveSyncType(), this,
												null);
									} else {
										this
												.addError(0,
														"Response does not contain redirect location");
										this.setData(response);
										this.endSync();
									}
								} else {
									contentType = response.getContentType();
									if (contentType === sap.firefly.ContentType.TEXT_HTML) {
										html = response.getStringContent();
										identityProviderForm = sap.firefly.HtmlForm
												.create(originSite, html);
										if (identityProviderForm.isValid()) {
											if (identityProviderForm
													.getParameterValue("j_username") !== null) {
												masterRequest = this
														.getRequest();
												identityProviderForm
														.set(
																"j_username",
																masterRequest
																		.getUser());
												identityProviderForm.set(
														"j_password",
														masterRequest
																.getPassword());
											}
											this
													.postForm(
															session,
															identityProviderForm,
															false);
										} else {
											this.addError(0, "Logon failed");
											this.setData(response);
											this.endSync();
										}
									}
								}
							}
						}
					},
					postForm : function(session, form, useCertificates) {
						var connectionInfo;
						var httpClient;
						var request;
						var masteruri;
						var referer;
						var originUri;
						var origin;
						var cookiesMasterStore;
						var buffer;
						var names;
						var hasValue;
						var name;
						var type;
						var value;
						var valueEnc;
						var content;
						var extAuth;
						this.m_step = this.m_step + 1;
						connectionInfo = form.getTarget();
						httpClient = sap.firefly.HttpClientFactory
								.newInstanceByConnection(session,
										connectionInfo);
						request = httpClient.getRequest();
						request.setUri(connectionInfo);
						request
								.setAcceptContentType(sap.firefly.HttpContentType.WILDCARD);
						if (useCertificates) {
							request
									.setAuthenticationType(sap.firefly.AuthenticationType.CERTIFICATES);
						} else {
							request
									.setAuthenticationType(sap.firefly.AuthenticationType.NONE);
						}
						request
								.setMethod(sap.firefly.HttpRequestMethod.HTTP_POST);
						masteruri = form.getOriginSite();
						referer = masteruri.getUriString();
						request.setReferer(referer);
						originUri = sap.firefly.XUri.createFromOther(masteruri);
						originUri.setFragment(null);
						originUri.setPath(null);
						originUri.setQuery(null);
						originUri
								.setAuthenticationType(sap.firefly.AuthenticationType.NONE);
						origin = originUri.getUriString();
						request.setOrigin(origin);
						cookiesMasterStore = this.getRequest()
								.getCookiesMasterStore();
						request.setCookiesMasterStore(cookiesMasterStore);
						buffer = sap.firefly.XStringBuffer.create();
						names = form.getNames();
						hasValue = false;
						while (names.hasNext()) {
							name = names.next();
							type = form.getParameterType(name);
							if ((sap.firefly.XString.isEqual(type, "submit") === false)) {
								if (hasValue) {
									buffer.append("&");
								}
								hasValue = true;
								buffer.append(name);
								buffer.append("=");
								value = form.getParameterValue(name);
								valueEnc = sap.firefly.XHttpUtils
										.encodeURIComponent(value);
								buffer.append(valueEnc);
							}
						}
						content = buffer.toString();
						request.setStringContent(content);
						request
								.setHttpContentType(sap.firefly.HttpContentType.APPLICATION_FORM);
						extAuth = httpClient.processHttpRequest(this
								.getActiveSyncType(), this, null);
						return extAuth;
					}
				});
$Firefly.createClass("sap.firefly.IoModule", sap.firefly.DfModule, {
	$statics : {
		s_module : null,
		getInstance : function() {
			return sap.firefly.IoModule
					.initVersion(sap.firefly.XVersion.API_DEFAULT);
		},
		initVersion : function(version) {
			if (sap.firefly.IoModule.s_module === null) {
				if (sap.firefly.CoreExtModule.initVersion(version) === null) {
					throw sap.firefly.XException
							.createInitializationException();
				}
				sap.firefly.IoModule.s_module = new sap.firefly.IoModule();
				sap.firefly.SystemType.staticSetup();
				sap.firefly.IoComponentType.staticSetupIoType();
				sap.firefly.HttpClientFactory.staticSetup();
				sap.firefly.XFileSystemType.staticSetup();
				sap.firefly.ContentType.staticSetup();
				sap.firefly.JsonParserErrorCode.staticSetup();
				sap.firefly.JsonParserFactory.staticSetupJsonParserFactory();
				sap.firefly.XmlParserFactory.staticSetupXmlParserFactory();
				sap.firefly.JxJsonParserFactory.staticSetup();
				sap.firefly.JsonSerializerFactory
						.staticSetupJsonSerializerFactory();
				sap.firefly.DocumentFormatType.staticSetup();
				sap.firefly.XPrompt.staticSetup();
				sap.firefly.AuthenticationType.staticSetup();
				sap.firefly.ProtocolType.staticSetup();
				sap.firefly.HttpConstants.staticSetup();
				sap.firefly.HttpContentType.staticSetup();
				sap.firefly.HttpRequestMethod.staticSetup();
				sap.firefly.RpcFunctionFactory.staticSetupRcpFunctionFactory();
				sap.firefly.HttpFileFactory.staticSetup();
				sap.firefly.HttpSamlClientFactory.staticSetupSamlFactory();
			}
			return sap.firefly.IoModule.s_module;
		}
	}
});
sap.firefly.IoModule.getInstance();