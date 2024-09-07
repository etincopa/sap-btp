/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./library','sap/ui/core/Control','sap/ui/core/delegate/ScrollEnablement','sap/ui/Device','sap/ui/core/InvisibleText','sap/ui/core/ResizeHandler','./TokenizerRenderer',"sap/ui/dom/containsOrEquals","sap/ui/events/KeyCodes","sap/base/Log","sap/ui/core/EnabledPropagator","sap/ui/thirdparty/jquery","sap/ui/dom/jquery/control"],function(l,C,S,D,I,R,T,c,K,L,E,q){"use strict";var a=C.extend("sap.m.Tokenizer",{metadata:{library:"sap.m",properties:{editable:{type:"boolean",group:"Misc",defaultValue:true},width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},maxWidth:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"100%"}},defaultAggregation:"tokens",aggregations:{tokens:{type:"sap.m.Token",multiple:true,singularName:"token"},_tokensInfo:{type:"sap.ui.core.InvisibleText",multiple:false,visibility:"hidden"}},associations:{ariaDescribedBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaDescribedBy"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}},events:{tokenChange:{parameters:{type:{type:"string"},token:{type:"sap.m.Token"},tokens:{type:"sap.m.Token[]"},addedTokens:{type:"sap.m.Token[]"},removedTokens:{type:"sap.m.Token[]"}}},tokenUpdate:{allowPreventDefault:true,parameters:{type:{type:"string"},addedTokens:{type:"sap.m.Token[]"},removedTokens:{type:"sap.m.Token[]"}}}}}});var r=sap.ui.getCore().getLibraryResourceBundle("sap.m");E.apply(a.prototype,[true]);a.prototype.init=function(){this.bAllowTextSelection=false;this._oTokensWidthMap={};this._oIndicator=null;this._bAdjustable=false;this._aTokenValidators=[];this._oScroller=new S(this,this.getId()+"-scrollContainer",{horizontal:true,vertical:false,nonTouchScrolling:true});if(sap.ui.getCore().getConfiguration().getAccessibility()){var A=new I({text:r.getText("TOKENIZER_ARIA_CONTAIN_TOKEN")});this.setAggregation("_tokensInfo",A);}};a.prototype._handleNMoreIndicatorPress=function(f){this._fnOnNMorePress=f;};a.prototype._hasMoreIndicator=function(){var d=this.$();return!!d.length&&this.$().find(".sapMHiddenToken").length>0;};a.prototype._adjustTokensVisibility=function(){if(!this.getDomRef()){return;}var t=parseInt(this.getMaxWidth()),b=this._getVisibleTokens().reverse(),i=b.length,d,f,e,F=-1;b.some(function(o,g){t=t-this._oTokensWidthMap[o.getId()];if(t<=0){F=g;return true;}else{f=t;}}.bind(this));if(F>-1){for(e=0;e<i;e++){if(e>=F){b[e].addStyleClass("sapMHiddenToken");}else{b[e].removeStyleClass("sapMHiddenToken");}}this._handleNMoreIndicator(i-F);d=this._oIndicator.width();if(d>=f){F=F-1;this._handleNMoreIndicator(i-F);b[F].addStyleClass("sapMHiddenToken");}}else{this._showAllTokens();}};a.prototype._handleNMoreIndicator=function(h){if(!this.getDomRef()){return this;}if(h){var s="MULTIINPUT_SHOW_MORE_TOKENS";if(h===this._getVisibleTokens().length){this.$().css("overflow","visible");if(h===1){s="TOKENIZER_SHOW_ALL_ITEM";}else{s="TOKENIZER_SHOW_ALL_ITEMS";}}this._oIndicator.removeClass("sapUiHidden");this._oIndicator.html(r.getText(s,h));}else{this.$().css("overflow","hidden");this._oIndicator.addClass("sapUiHidden");}return this;};a.prototype._getVisibleTokens=function(){return this.getTokens().filter(function(t){return t.getVisible();});};a.prototype._showAllTokens=function(){this._handleNMoreIndicator(0);this._getVisibleTokens().forEach(function(t){t.removeStyleClass("sapMHiddenToken");});};a.prototype.getScrollDelegate=function(){return this._oScroller;};a.prototype.scrollToEnd=function(){var d=this.getDomRef(),t;if(!d){return;}if(!this._sResizeHandlerId){t=this;this._sResizeHandlerId=R.register(d,function(){t.scrollToEnd();});}var s=this.$().find(".sapMTokenizerScrollContainer")[0];d.scrollLeft=s.scrollWidth;};a.prototype.setMaxWidth=function(w){this.setProperty("maxWidth",w,true);this.$().css("max-width",this.getMaxWidth());if(this.getDomRef()&&this._getAdjustable()){this._adjustTokensVisibility();}return this;};a.prototype._getIndicatorVisibility=function(){return this._oIndicator&&!this._oIndicator.hasClass("sapUiHidden");};a.prototype._setAdjustable=function(A){this._bAdjustable=A;};a.prototype._getAdjustable=function(){return this._bAdjustable;};a.prototype.setPixelWidth=function(n){if(typeof n!=="number"){L.warning("Tokenizer.setPixelWidth called with invalid parameter. Expected parameter of type number.");return;}this.setWidth(n+"px");if(this._oScroller){this._oScroller.refresh();}};a.prototype.scrollToStart=function(){var d=this.getDomRef();if(!d){return;}this._deactivateScrollToEnd();d.scrollLeft=0;};a.prototype._deactivateScrollToEnd=function(){this._deregisterResizeHandler();};a.prototype.getScrollWidth=function(){if(!this.getDomRef()){return 0;}return this.$().children(".sapMTokenizerScrollContainer")[0].scrollWidth;};a.prototype.onBeforeRendering=function(){this._setTokensAria();this._deregisterResizeHandler();};a.prototype.onAfterRendering=function(){var t=this.getTokens(),b=t.length;this.scrollToEnd();this._oIndicator=this.$().find(".sapMTokenizerIndicator");for(var i=0;i<b;i++){var o=t[i].getDomRef();if(o){o.setAttribute("aria-posinset",i+1);o.setAttribute("aria-setsize",b);}}if(this._getAdjustable()){this._useCollapsedMode(this._hasMoreIndicator(),true);}};a.prototype.onThemeChanged=function(){if(!this._getAdjustable()){return;}this.getTokens().forEach(function(t){if(t.getDomRef()&&!t.$().hasClass("sapMHiddenToken")){this._oTokensWidthMap[t.getId()]=t.$().outerWidth(true);}}.bind(this));this._adjustTokensVisibility();};a.prototype._useCollapsedMode=function(b,s){var p=this.getParent(),t=this._getVisibleTokens();if(!t.length){return;}if(b){this._adjustTokensVisibility();}else{this._showAllTokens();}if(!s){p._syncInputWidth&&setTimeout(p["_syncInputWidth"].bind(p,this),0);}};a.prototype.invalidate=function(o){var p=this.getParent();if(p instanceof sap.m.MultiInput){p.invalidate(o);}else{C.prototype.invalidate.call(this,o);}};a.prototype.onsapfocusleave=function(e){if(document.activeElement==this.getDomRef()||!this._checkFocus()){this._changeAllTokensSelection(false);this._oSelectionOrigin=null;}};a.prototype.isAllTokenSelected=function(){if(this._getVisibleTokens().length===this.getSelectedTokens().length){return true;}return false;};a.prototype.onkeydown=function(e){var s;if(!this.getEnabled()){return;}if(e.which===K.TAB){this._changeAllTokensSelection(false);}if((e.ctrlKey||e.metaKey)&&e.which===K.A){this._iSelectedToken=this.getSelectedTokens().length;s=this.getSelectedTokens().length<this._getVisibleTokens().length;if(this._getVisibleTokens().length>0){this.focus();this._changeAllTokensSelection(s);e.preventDefault();e.stopPropagation();}}if((e.ctrlKey||e.metaKey)&&(e.which===K.C||e.which===K.INSERT)){this._copy();}if(((e.ctrlKey||e.metaKey)&&e.which===K.X)||(e.shiftKey&&e.which===K.DELETE)){if(this.getEditable()){this._cut();}else{this._copy();}}};a.prototype.onsappreviousmodifiers=function(e){this.onsapprevious(e);};a.prototype.onsapnextmodifiers=function(e){this.onsapnext(e);};a.prototype.onsaphomemodifiers=function(e){this._selectRange(false);};a.prototype.onsapendmodifiers=function(e){this._selectRange(true);};a.prototype._selectRange=function(f){var o={},t=this._getVisibleTokens(),F=q(document.activeElement).control()[0],b=t.indexOf(F);if(!F||!F.isA("sap.m.Token")){return;}if(f){o.start=b;o.end=t.length-1;}else{o.start=0;o.end=b;}if(o.start<o.end){for(var i=o.start;i<=o.end;i++){t[i].setSelected(true);}}};a.prototype._copy=function(){var s=this.getSelectedTokens(),b="",t,d=function(e){if(e.clipboardData){e.clipboardData.setData('text/plain',b);}else{e.originalEvent.clipboardData.setData('text/plain',b);}e.preventDefault();};for(var i=0;i<s.length;i++){t=s[i];b+=(i>0?"\r\n":"")+t.getText();}if(!b){return;}if(D.browser.msie&&window.clipboardData){window.clipboardData.setData("text",b);}else{document.addEventListener('copy',d);document.execCommand('copy');document.removeEventListener('copy',d);}};a.prototype._cut=function(){var s=this,b=s.getSelectedTokens(),d="",e=[],f,t,g=function(o){if(o.clipboardData){o.clipboardData.setData('text/plain',d);}else{o.originalEvent.clipboardData.setData('text/plain',d);}o.preventDefault();};f=s.fireTokenUpdate({addedTokens:[],removedTokens:e,type:a.TokenUpdateType.Removed});for(var i=0;i<b.length;i++){t=b[i];d+=(i>0?"\r\n":"")+t.getText();if(f&&t.getEditable()){s.removeToken(t);e.push(t);t.destroy();}}if(!d){return;}if(D.browser.msie&&window.clipboardData){window.clipboardData.setData("text",d);}else{document.addEventListener('cut',g);document.execCommand('cut');document.removeEventListener('cut',g);}};a.prototype.onsapbackspace=function(e){var s=this.getSelectedTokens();if(!this.getEnabled()){return;}if(s.length<2){this.onsapprevious(e);}else{this._focusUnselectedToken(e);}this._handleKeyboardDelete(e);e.setMarked();};a.prototype._focusUnselectedToken=function(e){var s=this.getSelectedTokens(),t=this._getVisibleTokens(),i,o;if(e.keyCode===K.DELETE){i=t.indexOf(s[s.length-1]);o=t[i+1];}if(e.keyCode===K.BACKSPACE){i=t.indexOf(s[0]);o=t[i-1];}if(o){o.focus();}else{e.setMarked("forwardFocusToParent");this.focus();}};a.prototype.onsapdelete=function(e){var s;if(!this.getEnabled()){return;}s=this.getSelectedTokens();if(s.length<2){this.onsapnext(e);}else{this._focusUnselectedToken(e);}this._handleKeyboardDelete(e);e.setMarked();};a.prototype._handleKeyboardDelete=function(e){var t;if(this.getEditable()){t=q(e.target).control()[0];if(t&&t.isA("sap.m.Token")){this.handleTokenDeletion(t);}this._removeSelectedTokens();if(!this._getVisibleTokens().length){e.setMarked("forwardFocusToParent");}}};a.prototype._ensureTokenVisible=function(t){if(!t||!t.getDomRef()||!this.getDomRef()){return;}var i=this.$().offset().left,b=this.$().width(),d=t.$().offset().left,e=t.$().width();if(this._getVisibleTokens().indexOf(t)==0){this.$().scrollLeft(0);return;}if(d<i){this.$().scrollLeft(this.$().scrollLeft()-i+d);}if(d-i+e>b){this.$().scrollLeft(this.$().scrollLeft()+(d-i+e-b));}};a.prototype.onsapprevious=function(e){var t=this._getVisibleTokens(),i=t.length;if(i===0){return;}var f=q(document.activeElement).control()[0];var b=f?t.indexOf(f):-1;if(b==0){e.setMarked("forwardFocusToParent");return;}var d,g;if(b>0){d=t[b-1];d.focus();}else{d=t[t.length-1];d.focus({preventScroll:true});}if(e.shiftKey){g=t[b];d.setSelected(true);g.setSelected(true);}this._deactivateScrollToEnd();this._ensureTokenVisible(d);e.setMarked();e.preventDefault();};a.prototype.onsapnext=function(e){var t=this._getVisibleTokens(),i=t.length;if(i===0){return;}var f=q(document.activeElement).control()[0];var b=f?t.indexOf(f):-1;if(b<i-1){var n=t[b+1],d=t[b];n.focus();if(e.shiftKey){n.setSelected(true);d.setSelected(true);}this._ensureTokenVisible(n);}else{e.setMarked("forwardFocusToParent");return;}this._deactivateScrollToEnd();e.setMarked();e.preventDefault();};a.prototype.addValidator=function(v){if(typeof(v)==="function"){this._aTokenValidators.push(v);}};a.prototype.removeValidator=function(v){var i=this._aTokenValidators.indexOf(v);if(i!==-1){this._aTokenValidators.splice(i,1);}};a.prototype.removeAllValidators=function(){this._aTokenValidators=[];};a.prototype._validateToken=function(p,v){var t=p.token;var s;if(t&&t.getText()){s=t.getText();}else{s=p.text;}var V=p.validationCallback;var o=p.suggestionObject;var i,b,d;if(!v){v=this._aTokenValidators;}d=v.length;if(d===0){if(!t&&V){V(false);}return t;}for(i=0;i<d;i++){b=v[i];t=b({text:s,suggestedToken:t,suggestionObject:o,asyncCallback:this._getAsyncValidationCallback(v,i,s,o,V)});if(!t){if(V){V(false);}return null;}if(t===a.WaitForAsyncValidation){return null;}}return t;};a.prototype._getAsyncValidationCallback=function(v,V,i,s,f){var t=this,A;return function(o){if(o){v=v.slice(V+1);o=t._validateToken({text:i,token:o,suggestionObject:s,validationCallback:f},v);A=t._addUniqueToken(o,f);if(A){t.fireTokenUpdate({addedTokens:[o],removedTokens:[],type:a.TokenUpdateType.Added});}}else{if(f){f(false);}}};};a.prototype.addValidateToken=function(p){var t=this._validateToken(p);this._addUniqueToken(t,p.validationCallback);};a.prototype._addValidateToken=function(p){var t=this._validateToken(p),A=this._addUniqueToken(t,p.validationCallback);if(A){this.fireTokenUpdate({addedTokens:[t],removedTokens:[],type:a.TokenUpdateType.Added});}};a.prototype._addUniqueToken=function(t,v){if(!t){return false;}var b=this._tokenExists(t);if(b){var p=this.getParent();if(p instanceof sap.m.MultiInput&&v){v(false);}return false;}this.addToken(t);if(v){v(true);}this.fireTokenChange({addedTokens:[t],removedTokens:[],type:a.TokenChangeType.TokensChanged});return true;};a.prototype._parseString=function(s){return s.split(/\r\n|\r|\n/g);};a.prototype._checkFocus=function(){return this.getDomRef()&&c(this.getDomRef(),document.activeElement);};a.prototype._tokenExists=function(t){var b=this.getTokens();if(!(b&&b.length)){return false;}var k=t.getKey();if(!k){return false;}var d=b.length;for(var i=0;i<d;i++){var e=b[i];var f=e.getKey();if(f===k){return true;}}return false;};a.prototype.addToken=function(t,s){var p=this.getParent();t.setProperty("editableParent",this.getEditable());if(p instanceof sap.m.MultiInput){if(p.getMaxTokens()!==undefined&&p.getTokens().length>=p.getMaxTokens()){return this;}}this.addAggregation("tokens",t,s);this.fireTokenChange({token:t,type:a.TokenChangeType.Added});t.addEventDelegate({onAfterRendering:function(){if(sap.ui.getCore().isThemeApplied()&&t.getDomRef()&&!t.$().hasClass("sapMHiddenToken")){this._oTokensWidthMap[t.getId()]=t.$().outerWidth(true);}}.bind(this)});return this;};a.prototype.removeToken=function(t){t=this.removeAggregation("tokens",t);this._bScrollToEndIsActive=true;this.fireTokenChange({token:t,type:a.TokenChangeType.Removed});return t;};a.prototype.setTokens=function(t){var o=this.getTokens();this.removeAllTokens(false);var i;for(i=0;i<t.length;i++){this.addToken(t[i],true);}this.invalidate();this.fireTokenChange({addedTokens:t,removedTokens:o,type:a.TokenChangeType.TokensChanged});};a.prototype.removeAllTokens=function(f){var t=this.getTokens();var b=this.removeAllAggregation("tokens");if(typeof(f)==="boolean"&&!f){return b;}this.fireTokenChange({addedTokens:[],removedTokens:t,type:a.TokenChangeType.TokensChanged});this.fireTokenChange({tokens:t,type:a.TokenChangeType.RemovedAll});return b;};a.prototype.updateTokens=function(){this.destroyTokens();this.updateAggregation("tokens");};a.prototype._removeSelectedTokens=function(){var t=this.getSelectedTokens();if(t.length===0){return this;}this.handleTokenDeletion(t);this._doSelect();return this;};a.prototype.handleTokenDeletion=function(t){var e,i,o,b=[];b=b.concat(t);e=this.fireTokenUpdate({addedTokens:[],removedTokens:b,type:a.TokenUpdateType.Removed});if(!e){return;}for(i=0;i<b.length;i++){o=b[i];if(o.getEditable()){o.destroy();}}this.scrollToEnd();this.fireTokenChange({addedTokens:[],removedTokens:b,type:a.TokenChangeType.TokensChanged});};a.prototype.selectAllTokens=function(s){if(s===undefined){s=true;}var t=this._getVisibleTokens(),b=t.length,i;for(i=0;i<b;i++){t[i].setSelected(s);}this._doSelect();return this;};a.prototype._changeAllTokensSelection=function(s,b){var t=this._getVisibleTokens(),d=t.length,e,i;for(i=0;i<d;i++){e=t[i];if(e!==b){e._changeSelection(s);}}this._doSelect();return this;};a.prototype.getSelectedTokens=function(){var s=[],t=this._getVisibleTokens(),i,b,d=t.length;for(i=0;i<d;i++){b=t[i];if(b.getSelected()){s.push(b);}}return s;};a.prototype._onTokenDelete=function(t){if(t&&this.getEditable()&&this.getEnabled()){var e=this.fireTokenUpdate({addedTokens:[],removedTokens:[t],type:a.TokenUpdateType.Removed});if(!e){return;}delete this._oTokensWidthMap[t.getId()];t.destroy();this.fireTokenChange({addedTokens:[],removedTokens:[t],type:a.TokenChangeType.TokensChanged});}};a.prototype._onTokenSelect=function(t,b,s){var d=this._getVisibleTokens(),o,i;if(s){var f=this._getFocusedToken();if(!f){this._oSelectionOrigin=null;return;}if(this._oSelectionOrigin){f=this._oSelectionOrigin;}else{this._oSelectionOrigin=f;}var F=this.indexOfToken(f),e=this.indexOfToken(t),m=Math.min(F,e),M=Math.max(F,e);for(i=0;i<d.length;i++){o=d[i];if(i>=m&&i<=M){o._changeSelection(true);}else if(!b){o._changeSelection(false);}}return;}this._oSelectionOrigin=null;if(b){return;}this._oSelectionOrigin=t;for(i=0;i<d.length;i++){o=d[i];if(o!==t){o._changeSelection(false);}}};a.prototype._getFocusedToken=function(){var f=sap.ui.getCore().byId(document.activeElement.id);if(!f||!(f instanceof sap.m.Token)||this.indexOfToken(f)==-1){return null;}return f;};a.prototype.onsaphome=function(e){var v=this._getVisibleTokens();(v.length>0)&&v[0].focus();this.scrollToStart();e.preventDefault();};a.prototype.onsapend=function(e){var t=this._getVisibleTokens(),o=t[t.length-1];if(o.getDomRef()!==document.activeElement){o.focus();this.scrollToEnd();e.stopPropagation();}else{e.setMarked("forwardFocusToParent");}e.preventDefault();};a.prototype.onclick=function(e){var f;f=q(e.target).hasClass("sapMTokenizerIndicator")||(e.target===this.getFocusDomRef());if(!this.getEnabled()){return;}if(f){this._fnOnNMorePress&&this._fnOnNMorePress(e);}};a.prototype.ontap=function(e){var t=e.target,b=this._getVisibleTokens(),o=b[b.length-1];if(D.browser.msie&&t===o.getDomRef()){setTimeout(function(){this.scrollToEnd();}.bind(this),0);}};a.prototype.ontouchstart=function(e){e.setMarked();if(D.browser.chrome&&window.getSelection()){window.getSelection().removeAllRanges();}};a.prototype.exit=function(){this._deregisterResizeHandler();};a.prototype._deregisterResizeHandler=function(){if(this._sResizeHandlerId){R.deregister(this._sResizeHandlerId);delete this._sResizeHandlerId;}};a.prototype._setTokensAria=function(){var t=this._getVisibleTokens().length,i,s="";if(sap.ui.getCore().getConfiguration().getAccessibility()){i=this.getAggregation("_tokensInfo");switch(t){case 0:s=r.getText("TOKENIZER_ARIA_CONTAIN_TOKEN");break;case 1:s=r.getText("TOKENIZER_ARIA_CONTAIN_ONE_TOKEN");break;default:s=r.getText("TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS",t);break;}i.setText(s);}};a.prototype._doSelect=function(){if(this._checkFocus()&&this._bCopyToClipboardSupport){var f=document.activeElement;var s=window.getSelection();s.removeAllRanges();if(this.getSelectedTokens().length){var o=document.createRange();o.selectNodeContents(this.getDomRef("clip"));s.addRange(o);}if(window.clipboardData&&f.id==this.getId()+"-clip"&&this.getDomRef()){this.getDomRef().focus();}}};a.prototype.getReverseTokens=function(){return!!this._reverseTokens;};a.prototype.setReverseTokens=function(b){this._reverseTokens=b;};a.prototype.setEditable=function(e){var t=this.getTokens();t.forEach(function(o){o.setProperty("editableParent",e);});this.setProperty("editable",e);return this;};a.prototype.getTokensInfoId=function(){return this.getAggregation("_tokensInfo").getId();};a.TokenChangeType={Added:"added",Removed:"removed",RemovedAll:"removedAll",TokensChanged:"tokensChanged"};a.TokenUpdateType={Added:"added",Removed:"removed"};a.WaitForAsyncValidation="sap.m.Tokenizer.WaitForAsyncValidation";return a;});
