Object.keys = Object.keys
		|| (function() {
			var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !{
				toString : null
			}.propertyIsEnumerable("toString"), DontEnums = [ "toString",
					"toLocaleString", "valueOf", "hasOwnProperty",
					"isPrototypeOf", "propertyIsEnumerable", "constructor" ], DontEnumsLength = DontEnums.length;
			return function(o) {
				if (typeof o !== "object" && typeof o !== "function"
						|| o === null) {
					throw new TypeError("Object.keys called on a non-object");
				}
				var result = [];
				for ( var name in o) {
					if (hasOwnProperty.call(o, name)) {
						result.push(name);
					}
				}
				if (hasDontEnumBug) {
					for (var i = 0; i < DontEnumsLength; i++) {
						if (hasOwnProperty.call(o, DontEnums[i])) {
							result.push(DontEnums[i]);
						}
					}
				}
				return result;
			};
		})();
if (typeof String.prototype.trim !== "function") {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, "");
	};
}
sap.firefly.XArrayWrapper = function(copy) {
	this.m_isReleased = false;
	this.m_list = [];
	if (copy) {
		this.m_list.push.apply(this.m_list, copy);
	}
};
sap.firefly.XArrayWrapper.prototype = new sap.firefly.XObject();
sap.firefly.XArrayWrapper.prototype.releaseObject = function() {
	this.m_list = null;
	this.m_isReleased = true;
};
sap.firefly.XArrayWrapper.prototype.size = function() {
	return this.m_list.length;
};
sap.firefly.XArrayWrapper.prototype.isEmpty = function() {
	return this.m_list.length === 0;
};
sap.firefly.XArrayWrapper.prototype.hasElements = function() {
	return this.m_list.length !== 0;
};
sap.firefly.XArrayWrapper.prototype.toString = function() {
	var buffer = new sap.firefly.XStringBuffer();
	var size = this.m_list.length;
	var i;
	buffer.append("[");
	for (i = 0; i < size; i++) {
		if (i > 0) {
			buffer.append(", ");
		}
		buffer.append(this.m_list[i].toString());
	}
	buffer.append("]");
	return buffer.toString();
};
sap.firefly.XArrayWrapper.prototype.concat = function() {
	return this.m_list.concat.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.copyWithin = function() {
	return this.m_list.copyWithin.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.entries = function() {
	return this.m_list.entries.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.every = function() {
	return this.m_list.every.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.fill = function() {
	return this.m_list.fill.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.filter = function() {
	return this.m_list.filter.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.find = function() {
	return this.m_list.find.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.findIndex = function() {
	return this.m_list.findIndex.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.forEach = function() {
	return this.m_list.forEach.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.includes = function() {
	return this.m_list.includes.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.indexOf = function() {
	return this.m_list.indexOf.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.map = function() {
	return this.m_list.map.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.pop = function() {
	return this.m_list.pop.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.push = function() {
	return this.m_list.push.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.reduce = function() {
	return this.m_list.reduce.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.reduceRight = function() {
	return this.m_list.reduceRight.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.reverse = function() {
	return this.m_list.reverse.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.shift = function() {
	return this.m_list.shift.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.slice = function() {
	return this.m_list.slice.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.some = function() {
	return this.m_list.some.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.sort = function() {
	return this.m_list.sort.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.splice = function() {
	return this.m_list.splice.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.toLocaleString = function() {
	return this.m_list.toLocaleString.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.unshift = function() {
	return this.m_list.unshift.apply(this.m_list, arguments);
};
sap.firefly.XArrayWrapper.prototype.values = function() {
	return this.m_list.values.apply(this.m_list, arguments);
};
sap.firefly.Base64 = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.Base64.prototype = new sap.firefly.XObject();
sap.firefly.Base64.s_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
sap.firefly.Base64.encode = function(input) {
	if (typeof btoa !== "undefined") {
		return btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g,
				function(match, p1) {
					return String.fromCharCode("0x" + p1);
				}));
	}
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;
	var keyStr = sap.firefly.Base64.s_keyStr;
	do {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else {
			if (isNaN(chr3)) {
				enc4 = 64;
			}
		}
		output += keyStr.charAt(enc1) + keyStr.charAt(enc2)
				+ keyStr.charAt(enc3) + keyStr.charAt(enc4);
		chr1 = chr2 = chr3 = "";
		enc1 = enc2 = enc3 = enc4 = "";
	} while (i < input.length);
	return output;
};
sap.firefly.XStringTokenizer = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XStringTokenizer.prototype = new sap.firefly.XObject();
sap.firefly.XStringTokenizer.splitString = function(string, splitString) {
	if (string === null) {
		return null;
	}
	if (splitString === null) {
		return null;
	}
	var splittedStrings = string.split(splitString);
	if (splittedStrings === null) {
		return null;
	}
	return new sap.firefly.XListOfString(splittedStrings);
};
sap.firefly.XErrorHelper = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XErrorHelper.prototype = new sap.firefly.XObject();
sap.firefly.XErrorHelper.convertToString = function(error) {
	var sb = new sap.firefly.XStringBuffer();
	if (error.hasCode()) {
		sb.append(error.getCode().toString()).appendNewLine();
	}
	var errorText = error.getText();
	if (errorText !== null) {
		sb.append(errorText).appendNewLine();
	}
	if (error.hasErrorCause()) {
		sb.append(error.getErrorCause().toString()).appendNewLine();
	}
	if (error.hasStackTrace()) {
		sb.append(error.getStackTrace().toString()).appendNewLine();
	}
	if (error.hasExtendedInfo()) {
		sb.append("Error with extended info").appendNewLine();
	}
	return sb.toString();
};
sap.firefly.XErrorHelper.convertExceptionToString = function(throwable) {
	var sb = new sap.firefly.XStringBuffer();
	if (throwable !== null) {
		if (typeof throwable.toString === "function") {
			sb.append(throwable.toString()).appendNewLine();
		}
		var json = JSON.stringify(throwable);
		if ("{}" !== json) {
			sb.append(json);
			sb.appendNewLine();
		}
	}
	return sb.toString();
};
sap.firefly.XStackTrace = function() {
	sap.firefly.XObject.call(this);
	this.m_traces = new sap.firefly.XListOfString();
};
sap.firefly.XStackTrace.prototype = new sap.firefly.XObject();
sap.firefly.XStackTrace.create = function(removeLineCount) {
	var newError = new Error();
	var stackArray = newError.stack.split("\n");
	var len = stackArray.length;
	if (len > 1) {
		var newObj = new sap.firefly.XStackTrace();
		if (((len - 1) - removeLineCount) > 0) {
			for (var i = (1 + removeLineCount); i < len; i++) {
				newObj.m_traces.add(stackArray[i].trim());
			}
		}
		return newObj;
	}
};
sap.firefly.XStackTrace.supportsStackTrace = function() {
	return false;
};
sap.firefly.XStackTrace.getStackTrace = function(excpt, numberOfLines) {
	return excpt.stack;
};
sap.firefly.XStackTrace.prototype.releaseObject = function() {
	this.m_traces = sap.firefly.XObject.releaseIfNotNull(this.m_traces);
	sap.firefly.XStackTrace.$superclass.releaseObject.call(this);
};
sap.firefly.XStackTrace.prototype.getStackTraceLines = function() {
	return this.m_traces.getValuesAsReadOnlyListOfString();
};
sap.firefly.XStackTrace.prototype.toString = function() {
	return "";
};
sap.firefly.XLogger = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XLogger.prototype = new sap.firefly.XObject();
sap.firefly.XLogger.s_output = "";
sap.firefly.XLogger.s_consoleDivName = null;
sap.firefly.XLogger.s_consoleDiv = null;
sap.firefly.XLogger.s_logger = null;
sap.firefly.XLogger.staticSetup = function() {
	sap.firefly.XLogger.s_logger = new sap.firefly.XLogger();
};
sap.firefly.XLogger.getLogger = function() {
	return sap.firefly.XLogger.s_logger;
};
sap.firefly.XLogger.setLogger = function(logger) {
	sap.firefly.XLogger.s_logger = logger;
};
sap.firefly.XLogger.println = function(value) {
	sap.firefly.XLogger.s_logger.writelog(value);
};
sap.firefly.XLogger.printlnEmpty = function() {
	sap.firefly.XLogger.s_logger.writelog(null);
};
sap.firefly.XLogger.print = function(value) {
	if (value !== null) {
		if ((typeof jstestdriver !== "undefined") && (jstestdriver.console)) {
			jstestdriver.console.log(value);
		} else {
			if (($ !== undefined) && ($.db) && ($.db.ina) && ($.trace)) {
				$.trace.debug("Firefly: " + value);
			} else {
				if ((module !== undefined) && (this.module !== module)
						&& (module.exports)) {
					console.log(value);
				} else {
					if ($Global.console) {
						$Global.console.log(value);
					} else {
						sap.firefly.XLogger.s_output += value;
					}
				}
			}
		}
		sap.firefly.XLogger.writeToDivConsole(value, false);
	}
};
sap.firefly.XLogger.clear = function() {
	sap.firefly.XLogger.s_output = "";
	sap.firefly.XLogger.clearDivConsole();
};
sap.firefly.XLogger.getOutput = function() {
	return sap.firefly.XLogger.s_output;
};
sap.firefly.XLogger.alert = function(value) {
	if (value !== null) {
		if ((jstestdriver !== undefined) && (jstestdriver.console)) {
			jstestdriver.console.log(value);
		} else {
			if (($ !== undefined) && ($.db) && ($.db.ina) && ($.trace)) {
				$.trace.debug("Firefly: " + value);
			} else {
				if ((module !== undefined) && (this.module !== module)
						&& (module.exports)) {
					console.log(value);
				} else {
					if ($Global.alert) {
						$Global.alert(value);
					} else {
						sap.firefly.XLogger.s_output += value + "\n";
					}
				}
			}
		}
	}
};
sap.firefly.XLogger.writeToDivConsole = function(value, addLnFlag) {
	var consoleDiv = sap.firefly.XLogger.getDivConsole();
	if (consoleDiv !== null) {
		if (value !== null && value !== undefined) {
			var doc = document;
			var docFragment = doc.createDocumentFragment();
			var lines = value.split(/\r\n|\r|\n/g);
			var len = lines.length;
			for (var i = 0; i < len; i++) {
				if (i > 0) {
					docFragment.appendChild(doc.createElement("br"));
				}
				docFragment.appendChild(doc.createTextNode(lines[i]));
			}
			consoleDiv.appendChild(docFragment);
		}
		if (addLnFlag) {
			consoleDiv.appendChild(document.createElement("br"));
		}
		setTimeout(function() {
			consoleDiv.scrollTop = consoleDiv.scrollHeight;
		}, 0);
	}
};
sap.firefly.XLogger.getDivConsole = function() {
	var xLogger = sap.firefly.XLogger;
	var consoleDiv = xLogger.s_consoleDiv;
	if (consoleDiv === null && xLogger.s_consoleDivName !== null) {
		consoleDiv = document.getElementById(xLogger.s_consoleDivName);
		if (consoleDiv !== null) {
			var consoleDivStyle = consoleDiv.style;
			consoleDivStyle.backgroundColor = "black";
			consoleDivStyle.color = "#FFCC00";
			consoleDivStyle.fontFamily = "Courier";
			consoleDivStyle.overflow = "auto";
			consoleDivStyle.width = "640px";
			consoleDivStyle.height = "480px";
			var consoleDivLeft = 0;
			var consoleDivTop = 0;
			var startX;
			var startY;
			consoleDiv
					.addEventListener(
							"touchstart",
							function(e) {
								var touchObject = e.changedTouches[0];
								if (consoleDivStyle.left === "") {
									consoleDivLeft = 0;
								} else {
									if (sap.firefly.XString.endsWith(
											consoleDivStyle.left, "px")) {
										consoleDivLeft = parseInt(
												consoleDivStyle.left
														.substring(
																0,
																consoleDivStyle.left.length - 2),
												10);
									} else {
										if (isNaN(consoleDivStyle.left) === false) {
											consoleDivLeft = parseInt(
													consoleDivStyle.left, 10);
										} else {
											consoleDivLeft = 0;
										}
									}
								}
								if (consoleDivStyle.top === "") {
									consoleDivTop = 0;
								} else {
									if (sap.firefly.XString.endsWith(
											consoleDivStyle.top, "px")) {
										consoleDivTop = parseInt(
												consoleDivStyle.top
														.substring(
																0,
																consoleDivStyle.top.length - 2),
												10);
									} else {
										if (isNaN(consoleDivStyle.top) === false) {
											consoleDivTop = parseInt(
													consoleDivStyle.top, 10);
										} else {
											consoleDivTop = 0;
										}
									}
								}
								startX = parseInt(touchObject.clientX, 10);
								startY = parseInt(touchObject.clientY, 10);
								e.preventDefault();
							}, false);
			consoleDiv.addEventListener("touchmove", function(e) {
				var touchObject = e.changedTouches[0];
				var width = window.innerWidth;
				var height = window.innerHeight;
				var maxX = width - consoleDiv.clientWidth;
				var maxY = height - consoleDiv.clientHeight;
				var distanceX = parseInt(touchObject.clientX, 10) - startX;
				var distanceY = parseInt(touchObject.clientY, 10) - startY;
				var left = ((consoleDivLeft + distanceX > maxX) ? maxX
						: (consoleDivLeft + distanceX < 0) ? 0 : consoleDivLeft
								+ distanceX)
						+ "px";
				var top = ((consoleDivTop + distanceY > maxY) ? maxY
						: (consoleDivTop + distanceY < 0) ? 0 : consoleDivTop
								+ distanceY)
						+ "px";
				consoleDivStyle.left = left;
				consoleDivStyle.top = top;
				e.preventDefault();
			}, false);
			consoleDiv.innerHTML = "";
			xLogger.s_consoleDiv = consoleDiv;
		}
	}
	return consoleDiv;
};
sap.firefly.XLogger.clearDivConsole = function() {
	if (sap.firefly.XLogger.s_consoleDiv !== null) {
		sap.firefly.XLogger.s_consoleDiv.innerHTML = "";
	}
};
sap.firefly.XLogger.prototype.writelog = function(logline) {
	if ((typeof jstestdriver !== "undefined") && (jstestdriver.console)) {
		jstestdriver.console.log(logline);
	} else {
		if ((typeof $ !== "undefined") && ($.db) && ($.db.ina) && ($.trace)) {
			$.trace.debug("Firefly: " + logline);
		} else {
			if ((typeof module !== "undefined") && (this.module !== module)
					&& (module.exports)) {
				console.log(logline);
			} else {
				if ($Global.console) {
					$Global.console.log(logline);
				} else {
					sap.firefly.XLogger.s_output += logline + "\n";
				}
			}
		}
	}
	sap.firefly.XLogger.writeToDivConsole(logline || "", true);
};
sap.firefly.MemoryManager = function() {
	sap.firefly.DfMemoryManager.call(this);
};
sap.firefly.MemoryManager.prototype = new sap.firefly.DfMemoryManager();
sap.firefly.MemoryManager.create = function() {
	return new sap.firefly.MemoryManager();
};
sap.firefly.MemoryManager.prototype.getObjectCount = function() {
	return -1;
};
sap.firefly.MemoryManager.prototype.getAllocatedMemory = function() {
	return -1;
};
sap.firefly.MemoryManager.prototype.getFreeMemory = function() {
	return -1;
};
sap.firefly.XHttpUtils = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XHttpUtils.prototype = new sap.firefly.XObject();
sap.firefly.XHttpUtils.encodeURIComponent = function(unescaped) {
	return encodeURIComponent(unescaped);
};
sap.firefly.XHttpUtils.decodeURIComponent = function(escaped) {
	return decodeURIComponent(escaped);
};
sap.firefly.XHttpUtils.encodeByteArrayToBase64 = function(byteArray) {
	var nativeString = sap.firefly.XByteArray
			.convertXByteArrayToString(byteArray);
	var encodedString;
	if ((typeof module !== "undefined") && (this.module !== module)
			&& (module.exports)) {
		encodedString = new Buffer(nativeString, "utf8").toString("base64");
	} else {
		if (typeof window !== "undefined") {
			encodedString = window.btoa(sap.firefly.XString
					.utf8Encode(nativeString));
		}
	}
	return encodedString;
};
sap.firefly.XHttpUtils.decodeBase64ToByteArray = function(base64) {
	var decodedString = "";
	if ((typeof module !== "undefined") && (this.module !== module)
			&& (module.exports)) {
		decodedString = new Buffer(base64, "base64").toString();
	} else {
		if (typeof window !== "undefined") {
			decodedString = sap.firefly.XString.utf8Decode(window.atob(base64));
		}
	}
	return sap.firefly.XByteArray.convertStringToXByteArray(decodedString);
};
sap.firefly.XHttpUtils.getMD5Hash = function(byteArray) {
};
sap.firefly.XHttpUtils.compressByteArrayToGzip = function(byteArray) {
};
sap.firefly.XHttpUtils.uncompressGzipToByteArray = function(gzipByteArray) {
};
sap.firefly.XHttpUtils.s_reg1 = new RegExp("[\\\\]", "g");
sap.firefly.XHttpUtils.s_reg2 = new RegExp('[\\"]', "g");
sap.firefly.XHttpUtils.s_reg3 = new RegExp("[\\/]", "g");
sap.firefly.XHttpUtils.s_reg4 = new RegExp("[\\b]", "g");
sap.firefly.XHttpUtils.s_reg5 = new RegExp("[\\f]", "g");
sap.firefly.XHttpUtils.s_reg6 = new RegExp("[\\n]", "g");
sap.firefly.XHttpUtils.s_reg7 = new RegExp("[\\r]", "g");
sap.firefly.XHttpUtils.s_reg8 = new RegExp("[\\t]", "g");
sap.firefly.XHttpUtils.escapeToJsonString = function(value) {
	var ref = sap.firefly.XHttpUtils;
	if (value.indexOf("\\") !== -1) {
		value = value.replace(ref.s_reg1, "\\\\");
	}
	if (value.indexOf('"') !== -1) {
		value = value.replace(ref.s_reg2, '\\"');
	}
	if (value.indexOf("/") !== -1) {
		value = value.replace(ref.s_reg3, "\\/");
	}
	if (value.indexOf("\b") !== -1) {
		value = value.replace(ref.s_reg4, "\\b");
	}
	if (value.indexOf("\f") !== -1) {
		value = value.replace(ref.s_reg5, "\\f");
	}
	if (value.indexOf("\n") !== -1) {
		value = value.replace(ref.s_reg6, "\\n");
	}
	if (value.indexOf("\r") !== -1) {
		value = value.replace(ref.s_reg7, "\\r");
	}
	if (value.indexOf("\t") !== -1) {
		value = value.replace(ref.s_reg8, "\\t");
	}
	return value;
};
sap.firefly.QueuedCallbackProcessorHandle = function(nativeCallback,
		isErrorCallback) {
	if (nativeCallback === null) {
		throw new Error("Illegal State: illegal native callback");
	}
	this.m_nativeCallback = nativeCallback;
	this.m_isErrorCallback = isErrorCallback;
};
sap.firefly.QueuedCallbackProcessorHandle.prototype = {
	releaseObject : function() {
		this.m_nativeCallback = null;
		sap.firefly.QueuedCallbackProcessorHandle.$superclass.releaseObject
				.call(this);
	},
	processCallback : function(customIdentifier) {
		this.m_nativeCallback();
	},
	isErrorCallback : function() {
		return this.m_isErrorCallback;
	}
};
sap.firefly.QueuedCallbackProcessorHandle.create = function(nativeCallback,
		isErrorCallback) {
	return new sap.firefly.QueuedCallbackProcessorHandle(nativeCallback,
			isErrorCallback);
};
$Global.sap.firefly.env = $Global.sap.firefly.env || {};
sap.firefly.XSystemUtils = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XSystemUtils.prototype = new sap.firefly.XObject();
sap.firefly.XSystemUtils.s_environmentProperties = null;
sap.firefly.XSystemUtils.getCurrentTimeInMilliseconds = function() {
	return new Date().getTime();
};
sap.firefly.XSystemUtils.waitMillis = function(waitTimeInMillis) {
	var oSystemUtils = sap.firefly.XSystemUtils;
	var startTimeInMillis;
	var currentTimeInMillis;
	if (waitTimeInMillis < 0) {
		throw new Error("Illegal Argument: illegal wait time");
	}
	startTimeInMillis = oSystemUtils.getCurrentTimeInMilliseconds();
	currentTimeInMillis = oSystemUtils.getCurrentTimeInMilliseconds();
	while ((currentTimeInMillis - startTimeInMillis) < waitTimeInMillis) {
		currentTimeInMillis = oSystemUtils.getCurrentTimeInMilliseconds();
	}
};
sap.firefly.XSystemUtils.processQueuedCallback = function(nativeQueue,
		callback, withErrorCallback) {
	if (nativeQueue === null) {
		throw new Error("Illegal Argument: illegal queue");
	}
	if (callback === null) {
		throw new Error("Illegal Argument: illegal callback");
	}
	nativeQueue.call("queued call", function(callbacks) {
		var nativeErrorCallback = callbacks.addErrback(function() {
		});
		var errorCallbackHandle = sap.firefly.QueuedCallbackProcessorHandle
				.create(nativeErrorCallback, true);
		setTimeout(function() {
			callback.processCallback(errorCallbackHandle);
		}, 0);
		var nativeCallback = callbacks.add(function() {
		});
		var callbackHandle = sap.firefly.QueuedCallbackProcessorHandle.create(
				nativeCallback, false);
		setTimeout(function() {
			callback.processCallback(callbackHandle);
		}, 0);
	});
	return true;
};
sap.firefly.XSystemUtils.sleepMillisNonBlocking = function(sleepTimeInMillis,
		callback, customIdentifier) {
	if (sleepTimeInMillis < 0) {
		throw new Error("Illegal Argument: illegal sleep time");
	}
	if (callback === null) {
		throw new Error("Illegal Argument: illegal callback");
	}
	setTimeout(function() {
		callback.processCallback(customIdentifier);
	}, sleepTimeInMillis);
	return true;
};
sap.firefly.XSystemUtils.getNativeEnvironment = function() {
	var oSystemUtils = sap.firefly.XSystemUtils;
	var map;
	if ((typeof module !== "undefined") && (this.module !== module)
			&& (module.exports)) {
		map = oSystemUtils.getNativeEnvironmentNodeJs();
	} else {
		if (($Global.window) && ($Global.window.location)
				&& ($Global.window.location.search)) {
			map = oSystemUtils.getNativeEnvironmentBrowser();
		} else {
			map = sap.firefly.XHashMapOfStringByString.create();
		}
	}
	oSystemUtils.addWiredEnvironment(map);
	return map;
};
sap.firefly.XSystemUtils.getNativeEnvironmentBrowser = function() {
	var map = sap.firefly.XHashMapOfStringByString.create();
	var search = new RegExp("([^&=]+)=?([^&]*)", "g");
	var decode = function(s) {
		return decodeURIComponent(s.replace(/[+]/g, " "));
	};
	var query = $Global.window.location.search.substring(1);
	var match;
	while (true) {
		match = search.exec(query);
		if (match === null) {
			break;
		}
		map.put(decode(match[1]), decode(match[2]));
	}
	return map;
};
sap.firefly.XSystemUtils.getNativeEnvironmentNodeJs = function() {
	var oFirefly = sap.firefly;
	var oPrUtils = oFirefly.PrUtils;
	var parameters = oFirefly.XHashMapOfStringByString.create();
	var json = process.env;
	var jsonElementVariables = oFirefly.XJson.extractJsonContent(json);
	var jsonStructureVariables = oFirefly.PrStructure
			.createDeepCopy(jsonElementVariables);
	var variableNames = jsonStructureVariables.getStructureElementNames();
	var variableIndex;
	var variableName;
	var variableValueString;
	if (variableNames !== null) {
		var len = variableNames.size();
		for (variableIndex = 0; variableIndex < len; variableIndex++) {
			variableName = variableNames.get(variableIndex);
			variableValueString = oPrUtils.getStringProperty(
					jsonStructureVariables, variableName);
			if (variableValueString !== null) {
				parameters.put(variableName, variableValueString
						.getStringValue());
			}
		}
	}
	process.argv.forEach(function(val, index, array) {
		var argument = val;
		var argumentSeparatorIndex = argument.indexOf("=");
		var argumentName;
		var argumentValue;
		if (argumentSeparatorIndex > -1) {
			argumentName = argument.substring(0, argumentSeparatorIndex);
			argumentValue = argument.substring(argumentSeparatorIndex + 1,
					argument.length);
			parameters.put(argumentName, argumentValue);
		}
	});
	return parameters;
};
sap.firefly.XSystemUtils.addWiredEnvironment = function(map) {
	var oFireflyEnv = $Global.sap.firefly.env;
	for ( var key in oFireflyEnv) {
		if (oFireflyEnv.hasOwnProperty(key)) {
			map.put(key, oFireflyEnv[key]);
		}
	}
};
sap.firefly.XNativeDateTimeProvider = function() {
	sap.firefly.XDateTimeProvider.call(this);
};
sap.firefly.XNativeDateTimeProvider.prototype = new sap.firefly.XDateTimeProvider();
sap.firefly.XNativeDateTimeProvider.staticSetupNative = function() {
	var object = new sap.firefly.XNativeDateTimeProvider();
	sap.firefly.XDateTimeProvider.setInstance(object);
};
sap.firefly.XNativeDateTimeProvider.prototype.getCurrentDateAtLocalTimezone = function() {
	var currentDate = new Date();
	var year = currentDate.getFullYear();
	var month = currentDate.getMonth();
	var day = currentDate.getDate();
	return sap.firefly.XDate.createDateWithValues(year, month, day);
};
sap.firefly.XNativeDateTimeProvider.prototype.getCurrentDateTimeAtLocalTimezone = function() {
	var currentDate = new Date();
	var year = currentDate.getFullYear();
	var month = currentDate.getMonth();
	var day = currentDate.getDate();
	var hour = currentDate.getHours();
	var minute = currentDate.getMinutes();
	var second = currentDate.getSeconds();
	var millisecond = currentDate.getMilliseconds();
	return sap.firefly.XDateTime.createDateTimeWithValues(year, month, day,
			hour, minute, second, millisecond);
};
sap.firefly.XNativeDateTimeProvider.prototype.getCurrentTimeAtLocalTimezone = function() {
	var currentDate = new Date();
	var hour = currentDate.getHours();
	var minute = currentDate.getMinutes();
	var second = currentDate.getSeconds();
	var millisecond = currentDate.getMilliseconds();
	return sap.firefly.XTime.createTimeWithValues(hour, minute, second,
			millisecond);
};
sap.firefly.XNativeComparator = function(xComparator) {
	sap.firefly.XObject.call(this);
	this.m_xComparator = xComparator;
	this.m_enclosing = null;
};
sap.firefly.XNativeComparator.prototype = new sap.firefly.XObject();
sap.firefly.XNativeComparator.prototype.releaseObject = function() {
	this.m_xComparator = null;
	this.m_enclosing = null;
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XNativeComparator.prototype.compare = function(o1, o2) {
	return this.m_xComparator.compare(o1, o2);
};
sap.firefly.XComparator = function(comparatorStrategy) {
	sap.firefly.XObject.call(this);
	this.m_comparatorStrategy = comparatorStrategy;
	this.m_nativeComparator = new sap.firefly.XNativeComparator(this);
};
sap.firefly.XComparator.prototype = new sap.firefly.XObject();
sap.firefly.XComparator.create = function(comparatorStrategy) {
	return new sap.firefly.XComparator(comparatorStrategy);
};
sap.firefly.XComparator.prototype.releaseObject = function() {
	this.m_comparatorStrategy = null;
	if (this.m_nativeComparator !== null) {
		this.m_nativeComparator.releaseObject();
		this.m_nativeComparator = null;
	}
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XComparator.prototype.getComparatorStrategy = function() {
	return this.m_comparatorStrategy;
};
sap.firefly.XComparator.prototype.compare = function(o1, o2) {
	return this.m_comparatorStrategy.compare(o1, o2);
};
sap.firefly.XComparator.prototype.getNativeComparator = function() {
	return this.m_nativeComparator;
};
sap.firefly.XNativeComparatorOfString = function(xComparator) {
	sap.firefly.XObject.call(this);
	this.m_xComparator = xComparator;
	this.m_enclosing = null;
};
sap.firefly.XNativeComparatorOfString.prototype = new sap.firefly.XObject();
sap.firefly.XNativeComparatorOfString.prototype.releaseObject = function() {
	this.m_xComparator = null;
	this.m_enclosing = null;
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XNativeComparatorOfString.prototype.compare = function(s1, s2) {
	return this.m_xComparator.compare(s1, s2);
};
sap.firefly.XComparatorOfString = function(comparatorStrategy) {
	sap.firefly.XObject.call(this);
	this.m_comparatorStrategy = comparatorStrategy;
	this.m_nativeComparator = new sap.firefly.XNativeComparatorOfString(this);
};
sap.firefly.XComparatorOfString.prototype = new sap.firefly.XObject();
sap.firefly.XComparatorOfString.create = function(comparatorStrategy) {
	return new sap.firefly.XComparatorOfString(comparatorStrategy);
};
sap.firefly.XComparatorOfString.prototype.releaseObject = function() {
	this.m_comparatorStrategy = null;
	if (this.m_nativeComparator !== null) {
		this.m_nativeComparator.releaseObject();
		this.m_nativeComparator = null;
	}
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XComparatorOfString.prototype.getStringComparatorStrategy = function() {
	return this.m_comparatorStrategy;
};
sap.firefly.XComparatorOfString.prototype.compare = function(s1, s2) {
	return this.m_comparatorStrategy.compare(s1, s2);
};
sap.firefly.XComparatorOfString.prototype.getNativeComparator = function() {
	return this.m_nativeComparator;
};
sap.firefly.XGuid = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XGuid.prototype = new sap.firefly.XObject();
sap.firefly.XGuid.getGuid = function() {
	var S4 = function() {
		return (((1 + Math.random()) * 65536) | 0).toString(16).substring(1);
	};
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4()
			+ S4() + S4());
};
sap.firefly.XHashMap = function() {
	sap.firefly.XObject.call(this);
	this.m_native = {};
};
sap.firefly.XHashMap.prototype = new sap.firefly.XObject();
sap.firefly.XHashMap.prototype.createMapCopyInternal = function() {
	var newMap = {};
	for ( var prop in this.m_native) {
		if (this.m_native.hasOwnProperty(prop)) {
			newMap[prop] = this.m_native[prop];
		}
	}
	return newMap;
};
sap.firefly.XHashMap.prototype.releaseObject = function() {
	this.m_native = null;
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XHashMap.prototype.clear = function() {
	this.m_native = {};
};
sap.firefly.XHashMap.prototype.size = function() {
	return Object.keys(this.m_native).length;
};
sap.firefly.XHashMap.prototype.isEmpty = function() {
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key)) {
			return false;
		}
	}
	return true;
};
sap.firefly.XHashMap.prototype.hasElements = function() {
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key)) {
			return true;
		}
	}
	return false;
};
sap.firefly.XHashMap.prototype.isEqualTo = function(other) {
	if (other === null) {
		return false;
	}
	if (this === other) {
		return true;
	}
	for ( var thisKey in this.m_native) {
		if (this.m_native.hasOwnProperty(thisKey)) {
			if (other.m_native.hasOwnProperty(thisKey) === false) {
				return false;
			}
			var thisValue = this.m_native[thisKey];
			var thatValue = other.m_native[thisKey];
			if (thisValue !== thatValue) {
				if (thisValue === null) {
					return false;
				}
				if (thisValue.isEqualTo(thatValue) === false) {
					return false;
				}
			}
		}
	}
	for ( var thatKey in other.m_native) {
		if (other.m_native.hasOwnProperty(thatKey)) {
			if (this.m_native.hasOwnProperty(thatKey) === false) {
				return false;
			}
		}
	}
	return true;
};
sap.firefly.XHashMap.prototype.containsKey = function(key) {
	if (key === null) {
		return false;
	}
	return this.m_native.hasOwnProperty(key);
};
sap.firefly.XHashMap.prototype.contains = function(value) {
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key) && this.m_native[key] === value) {
			return true;
		}
	}
	return false;
};
sap.firefly.XHashMap.prototype.getByKey = function(key) {
	var value = this.m_native[key];
	if (value === undefined) {
		return null;
	}
	return value;
};
sap.firefly.XHashMap.prototype.putIfNotNull = function(key, element) {
	if (element !== null) {
		this.put(key, element);
	}
};
sap.firefly.XHashMap.prototype.put = function(key, value) {
	if (key === null) {
		throw new Error("Illegal Argument: Key is null");
	}
	this.m_native[key] = value;
};
sap.firefly.XHashMap.prototype.remove = function(key) {
	if (key !== null) {
		delete this.m_native[key];
	}
};
sap.firefly.XHashMap.prototype.getKeysAsReadOnlyList = function() {
	var list = new sap.firefly.XList();
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key)) {
			list.add(key);
		}
	}
	return list;
};
sap.firefly.XHashMap.prototype.getValuesAsReadOnlyList = function() {
	var list = new sap.firefly.XList();
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key)) {
			list.add(this.m_native[key]);
		}
	}
	return list;
};
sap.firefly.XHashMap.prototype.getKeysAsIterator = function() {
	return new sap.firefly.XIterator(this.getKeysAsReadOnlyList());
};
sap.firefly.XHashMap.prototype.getIterator = function() {
	return new sap.firefly.XIterator(this.getValuesAsReadOnlyList());
};
sap.firefly.XHashMap.prototype.getMapFromImplementation = function() {
	return this.m_native;
};
sap.firefly.XHashMap.prototype.toString = function() {
	return this.m_native.toString();
};
sap.firefly.XHashMapByString = function() {
	sap.firefly.XHashMap.call(this);
};
sap.firefly.XHashMapByString.prototype = new sap.firefly.XHashMap();
sap.firefly.XHashMapByString.create = function() {
	return new sap.firefly.XHashMapByString();
};
sap.firefly.XHashMapByString.prototype.createMapByStringCopy = function() {
	var hashMap = new sap.firefly.XHashMapByString();
	hashMap.m_native = this.createMapCopyInternal();
	return hashMap;
};
sap.firefly.XHashMapByString.prototype.clone = sap.firefly.XHashMapByString.prototype.createMapByStringCopy;
sap.firefly.XHashMapByString.prototype.getKeysAsReadOnlyListOfString = function() {
	var list = new sap.firefly.XListOfString();
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key)) {
			list.add(key);
		}
	}
	return list;
};
sap.firefly.XHashMapByString.prototype.getKeysAsIteratorOfString = sap.firefly.XHashMapByString.prototype.getKeysAsIterator;
sap.firefly.XHashMapOfStringByString = function() {
	sap.firefly.XHashMap.call(this);
};
sap.firefly.XHashMapOfStringByString.prototype = new sap.firefly.XHashMap();
sap.firefly.XHashMapOfStringByString.create = function() {
	return new sap.firefly.XHashMapOfStringByString();
};
sap.firefly.XHashMapOfStringByString.createMapOfStringByStringStaticCopy = function(
		map) {
	if (map === null || map === undefined) {
		return null;
	}
	var hashMap = new sap.firefly.XHashMapOfStringByString();
	var keys = map.getKeysAsIteratorOfString();
	while (keys.hasNext()) {
		var key = keys.next();
		hashMap.put(key, map.getByKey(key));
	}
	return hashMap;
};
sap.firefly.XHashMapOfStringByString.prototype.createMapOfStringByStringCopy = function() {
	var hashMap = new sap.firefly.XHashMapOfStringByString();
	hashMap.m_native = this.createMapCopyInternal();
	return hashMap;
};
sap.firefly.XHashMapOfStringByString.prototype.isEqualTo = function(other) {
	if (other === null) {
		return false;
	}
	if (this === other) {
		return true;
	}
	for ( var thisKey in this.m_native) {
		if (this.m_native.hasOwnProperty(thisKey)) {
			if (this.m_native[thisKey] !== other.m_native[thisKey]) {
				return false;
			}
		}
	}
	for ( var thatKey in other.m_native) {
		if (other.m_native.hasOwnProperty(thatKey)) {
			if (this.m_native.hasOwnProperty(thatKey) === false) {
				return false;
			}
		}
	}
	return true;
};
sap.firefly.XHashMapOfStringByString.prototype.getValuesAsReadOnlyListOfString = function() {
	var list = new sap.firefly.XListOfString();
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key)) {
			list.add(this.m_native[key]);
		}
	}
	return list;
};
sap.firefly.XHashMapOfStringByString.prototype.getIterator = function() {
	return new sap.firefly.XIterator(this.getValuesAsReadOnlyList());
};
sap.firefly.XHashMapOfStringByString.prototype.getKeysAsReadOnlyListOfString = function() {
	var list = new sap.firefly.XListOfString();
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key)) {
			list.add(key);
		}
	}
	return list;
};
sap.firefly.XHashMapOfStringByString.prototype.getKeysAsIteratorOfString = sap.firefly.XHashMapOfStringByString.prototype.getKeysAsIterator;
sap.firefly.XHashMapOfStringByString.prototype.toString = function() {
	var keyIterator = this.getKeysAsIterator();
	var buffer = new sap.firefly.XStringBuffer();
	while (keyIterator.hasNext()) {
		var key = keyIterator.next();
		var value = this.getByKey(key);
		buffer.append(key + "=" + value);
		if (keyIterator.hasNext()) {
			buffer.append(",");
		}
	}
	return buffer.toString();
};
sap.firefly.XHashSetOfString = function() {
	sap.firefly.XObject.call(this);
	this.m_native = {};
};
sap.firefly.XHashSetOfString.prototype = new sap.firefly.XObject();
sap.firefly.XHashSetOfString.create = function() {
	return new sap.firefly.XHashSetOfString();
};
sap.firefly.XHashSetOfString.prototype.createSetCopy = function() {
	var hashSet = new sap.firefly.XHashSetOfString();
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key)) {
			hashSet.m_native[key] = this.m_native[key];
		}
	}
	return hashSet;
};
sap.firefly.XHashSetOfString.prototype.clone = sap.firefly.XHashSetOfString.prototype.createSetCopy;
sap.firefly.XHashSetOfString.prototype.releaseObject = function() {
	this.m_native = null;
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XHashSetOfString.prototype.isEqualTo = function(other) {
	if (other === null) {
		return false;
	}
	if (this === other) {
		return true;
	}
	for ( var thisKey in this.m_native) {
		if (this.m_native.hasOwnProperty(thisKey)) {
			if (other.m_native.hasOwnProperty(thisKey) === false) {
				return false;
			}
		}
	}
	for ( var thatKey in other.m_native) {
		if (other.m_native.hasOwnProperty(thatKey)) {
			if (this.m_native.hasOwnProperty(thatKey) === false) {
				return false;
			}
		}
	}
	return true;
};
sap.firefly.XHashSetOfString.prototype.clear = function() {
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key)) {
			delete this.m_native[key];
		}
	}
};
sap.firefly.XHashSetOfString.prototype.size = function() {
	return Object.keys(this.m_native).length;
};
sap.firefly.XHashSetOfString.prototype.isEmpty = function() {
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key)) {
			return false;
		}
	}
	return true;
};
sap.firefly.XHashSetOfString.prototype.hasElements = function() {
	return this.isEmpty() === false;
};
sap.firefly.XHashSetOfString.prototype.contains = function(key) {
	if (key === null) {
		return false;
	}
	return this.m_native.hasOwnProperty(key);
};
sap.firefly.XHashSetOfString.prototype.put = function(key) {
	if (key === null) {
		throw new Error("Illegal Argument: null");
	}
	this.m_native[key] = true;
};
sap.firefly.XHashSetOfString.prototype.putAll = function(elements) {
	if (elements !== null) {
		var size = elements.size();
		for (var i = 0; i < size; i++) {
			this.m_native[elements.get(i)] = true;
		}
	}
};
sap.firefly.XHashSetOfString.prototype.removeElement = function(key) {
	if (key !== null) {
		delete this.m_native[key];
	}
};
sap.firefly.XHashSetOfString.prototype.getValuesAsReadOnlyListOfString = function() {
	var list = new sap.firefly.XListOfString();
	for ( var key in this.m_native) {
		if (this.m_native.hasOwnProperty(key)) {
			list.add(key);
		}
	}
	return list;
};
sap.firefly.XHashSetOfString.prototype.getValuesAsIterator = function() {
	return new sap.firefly.XIterator(this.getValuesAsReadOnlyListOfString());
};
sap.firefly.XHashSetOfString.prototype.getIterator = sap.firefly.XHashSetOfString.prototype.getValuesAsIterator;
sap.firefly.XHashSetOfString.prototype.toString = function() {
	return this.m_native.toString();
};
sap.firefly.XIterator = function(list) {
	sap.firefly.XObject.call(this);
	this.m_readOnlyValues = list;
	this.m_position = -1;
};
sap.firefly.XIterator.prototype = new sap.firefly.XObject();
sap.firefly.XIterator.createFromList = function(list) {
	return new sap.firefly.XIterator(list);
};
sap.firefly.XIterator.prototype.releaseObject = function() {
	this.m_readOnlyValues = null;
	this.m_position = null;
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XIterator.prototype.hasNext = function() {
	return (this.m_position + 1 < this.m_readOnlyValues.size());
};
sap.firefly.XIterator.prototype.next = function() {
	return this.m_readOnlyValues.get(++this.m_position);
};
sap.firefly.XList = function(copy) {
	this.m_isReleased = false;
	if (copy !== undefined) {
		this.push.apply(this, copy);
	}
};
sap.firefly.XList.prototype = [];
sap.firefly.XObject.extend(sap.firefly.XList.prototype,
		sap.firefly.XObject.prototype);
sap.firefly.XList.create = function() {
	return new sap.firefly.XList();
};
sap.firefly.XList.nativeSortAscending = function(a, b) {
	return a.compareTo(b);
};
sap.firefly.XList.nativeSortDescending = function(a, b) {
	return b.compareTo(a);
};
sap.firefly.XList.prototype.createListCopy = function() {
	return new sap.firefly.XList(this);
};
sap.firefly.XList.prototype.sublist = function(beginIndex, endIndex) {
	var end = (endIndex === -1 ? this.length : endIndex);
	return new sap.firefly.XList(this.slice(beginIndex, end));
};
sap.firefly.XList.prototype.createArrayCopy = function() {
	return new sap.firefly.XArray(-1, this);
};
sap.firefly.XList.prototype.addAll = function(otherList) {
	if (otherList !== null && otherList !== undefined && otherList !== this) {
		this.push.apply(this, otherList);
	}
};
sap.firefly.XList.prototype.add = sap.firefly.XList.prototype.push;
sap.firefly.XList.prototype.isEqualTo = function(other) {
	if (other === null) {
		return false;
	}
	if (this === other) {
		return true;
	}
	var size = this.length;
	if (size !== other.length) {
		return false;
	}
	var thisEntry, thatEntry;
	for (var idx = 0; idx < size; idx++) {
		thisEntry = this[idx];
		thatEntry = other[idx];
		if ((thisEntry === null) && (thatEntry === null)) {
			continue;
		}
		if ((thisEntry === null) || (thatEntry === null)) {
			return false;
		}
		if (!thisEntry.isEqualTo(thatEntry)) {
			return false;
		}
	}
	return true;
};
sap.firefly.XList.prototype.assertIndexIsValid = function(index) {
	if (index < 0 || index >= this.length) {
		throw new Error("Illegal Argument: illegal index");
	}
};
sap.firefly.XList.prototype.insert = function(index, element) {
	if (index < 0 || index > this.length) {
		throw new Error("Illegal Argument: illegal index");
	}
	this.splice(index, 0, element);
};
sap.firefly.XList.prototype.clear = function() {
	this.length = 0;
};
sap.firefly.XList.prototype.get = function(index) {
	this.assertIndexIsValid(index);
	return this[index];
};
sap.firefly.XList.prototype.getIndex = function(element) {
	var len = this.length;
	var i;
	var thisElement;
	for (i = 0; i < len; i++) {
		thisElement = this[i];
		if (thisElement === element) {
			return i;
		}
		if (thisElement !== null && thisElement.isEqualTo(element)) {
			return i;
		}
	}
	return -1;
};
sap.firefly.XList.prototype.contains = function(element) {
	return this.getIndex(element) !== -1;
};
sap.firefly.XList.prototype.isEmpty = function() {
	return this.length === 0;
};
sap.firefly.XList.prototype.hasElements = function() {
	return this.length !== 0;
};
sap.firefly.XList.prototype.moveElement = function(fromIndex, toIndex) {
	this.assertIndexIsValid(fromIndex);
	this.assertIndexIsValid(toIndex);
	if (toIndex !== fromIndex) {
		var object = this.removeAt(fromIndex);
		this.insert(toIndex, object);
	}
};
sap.firefly.XList.prototype.removeAt = function(index) {
	this.assertIndexIsValid(index);
	return this.splice(index, 1)[0];
};
sap.firefly.XList.prototype.removeElement = function(element) {
	var index = this.getIndex(element);
	if (index !== -1) {
		this.splice(index, 1);
	}
};
sap.firefly.XList.prototype.size = function() {
	return this.length;
};
sap.firefly.XList.prototype.set = function(index, element) {
	this.assertIndexIsValid(index);
	this[index] = element;
};
sap.firefly.XList.prototype.getIterator = function() {
	return new sap.firefly.XIterator(this);
};
sap.firefly.XList.prototype.getValuesAsReadOnlyList = function() {
	return this;
};
sap.firefly.XList.prototype.sortByDirection = function(sortDirection) {
	var oFirefly = sap.firefly;
	if (sortDirection === oFirefly.XSortDirection.ASCENDING) {
		this.sort(oFirefly.XList.nativeSortAscending);
	} else {
		if (sortDirection === oFirefly.XSortDirection.DESCENDING) {
			this.sort(oFirefly.XList.nativeSortDescending);
		} else {
			throw new Error("Illegal Argument: illegal sort direction");
		}
	}
};
sap.firefly.XList.prototype.sortByComparator = function(sortComparator) {
	this.sort(function(a, b) {
		return sortComparator.compare(a, b);
	});
};
sap.firefly.XList.prototype.toString = function() {
	var buffer = new sap.firefly.XStringBuffer();
	var size = this.length;
	var i;
	buffer.append("[");
	for (i = 0; i < size; i++) {
		if (i > 0) {
			buffer.append(", ");
		}
		buffer.append(this[i].toString());
	}
	buffer.append("]");
	return buffer.toString();
};
sap.firefly.XList.prototype.getListFromImplementation = function() {
	return (this.m_list ? this.m_list : this);
};
sap.firefly.XListOfString = function(copy) {
	sap.firefly.XList.call(this, copy);
};
sap.firefly.XListOfString.prototype = new sap.firefly.XList();
sap.firefly.XListOfString.create = function() {
	return new sap.firefly.XListOfString();
};
sap.firefly.XListOfString.createFromReadOnlyList = function(readOnlyList) {
	return new sap.firefly.XListOfString(readOnlyList);
};
sap.firefly.XListOfString.prototype.createListOfStringCopy = function() {
	return new sap.firefly.XListOfString(this);
};
sap.firefly.XListOfString.prototype.getIndex = function(element) {
	var len = this.length;
	var i;
	for (i = 0; i < len; i++) {
		if (this[i] === element) {
			return i;
		}
	}
	return -1;
};
sap.firefly.XListOfString.prototype.isEqualTo = function(other) {
	if (other === null) {
		return false;
	}
	if (this === other) {
		return true;
	}
	var len = this.length;
	if (len !== other.size()) {
		return false;
	}
	for (var idx = 0; idx < len; idx++) {
		if (this[idx] !== other[idx]) {
			return false;
		}
	}
	return true;
};
sap.firefly.XListOfString.prototype.sortByDirection = function(sortDirection) {
	if (sortDirection === sap.firefly.XSortDirection.ASCENDING) {
		this._quickSort(0, this.length);
	} else {
		if (sortDirection === sap.firefly.XSortDirection.DESCENDING) {
			this._quickSort(0, this.length);
			this.reverse();
		} else {
			throw new Error("Illegal Argument: illegal sort direction");
		}
	}
};
sap.firefly.XListOfString.prototype._partition = function(left, right) {
	var cmp = this[right - 1], minEnd = left, maxEnd;
	for (maxEnd = left; maxEnd < right - 1; maxEnd++) {
		if (this[maxEnd] <= cmp) {
			this._swap(maxEnd, minEnd);
			++minEnd;
		}
	}
	this._swap(minEnd, right - 1);
	return minEnd;
};
sap.firefly.XListOfString.prototype._swap = function(i, j) {
	var temp = this[i];
	this[i] = this[j];
	this[j] = temp;
};
sap.firefly.XListOfString.prototype._quickSort = function(left, right) {
	if (left < right) {
		var p = this._partition(left, right);
		this._quickSort(left, p);
		this._quickSort(p + 1, right);
	}
};
sap.firefly.XListOfString.prototype.getIterator = function() {
	return new sap.firefly.XIterator(this);
};
sap.firefly.XListOfString.prototype.getValuesAsReadOnlyListOfString = function() {
	return this;
};
sap.firefly.XArray = function(size, copy) {
	sap.firefly.XArrayWrapper.call(this, copy);
	var i;
	if (copy === undefined && size) {
		this.m_list.length = size;
		for (i = 0; i < size; i++) {
			this.m_list[i] = null;
		}
	}
};
sap.firefly.XArray.prototype = new sap.firefly.XArrayWrapper();
sap.firefly.XArray.create = function(size) {
	return new sap.firefly.XArray(size);
};
sap.firefly.XArray.prototype.assertIndexIsValid = function(index) {
	if (index >= this.m_list.length) {
		throw new Error("Illegal Argument: Index exceeds size of this array");
	}
};
sap.firefly.XArray.prototype.clear = function() {
	var len = this.m_list.length;
	var i;
	for (i = 0; i < len; i++) {
		this.m_list[i] = null;
	}
};
sap.firefly.XArray.prototype.set = function(index, value) {
	this.assertIndexIsValid(index);
	this.m_list[index] = value;
};
sap.firefly.XArray.prototype.get = function(index) {
	this.assertIndexIsValid(index);
	return this.m_list[index];
};
sap.firefly.XArray.prototype.createArrayCopy = function() {
	return new sap.firefly.XArray(-1, this.m_list);
};
sap.firefly.XArray.prototype.toString = function() {
	var buffer = new sap.firefly.XStringBuffer();
	buffer.append("[");
	var i;
	var len = this.m_list.length;
	for (i = 0; i < len; i++) {
		if (i > 0) {
			buffer.append(",");
		}
		buffer.append(this.m_list[i].toString());
	}
	buffer.append("]");
	return buffer.toString();
};
sap.firefly.XArrayOfInt = function(size, copy) {
	sap.firefly.XArray.call(this, size, copy);
	var i;
	if (copy === undefined && size) {
		this.m_list.length = size;
		for (i = 0; i < size; i++) {
			this.m_list[i] = 0;
		}
	}
};
sap.firefly.XArrayOfInt.prototype = new sap.firefly.XArray();
sap.firefly.XArrayOfInt.create = function(size) {
	return new sap.firefly.XArrayOfInt(size);
};
sap.firefly.XArrayOfInt.prototype.clear = function() {
	var len = this.m_list.length;
	var i;
	for (i = 0; i < len; i++) {
		this.m_list[i] = 0;
	}
};
sap.firefly.XArrayOfInt.prototype.copyFrom = function(source, sourceIndex,
		destinationIndex, length) {
	if (sourceIndex < 0 || destinationIndex < 0 || length < 0) {
		throw new Error("Illegal Argument: Index must be >= 0");
	}
	if ((destinationIndex + length) > this.m_list.length) {
		throw new Error(
				"Illegal Argument: DestinationIndex will exceed size of this array");
	}
	if ((sourceIndex + length) > source.m_list.length) {
		throw new Error(
				"Illegal Argument: SourceIndex will exceed size of source array");
	}
	var i;
	for (i = 0; i < length; i++) {
		this.m_list[i + destinationIndex] = source.m_list[i + sourceIndex];
	}
};
sap.firefly.XArrayOfInt.prototype.clone = function() {
	return new sap.firefly.XArrayOfInt(-1, this.m_list);
};
sap.firefly.XArrayOfInt.prototype.createCopyByIndex = function(sourceIndex,
		length) {
	var copy = new sap.firefly.XArrayOfInt(length);
	copy.copyFrom(this, sourceIndex, 0, length);
	return copy;
};
sap.firefly.XArrayOfString = function(size, copy) {
	sap.firefly.XArray.call(this, size, copy);
};
sap.firefly.XArrayOfString.prototype = new sap.firefly.XArray();
sap.firefly.XArrayOfString.create = function(size) {
	return new sap.firefly.XArrayOfString(size);
};
sap.firefly.XArrayOfString.prototype.copyFrom = function(source, sourceIndex,
		destinationIndex, length) {
	if (sourceIndex < 0 || destinationIndex < 0 || length < 0) {
		throw new Error("Illegal Argument: Index must be >= 0");
	}
	if ((destinationIndex + length) > this.m_list.length) {
		throw new Error(
				"Illegal Argument: DestinationIndex will exceed size of this array");
	}
	if ((sourceIndex + length) > source.m_list.length) {
		throw new Error(
				"Illegal Argument: SourceIndex will exceed size of source array");
	}
	var i;
	for (i = 0; i < length; i++) {
		this.m_list[i + destinationIndex] = source.m_list[i + sourceIndex];
	}
};
sap.firefly.XArrayOfString.prototype.clone = function() {
	return new sap.firefly.XArrayOfString(-1, this.m_list);
};
sap.firefly.XArrayOfString.prototype.createCopyByIndex = function(sourceIndex,
		length) {
	var copy = new sap.firefly.XArrayOfString(length);
	copy.copyFrom(this, sourceIndex, 0, length);
	return copy;
};
sap.firefly.PlatformModule = function() {
	sap.firefly.DfModule.call(this);
};
sap.firefly.PlatformModule.prototype = new sap.firefly.DfModule();
sap.firefly.PlatformModule.s_module = null;
sap.firefly.PlatformModule.getInstance = function() {
	return sap.firefly.PlatformModule
			.initVersion(sap.firefly.XVersion.API_DEFAULT);
};
sap.firefly.PlatformModule.initVersion = function(version) {
	var oFirefly = sap.firefly;
	if (oFirefly.PlatformModule.s_module === null) {
		if (oFirefly.CoreModule.initVersion(version) === null) {
			throw new Error("Initialization Exception");
		}
		oFirefly.XLanguage.setLanguage(oFirefly.XLanguage.JAVASCRIPT);
		oFirefly.XSyncEnv.setSyncEnv(oFirefly.XSyncEnv.EXTERNAL_MAIN_LOOP);
		oFirefly.XNativeDateTimeProvider.staticSetupNative();
		oFirefly.XLogger.staticSetup();
		oFirefly.PlatformModule.s_module = new oFirefly.PlatformModule();
	}
	return oFirefly.PlatformModule.s_module;
};
sap.firefly.PlatformModule.getInstance();
sap.firefly.XReflection = function() {
	sap.firefly.XObject.call(this);
	this.m_native = {};
};
sap.firefly.XReflection.prototype = new sap.firefly.XObject();
sap.firefly.XReflection.getMethods = function(clazz) {
	return null;
};
sap.firefly.XReflection.getMembers = function(clazz) {
	return null;
};
sap.firefly.XReflection.invokeMethod = function(target, methodName, returnType) {
	var result = target[methodName]();
	return this.getBandungObject(result, returnType);
};
sap.firefly.XReflection.invokeMethodWithArgs = function(target, methodName,
		args, returnType) {
	var paramValues = [];
	var i;
	for (i = 0; i < args.size(); i++) {
		paramValues.push(this.getNativeObject(args.get(i)));
	}
	var result = target[methodName].apply(target, paramValues);
	return this.getBandungObject(result, returnType);
};
sap.firefly.XReflection.getNativeObject = function(param) {
	var obj = param.getValue();
	if (obj !== null && obj !== undefined && param.isWrapped()) {
		if (obj instanceof sap.firefly.XStringValue) {
			return obj.getStringValue();
		}
		if (obj instanceof sap.firefly.XDoubleValue) {
			return obj.getDoubleValue();
		}
		if (obj instanceof sap.firefly.XIntegerValue) {
			return obj.getIntegerValue();
		}
		if (obj instanceof sap.firefly.XBooleanValue) {
			return obj.getBooleanValue();
		}
		if (obj instanceof sap.firefly.XLongValue) {
			return obj.getLongValue();
		}
	}
	return obj;
};
sap.firefly.XReflection.getBandungObject = function(obj, returnType) {
	if (typeof obj === "string" || typeof obj === "number"
			|| typeof obj === "boolean") {
		var xClassObj = sap.firefly.XClass.createByName(returnType);
		return xClassObj.getNativeElement().create(obj);
	}
	return obj;
};