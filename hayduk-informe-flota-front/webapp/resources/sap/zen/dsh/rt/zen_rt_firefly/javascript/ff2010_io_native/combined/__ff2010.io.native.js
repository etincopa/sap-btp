if ((typeof $ !== "undefined") && ($.db) && ($.db.ina) && ($.trace)) {
	$Global.window = {
		location : {
			protocol : "http:",
			hostname : "localhost",
			port : 8000,
			pathname : "",
			hash : "",
			search : ""
		}
	};
	$Global.console = {
		log : function(text) {
			$.trace.debug("XLogger: " + text);
		}
	};
	$Global.XMLHttpRequest = function() {
		this.headers = {};
	};
	$Global.XMLHttpRequest.clients = {
		"default" : new $.net.http.Client()
	};
	$Global.XMLHttpRequest.prototype.open = function(method, url, async) {
		$.trace.debug("Creating request with method=" + method + ", url=" + url
				+ ", async=" + async);
		this.url = url;
		if (method === "GET") {
			this.request = new $.net.http.Request($.net.http.GET, url);
		} else {
			if (method === "POST") {
				this.request = new $.net.http.Request($.net.http.POST, url);
			} else {
				if (method === "PUT") {
					this.request = new $.net.http.Request($.net.http.PUT, url);
				}
			}
		}
		if (this.request === undefined) {
			throw new Error(
					"Illegal State: Couldn't create XS-request for method "
							+ method);
		}
	};
	$Global.XMLHttpRequest.prototype.send = function(data) {
		var str = "";
		var aHeaders = this.request.headers;
		var fnDebug = $.trace.debug;
		var sClient = "default";
		for ( var member in this.headers) {
			if (this.headers.hasOwnProperty(member)) {
				aHeaders.set(member, this.headers[member]);
				str += member + "=" + this.headers[member] + "\u000d\u000a";
				if (member === sap.firefly.HttpConstants.HD_AUTHORIZATION) {
					sClient = this.headers[member];
					if (!$Global.XMLHttpRequest.clients.hasOwnProperty(sClient)) {
						$Global.XMLHttpRequest.clients[sClient] = new $.net.http.Client();
					}
				}
			}
		}
		fnDebug("Request to send, client key:\n" + sClient);
		var oClient = $Global.XMLHttpRequest.clients[sClient];
		fnDebug("Request to send, headers:\n" + str);
		fnDebug("Request to send, body:\n" + data);
		if (data !== null) {
			this.request.setBody(data);
		}
		oClient.request(this.request, this.url);
		this.response = oClient.getResponse();
		this.readyState = 4;
		this.status = this.response.status;
		this.statusText = "";
		if (!this.response.body) {
			this.responseText = "";
		} else {
			this.responseText = this.response.body.asString();
		}
		this.headers = {};
		fnDebug("Received response, header:\n" + this.getAllResponseHeaders());
		fnDebug("Received response, body:\n" + this.responseText);
	};
	$Global.XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
		this.headers[header] = value;
		$.trace.debug("Added field to the header " + header + "=" + value
				+ ", size=" + this.headers.length);
	};
	$Global.XMLHttpRequest.prototype.getAllResponseHeaders = function() {
		var str = "";
		var aHeaders = this.response.headers;
		var len = aHeaders.length;
		for (var i = 0; i < len; ++i) {
			var header = aHeaders[i];
			str += header.name + ": " + header.value + "\u000d\u000a";
		}
		return str;
	};
}
sap.firefly.NodeJsXMLHttpRequest = function() {
	sap.firefly.XObject.call(this);
	this.readyState = sap.firefly.NodeJsXMLHttpRequest.UNSENT;
	this.m_headers = {};
	this.m_options = {};
	this.m_sendFlag = false;
	this.m_method = null;
	this.m_url = null;
	this.m_async = null;
	this.status = null;
	this.statusText = null;
	this.response = null;
	this.responseText = "";
	this.onreadystatechange = null;
	this.m_cookies = null;
};
sap.firefly.NodeJsXMLHttpRequest.prototype = new sap.firefly.XObject();
sap.firefly.NodeJsXMLHttpRequest.UNSENT = 0;
sap.firefly.NodeJsXMLHttpRequest.OPENED = 1;
sap.firefly.NodeJsXMLHttpRequest.HEADERS_RECEIVED = 2;
sap.firefly.NodeJsXMLHttpRequest.DONE = 4;
sap.firefly.NodeJsXMLHttpRequest.prototype.getResponseHeader = function(header) {
	if (typeof header === "string"
			&& this.readyState > sap.firefly.NodeJsXMLHttpRequest.OPENED) {
		return this.response.headers[header.toLowerCase()];
	}
	return null;
};
sap.firefly.NodeJsXMLHttpRequest.prototype.getAllResponseHeaders = function() {
	if (this.readyState < sap.firefly.NodeJsXMLHttpRequest.HEADERS_RECEIVED) {
		return "";
	}
	var result = "";
	var headers = this.response.headers;
	for ( var h in headers) {
		if (headers.hasOwnProperty(h)) {
			var headerLower = h.toLowerCase();
			result += headerLower + ": " + headers[headerLower] + "\r\n";
		}
	}
	return result.substr(0, result.length - 2);
};
sap.firefly.NodeJsXMLHttpRequest.prototype.isHttpsProtocol = function(url) {
	var parsedUrl = require("url").parse(url.toString());
	var protocolLower = parsedUrl.protocol.toLowerCase();
	return (protocolLower === "https:");
};
sap.firefly.NodeJsXMLHttpRequest.prototype.setCookies = function(cookies) {
	this.m_cookies = cookies;
};
sap.firefly.NodeJsXMLHttpRequest.prototype.setRequestHeader = function(header,
		value) {
	var headerLower = header.toLowerCase();
	if (headerLower !== "cookie") {
		if (this.readyState !== sap.firefly.NodeJsXMLHttpRequest.OPENED) {
			throw new Error("Request is not in OPEN state");
		}
		if (this.m_sendFlag) {
			throw new Error("Request has been already sent");
		}
		this.m_headers[headerLower] = this.m_headers[headerLower] ? this.m_headers[headerLower]
				+ ", " + value
				: value;
	} else {
		this.m_headers[headerLower] = this.m_headers[headerLower] ? this.m_headers[headerLower]
				+ ", " + value
				: value;
	}
};
sap.firefly.NodeJsXMLHttpRequest.prototype.open = function(method, url, async) {
	var methodUpper = method.toUpperCase();
	if (methodUpper !== "POST" && methodUpper !== "GET"
			&& methodUpper !== "PUT") {
		throw new Error("Request method is not supported");
	}
	this.m_async = async;
	this.m_headers = {};
	this.m_method = methodUpper;
	this.m_url = url;
	this.m_sendFlag = false;
	this.readyState = sap.firefly.NodeJsXMLHttpRequest.OPENED;
	this.status = 0;
	this.statusText = "";
};
sap.firefly.NodeJsXMLHttpRequest.prototype.send = function(body) {
	if (this.readyState !== sap.firefly.NodeJsXMLHttpRequest.OPENED) {
		throw new Error("Request is not in OPEN state");
	}
	if (this.m_sendFlag) {
		throw new Error("Request has been already sent");
	}
	if (this.m_method === "GET") {
		body = null;
	} else {
		if (body) {
			this.setRequestHeader("Content-Length",
					Buffer.isBuffer(body) ? body.length : Buffer
							.byteLength(body));
		} else {
			if (this.m_method === "POST") {
				this.setRequestHeader("Content-Length", 0);
			}
		}
	}
	var parsedUrl = require("url").parse(this.m_url);
	var port = parsedUrl.port || (this.isHttpsProtocol(this.m_url) ? 443 : 80);
	var host;
	var hostname;
	switch (parsedUrl.protocol) {
	case "https:":
	case "http:":
		host = parsedUrl.host;
		hostname = parsedUrl.hostname;
		break;
	default:
		throw new Error("Protocol not supported");
	}
	this.setRequestHeader("Host", host);
	this.setRequestHeader("User-Agent", process.release.name + "/"
			+ process.version + "(" + process.platform + ")");
	if (this.m_cookies !== null) {
		var cookiesList = this.m_cookies.getCookies();
		if (cookiesList.size() !== 0) {
			var cookies = "";
			for (var i = 0; i < cookiesList.size(); i++) {
				cookies += cookiesList.get(i).getName() + "="
						+ cookiesList.get(i).getValue() + "; ";
			}
			this.setRequestHeader("Cookie", cookies.substring(0,
					cookies.length - 2));
		}
	}
	this.m_options = {
		"host" : host,
		"port" : port,
		"path" : parsedUrl.path,
		"hostname" : hostname,
		"protocol" : parsedUrl.protocol,
		"method" : this.m_method,
		"headers" : this.m_headers
	};
	var useProxy = false;
	if (useProxy) {
		var proxyHost = "127.0.0.1";
		var proxyPort = 8888;
		this.m_options.host = proxyHost;
		this.m_options.port = proxyPort;
		this.m_options.path = this.m_url;
		delete this.m_options.hostname;
	}
	var handleResponseEnd = (function(resp) {
		var response = JSON.parse(resp);
		this.response = response.data;
		this.status = response.data.statusCode;
		this.statusText = response.data.statusMessage;
		this.responseText = response.data.text;
		this.readyState = sap.firefly.NodeJsXMLHttpRequest.DONE;
		if (this.m_async) {
			this.handleEvent("readystatechange");
		}
	}).bind(this);
	var handleResponseError = (function(error) {
		this.response = error;
		this.status = 0;
		this.statusText = "";
		this.responseText = "";
		this.readyState = sap.firefly.NodeJsXMLHttpRequest.DONE;
	}).bind(this);
	var handleRequestError = (function(error) {
		this.response = null;
		this.status = error.code;
		this.statusText = error.message;
		this.responseText = error.message;
		this.readyState = sap.firefly.NodeJsXMLHttpRequest.DONE;
	}).bind(this);
	var charsetUTF8 = "UTF-8";
	if (this.m_async) {
		this.m_sendFlag = true;
		var responseText = "";
		var request = require("http"
				+ (this.isHttpsProtocol(this.m_url) ? "s" : "")).request;
		var processResponse = (function(response) {
			response.setEncoding(charsetUTF8);
			response.on("data", function(data) {
				responseText += data;
			});
			response.on("end", function() {
				handleResponseEnd(JSON.stringify({
					"error" : null,
					"data" : {
						"statusCode" : response.statusCode,
						"statusMessage" : response.statusMessage,
						"headers" : response.headers,
						"text" : responseText
					}
				}));
			});
			response.on("error", function(error) {
				handleResponseError(error);
			});
		}).bind(this);
		var requestPerformer = request(this.m_options, processResponse);
		requestPerformer.on("error", function(error) {
			handleRequestError(error);
		});
		if (body !== null) {
			requestPerformer.write(body);
		}
		requestPerformer.end();
	} else {
		var fs = require("fs");
		var syncFile = ".nodeHttpSync_" + process.pid;
		fs.writeFileSync(syncFile, "", charsetUTF8);
		var syncReq = 'var request = require("http'
				+ (this.isHttpsProtocol(this.m_url) ? "s" : "")
				+ '").request;'
				+ 'var responseText = "";'
				+ "var processResponse = function(response) {"
				+ 'response.setEncoding("'
				+ charsetUTF8
				+ '");'
				+ 'response.on("data", function(data) {'
				+ "responseText += data;"
				+ "});"
				+ 'response.on("end", function() {'
				+ 'fs.writeFileSync("'
				+ syncFile
				+ '", '
				+ 'JSON.stringify({"error": null, "data": {"statusCode": '
				+ "response.statusCode"
				+ ', "statusMessage": '
				+ "response.statusMessage"
				+ ', "headers": '
				+ "response.headers"
				+ ', "text": '
				+ "responseText"
				+ "}})"
				+ ', "'
				+ charsetUTF8
				+ '");'
				+ "});"
				+ 'response.on("error", function(error) {'
				+ 'fs.writeFileSync("'
				+ syncFile
				+ '", '
				+ 'JSON.stringify({"error": '
				+ "error"
				+ "})"
				+ ', "'
				+ charsetUTF8
				+ '");'
				+ "});"
				+ "};"
				+ "var requestPerformer = request("
				+ JSON.stringify(this.m_options)
				+ ", processResponse);"
				+ 'requestPerformer.on("error", function(error) {'
				+ 'fs.writeFileSync("'
				+ syncFile
				+ '", '
				+ 'JSON.stringify({"error": '
				+ "error"
				+ "})"
				+ ', "'
				+ charsetUTF8
				+ '");'
				+ "});"
				+ (body ? "requestPerformer.write(" + JSON.stringify(body)
						+ ");" : "") + "requestPerformer.end();";
		var spawnSync = require("child_process").spawnSync;
		spawnSync(process.argv[0], [ "-e", syncReq ]);
		var resp = fs.readFileSync(syncFile, charsetUTF8);
		fs.unlinkSync(syncFile);
		var err = JSON.parse(resp).error;
		if (err) {
			handleResponseError(err);
		} else {
			handleResponseEnd(resp);
		}
	}
};
sap.firefly.NodeJsXMLHttpRequest.prototype.handleEvent = function(event) {
	if (typeof this["on" + event] === "function") {
		this["on" + event]();
	}
};
sap.firefly.NativeXFileSystem = function() {
	sap.firefly.DfXFileSystem.call(this);
};
sap.firefly.NativeXFileSystem.prototype = new sap.firefly.DfXFileSystem();
sap.firefly.NativeXFileSystem.staticSetup = function() {
	if ((typeof module !== "undefined") && (this.module !== module)
			&& (module.exports)) {
		var xFile = sap.firefly.XFile;
		xFile.setFileSystem(new sap.firefly.NativeXFileSystem());
		xFile.NATIVE_SLASH = require("path").sep;
		xFile.IS_SUPPORTED = true;
	}
};
sap.firefly.NativeXFileSystem.prototype.getRoots = function() {
	var paths = new sap.firefly.XListOfString();
	var isWin = /^win/.test(process.platform);
	if (isWin) {
		paths.add("C:\\");
	} else {
		paths.add("/");
	}
	return paths;
};
sap.firefly.NativeXFileSystem.prototype.getChildren = function(nativePath) {
	var paths;
	var files;
	var i;
	var path;
	var xFile = sap.firefly.XFile;
	if (sap.firefly.XStringUtils.isNullOrEmpty(nativePath)) {
		return this.getRoots();
	}
	paths = new sap.firefly.XListOfString();
	try {
		files = require("fs").readdirSync(nativePath);
		for (i in files) {
			if (files.hasOwnProperty(i)) {
				path = nativePath + xFile.NATIVE_SLASH + files[i];
				paths.add(path);
			}
		}
	} catch (err) {
	}
	return paths;
};
sap.firefly.NativeXFileSystem.prototype.isDirectory = function(nativePath) {
	try {
		var stats = require("fs").statSync(nativePath);
		if (stats.isDirectory()) {
			return true;
		}
	} catch (err) {
	}
	return false;
};
sap.firefly.NativeXFileSystem.prototype.isFile = function(nativePath) {
	try {
		var stats = require("fs").statSync(nativePath);
		if (stats.isFile()) {
			return true;
		}
	} catch (err) {
	}
	return false;
};
sap.firefly.NativeXFileSystem.prototype.isExisting = function(nativePath) {
	return (this.isDirectory(nativePath) || this.isFile(nativePath));
};
sap.firefly.NativeXFileSystem.prototype.loadInternal = function(nativePath,
		messageManager) {
	var byteArray;
	try {
		var bytes = require("fs").readFileSync(nativePath);
		byteArray = new sap.firefly.XByteArray(bytes);
	} catch (err) {
		messageManager.addError(0, err);
	}
	return byteArray;
};
sap.firefly.NativeXFileSystem.prototype.load = function(nativePath) {
	var messageManager = sap.firefly.MessageManager.createMessageManager();
	var byteArray = this.loadInternal(nativePath, messageManager);
	return sap.firefly.ExtResult.create(byteArray, messageManager);
};
sap.firefly.NativeXFileSystem.prototype.loadExt = function(nativePath) {
	var messageManager = sap.firefly.MessageManager.createMessageManager();
	var byteArray = this.loadInternal(nativePath, messageManager);
	var content = sap.firefly.XFileContent.create();
	content.setMessageCollection(messageManager);
	content.setContentType(sap.firefly.ContentType.BINARY);
	content.setBinaryContent(byteArray);
	return content;
};
sap.firefly.NativeXFileSystem.prototype.loadGzipped = function(nativePath) {
	var messageManager = sap.firefly.MessageManager.createMessageManager();
	var bytes = [];
	try {
		bytes = require("fs").readFileSync(nativePath);
		bytes = require("zlib").gunzipSync(bytes);
	} catch (err) {
		messageManager.addError(0, err);
	}
	var content = sap.firefly.XFileContent.create();
	content.setMessageCollection(messageManager);
	content.setContentType(sap.firefly.ContentType.BINARY);
	content.setBinaryContent(new sap.firefly.XByteArray(bytes));
	return content;
};
sap.firefly.NativeXFileSystem.prototype.save = function(nativePath, data) {
	var messageManager = sap.firefly.MessageManager.createMessageManager();
	var bytes = data.getNative();
	try {
		require("fs").writeFileSync(nativePath, bytes);
	} catch (err) {
		messageManager.addError(0, err);
	}
	return messageManager;
};
sap.firefly.NativeXFileSystem.prototype.mkdirs = function(nativePath) {
	try {
		require("fs").mkdirSync(nativePath);
	} catch (err) {
	}
};
sap.firefly.NativeXFileSystem.prototype.mkdir = function(nativePath) {
	try {
		require("fs").mkdirSync(nativePath);
	} catch (err) {
	}
};
sap.firefly.NativeXFileSystem.prototype.getLastModifiedTimestamp = function(
		nativePath) {
	try {
		var stats = require("fs").statSync(nativePath);
		return stats.mtime;
	} catch (err) {
		return null;
	}
};
sap.firefly.NativeXFileSystem.prototype.renameTo = function(sourceNativePath,
		destNativePath) {
	try {
		require("fs").renameSync(sourceNativePath, destNativePath);
	} catch (err) {
	}
};
sap.firefly.NativeXFileSystem.prototype.deleteFile = function(nativePath) {
	try {
		require("fs").unlinkSync(nativePath);
	} catch (err) {
	}
};
sap.firefly.NativeDispatcher = function() {
	sap.firefly.DfDispatcher.call(this);
};
sap.firefly.NativeDispatcher.prototype = new sap.firefly.DfDispatcher();
sap.firefly.NativeDispatcher.staticSetup = function() {
	sap.firefly.Dispatcher.replaceInstance(new sap.firefly.NativeDispatcher());
};
sap.firefly.NativeDispatcher.prototype.registerInterval = function(
		milliseconds, listener, customIdentifier) {
	return $Global.window.setInterval(function() {
		listener.onTimerEvent(null, customIdentifier);
	}, milliseconds);
};
sap.firefly.NativeDispatcher.prototype.unregisterInterval = function(handle) {
	$Global.window.clearInterval(handle);
};
sap.firefly.NativeDispatcher.prototype.registerTimer = function(milliseconds,
		listener, customIdentifier) {
	return $Global.window.setTimeout(function() {
		listener.onTimerEvent(null, customIdentifier);
	}, milliseconds);
};
sap.firefly.NativeDispatcher.prototype.unregisterTimer = function(handle) {
	$Global.window.clearTimeout(handle);
};
sap.firefly.NativeJsonParser = function() {
	sap.firefly.DfDocumentParser.call(this);
	this.setup();
};
sap.firefly.NativeJsonParser.prototype = new sap.firefly.DfDocumentParser();
sap.firefly.NativeJsonParser.prototype.parseUnsafe = function(content) {
	this.clearMessages();
	if (content === null || content === undefined) {
		return null;
	}
	return new sap.firefly.NativeJsonProxyElement(JSON.parse(content));
};
sap.firefly.NativeJsonParser.prototype.parse = function(content) {
	var jsonRootElement;
	this.clearMessages();
	if (content === null) {
		return null;
	}
	var regExpBom = /^\uFEFF?|\u200B?/;
	if (regExpBom.test(content)) {
		content = content.replace(regExpBom, "");
	}
	try {
		jsonRootElement = JSON.parse(content);
	} catch (e) {
		this.addError(sap.firefly.JsonParserErrorCode.JSON_PARSER_ROOT_ERROR,
				e.message);
		return null;
	}
	if (jsonRootElement === undefined) {
		return null;
	}
	return new sap.firefly.NativeJsonProxyElement(jsonRootElement);
};
sap.firefly.NativeJsonParser.prototype.parseNativeObject = function(
		jsonRootElement) {
	var ocpRootElement;
	this.clearMessages();
	if (jsonRootElement === null || jsonRootElement === undefined) {
		return null;
	}
	try {
		ocpRootElement = new sap.firefly.NativeJsonProxyElement(jsonRootElement);
	} catch (e) {
		this.addError(sap.firefly.JsonParserErrorCode.JSON_PARSER_ROOT_ERROR,
				e.message);
		return null;
	}
	return ocpRootElement;
};
sap.firefly.NativeJsonParser.prototype.supportsNative = function() {
	return true;
};
sap.firefly.NativeJsonParserFactory = function() {
	sap.firefly.JsonParserFactory.call(this);
};
sap.firefly.NativeJsonParserFactory.prototype = new sap.firefly.JsonParserFactory();
sap.firefly.NativeJsonParserFactory.staticSetup = function() {
	sap.firefly.JsonParserFactory
			.setJsonParserFactory(new sap.firefly.NativeJsonParserFactory());
};
sap.firefly.NativeJsonParserFactory.prototype.newParserInstance = function() {
	return new sap.firefly.NativeJsonParser();
};
sap.firefly.NativeJsonProxyElement = function(jsonRootElement) {
	sap.firefly.PrElement.call(this);
	this.m_jsonRootElement = jsonRootElement;
};
sap.firefly.NativeJsonProxyElement.prototype = new sap.firefly.PrElement();
sap.firefly.NativeJsonProxyElement.prototype.releaseObject = function() {
	this.m_jsonRootElement = null;
	sap.firefly.PrElement.prototype.releaseObject.call(this);
};
sap.firefly.NativeJsonProxyElement.prototype.setElementByName = function(name,
		element) {
	if (element === null) {
		delete this.m_jsonRootElement[name];
	} else {
		this.m_jsonRootElement[name] = element;
	}
};
sap.firefly.NativeJsonProxyElement.prototype.getPermaCopy = function() {
	return new sap.firefly.NativeJsonProxyElement(this.m_jsonRootElement);
};
sap.firefly.NativeJsonProxyElement.prototype.asString = function() {
	return this;
};
sap.firefly.NativeJsonProxyElement.prototype.asNumber = sap.firefly.NativeJsonProxyElement.prototype.asString;
sap.firefly.NativeJsonProxyElement.prototype.asBoolean = sap.firefly.NativeJsonProxyElement.prototype.asString;
sap.firefly.NativeJsonProxyElement.prototype.asNull = sap.firefly.NativeJsonProxyElement.prototype.asString;
sap.firefly.NativeJsonProxyElement.prototype.asInteger = sap.firefly.NativeJsonProxyElement.prototype.asString;
sap.firefly.NativeJsonProxyElement.prototype.asLong = sap.firefly.NativeJsonProxyElement.prototype.asString;
sap.firefly.NativeJsonProxyElement.prototype.asDouble = sap.firefly.NativeJsonProxyElement.prototype.asString;
sap.firefly.NativeJsonProxyElement.prototype.asList = sap.firefly.NativeJsonProxyElement.prototype.asString;
sap.firefly.NativeJsonProxyElement.prototype.asStructure = sap.firefly.NativeJsonProxyElement.prototype.asString;
sap.firefly.NativeJsonProxyElement.prototype.setStringByName = function(name,
		value) {
	this.m_jsonRootElement[name] = value;
};
sap.firefly.NativeJsonProxyElement.prototype.setBooleanByName = sap.firefly.NativeJsonProxyElement.prototype.setStringByName;
sap.firefly.NativeJsonProxyElement.prototype.setIntegerByName = sap.firefly.NativeJsonProxyElement.prototype.setStringByName;
sap.firefly.NativeJsonProxyElement.prototype.setLongByName = sap.firefly.NativeJsonProxyElement.prototype.setStringByName;
sap.firefly.NativeJsonProxyElement.prototype.setDoubleByName = sap.firefly.NativeJsonProxyElement.prototype.setStringByName;
sap.firefly.NativeJsonProxyElement.prototype.setNullByName = function(name) {
	this.m_jsonRootElement[name] = sap.firefly.PrNull.create();
};
sap.firefly.NativeJsonProxyElement.prototype.setElementAt = function(position,
		element) {
	this.m_jsonRootElement[position] = element;
};
sap.firefly.NativeJsonProxyElement.prototype.getType = function() {
	return this.getTypeOf(this.m_jsonRootElement);
};
sap.firefly.NativeJsonProxyElement.prototype.hasElements = function() {
	if (this.m_jsonRootElement !== null) {
		for ( var prop in this.m_jsonRootElement) {
			if (this.m_jsonRootElement.hasOwnProperty(prop)) {
				return true;
			}
		}
	}
	return false;
};
sap.firefly.NativeJsonProxyElement.prototype.getElementTypeByName = function(
		name) {
	var element = this.m_jsonRootElement[name];
	if (element === undefined) {
		return null;
	}
	return this.getTypeOf(element);
};
sap.firefly.NativeJsonProxyElement.prototype.getElementTypeByIndex = function(
		index) {
	var element = this.m_jsonRootElement[index];
	if (element === undefined) {
		return null;
	}
	return this.getTypeOf(element);
};
sap.firefly.NativeJsonProxyElement.prototype.getTypeOf = function(element) {
	if (element === null) {
		return sap.firefly.PrElementType.THE_NULL;
	}
	switch (typeof element) {
	case "string":
		return sap.firefly.PrElementType.STRING;
	case "boolean":
		return sap.firefly.PrElementType.BOOLEAN;
	case "number":
		return sap.firefly.PrElementType.DOUBLE;
	case "object":
		if (element instanceof Array) {
			return sap.firefly.PrElementType.LIST;
		}
		return sap.firefly.PrElementType.STRUCTURE;
	default:
		return null;
	}
	return null;
};
sap.firefly.NativeJsonProxyElement.prototype.getStringValue = function() {
	return this.m_jsonRootElement;
};
sap.firefly.NativeJsonProxyElement.prototype.getIntegerValue = sap.firefly.NativeJsonProxyElement.prototype.getStringValue;
sap.firefly.NativeJsonProxyElement.prototype.getLongValue = sap.firefly.NativeJsonProxyElement.prototype.getStringValue;
sap.firefly.NativeJsonProxyElement.prototype.getDoubleValue = sap.firefly.NativeJsonProxyElement.prototype.getStringValue;
sap.firefly.NativeJsonProxyElement.prototype.getBooleanValue = sap.firefly.NativeJsonProxyElement.prototype.getStringValue;
sap.firefly.NativeJsonProxyElement.prototype.hasValueByName = function(name) {
	return this.m_jsonRootElement.hasOwnProperty(name);
};
sap.firefly.NativeJsonProxyElement.prototype.getTypeOfElement = function(name) {
	var element = this.m_jsonRootElement[name];
	if (element === undefined) {
		throw new Error("Illegal State: Json Element not available: " + name);
	}
	return this.getTypeOf(element);
};
sap.firefly.NativeJsonProxyElement.prototype.getStringByName = function(name) {
	var element = this.m_jsonRootElement[name];
	if (element === undefined) {
		return null;
	}
	return element;
};
sap.firefly.NativeJsonProxyElement.prototype.getIntegerByName = sap.firefly.NativeJsonProxyElement.prototype.getStringByName;
sap.firefly.NativeJsonProxyElement.prototype.getLongByName = sap.firefly.NativeJsonProxyElement.prototype.getStringByName;
sap.firefly.NativeJsonProxyElement.prototype.getBooleanByName = sap.firefly.NativeJsonProxyElement.prototype.getStringByName;
sap.firefly.NativeJsonProxyElement.prototype.getDoubleByName = sap.firefly.NativeJsonProxyElement.prototype.getStringByName;
sap.firefly.NativeJsonProxyElement.prototype.getStructureElementNames = function() {
	var names = new sap.firefly.XListOfString();
	var attributeName;
	for (attributeName in this.m_jsonRootElement) {
		if (this.m_jsonRootElement.hasOwnProperty(attributeName)) {
			names.add(attributeName);
		}
	}
	return names;
};
sap.firefly.NativeJsonProxyElement.prototype.getElementByName = function(name) {
	var element = this.m_jsonRootElement[name];
	if (element === undefined) {
		return null;
	}
	return new sap.firefly.NativeJsonProxyElement(element);
};
sap.firefly.NativeJsonProxyElement.prototype.getStructureByName = sap.firefly.NativeJsonProxyElement.prototype.getElementByName;
sap.firefly.NativeJsonProxyElement.prototype.getListByName = sap.firefly.NativeJsonProxyElement.prototype.getElementByName;
sap.firefly.NativeJsonProxyElement.prototype.getElementByIndex = function(index) {
	var element = this.m_jsonRootElement[index];
	if (element !== null && element !== undefined) {
		return new sap.firefly.NativeJsonProxyElement(element);
	}
	return null;
};
sap.firefly.NativeJsonProxyElement.prototype.getListByIndex = sap.firefly.NativeJsonProxyElement.prototype.getElementByIndex;
sap.firefly.NativeJsonProxyElement.prototype.getStructureByIndex = sap.firefly.NativeJsonProxyElement.prototype.getElementByIndex;
sap.firefly.NativeJsonProxyElement.prototype.getStringByIndex = function(index) {
	return this.m_jsonRootElement[index];
};
sap.firefly.NativeJsonProxyElement.prototype.getIntegerByIndex = sap.firefly.NativeJsonProxyElement.prototype.getStringByIndex;
sap.firefly.NativeJsonProxyElement.prototype.getBooleanByIndex = sap.firefly.NativeJsonProxyElement.prototype.getStringByIndex;
sap.firefly.NativeJsonProxyElement.prototype.getLongByIndex = sap.firefly.NativeJsonProxyElement.prototype.getStringByIndex;
sap.firefly.NativeJsonProxyElement.prototype.getDoubleByIndex = sap.firefly.NativeJsonProxyElement.prototype.getStringByIndex;
sap.firefly.NativeJsonProxyElement.prototype.getNullByIndex = function(index) {
	return sap.firefly.ConstantValue.THE_NULL;
};
sap.firefly.NativeJsonProxyElement.prototype.getStringByIndexWithDefault = function(
		index, defaultValue) {
	if (this.m_jsonRootElement.hasOwnProperty(index)) {
		return this.m_jsonRootElement[index];
	}
	return defaultValue;
};
sap.firefly.NativeJsonProxyElement.prototype.getIntegerByIndexWithDefault = sap.firefly.NativeJsonProxyElement.prototype.getStringByIndexWithDefault;
sap.firefly.NativeJsonProxyElement.prototype.getLongByIndexWithDefault = sap.firefly.NativeJsonProxyElement.prototype.getStringByIndexWithDefault;
sap.firefly.NativeJsonProxyElement.prototype.getDoubleByIndexWithDefault = sap.firefly.NativeJsonProxyElement.prototype.getStringByIndexWithDefault;
sap.firefly.NativeJsonProxyElement.prototype.getBooleanByIndexWithDefault = sap.firefly.NativeJsonProxyElement.prototype.getStringByIndexWithDefault;
sap.firefly.NativeJsonProxyElement.prototype.size = function() {
	return this.m_jsonRootElement.length;
};
sap.firefly.NativeJsonProxyElement.prototype.isEmpty = function() {
	return this.m_jsonRootElement.length === 0;
};
sap.firefly.NativeJsonProxyElement.prototype.getStringByNameWithDefault = function(
		name, defaultValue) {
	if (this.hasValueByName(name)) {
		return this.getBooleanByName(name);
	}
	return defaultValue;
};
sap.firefly.NativeJsonProxyElement.prototype.getBooleanByNameWithDefault = sap.firefly.NativeJsonProxyElement.prototype.getStringByNameWithDefault;
sap.firefly.NativeJsonProxyElement.prototype.getIntegerByNameWithDefault = sap.firefly.NativeJsonProxyElement.prototype.getStringByNameWithDefault;
sap.firefly.NativeJsonProxyElement.prototype.getLongByNameWithDefault = sap.firefly.NativeJsonProxyElement.prototype.getStringByNameWithDefault;
sap.firefly.NativeJsonProxyElement.prototype.getDoubleByNameWithDefault = sap.firefly.NativeJsonProxyElement.prototype.getStringByNameWithDefault;
sap.firefly.NativeJsonProxyElement.prototype.getObjectByNameWithDefault = sap.firefly.NativeJsonProxyElement.prototype.getStringByNameWithDefault;
sap.firefly.NativeJsonProxyElement.prototype.setStringByNameNotNull = function(
		name, value) {
	if (value !== null) {
		this.setStringByName(name, value);
	}
};
sap.firefly.NativeJsonProxyElement.prototype.setNewListByName = function(name) {
	var list = sap.firefly.PrList.create();
	this.setElementByName(name, list);
	return list;
};
sap.firefly.NativeJsonProxyElement.prototype.setNewStructureByName = function(
		name) {
	var list = sap.firefly.PrStructure.create();
	this.setElementByName(name, list);
	return list;
};
sap.firefly.NativeJsonProxyElement.prototype.getStructureElementNamesSorted = function() {
	var structureElementNames = this.getStructureElementNames();
	if (structureElementNames === null || structureElementNames.isEmpty()) {
		return structureElementNames;
	}
	var sorted = new sap.firefly.XListOfString(structureElementNames);
	sorted.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
	return sorted;
};
sap.firefly.NativeJsonProxyElement.prototype.hasStringByName = function(name) {
	if (!this.hasValueByName(name)) {
		return false;
	}
	return this.getElementTypeByName(name) === sap.firefly.PrElementType.STRING;
};
sap.firefly.NativeHttpClient = function(session) {
	sap.firefly.DfHttpClient.call(this);
	this.m_xmlHttpRequest = null;
	this.m_isOnAjaxEventExecuted = false;
	sap.firefly.DfHttpClient.prototype.setupHttpClient.call(this, session);
	this.m_response = sap.firefly.HttpResponse
			.createResponse(this.getRequest());
};
sap.firefly.NativeHttpClient.prototype = new sap.firefly.DfHttpClient();
sap.firefly.NativeHttpClient.parseResponseHeaders = function(headerStr,
		headerFields) {
	if (headerStr !== null) {
		var headerPairs = headerStr.split("\u000d\u000a");
		var headerLength = headerPairs.length;
		var oHttpConstants = sap.firefly.HttpConstants;
		for (var i = 0; i < headerLength; i++) {
			var headerPair = headerPairs[i];
			var index = headerPair.indexOf("\u003a\u0020");
			if (index > 0) {
				var key = headerPair.substring(0, index).replace(
						/(^\u000d\u000a?)|(^\u000a?)/, "");
				var value = headerPair.substring(index + 2);
				headerFields.put(oHttpConstants.lookupCamelCase(key), value);
			}
		}
	}
};
sap.firefly.NativeHttpClient.prototype.releaseObject = function() {
	this.m_xmlHttpRequest = null;
	this.m_response = sap.firefly.XObject.releaseIfNotNull(this.m_response);
	this.m_isOnAjaxEventExecuted = null;
	sap.firefly.DfHttpClient.prototype.releaseObject.call(this);
};
sap.firefly.NativeHttpClient.prototype.onAjaxEvent = function() {
	var xmlHttpRequest = this.m_xmlHttpRequest;
	if (xmlHttpRequest !== null && xmlHttpRequest.readyState === 4) {
		var oFirefly = sap.firefly;
		this.addProfileStep("Receive http response");
		this.m_isOnAjaxEventExecuted = true;
		if ((typeof module !== "undefined") && ($Global.module !== module)
				&& (module.exports)) {
			var cookies = sap.firefly.HttpCookies.create();
			var cookiesResponseHeaders = xmlHttpRequest
					.getResponseHeader(oFF.HttpConstants.HD_SET_COOKIE);
			for ( var h in cookiesResponseHeaders) {
				if (cookiesResponseHeaders.hasOwnProperty(h)) {
					cookies
							.addByHttpServerResponseValue(cookiesResponseHeaders[h]);
				}
			}
			this.m_response.setCookies(cookies);
			this.m_response.setCookiesMasterStore(this.getRequest()
					.getCookiesMasterStore());
			this.m_response.applyCookiesToMasterStorage();
		}
		var response = this.m_response;
		response.setStatusCode(xmlHttpRequest.status);
		response.setStatusCodeDetails(xmlHttpRequest.statusText);
		var allResponseHeaders = xmlHttpRequest.getAllResponseHeaders();
		var headerFields = response.getHeaderFieldsBase();
		oFirefly.NativeHttpClient.parseResponseHeaders(allResponseHeaders,
				headerFields);
		var contentTypeValue = headerFields
				.getByKey(oFirefly.HttpConstants.HD_CONTENT_TYPE);
		if (contentTypeValue !== null) {
			contentTypeValue = contentTypeValue.toLowerCase();
			var delimiter = contentTypeValue.indexOf(";");
			if (delimiter !== -1) {
				contentTypeValue = contentTypeValue.substring(0, delimiter);
			}
		}
		var contentType = oFirefly.HttpContentType.lookup(contentTypeValue);
		if (contentType === null) {
			response.setContentTypeValue(contentTypeValue);
		} else {
			response.setHttpContentType(contentType);
			if (contentType.isText()) {
				var content = xmlHttpRequest.responseText;
				response.setStringContent(content);
				if (contentType === oFirefly.HttpContentType.APPLICATION_JSON) {
					if ((content !== null) && (content.length > 0)) {
						try {
							this.addProfileStep("Parse json");
							var jsonRootElement = JSON.parse(content);
							var ocpRootElement = new oFirefly.NativeJsonProxyElement(
									jsonRootElement);
							response.setJsonObject(ocpRootElement);
						} catch (e) {
							this
									.addError(
											oFirefly.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE,
											e.message);
						}
					}
				}
			}
		}
		this.setData(response);
		this.endSync();
		this.m_xmlHttpRequest = null;
	}
};
sap.firefly.NativeHttpClient.prototype.processSynchronization = function(
		syncType) {
	var oFirefly = sap.firefly;
	var oHttpConstants = oFirefly.HttpConstants;
	var oHttpRequestMethod = oFirefly.HttpRequestMethod;
	this.m_xmlHttpRequest = null;
	if ($Global.XMLHttpRequest) {
		this.m_xmlHttpRequest = new $Global.XMLHttpRequest();
	} else {
		if ((typeof module !== "undefined") && ($Global.module !== module)
				&& (module.exports)) {
			this.getRequest().retrieveCookiesFromMasterStorage();
			this.m_xmlHttpRequest = new sap.firefly.NodeJsXMLHttpRequest();
			this.m_xmlHttpRequest.setCookies(this.getRequest().getCookies());
		}
	}
	if (this.m_xmlHttpRequest !== null) {
		var xmlHttpRequest = this.m_xmlHttpRequest;
		var request = this.getRequest();
		var isAsync = (syncType === oFirefly.SyncType.NON_BLOCKING);
		var url = request.getUriStringWithoutAuthentication();
		var oRequestMethod = request.getMethod();
		xmlHttpRequest.open(oRequestMethod.getName(), url, isAsync);
		if ((oRequestMethod === oHttpRequestMethod.HTTP_POST)
				|| (oRequestMethod === oHttpRequestMethod.HTTP_PUT)) {
			var requestContentType = request.getHttpContentType().getName()
					+ ";charset=UTF-8";
			xmlHttpRequest.setRequestHeader(oHttpConstants.HD_CONTENT_TYPE,
					requestContentType);
		}
		xmlHttpRequest.setRequestHeader(oHttpConstants.HD_ACCEPT, request
				.getAcceptContentType().getName());
		if (request.getAuthenticationType() === oFirefly.AuthenticationType.BASIC) {
			var valueUnencoded = request.getUser() + ":"
					+ request.getPassword();
			var valueEncoded = oHttpConstants.VA_AUTHORIZATION_BASIC + " "
					+ oFirefly.Base64.encode(valueUnencoded);
			xmlHttpRequest.setRequestHeader(oHttpConstants.HD_AUTHORIZATION,
					valueEncoded);
		} else {
			if (request.getAuthenticationType() === oFirefly.AuthenticationType.BEARER) {
				xmlHttpRequest.setRequestHeader(
						oHttpConstants.HD_AUTHORIZATION,
						oHttpConstants.VA_AUTHORIZATION_BEARER
								+ " "
								+ request.getAuthenticationToken()
										.getAccessToken());
			}
		}
		var lang = request.getLanguage();
		if (lang !== null) {
			xmlHttpRequest.setRequestHeader(oHttpConstants.HD_ACCEPT_LANGUAGE,
					lang);
		}
		var headerFields = request.getHeaderFields();
		var headerKeys = headerFields.getKeysAsIteratorOfString();
		while (headerKeys.hasNext()) {
			var currentKey = headerKeys.next();
			xmlHttpRequest.setRequestHeader(currentKey, headerFields
					.getByKey(currentKey));
		}
		xmlHttpRequest.onreadystatechange = this.onAjaxEvent.bind(this);
		if (this._sendInternal(request, isAsync) === false) {
			return false;
		}
		if (isAsync === false) {
			if (this.m_isOnAjaxEventExecuted === false) {
				this.onAjaxEvent();
				this.m_xmlHttpRequest = null;
			}
		}
		return true;
	}
	this.addError(oFirefly.HttpErrorCode.HTTP_MISSING_NATIVE_DRIVER,
			"XMLHttpRequest not supported");
	return false;
};
sap.firefly.NativeHttpClient.prototype._sendInternal = function(request,
		isAsync) {
	var oHttpRequestMethod = sap.firefly.HttpRequestMethod;
	try {
		this.m_isOnAjaxEventExecuted = false;
		this.addProfileStep("### SERVER ###");
		if ((request.getMethod() === oHttpRequestMethod.HTTP_POST)
				|| (request.getMethod() === oHttpRequestMethod.HTTP_PUT)) {
			this.m_xmlHttpRequest.send(request.getStringContent());
		} else {
			this.m_xmlHttpRequest.send(null);
		}
		return true;
	} catch (e) {
		this.addError(sap.firefly.HttpErrorCode.HTTP_IO_EXCEPTION, e.message);
		return false;
	}
};
sap.firefly.NativeHttpClientFactory = function() {
	sap.firefly.HttpClientFactory.call(this);
};
sap.firefly.NativeHttpClientFactory.prototype = new sap.firefly.HttpClientFactory();
sap.firefly.NativeHttpClientFactory.staticSetup = function() {
	var factory = new sap.firefly.NativeHttpClientFactory();
	sap.firefly.HttpClientFactory.setHttpClientFactoryForProtocol(
			sap.firefly.ProtocolType.HTTPS, factory);
	sap.firefly.HttpClientFactory.setHttpClientFactoryForProtocol(
			sap.firefly.ProtocolType.HTTP, factory);
};
sap.firefly.NativeHttpClientFactory.prototype.newHttpClientInstance = function(
		session) {
	return new sap.firefly.NativeHttpClient(session);
};
sap.firefly.RpcFunctionInaDB = function() {
	sap.firefly.DfRpcFunction.call(this);
	this.m_name = null;
};
sap.firefly.RpcFunctionInaDB.prototype = new sap.firefly.DfRpcFunction();
sap.firefly.RpcFunctionInaDB.m_clazz = null;
sap.firefly.RpcFunctionInaDB.staticSetup = function() {
	if ((typeof $ !== "undefined") && ($.db !== undefined)
			&& ($.db.ina !== undefined)) {
		var registrationService;
		sap.firefly.RpcFunctionInaDB.m_clazz = new sap.firefly.XClass(
				sap.firefly.RpcFunctionInaDB);
		registrationService = sap.firefly.RegistrationService.getInstance();
		registrationService.addRpcFunction("INA_DB",
				sap.firefly.RpcFunctionInaDB.m_clazz);
	}
};
sap.firefly.RpcFunctionInaDB.prototype.setupRpcFunction = function(session,
		connectionInfo, name) {
	this.m_name = name;
	this.setupFunction(session, connectionInfo, null);
};
sap.firefly.RpcFunctionInaDB.prototype.releaseObject = function() {
	this.m_name = null;
	sap.firefly.DfRpcFunction.prototype.releaseObject.call(this);
};
sap.firefly.RpcFunctionInaDB.prototype.getName = function() {
	return this.m_name;
};
sap.firefly.RpcFunctionInaDB.prototype.processSynchronization = function(
		syncType) {
	var path = this.getName();
	var request;
	var response;
	var requestStructure;
	var serializer;
	var requestJsonString;
	var responseJsonString;
	var jsonParser;
	var jsonElement;
	var fnDebug = $.trace.debug;
	var oFirefly = sap.firefly;
	if (oFirefly.XStringUtils.isNullOrEmpty(path)) {
		this.addError(1001, " path null");
		return false;
	}
	request = this.getRequest();
	if (request === null) {
		this.addError(1002, "request null");
		return false;
	}
	response = this.getResponse();
	if (response === null) {
		this.addError(1003, "response null");
		return false;
	}
	requestStructure = request.getRequestStructure();
	if (requestStructure !== null) {
		serializer = oFirefly.JsonSerializerToString.create();
		requestJsonString = serializer.serializePrettyPrint(requestStructure,
				false, false, 0);
	}
	responseJsonString = null;
	if (path === "/sap/bc/ina/service/v2/GetServerInfo") {
		fnDebug("Ina-Request:");
		fnDebug(requestJsonString);
		responseJsonString = $.db.ina.getServiceInfo(requestJsonString);
		fnDebug("Ina-Response:");
		fnDebug(responseJsonString);
	} else {
		if (path === "/sap/bc/ina/service/v2/GetResponse") {
			fnDebug("Ina-Request:");
			fnDebug(requestJsonString);
			responseJsonString = $.db.ina.getResponse(requestJsonString);
			fnDebug("Ina-Response:");
			fnDebug(responseJsonString);
		} else {
			if (path !== "/sap/hana/xs/formLogin/logout.xscfunc") {
				this.addError(1004, "illegal path");
				return false;
			}
			responseJsonString = null;
		}
	}
	if (oFirefly.XStringUtils.isNotNullAndNotEmpty(responseJsonString)) {
		jsonParser = oFirefly.JsonParserFactory.newInstance();
		jsonElement = jsonParser.parse(responseJsonString);
		if (jsonParser.hasErrors()) {
			this.addMessages(jsonParser.getErrors());
			return false;
		} else {
			if (jsonElement !== null) {
				if (jsonElement.getType() !== oFirefly.PrElementType.STRUCTURE) {
					this.addError(1005, "wrong json response type");
					return false;
				} else {
					response.setRootElement(jsonElement);
				}
			}
		}
	}
	this.setData(response);
	return false;
};
sap.firefly.NetworkEnv = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.NetworkEnv.prototype = new sap.firefly.XObject();
sap.firefly.NetworkEnv.s_location = null;
sap.firefly.NetworkEnv.staticSetup = function() {
	sap.firefly.NetworkEnv.getLocation();
};
sap.firefly.NetworkEnv.getLocation = function() {
	var oNetworkEnv = sap.firefly.NetworkEnv;
	var oWindow = $Global.window;
	if (oNetworkEnv.s_location === null) {
		oNetworkEnv.s_location = sap.firefly.XUri.create();
		if (oWindow) {
			if (oWindow.location) {
				var location = oWindow.location;
				var protocol = location.protocol;
				var index = protocol.indexOf(":");
				if (index !== -1) {
					protocol = protocol.substring(0, index);
				}
				oNetworkEnv.s_location.setScheme(protocol);
				oNetworkEnv.s_location.setHost(location.hostname);
				oNetworkEnv.s_location.setPort(parseInt(location.port));
				oNetworkEnv.s_location.setPath(location.pathname);
				oNetworkEnv.s_location.setFragment(location.hash);
				oNetworkEnv.s_location.setQuery(location.search);
			}
		}
	}
	return oNetworkEnv.s_location;
};
sap.firefly.NativeJsonExtractor = function() {
	sap.firefly.DfDocumentParser.call(this);
};
sap.firefly.NativeJsonExtractor.prototype = new sap.firefly.DfDocumentParser();
sap.firefly.NativeJsonExtractor.staticSetup = function() {
	sap.firefly.XJson.setJsonExtractor(new sap.firefly.NativeJsonExtractor());
};
sap.firefly.NativeJsonExtractor.prototype.extractJsonContent = function(content) {
	var oFirefly = sap.firefly;
	if (content instanceof oFirefly.XJson) {
		return content.getElement();
	}
	return oFirefly.PrElement
			.deepCopyElement(new oFirefly.NativeJsonProxyElement(content));
};
sap.firefly.IoNativeModule = function() {
	sap.firefly.DfModule.call(this);
};
sap.firefly.IoNativeModule.prototype = new sap.firefly.DfModule();
sap.firefly.IoNativeModule.s_module = null;
sap.firefly.IoNativeModule.getInstance = function() {
	return sap.firefly.IoNativeModule
			.initVersion(sap.firefly.XVersion.API_DEFAULT);
};
sap.firefly.IoNativeModule.initVersion = function(version) {
	var oFirefly = sap.firefly;
	var oNativeModule = oFirefly.IoNativeModule;
	if (oNativeModule.s_module === null) {
		if (oFirefly.IoModule.initVersion(version) === null) {
			throw new Error("Initialization Exception");
		}
		oNativeModule.s_module = new oFirefly.IoNativeModule();
		oFirefly.NativeXFileSystem.staticSetup();
		oFirefly.NetworkEnv.staticSetup();
		oFirefly.NativeDispatcher.staticSetup();
		oFirefly.NativeJsonParserFactory.staticSetup();
		oFirefly.NativeHttpClientFactory.staticSetup();
		oFirefly.RpcFunctionInaDB.staticSetup();
		oFirefly.NativeJsonExtractor.staticSetup();
	}
	return oNativeModule.s_module;
};
sap.firefly.IoNativeModule.getInstance();