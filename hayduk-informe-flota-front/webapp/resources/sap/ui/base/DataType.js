/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var D=function(){throw new Error();};D.prototype.getName=function(){return undefined;};D.prototype.getBaseType=function(){return undefined;};D.prototype.getPrimitiveType=function(){var T=this;while(T.getBaseType()){T=T.getBaseType();}return T;};D.prototype.getComponentType=function(){return undefined;};D.prototype.getDefaultValue=function(){return undefined;};D.prototype.isArrayType=function(){return false;};D.prototype.isEnumType=function(){return false;};D.prototype.getEnumValues=function(){return undefined;};D.prototype.parseValue=function(v){return v;};D.prototype.isValid=undefined;D.prototype.setNormalizer=function(n){this._fnNormalizer=typeof n==="function"?n:undefined;};D.prototype.normalize=function(v){return this._fnNormalizer?this._fnNormalizer(v):v;};function c(n,s,B){s=s||{};var o=B||D.prototype;var T=Object.create(o);T.getName=function(){return n;};if(s.hasOwnProperty("defaultValue")){var v=s.defaultValue;T.getDefaultValue=function(){return v;};}if(s.isValid){var i=s.isValid;T.isValid=o.isValid?function(V){if(!o.isValid(V)){return false;}return i(V);}:i;}if(s.parseValue){T.parseValue=s.parseValue;}T.getBaseType=function(){return B;};return T;}var a=c("array",{defaultValue:[]});function b(e){var T=Object.create(D.prototype);T.getName=function(){return e.getName()+"[]";};T.getComponentType=function(){return e;};T.isValid=function(v){if(v===null){return true;}if(Array.isArray(v)){for(var i=0;i<v.length;i++){if(!e.isValid(v[i])){return false;}}return true;}return false;};T.parseValue=function(v){var V=v.split(",");for(var i=0;i<V.length;i++){V[i]=e.parseValue(V[i]);}return V;};T.isArrayType=function(){return true;};T.getBaseType=function(){return a;};return T;}function d(T,e){var V={},s;for(var n in e){var f=e[n];if(!s){s=f;}if(typeof f!=="string"){throw new Error("Value "+f+" for enum type "+T+" is not a string");}if(!V.hasOwnProperty(f)||n==f){V[f]=n;}}var o=Object.create(D.prototype);o.getName=function(){return T;};o.isValid=function(v){return typeof v==="string"&&V.hasOwnProperty(v);};o.parseValue=function(f){return e[f];};o.getDefaultValue=function(){return s;};o.getBaseType=function(){return t.string;};o.isEnumType=function(){return true;};o.getEnumValues=function(){return e;};return o;}var t={"any":c("any",{defaultValue:null,isValid:function(v){return true;}}),"boolean":c("boolean",{defaultValue:false,isValid:function(v){return typeof v==="boolean";},parseValue:function(v){return v=="true";}}),"int":c("int",{defaultValue:0,isValid:function(v){return typeof v==="number"&&Math.floor(v)==v;},parseValue:function(v){return parseInt(v,10);}}),"float":c("float",{defaultValue:0.0,isValid:function(v){return typeof v==="number";},parseValue:function(v){return parseFloat(v);}}),"string":c("string",{defaultValue:"",isValid:function(v){return typeof v==="string"||v instanceof String;},parseValue:function(v){return v;}}),"object":c("object",{defaultValue:null,isValid:function(v){return typeof v==="object"||typeof v==="function";},parseValue:function(v){return v?JSON.parse(v):null;}}),"function":c("function",{defaultValue:null,isValid:function(v){return v==null||typeof v==='function';},parseValue:function(v){throw new TypeError("values of type function can't be parsed from a string");}})};D.getType=function(T){var o=t[T];if(!(o instanceof D)){if(T.indexOf("[]",T.length-2)>0){var C=T.slice(0,-2),e=this.getType(C);o=e&&b(e);if(o){t[T]=o;}}else if(T!=='array'){o=q.sap.getObject(T);if(o instanceof D){t[T]=o;}else if(q.isPlainObject(o)){o=t[T]=d(T,o);}else{if(o){q.sap.log.warning("'"+T+"' is not a valid data type. Falling back to type 'any'.");o=t.any;}else{q.sap.log.error("data type '"+T+"' could not be found.");o=undefined;}}}}return o;};D.createType=function(n,s,B){if(/[\[\]]/.test(n)){q.sap.log.error("DataType.createType: array types ('something[]') must not be created with createType, "+"they're created on-the-fly by DataType.getType");}if(typeof B==="string"){B=D.getType(B);}B=B||t.any;if(B.isArrayType()||B.isEnumType()){q.sap.log.error("DataType.createType: base type must not be an array- or enum-type");}if(n==='array'||t[n]instanceof D){if(n==='array'||t[n].getBaseType()==null){throw new Error("DataType.createType: primitive or hidden type "+n+" can't be re-defined");}q.sap.log.warning("DataTypes.createType: type "+n+" is redefined. "+"This is an unsupported usage of DataType and might cause issues.");}var T=t[n]=c(n,s,B);return T;};var I={};D.registerInterfaceTypes=function(T){for(var i=0;i<T.length;i++){q.sap.setObject(T[i],I[T[i]]=new String(T[i]));}};D.isInterfaceType=function(T){return I.hasOwnProperty(T)&&q.sap.getObject(T)===I[T];};return D;},true);
