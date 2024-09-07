/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['../base/DataType','../base/Object','../base/ManagedObject','../base/ManagedObjectRegistry','./ElementMetadata','../Device',"sap/ui/performance/trace/Interaction","sap/base/Log","sap/base/assert","sap/ui/thirdparty/jquery","sap/ui/events/F6Navigation","./RenderManager"],function(D,B,M,a,E,b,I,L,c,q,F,R){"use strict";var d=M.extend("sap.ui.core.Element",{metadata:{stereotype:"element","abstract":true,publicMethods:["getId","getMetadata","getTooltip_AsString","getTooltip_Text","getModel","setModel","hasModel","bindElement","unbindElement","getElementBinding","prop","getLayoutData","setLayoutData"],library:"sap.ui.core",aggregations:{tooltip:{name:"tooltip",type:"sap.ui.core.TooltipBase",altTypes:["string"],multiple:false},customData:{name:"customData",type:"sap.ui.core.CustomData",multiple:true,singularName:"customData"},layoutData:{name:"layoutData",type:"sap.ui.core.LayoutData",multiple:false,singularName:"layoutData"},dependents:{name:"dependents",type:"sap.ui.core.Element",multiple:true},dragDropConfig:{name:"dragDropConfig",type:"sap.ui.core.dnd.DragDropBase",multiple:true,singularName:"dragDropConfig"}}},constructor:function(i,S){M.apply(this,arguments);},renderer:null},E);a.apply(d,{onDuplicate:function(i,o,h){if(o._sapui_candidateForDestroy){L.debug("destroying dangling template "+o+" when creating new object with same ID");o.destroy();}else{var m="adding element with duplicate id '"+i+"'";if(sap.ui.getCore().getConfiguration().getNoDuplicateIds()){L.error(m);throw new Error("Error: "+m);}else{L.warning(m);}}}});d.defineClass=function(h,S,m){return B.defineClass(h,S,m||E);};d.prototype.getInterface=function(){return this;};d.prototype._handleEvent=function(o){var t=this,h="on"+o.type;function j(k){var i,l,m;if(k&&(l=k.length)>0){k=l===1?k:k.slice();for(i=0;i<l;i++){if(o.isImmediateHandlerPropagationStopped()){return;}m=k[i].oDelegate;if(m[h]){m[h].call(k[i].vThis===true?t:k[i].vThis||m,o);}}}}j(this.aBeforeDelegates);if(o.isImmediateHandlerPropagationStopped()){return;}if(this[h]){this[h](o);}j(this.aDelegates);};d.prototype.init=function(){};d.prototype.exit=function(){};d.create=M.create;d.prototype.toString=function(){return"Element "+this.getMetadata().getName()+"#"+this.sId;};d.prototype.getDomRef=function(S){return document.getElementById(S?this.getId()+"-"+S:this.getId());};d.prototype.$=function(S){return q(this.getDomRef(S));};d.prototype.isActive=function(){return this.oParent&&this.oParent.isActive();};d.prototype.prop=function(p,v){var P=this.getMetadata().getAllSettings()[p];if(P){if(arguments.length==1){return this[P._sGetter]();}else{this[P._sMutator](v);return this;}}};d.prototype.insertDependent=function(o,i){this.insertAggregation("dependents",o,i,true);return this;};d.prototype.addDependent=function(o){this.addAggregation("dependents",o,true);return this;};d.prototype.removeDependent=function(v){return this.removeAggregation("dependents",v,true);};d.prototype.removeAllDependents=function(){return this.removeAllAggregation("dependents",true);};d.prototype.destroyDependents=function(){this.destroyAggregation("dependents",true);return this;};d.prototype.rerender=function(){if(this.oParent){this.oParent.rerender();}};d.prototype.getUIArea=function(){return this.oParent?this.oParent.getUIArea():null;};d.prototype.destroy=function(S){if(this.bIsDestroyed){return;}var h=!this.getParent();d._updateFocusInfo(this);M.prototype.destroy.call(this,S);this.data=n;var o=this.getDomRef();if(!o){return;}var k=(S==="KeepDom");if(S===true||(!k&&h)||this.isA("sap.ui.core.PopupInterface")||R.isPreservedContent(o)){q(o).remove();}else{o.removeAttribute("data-sap-ui-preserve");if(!k){o.id="sap-ui-destroyed-"+this.getId();for(var i=0,j=o.querySelectorAll('[id^="'+this.getId()+'-"]');i<j.length;i++){j[i].id="sap-ui-destroyed-"+j[i].id;}}}};d.prototype.fireEvent=function(h,p,A,i){if(this.hasListeners(h)){I.notifyStepStart(h,this);}if(typeof p==='boolean'){i=A;A=p;p=null;}p=p||{};p.id=p.id||this.getId();if(d._interceptEvent){d._interceptEvent(h,this,p);}return M.prototype.fireEvent.call(this,h,p,A,i);};d._interceptEvent=undefined;d.prototype.addDelegate=function(o,h,t,i){c(o,"oDelegate must be not null or undefined");if(!o){return this;}this.removeDelegate(o);if(typeof h==="object"){i=t;t=h;h=false;}if(typeof t==="boolean"){i=t;t=undefined;}(h?this.aBeforeDelegates:this.aDelegates).push({oDelegate:o,bClone:!!i,vThis:((t===this)?true:t)});return this;};d.prototype.removeDelegate=function(o){var i;for(i=0;i<this.aDelegates.length;i++){if(this.aDelegates[i].oDelegate==o){this.aDelegates.splice(i,1);i--;}}for(i=0;i<this.aBeforeDelegates.length;i++){if(this.aBeforeDelegates[i].oDelegate==o){this.aBeforeDelegates.splice(i,1);i--;}}return this;};d.prototype.addEventDelegate=function(o,t){return this.addDelegate(o,false,t,true);};d.prototype.removeEventDelegate=function(o){return this.removeDelegate(o);};d.prototype.getFocusDomRef=function(){return this.getDomRef()||null;};function g(o){var p,S=[];p=o.parentNode;while(p){S.push({node:p,scrollLeft:p.scrollLeft,scrollTop:p.scrollTop});p=p.parentNode;}return S;}function r(S){S.forEach(function(o){var h=o.node;if(h.scrollLeft!==o.scrollLeft){h.scrollLeft=o.scrollLeft;}if(h.scrollTop!==o.scrollTop){h.scrollTop=o.scrollTop;}});}d.prototype.focus=function(o){var h=this.getFocusDomRef(),S=[];o=o||{};if(h){if(b.browser.safari){if(o.preventScroll===true){S=g(h);}h.focus();if(S.length>0){setTimeout(r.bind(null,S),0);}}else{h.focus(o);}}};d.prototype.getFocusInfo=function(){return{id:this.getId()};};d.prototype.applyFocusInfo=function(o){this.focus(o);return this;};d.prototype._refreshTooltipBaseDelegate=function(t){var o=this.getTooltip();if(B.isA(o,"sap.ui.core.TooltipBase")){this.removeDelegate(o);}if(B.isA(t,"sap.ui.core.TooltipBase")){t._currentControl=this;this.addDelegate(t);}};d.prototype.setTooltip=function(t){this._refreshTooltipBaseDelegate(t);this.setAggregation("tooltip",t);return this;};d.prototype.getTooltip=function(){return this.getAggregation("tooltip");};d.runWithPreprocessors=M.runWithPreprocessors;d.prototype.getTooltip_AsString=function(){var t=this.getTooltip();if(typeof t==="string"||t instanceof String){return t;}return undefined;};d.prototype.getTooltip_Text=function(){var t=this.getTooltip();if(t&&typeof t.getText==="function"){return t.getText();}return t;};var C=d.extend("sap.ui.core.CustomData",{metadata:{library:"sap.ui.core",properties:{key:{type:"string",group:"Data",defaultValue:null},value:{type:"any",group:"Data",defaultValue:null},writeToDom:{type:"boolean",group:"Data",defaultValue:false}},designtime:"sap/ui/core/designtime/CustomData.designtime"}});C.prototype.setValue=function(v){this.setProperty("value",v,true);var o=this.getParent();if(o&&o.getDomRef()){var h=this._checkWriteToDom(o);if(h){o.$().attr(h.key,h.value);}}return this;};C.prototype._checkWriteToDom=function(o){if(!this.getWriteToDom()){return null;}var k=this.getKey();var v=this.getValue();function h(j){L.error("CustomData with key "+k+" should be written to HTML of "+o+" but "+j);return null;}if(typeof v!="string"){return h("the value is not a string.");}var i=D.getType("sap.ui.core.ID");if(!(i.isValid(k))||(k.indexOf(":")!=-1)){return h("the key is not valid (must be a valid sap.ui.core.ID without any colon).");}if(k==F.fastNavigationKey){v=/^\s*(x|true)\s*$/i.test(v)?"true":"false";}else if(k.indexOf("sap-ui")==0){return h("the key is not valid (may not start with 'sap-ui').");}return{key:"data-"+k,value:v};};function f(h,k){var j=h.getAggregation("customData");if(j){for(var i=0;i<j.length;i++){if(j[i].getKey()==k){return j[i];}}}return null;}function s(h,k,v,w){var o=f(h,k);if(v===null){if(!o){return;}var i=h.getAggregation("customData").length;if(i==1){h.destroyAggregation("customData",true);}else{h.removeAggregation("customData",o,true);o.destroy();}}else if(o){o.setValue(v);o.setWriteToDom(w);}else{h.addAggregation("customData",new C({key:k,value:v,writeToDom:w}),true);}}d.prototype.data=function(){var h=arguments.length;if(h==0){var j=this.getAggregation("customData"),k={};if(j){for(var i=0;i<j.length;i++){k[j[i].getKey()]=j[i].getValue();}}return k;}else if(h==1){var l=arguments[0];if(l===null){this.destroyAggregation("customData",true);return this;}else if(typeof l=="string"){var m=f(this,l);return m?m.getValue():null;}else if(typeof l=="object"){for(var o in l){s(this,o,l[o]);}return this;}else{throw new TypeError("When data() is called with one argument, this argument must be a string, an object or null, but is "+(typeof l)+":"+l+" (on UI Element with ID '"+this.getId()+"')");}}else if(h==2){s(this,arguments[0],arguments[1]);return this;}else if(h==3){s(this,arguments[0],arguments[1],arguments[2]);return this;}else{throw new TypeError("data() may only be called with 0-3 arguments (on UI Element with ID '"+this.getId()+"')");}};d._CustomData=C;function n(){var h=arguments.length;if(h===1&&arguments[0]!==null&&typeof arguments[0]=="object"||h>1&&h<4&&arguments[1]!==null){L.error("Cannot create custom data on an already destroyed element '"+this+"'");return this;}return d.prototype.data.apply(this,arguments);}d.prototype.clone=function(h,l){var o=M.prototype.clone.apply(this,arguments);for(var i=0;i<this.aDelegates.length;i++){if(this.aDelegates[i].bClone){o.aDelegates.push(this.aDelegates[i]);}}for(var k=0;k<this.aBeforeDelegates.length;k++){if(this.aBeforeDelegates[k].bClone){o.aBeforeDelegates.push(this.aBeforeDelegates[k]);}}if(this._sapui_declarativeSourceInfo){o._sapui_declarativeSourceInfo=Object.assign({},this._sapui_declarativeSourceInfo);}return o;};d.prototype.findElements=M.prototype.findAggregatedObjects;function e(o){var l=o.getParent();if(l){var h=q.Event("LayoutDataChange");h.srcControl=o;l._handleEvent(h);}}d.prototype.setLayoutData=function(l){this.setAggregation("layoutData",l,true);e(this);return this;};d.prototype.destroyLayoutData=function(){this.destroyAggregation("layoutData",true);e(this);return this;};d.prototype.bindElement=M.prototype.bindObject;d.prototype.unbindElement=M.prototype.unbindObject;d.prototype.getElementBinding=M.prototype.getObjectBinding;d.prototype._getFieldGroupIds=function(){var h;if(this.getMetadata().hasProperty("fieldGroupIds")){h=this.getFieldGroupIds();}if(!h||h.length==0){var p=this.getParent();if(p&&p._getFieldGroupIds){return p._getFieldGroupIds();}}return h||[];};d.prototype.getDomRefForSetting=function(S){var o=this.getMetadata().getAllSettings()[S];if(o&&o.selector){var h=this.getDomRef();if(h){h=h.parentNode;if(h&&h.querySelector){var i=o.selector.replace(/\{id\}/g,this.getId().replace(/(:|\.)/g,'\\$1'));return h.querySelector(i);}}}return null;};d.prototype._getMediaContainerWidth=function(){if(typeof this._oContextualSettings==="undefined"){return undefined;}return this._oContextualSettings.contextualWidth;};d.prototype._getCurrentMediaContainerRange=function(N){var w=this._getMediaContainerWidth();N=N||b.media.RANGESETS.SAP_STANDARD;return b.media.getCurrentRange(N,w);};d.prototype._onContextualSettingsChanged=function(){var w=this._getMediaContainerWidth(),S=w!==undefined,p=S^!!this._bUsingContextualWidth,l=this._aContextualWidthListeners||[];if(p){if(S){l.forEach(function(o){b.media.detachHandler(o.callback,o.listener,o.name);});}else{l.forEach(function(o){b.media.attachHandler(o.callback,o.listener,o.name);});}this._bUsingContextualWidth=S;}l.forEach(function(o){var m=this._getCurrentMediaContainerRange(o.name);if(m&&m.from!==o.media.from){o.media=m;o.callback.call(o.listener||window,m);}},this);};d.prototype._attachMediaContainerWidthChange=function(h,l,N){N=N||b.media.RANGESETS.SAP_STANDARD;this._aContextualWidthListeners=this._aContextualWidthListeners||[];this._aContextualWidthListeners.push({callback:h,listener:l,name:N,media:this._getCurrentMediaContainerRange(N)});if(!this._bUsingContextualWidth){b.media.attachHandler(h,l,N);}};d.prototype._detachMediaContainerWidthChange=function(h,l,N){var o;N=N||b.media.RANGESETS.SAP_STANDARD;if(!this._aContextualWidthListeners){return;}for(var i=0,j=this._aContextualWidthListeners.length;i<j;i++){o=this._aContextualWidthListeners[i];if(o.callback===h&&o.listener===l&&o.name===N){if(!this._bUsingContextualWidth){b.media.detachHandler(h,l,N);}this._aContextualWidthListeners.splice(i,1);break;}}};return d;});
