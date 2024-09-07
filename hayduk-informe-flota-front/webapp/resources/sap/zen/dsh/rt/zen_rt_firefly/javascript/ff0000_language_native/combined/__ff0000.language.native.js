var $Global;
if ((typeof module !== "undefined") && (this.module !== module)
		&& (module.exports)) {
	$Global = module.exports;
} else {
	if (typeof window !== "undefined") {
		$Global = this;
	} else {
		$Global = $Global || {};
	}
}
var sap = sap || {};
if (!sap.firefly) {
	sap["firefly"] = {};
}
$Global.sap = sap;
var $Firefly = {
	createByPrototype : function(thePrototype) {
		var F = function() {
		};
		F.prototype = thePrototype;
		return new F();
	},
	createClass : function(fullQualifiedClassName, superClass, classDefinition) {
		var namespaceArray;
		if (Object.prototype.toString.call(fullQualifiedClassName) === "[object Array]") {
			namespaceArray = fullQualifiedClassName;
		} else {
			namespaceArray = fullQualifiedClassName.split(".");
		}
		var parent = $Global;
		var currentElementName;
		var currentElement;
		var i;
		var errorMessage;
		var namespaceLen = namespaceArray.length - 1;
		for (i = 0; i < namespaceLen; i++) {
			currentElementName = namespaceArray[i];
			currentElement = parent[currentElementName];
			if (currentElement === undefined) {
				parent[currentElementName] = {};
				currentElement = parent[currentElementName];
			}
			parent = currentElement;
		}
		currentElementName = namespaceArray[namespaceLen];
		var ffClass = function() {
		};
		ffClass.prototype = {};
		if (superClass !== null) {
			if (superClass === undefined) {
				errorMessage = "$Firefly.createClass " + currentElementName
						+ " failed due to missing superClass";
				if ((typeof jstestdriver !== "undefined")
						&& (jstestdriver.console)) {
					jstestdriver.console.log(errorMessage);
				} else {
					if ((typeof $ !== undefined) && ($.db) && ($.db.ina)
							&& ($.trace)) {
						$.trace.debug("Firefly: " + errorMessage);
					} else {
						if ((typeof module !== "undefined")
								&& (this.module !== module) && (module.exports)) {
							console.log(errorMessage);
						} else {
							if ($Global.console) {
								$Global.console.log(errorMessage);
							}
						}
					}
				}
				return;
			}
			ffClass = function() {
				superClass.call(this);
			};
			var SuperClass = superClass;
			ffClass.prototype = new SuperClass();
			ffClass.$superclass = superClass.prototype;
		}
		var myPrototype = ffClass.prototype;
		var property;
		var staticProperty;
		var myStatics;
		for (property in classDefinition) {
			if (classDefinition.hasOwnProperty(property)) {
				if (property === "$statics") {
					myStatics = classDefinition[property];
					for (staticProperty in myStatics) {
						if (myStatics.hasOwnProperty(staticProperty)) {
							ffClass[staticProperty] = myStatics[staticProperty];
						}
					}
				} else {
					myPrototype[property] = classDefinition[property];
				}
			}
		}
		ffClass.clazzName = currentElementName;
		parent[currentElementName] = ffClass;
	}
};
sap.firefly.XObject = function() {
	this.m_isReleased = false;
};
sap.firefly.XObject.prototype = {
	releaseObject : function() {
		this.m_isReleased = true;
	},
	isReleased : function() {
		return this.m_isReleased;
	},
	isEqualTo : function(other) {
		return this === other;
	},
	getHashCode : function() {
		throw new Error("Unsupported Operation Exception");
	},
	compareTo : function(objectToCompare) {
		throw new Error("Unsupported Operation Exception");
	},
	clone : function() {
		throw new Error("Unsupported Operation Exception");
	},
	getWeakReference : function() {
		return new sap.firefly.XWeakReference(this);
	},
	toString : function() {
		return "[???]";
	}
};
sap.firefly.XObject.releaseIfNotNull = function(object) {
	if (object !== null) {
		object.releaseObject();
	}
	return null;
};
sap.firefly.XObject.extend = function(destination, source) {
	for ( var k in source) {
		if (source.hasOwnProperty(k)) {
			destination[k] = source[k];
		}
	}
};
sap.firefly.XWeakReference = function(reference) {
	sap.firefly.XObject.call(this);
	this.m_reference = reference;
};
sap.firefly.XWeakReference.prototype = new sap.firefly.XObject();
sap.firefly.XWeakReference.create = function(reference) {
	return new sap.firefly.XWeakReference(reference);
};
sap.firefly.XWeakReference.prototype.releaseObject = function() {
	this.m_reference = null;
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XWeakReference.prototype.getReference = function() {
	return this.m_reference;
};
sap.firefly.XWeakReference.prototype.isReferenceValid = function() {
	return this.m_reference !== null;
};
sap.firefly.XWeakReference.prototype.toString = function() {
	if (this.isReferenceValid()) {
		return this.m_reference.toString();
	}
	return null;
};
sap.firefly.XException = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XException.prototype = new sap.firefly.XObject();
sap.firefly.XException.createInitializationException = function() {
	return new Error("Initialization Exception");
};
sap.firefly.XException.createUnsupportedOperationException = function() {
	return new Error("Unsupported Operation Exception");
};
sap.firefly.XException.createRuntimeException = function(message) {
	return new Error("Runtime Exception: " + message);
};
sap.firefly.XException.createRuntimeExceptionWithParameter = function(message,
		parameter1, parameter2, parameter3) {
	var messageWithParameter = message;
	if (parameter1 !== null) {
		messageWithParameter = sap.firefly.XString.replace(
				messageWithParameter, "&1", parameter1);
	}
	if (parameter2 !== null) {
		messageWithParameter = sap.firefly.XString.replace(
				messageWithParameter, "&2", parameter2);
	}
	if (parameter3 !== null) {
		messageWithParameter = sap.firefly.XString.replace(
				messageWithParameter, "&3", parameter3);
	}
	return new Error("Runtime Exception: " + messageWithParameter);
};
sap.firefly.XException.createIllegalStateException = function(message) {
	return new Error("Illegal State: " + message);
};
sap.firefly.XException.createIllegalArgumentException = function(message) {
	return new Error("Illegal Argument: " + message);
};
sap.firefly.XException.supportsStackTrace = function() {
	return true;
};
sap.firefly.XException.getStackTrace = function(excp, removeLineCount) {
	if (excp.stack === undefined) {
		return excp.m_message
				+ "\r\n(No call stack available; please search source code for exception message)";
	}
	return excp.stack;
};
sap.firefly.XString = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XString.prototype = new sap.firefly.XObject();
sap.firefly.XString.concatenate2 = function(s1, s2) {
	if (s1 === null && s2 === null) {
		return "nullnull";
	}
	if (s1 === null) {
		return "null" + s2;
	}
	if (s2 === null) {
		return s1 + "null";
	}
	return s1 + s2;
};
sap.firefly.XString.isEqual = function(firstValue, secondValue) {
	return (firstValue === secondValue);
};
sap.firefly.XString.getCharAt = function(value, index) {
	return value.charCodeAt(index);
};
sap.firefly.XString.replace = function(value, searchPattern, replaceValue) {
	return value.split(searchPattern).join(replaceValue);
};
sap.firefly.XString.containsString = function(s1, s2) {
	if (s1 === null && s2 === null) {
		return true;
	}
	if (s1 === null) {
		return false;
	}
	if (s2 === null) {
		return true;
	}
	return (s1.indexOf(s2) !== -1);
};
sap.firefly.XString.startsWith = function(value, startsWithString) {
	return value.indexOf(startsWithString) === 0;
};
sap.firefly.XString.endsWith = function(value, endsWithString) {
	var lastIndexOf = value.lastIndexOf(endsWithString);
	if (lastIndexOf === -1) {
		return false;
	}
	if ((lastIndexOf + endsWithString.length) === value.length) {
		return true;
	}
	return false;
};
sap.firefly.XString.size = function(value) {
	return value.length;
};
sap.firefly.XString.compare = function(value, compareTo) {
	if (value === null && compareTo === null) {
		return 0;
	}
	if (value === null) {
		return -1;
	}
	if (compareTo === null) {
		return 1;
	}
	return ((value === compareTo) ? 0 : ((value > compareTo) ? 1 : -1));
};
sap.firefly.XString.indexOf = function(text, pattern) {
	return text.indexOf(pattern);
};
sap.firefly.XString.indexOfFrom = function(text, pattern, fromIndex) {
	return text.indexOf(pattern, fromIndex);
};
sap.firefly.XString.lastIndexOf = function(text, pattern) {
	return text.lastIndexOf(pattern);
};
sap.firefly.XString.lastIndexOfFrom = function(text, pattern, indexFrom) {
	return text.lastIndexOf(pattern, indexFrom);
};
sap.firefly.XString.substring = function(text, beginIndex, endIndex) {
	if (endIndex === -1) {
		return text.substring(beginIndex);
	}
	return text.substring(beginIndex, endIndex);
};
sap.firefly.XString.convertToLowerCase = function(value) {
	if (value === null) {
		return null;
	}
	return value.toLowerCase();
};
sap.firefly.XString.convertToUpperCase = function(value) {
	if (value === null) {
		return null;
	}
	return value.toUpperCase();
};
sap.firefly.XString.trim = function(value) {
	if (value === null) {
		return null;
	}
	return value.trim();
};
sap.firefly.XString.getStringResource = function(resourceClass, resourceName) {
	return null;
};
sap.firefly.XString.utf8Encode = function(value) {
	return unescape(encodeURIComponent(value));
};
sap.firefly.XString.utf8Decode = function(value) {
	return decodeURIComponent(escape(value));
};
sap.firefly.XString.cvtHex = function(val) {
	var str = "";
	var i;
	var v;
	for (i = 7; i >= 0; i--) {
		v = (val >>> (i * 4)) & 15;
		str += v.toString(16);
	}
	return str;
};
sap.firefly.XString.rotateLeft = function(n, s) {
	return (n << s) | (n >>> (32 - s));
};
sap.firefly.XString.createSHA1 = function(text) {
	if (text === null) {
		return null;
	}
	var blockstart;
	var i;
	var W = [];
	var H0 = 1732584193;
	var H1 = 4023233417;
	var H2 = 2562383102;
	var H3 = 271733878;
	var H4 = 3285377520;
	var A, B, C, D, E;
	var temp;
	var XString = sap.firefly.XString;
	var fnRotateLeft = XString.rotateLeft;
	var fnCvtHex = XString.cvtHex;
	var msg = XString.utf8Encode(text);
	var msgLen = msg.length;
	var wordArray = [];
	for (i = 0; i < msgLen - 3; i += 4) {
		wordArray.push(msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16
				| msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3));
	}
	switch (msgLen % 4) {
	case 0:
		wordArray.push(2147483648);
		break;
	case 1:
		wordArray.push(msg.charCodeAt(msgLen - 1) << 24 | 8388608);
		break;
	case 2:
		wordArray.push(msg.charCodeAt(msgLen - 2) << 24
				| msg.charCodeAt(msgLen - 1) << 16 | 32768);
		break;
	default:
		wordArray.push(msg.charCodeAt(msgLen - 3) << 24
				| msg.charCodeAt(msgLen - 2) << 16
				| msg.charCodeAt(msgLen - 1) << 8 | 128);
		break;
	}
	while ((wordArray.length % 16) !== 14) {
		wordArray.push(0);
	}
	wordArray.push(msgLen >>> 29);
	wordArray.push((msgLen << 3) & 4294967295);
	var wordArrayLen = wordArray.length;
	for (blockstart = 0; blockstart < wordArrayLen; blockstart += 16) {
		for (i = 0; i < 16; i++) {
			W[i] = wordArray[blockstart + i];
		}
		for (i = 16; i <= 79; i++) {
			W[i] = fnRotateLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
		}
		A = H0;
		B = H1;
		C = H2;
		D = H3;
		E = H4;
		for (i = 0; i <= 19; i++) {
			temp = (fnRotateLeft(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 1518500249) & 4294967295;
			E = D;
			D = C;
			C = fnRotateLeft(B, 30);
			B = A;
			A = temp;
		}
		for (i = 20; i <= 39; i++) {
			temp = (fnRotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 1859775393) & 4294967295;
			E = D;
			D = C;
			C = fnRotateLeft(B, 30);
			B = A;
			A = temp;
		}
		for (i = 40; i <= 59; i++) {
			temp = (fnRotateLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E
					+ W[i] + 2400959708) & 4294967295;
			E = D;
			D = C;
			C = fnRotateLeft(B, 30);
			B = A;
			A = temp;
		}
		for (i = 60; i <= 79; i++) {
			temp = (fnRotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 3395469782) & 4294967295;
			E = D;
			D = C;
			C = fnRotateLeft(B, 30);
			B = A;
			A = temp;
		}
		H0 = (H0 + A) & 4294967295;
		H1 = (H1 + B) & 4294967295;
		H2 = (H2 + C) & 4294967295;
		H3 = (H3 + D) & 4294967295;
		H4 = (H4 + E) & 4294967295;
	}
	return (fnCvtHex(H0) + fnCvtHex(H1) + fnCvtHex(H2) + fnCvtHex(H3) + fnCvtHex(H4))
			.toLowerCase();
};
sap.firefly.XString.assertIsString = function(value) {
	if (value !== null && typeof value !== "string") {
		throw new Error("Illegal Argument: value is not a string: "
				+ (typeof value));
	}
};
sap.firefly.XCharArray = function(value) {
	sap.firefly.XObject.call(this);
	this.m_value = value;
};
sap.firefly.XCharArray.prototype = new sap.firefly.XObject();
sap.firefly.XCharArray.create = function(value) {
	return new sap.firefly.XCharArray(value);
};
sap.firefly.XCharArray.prototype.releaseObject = function() {
	this.m_value = null;
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XCharArray.prototype.size = function() {
	return this.m_value.length;
};
sap.firefly.XCharArray.prototype.get = function(pos) {
	return this.m_value.charCodeAt(pos);
};
sap.firefly.XBoolean = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XBoolean.prototype = new sap.firefly.XObject();
sap.firefly.XBoolean.TRUE = "true";
sap.firefly.XBoolean.FALSE = "false";
sap.firefly.XBoolean.convertBooleanToString = function(value) {
	if (value === true) {
		return sap.firefly.XBoolean.TRUE;
	}
	return sap.firefly.XBoolean.FALSE;
};
sap.firefly.XBoolean.convertStringToBoolean = function(value) {
	if (sap.firefly.XBoolean.TRUE === value) {
		return true;
	}
	if (sap.firefly.XBoolean.FALSE === value) {
		return false;
	}
	throw new Error("Illegal Argument:" + value);
};
sap.firefly.XBoolean.convertStringToBooleanWithDefault = function(value,
		defaultValue) {
	if (sap.firefly.XBoolean.TRUE === value) {
		return true;
	}
	if (sap.firefly.XBoolean.FALSE === value) {
		return false;
	}
	return defaultValue;
};
sap.firefly.XInteger = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XInteger.prototype = new sap.firefly.XObject();
sap.firefly.XInteger.convertIntegerToString = function(value) {
	return value.toString();
};
sap.firefly.XInteger.convertIntegerToDouble = function(value) {
	return value;
};
sap.firefly.XInteger.convertStringToInteger = function(value) {
	if (value === null || value.length === 0 || isNaN(value)) {
		throw new Error("Illegal Argument: Value is not a number");
	}
	var intValue = parseInt(value, 10);
	if (isNaN(intValue)) {
		throw new Error("Illegal Argument: Value is not a number: " + value);
	}
	return intValue;
};
sap.firefly.XInteger.convertStringToIntegerWithRadix = function(value, radix) {
	if (value === null || value.length === 0 || isNaN(value)) {
		throw new Error("Illegal Argument: Value is not a number");
	}
	var intValue = parseInt(value, radix);
	if (isNaN(intValue)) {
		throw new Error("Illegal Argument: Value is not a number: " + value);
	}
	return intValue;
};
sap.firefly.XInteger.convertStringToIntegerWithDefault = function(value,
		defaultValue) {
	if (value === null || value.length === 0 || isNaN(value)) {
		return defaultValue;
	}
	var intValue = parseInt(value, 10);
	if (isNaN(intValue)) {
		return defaultValue;
	}
	return intValue;
};
sap.firefly.XLong = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XLong.prototype = new sap.firefly.XObject();
sap.firefly.XLong.convertLongToString = sap.firefly.XInteger.convertIntegerToString;
sap.firefly.XLong.convertLongToDouble = function(value) {
	return value;
};
sap.firefly.XLong.convertStringToLong = sap.firefly.XInteger.convertStringToInteger;
sap.firefly.XLong.convertStringToLongWithDefault = sap.firefly.XInteger.convertStringToIntegerWithDefault;
sap.firefly.XDouble = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XDouble.prototype = new sap.firefly.XObject();
sap.firefly.XDouble.convertDoubleToString = function(value) {
	return value.toString();
};
sap.firefly.XDouble.convertStringToDouble = function(value) {
	if (value === null || value.length === 0 || isNaN(value)) {
		throw new Error("Illegal Argument: Value is not a number: " + value);
	}
	var numberValue = parseFloat(value);
	if (isNaN(numberValue)) {
		throw new Error("Illegal Argument: Value is not a number: " + value);
	}
	return numberValue;
};
sap.firefly.XDouble.convertStringToDoubleWithDefault = function(value,
		defaultValue) {
	if (value === null || value.length === 0 || isNaN(value)) {
		return defaultValue;
	}
	var numberValue = parseFloat(value);
	if (isNaN(numberValue)) {
		return defaultValue;
	}
	return numberValue;
};
sap.firefly.XDouble.convertDoubleToLong = function(value) {
	return Math.floor(value);
};
sap.firefly.XDouble.convertDoubleToInt = function(value) {
	return parseInt(value, 10);
};
sap.firefly.XStringBuffer = function() {
	sap.firefly.XObject.call(this);
	this.m_stringBuffer = "";
};
sap.firefly.XStringBuffer.prototype = new sap.firefly.XObject();
sap.firefly.XStringBuffer.create = function() {
	return new sap.firefly.XStringBuffer();
};
sap.firefly.XStringBuffer.prototype.releaseObject = function() {
	this.m_stringBuffer = null;
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XStringBuffer.prototype.append = function(value) {
	if (value !== null) {
		this.m_stringBuffer += value;
	}
	return this;
};
sap.firefly.XStringBuffer.prototype.appendChar = function(value) {
	this.m_stringBuffer += String.fromCharCode(value);
	return this;
};
sap.firefly.XStringBuffer.prototype.appendInt = function(value) {
	this.m_stringBuffer += value;
	return this;
};
sap.firefly.XStringBuffer.prototype.appendDouble = sap.firefly.XStringBuffer.prototype.appendInt;
sap.firefly.XStringBuffer.prototype.appendLong = sap.firefly.XStringBuffer.prototype.appendInt;
sap.firefly.XStringBuffer.prototype.appendBoolean = function(value) {
	this.m_stringBuffer += sap.firefly.XBoolean.convertBooleanToString(value);
	return this;
};
sap.firefly.XStringBuffer.prototype.appendNewLine = function() {
	this.m_stringBuffer += "\n";
	return this;
};
sap.firefly.XStringBuffer.prototype.toString = function() {
	return this.m_stringBuffer;
};
sap.firefly.XStringBuffer.prototype.length = function() {
	return this.m_stringBuffer.length;
};
sap.firefly.XStringBuffer.prototype.clear = function() {
	this.m_stringBuffer = "";
};
sap.firefly.XCharArray = function(value) {
	sap.firefly.XObject.call(this);
	this.m_value = value;
};
sap.firefly.XCharArray.prototype = new sap.firefly.XObject();
sap.firefly.XCharArray.create = function(value) {
	return new sap.firefly.XCharArray(value);
};
sap.firefly.XCharArray.prototype.releaseObject = function() {
	this.m_value = null;
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XCharArray.prototype.size = function() {
	return this.m_value.length;
};
sap.firefly.XCharArray.prototype.get = function(pos) {
	return this.m_value.charCodeAt(pos);
};
sap.firefly.XClass = function(clazzPrototype) {
	sap.firefly.XObject.call(this);
	this.m_clazzPrototype = clazzPrototype;
};
sap.firefly.XClass.prototype = new sap.firefly.XObject();
sap.firefly.XClass.create = function(clazzPrototype) {
	return new sap.firefly.XClass(clazzPrototype);
};
sap.firefly.XClass.createByName = function(clazzName) {
	if (clazzName === null || clazzName === undefined) {
		return null;
	}
	return this.create(sap.firefly[clazzName]);
};
sap.firefly.XClass.getCanonicalClassName = function(object) {
	if (object === undefined || object.clazzName === undefined) {
		return "[unknown class]";
	}
	return object.clazzName;
};
sap.firefly.XClass.isXObjectReleased = function(targetObject) {
	if (targetObject === null) {
		return true;
	}
	return targetObject.isReleased ? targetObject.isReleased() : false;
};
sap.firefly.XClass.callFunction = function(functionObj, param1, param2, param3) {
	var getType = {};
	var isFunction = functionObj
			&& getType.toString.call(functionObj) === "[object Function]";
	if (isFunction) {
		if ((param1 === null) && (param2 === null) && (param3 === null)) {
			functionObj();
		} else {
			functionObj(param1, param2, param3);
		}
		return true;
	}
	return false;
};
sap.firefly.XClass.initializeClass = function(clazzName) {
};
sap.firefly.XClass.prototype.releaseObject = function() {
	this.m_clazzPrototype = null;
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XClass.prototype.getNativeName = function() {
	return "Prototype";
};
sap.firefly.XClass.prototype.getNativeElement = function() {
	return this.m_clazzPrototype;
};
sap.firefly.XClass.prototype.newInstance = function() {
	var clazzObject = $Firefly
			.createByPrototype(this.m_clazzPrototype.prototype);
	return clazzObject;
};
sap.firefly.XClass.prototype.toString = function() {
	return "Prototype";
};
sap.firefly.XCharset = function() {
	sap.firefly.XObject.call(this);
};
sap.firefly.XCharset.prototype = new sap.firefly.XObject();
sap.firefly.XCharset.USASCII = 0;
sap.firefly.XCharset._USASCII = "US-ASCII";
sap.firefly.XCharset.UTF8 = 1;
sap.firefly.XCharset._UTF8 = "UTF-8";
sap.firefly.XCharset.lookupCharsetName = function(theConstant) {
	if (theConstant === sap.firefly.XCharset.UTF8) {
		return sap.firefly.XCharset._UTF8;
	}
	return sap.firefly.XCharset._USASCII;
};
sap.firefly.XByteArray = function(nativeByteArrayObject) {
	sap.firefly.XObject.call(this);
	this.m_nativeByteArray = nativeByteArrayObject;
};
sap.firefly.XByteArray.prototype = new sap.firefly.XObject();
sap.firefly.XByteArray.create = function(nativeByteArrayObject, size) {
	if (nativeByteArrayObject === null) {
		return new sap.firefly.XByteArray(new Array(size));
	}
	return new sap.firefly.XByteArray(nativeByteArrayObject);
};
sap.firefly.XByteArray.copy = function(src, srcPos, dest, destPos, length) {
	var srcBytes = src.getNative();
	var destBytes = dest.getNative();
	var srcIndex = srcPos;
	var destIndex = destPos;
	var count = 0;
	while (count++ < length) {
		destBytes[destIndex++] = srcBytes[srcIndex++];
	}
};
sap.firefly.XByteArray.convertStringToXByteArray = function(value) {
	return sap.firefly.XByteArray.convertStringToXByteArrayWithCharset(value,
			sap.firefly.XCharset.UTF8);
};
sap.firefly.XByteArray.convertStringToXByteArrayWithCharset = function(value,
		charset) {
	if (sap.firefly.XCharset.UTF8 !== charset) {
		throw new Error("Runtime Exception: Unsupported charset");
	}
	var array = [];
	if ((typeof module !== "undefined") && (this.module !== module)
			&& (module.exports)) {
		array = new Buffer(value, "utf8");
	} else {
		var c;
		for (var n = 0; n < value.length; n++) {
			c = value.charCodeAt(n);
			if (c < 128) {
				array.push(c);
			} else {
				if ((c > 127) && (c < 2048)) {
					array.push((c >> 6) | 192);
					array.push((c & 63) | 128);
				} else {
					array.push((c >> 12) | 224);
					array.push(((c >> 6) & 63) | 128);
					array.push((c & 63) | 128);
				}
			}
		}
	}
	return new sap.firefly.XByteArray(array);
};
sap.firefly.XByteArray.convertXByteArrayToString = function(byteArray) {
	return sap.firefly.XByteArray.convertXByteArrayToStringWithCharset(
			byteArray, sap.firefly.XCharset.UTF8);
};
sap.firefly.XByteArray.convertXByteArrayToStringWithCharset = function(
		byteArray, charset) {
	if (sap.firefly.XCharset.UTF8 !== charset) {
		throw new Error("Runtime Exception: Unsupported charset");
	}
	var array = byteArray.getNative();
	if ((typeof module !== "undefined") && (this.module !== module)
			&& (module.exports)) {
		return new Buffer(array, "binary").toString("utf8");
	}
	var buffer = new sap.firefly.XStringBuffer();
	var i = 0;
	var c1 = 0;
	var c2 = 0;
	var c3 = 0;
	while (i < array.length) {
		c1 = array[i];
		if (c1 < 128) {
			buffer.append(String.fromCharCode(c1));
			++i;
		} else {
			if ((c1 > 191) && (c1 < 224)) {
				c2 = array[i + 1];
				buffer
						.append(String.fromCharCode(((c1 & 31) << 6)
								| (c2 & 63)));
				i += 2;
			} else {
				c2 = array[i + 1];
				c3 = array[i + 2];
				buffer.append(String.fromCharCode(((c1 & 15) << 12)
						| ((c2 & 63) << 6) | (c3 & 63)));
				i += 3;
			}
		}
	}
	return buffer.toString();
};
sap.firefly.XByteArray.isEqual = function(firstValue, secondValue) {
	return firstValue === secondValue;
};
sap.firefly.XByteArray.prototype.releaseObject = function() {
	this.m_nativeByteArray = null;
	sap.firefly.XObject.prototype.releaseObject.call(this);
};
sap.firefly.XByteArray.prototype.size = function() {
	if (this.m_nativeByteArray === null) {
		return 0;
	}
	return this.m_nativeByteArray.length;
};
sap.firefly.XByteArray.prototype.getByteAt = function(index) {
	return this.m_nativeByteArray[index];
};
sap.firefly.XByteArray.prototype.getNative = function() {
	return this.m_nativeByteArray;
};
sap.firefly.XByteArray.prototype.setNative = function(nativeByteArrayObject) {
	this.m_nativeByteArray = nativeByteArrayObject;
};
sap.firefly.XByteArray.prototype.resetValue = function() {
	throw new Error("Unsupported Operation Exception");
};
sap.firefly.XByteArray.prototype.isEqualTo = function() {
	throw new Error("Unsupported Operation Exception");
};
sap.firefly.XByteArray.prototype.clone = function() {
	throw new Error("Unsupported Operation Exception");
};
sap.firefly.XByteArray.prototype.toString = function() {
	throw new Error("Unsupported Operation Exception");
};
sap.firefly.XMath = function() {
};
sap.firefly.XMath.prototype = {};
sap.firefly.XMath.isNaN = function(value) {
	if (value === null || value === undefined) {
		return true;
	}
	return isNaN(value);
};
sap.firefly.XMath.mod = function(i1, i2) {
	var firstIsNegative = i1 < 0;
	var result;
	if (i2 === 0) {
		throw new Error("Illegal Argument: division by 0");
	}
	if (i1 === 0) {
		return 0;
	}
	if (!firstIsNegative && i2 > 0) {
		return i1 % i2;
	}
	if (firstIsNegative) {
		i1 = -i1;
	}
	if (i2 < 0) {
		i2 = -i2;
	}
	result = i1 % i2;
	if (result === 0) {
		return result;
	}
	if (firstIsNegative) {
		return -result;
	}
	return result;
};
sap.firefly.XMath.div = function(i1, i2) {
	var negativeCounter = 0;
	var result;
	if (i2 === 0) {
		throw new Error("Illegal Argument: division by 0");
	}
	if (i1 === 0) {
		return 0;
	}
	if (i1 > 0 && i2 > 0) {
		return Math.floor(i1 / i2);
	}
	if (i1 < 0) {
		i1 = -i1;
		++negativeCounter;
	}
	if (i2 < 0) {
		i2 = -i2;
		++negativeCounter;
	}
	result = Math.floor(i1 / i2);
	if (result === 0) {
		return result;
	}
	if (negativeCounter === 1) {
		return -result;
	}
	return result;
};
sap.firefly.XMath.binaryAnd = function(value1, value2) {
	return value1 & value2;
};
sap.firefly.XMath.binaryOr = function(value1, value2) {
	return value1 | value2;
};
sap.firefly.XMath.binaryXOr = function(value1, value2) {
	return value1 ^ value2;
};
sap.firefly.XMath.getMinimum = function(firstInteger, secondInteger) {
	if (firstInteger > secondInteger) {
		return secondInteger;
	}
	return firstInteger;
};
sap.firefly.XMath.getMaximum = function(firstInteger, secondInteger) {
	if (firstInteger > secondInteger) {
		return firstInteger;
	}
	return secondInteger;
};
sap.firefly.XMath.clamp = function(lowerBound, upperBound, value) {
	var xMath = sap.firefly.XMath;
	var lowerBoundary = xMath.getMinimum(lowerBound, upperBound);
	var upperBoundary = xMath.getMaximum(lowerBound, upperBound);
	return xMath.getMaximum(lowerBoundary, xMath.getMinimum(value,
			upperBoundary));
};
sap.firefly.XMath.pow = function(a, b) {
	return Math.pow(a, b);
};