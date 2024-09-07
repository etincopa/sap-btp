var sap = sap || {};
sap.designstudio = sap.designstudio || {};
sap.designstudio.sdk = sap.designstudio.sdk || {};

sap.designstudio.sdk.PropertyPage = function() {

	sap.designstudio.sdk.PropertyPage.instance = this;

	this.init = function() {
		// Override
	};

	this.componentSelected = function() {
		// Override
	};
	
	this.log = function(severiry, message) {
		eclipse_logJavaScriptMessage(severiry, message);
	};

	this.firePropertiesChanged = function(aPropertyNames) {
		if (this._inUpdate) {
			eclipse_logJavaScriptMessage("firePropertiesChanged called during property update: " + JSON.stringify(aPropertyNames) , "error");
			// The following "return" would be desirable to prevent endless recursion and event cascades
			// But it would be incompatible, so we probably can't do it.
			// return;			
		}
		var aPropertyValues = [];
		for ( var i = 0; i < aPropertyNames.length; i++) {
			var propertyName = aPropertyNames[i];
			var propHandler = this[propertyName];
			var value = propHandler.call(this);
			if (Array.isArray(value) || (typeof value == "object")) {
				value = JSON.stringify(value);
			}
			aPropertyValues[i] = value;
		}
		ds_propertyValuesChanged(aPropertyNames, aPropertyValues);
	};

	this.openPropertyDialog = function(propertyName) {
		ds_openPropertyDialog(propertyName);
	};
	
	this.callZTLFunction = function(sName, fCallback) {
		var args = Array.prototype.slice.apply(arguments); // First convert to normal array
		args = args.slice(2); // now cut the non-needed stuff
		var result = ds_callZTLFunction(sName, JSON.stringify(args));
		fCallback(JSON.parse(result));
	};
	
	this.callRuntimeHandler = function() {
		return ds_callComponentHandler.apply(null, arguments);
	};

};

sap.designstudio.sdk.PropertyPage.subclass = function(sName, fConstructor) {
	var aParts = sName.split(".");
	var lastScope = window;
	for ( var i = 0; i < aParts.length - 1; i++) {
		var sPart = aParts[i];
		var newScope = lastScope[sPart] || {};
		lastScope[sPart] = newScope;
		lastScope = newScope;
	}

	var sFunctionName = aParts[i];
	var fConstructorCallingSuper = function() {
		sap.designstudio.sdk.PropertyPage.apply(this, arguments);
		fConstructor.apply(this, arguments);
	};
	lastScope[sFunctionName] = fConstructorCallingSuper;

	return fConstructorCallingSuper;
};

function ds_init() {
	if (sap.designstudio.sdk.PropertyPage.instance) {
		sap.designstudio.sdk.PropertyPage.instance.init();
	}
}

function ds_componentSelected() {
	if (sap.designstudio.sdk.PropertyPage.instance) {
		sap.designstudio.sdk.PropertyPage.instance.componentSelected();
	}
}

function ds_setPropertyValues(data) {
	var instance = sap.designstudio.sdk.PropertyPage.instance;
	if (instance) {
		if (instance.beforeUpdate){
			instance.beforeUpdate();
		}
		instance._inUpdate=true;
		var oldValues = {}, propertyName, propHandler;
		// First get all the old values
		for (propertyName in data) {
			if (data.hasOwnProperty(propertyName)) {
				propHandler = instance[propertyName];
				if (propHandler) {
					oldValues[propertyName] = propHandler.call(instance);
				}
			}
		}
		// Update the values that have changed
		for (propertyName in data) {
			if (data.hasOwnProperty(propertyName)) {
				propHandler = instance[propertyName];
				if (propHandler) {
					var newValue = data[propertyName];
					if (oldValues[propertyName] !== newValue) {
						propHandler.call(instance, newValue);
					}
				}
			}
		}
		instance._inUpdate=false;
		if (instance.afterUpdate){
			instance.afterUpdate();
		}
	}
}

// Load jQuery
(function() {
	if (!window.jQuery) {
		// Adding a script include object to the document header leads to Javascript errors
		// as the script execution is done asynchronously and sometimes comes too late.
		// Therefore we use this synchronous way of fetching jquery to guarantee
		// that it is executed before the SDK component's Javascript init method runs.

		var xhrObj = (window.XMLHttpRequest) ? new XMLHttpRequest() : null;
	     if (!xhrObj) {
	        throw new Error("Could not find any XMLHttpRequest alternative.");
	    }		
		
		// open and send a synchronous request
		xhrObj.open('GET', "/aad/resources/jquery-1.7.1.js", false);
		xhrObj.send('');
		// add the returned content to a newly created script tag
		var se = document.createElement('script');
		se.type = "text/javascript";
		se.text = xhrObj.responseText;
		document.getElementsByTagName('head')[0].appendChild(se);		
	}
})();
