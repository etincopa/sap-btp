/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the base implementation for all model implementations
sap.ui.define(['jquery.sap.global', 'sap/ui/core/format/NumberFormat', 'sap/ui/model/CompositeType', 'sap/ui/model/FormatException', 'sap/ui/model/ParseException', 'sap/ui/model/ValidateException'],
	function(jQuery, NumberFormat, CompositeType, FormatException, ParseException, ValidateException) {
	"use strict";


	/**
	 * Constructor for a Unit type.
	 *
	 * @class
	 * This class represents the Unit composite type.
	 *
	 * @extends sap.ui.model.CompositeType
	 *
	 * @author SAP SE
	 * @version 1.54.7
	 *
	 * @public
	 * @param {object} [oFormatOptions] Formatting options. For a list of all available options, see {@link sap.ui.core.format.NumberFormat#constructor NumberFormat}.
	 * @param {object} [oFormatOptions.source] Additional set of format options to be used if the property in the model is not of type <code>string</code> and needs formatting as well.
	 * 										   If an empty object is given, the grouping is disabled and a dot is used as decimal separator.
	 * @param {object} [oConstraints] Value constraints
	 * @param {float} [oConstraints.minimum] Smallest value allowed for this type
	 * @param {float} [oConstraints.maximum] Largest value allowed for this type
	 * @param {float} [oConstraints.decimals] Largest number of decimals allowed for this type
	 * @param {array} [aDynamicFormatOptionNames] keys for dynamic format options which are used to map additional binding values, e.g. <code>["decimals"]</code>
	 * @alias sap.ui.model.type.Unit
	 */
	var Unit = CompositeType.extend("sap.ui.model.type.Unit", /** @lends sap.ui.model.type.Unit.prototype  */ {

		constructor : function (oFormatOptions, oConstraints, aDynamicFormatOptionNames) {
			CompositeType.apply(this, arguments);
			this.sName = "Unit";
			this.bUseRawValues = true;
			this.aDynamicFormatOptionNames = aDynamicFormatOptionNames;
		}
	});

	Unit.prototype._createInstance = function(oFormatArgs) {
		//merge base format options into object
		if (this.oFormatOptions) {
			oFormatArgs = jQuery.extend({}, this.oFormatOptions, oFormatArgs);
		}
		return NumberFormat.getUnitInstance(oFormatArgs);
	};

	Unit.prototype._getInstance = function(aArgs) {
		var oFormatArgs = this.createFormatOptions(aArgs);
		// Only subclasses of the Unit type use a NumberFormat instance cache.
		// By default a new NumberFormat instance is created everytime.
		if (this.getMetadata().getClass() !== Unit) {

			var oMetadata = this.getMetadata();
			oMetadata._mTypeInstanceCache = oMetadata._mTypeInstanceCache || {};

			var sHashKey = jQuery.sap.hashCode(JSON.stringify(oFormatArgs) || "");
			var oHashedInstance = oMetadata._mTypeInstanceCache[sHashKey];
			if (!oHashedInstance) {
				oHashedInstance = this._createInstance(oFormatArgs);
				oMetadata._mTypeInstanceCache[sHashKey] = oHashedInstance;
			}
			return oHashedInstance;
		} else {
			return this._createInstance(oFormatArgs);
		}
	};

	/**
	 * Clears the cache
	 * @private
	 */
	Unit.prototype._clearInstances = function() {
		if (this.getMetadata().getClass() !== Unit) {

			var oMetadata = this.getMetadata();
			if (oMetadata._mTypeInstanceCache) {
				oMetadata._mTypeInstanceCache = {};
			}
		}
	};

	Unit.prototype.createFormatOptions = function(aValues) {
		var oFormatOptions = {};
		if (this.aDynamicFormatOptionNames && aValues.length >= this.aDynamicFormatOptionNames.length) {

			this.aDynamicFormatOptionNames.forEach(function(sDynamicFormatOptionName, iIndex) {
				if (sDynamicFormatOptionName) {
					oFormatOptions[sDynamicFormatOptionName] = aValues[iIndex];
				}
			});
		}
		return oFormatOptions;
	};

	/**
	 * Extracts arguments from the given value
	 * @param vValue
	 * @returns {Array}
	 */
	Unit.prototype.extractArguments = function(vValue) {
		return Array.isArray(vValue) && vValue.length > 2 ? vValue.slice(2) : [];
	};

	/**
	 * Format the given array containing amount and Unit code to an output value of type string.
	 * Other internal types than 'string' are not supported by the Unit type.
	 * If a source format has been defined for this type, the formatValue does also accept
	 * a string value as input, which will be parsed into an array using the source format.
	 * If aValues is not defined or null, null will be returned.
	 *
	 * @function
	 * @name sap.ui.model.type.Unit.prototype.formatValue
	 * @param {array|string} vValue the array of values or string value to be formatted
	 * @param {string} sInternalType the target type
	 * @return {any} the formatted output value
	 *
	 * @public
	 */
	Unit.prototype.formatValue = function(vValue, sInternalType) {
		var aValues = vValue;
		if (vValue == undefined || vValue == null) {
			return null;
		}
		if (this.oInputFormat) {
			aValues = this.oInputFormat.parse(vValue);
		}
		if (!Array.isArray(aValues)) {
			throw new FormatException("Cannot format Unit: " + vValue + " has the wrong format");
		}
		if (aValues[0] == undefined || aValues[0] == null) {
			return null;
		}
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				this.aDynamicValues = this.extractArguments(aValues);
				this.oOutputFormat = this._getInstance(this.aDynamicValues);
				return this.oOutputFormat.format(aValues);
			case "int":
			case "float":
			case "any":
			default:
				throw new FormatException("Don't know how to format Unit to " + sInternalType);
		}
	};

	/**
	 * Parse a string value to an array containing amount and Unit. Parsing of other
	 * internal types than 'string' is not supported by the Unit type.
	 * In case a source format has been defined, after parsing the Unit is formatted
	 * using the source format and a string value is returned instead.
	 *
	 * @function
	 * @name sap.ui.model.type.Unit.prototype.parseValue
	 * @param {any} vValue the value to be parsed
	 * @param {string} sInternalType the source type
	 * @param {array} aCurrentValues the current values of all binding parts
	 * @return {array|string} the parse result array
	 *
	 * @public
	 */
	Unit.prototype.parseValue = function(vValue, sInternalType) {
		var vResult, oBundle;
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				this.oOutputFormat = this.oOutputFormat || this._getInstance();
				vResult = this.oOutputFormat.parse(vValue);
				if (!Array.isArray(vResult)) {
					oBundle = sap.ui.getCore().getLibraryResourceBundle();
					throw new ParseException(oBundle.getText("Unit.Invalid", [vValue]));
				}
				break;
			case "int":
			case "float":
			default:
				throw new ParseException("Don't know how to parse Unit from " + sInternalType);
		}
		if (this.oInputFormat) {
			vResult = this.oInputFormat.format(vResult);
		}
		return vResult;
	};

	Unit.prototype.validateValue = function(vValue) {
		if (this.oConstraints) {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
				aViolatedConstraints = [],
				aMessages = [],
				aValues = vValue,
				iValue;
			if (this.oInputFormat) {
				aValues = this.oInputFormat.parse(vValue);
			}
			iValue = aValues[0];
			jQuery.each(this.oConstraints, function(sName, oContent) {
				switch (sName) {
					case "minimum":
						if (iValue < oContent) {
							aViolatedConstraints.push("minimum");
							aMessages.push(oBundle.getText("Unit.Minimum", [oContent]));
						}
						break;
					case "maximum":
						if (iValue > oContent) {
							aViolatedConstraints.push("maximum");
							aMessages.push(oBundle.getText("Unit.Maximum", [oContent]));
						}
						break;
					case "decimals":
						var tempValue = NumberFormat._shiftDecimalPoint(iValue, oContent);
						if (Math.floor(tempValue) !== tempValue) {
							aViolatedConstraints.push("decimals");
							aMessages.push(oBundle.getText("Unit.Decimals", [oContent]));
						}
						break;
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new ValidateException(aMessages.join(" "), aViolatedConstraints);
			}
		}
	};

	Unit.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
		this._clearInstances();
		this._createInputFormat();
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	Unit.prototype._handleLocalizationChange = function() {
		this._clearInstances();
		this._createInputFormat();
	};

	Unit.prototype._createInputFormat = function() {
		var oSourceOptions = this.oFormatOptions.source;
		if (oSourceOptions) {
			if (jQuery.isEmptyObject(oSourceOptions)) {
				oSourceOptions = {
					groupingEnabled: false,
					groupingSeparator: ",",
					decimalSeparator: "."
				};
			}
			this.oInputFormat = NumberFormat.getUnitInstance(oSourceOptions);
		}
	};

	return Unit;

});
