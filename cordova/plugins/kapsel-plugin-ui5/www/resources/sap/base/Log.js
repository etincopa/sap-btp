/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/now"],function(n){"use strict";var L={};L.Level={NONE:-1,FATAL:0,ERROR:1,WARNING:2,INFO:3,DEBUG:4,TRACE:5,ALL:(5+1)};var d,l=[],m={'':L.Level.ERROR},a=3000,o=null,b=false;function p(i,w){return("000"+String(i)).slice(-w);}function c(C){return(!C||isNaN(m[C]))?m['']:m[C];}function e(){var i=l.length;if(i){var E=Math.min(i,Math.floor(a*0.7));if(o){o.onDiscardLogEntries(l.slice(0,i-E));}if(E){l=l.slice(-E,i);}else{l=[];}}}function g(){if(!o){o={listeners:[],onLogEntry:function(j){for(var i=0;i<o.listeners.length;i++){if(o.listeners[i].onLogEntry){o.listeners[i].onLogEntry(j);}}},onDiscardLogEntries:function(D){for(var i=0;i<o.listeners.length;i++){if(o.listeners[i].onDiscardLogEntries){o.listeners[i].onDiscardLogEntries(D);}}},attach:function(i,j){if(j){o.listeners.push(j);if(j.onAttachToLog){j.onAttachToLog(i);}}},detach:function(j,k){for(var i=0;i<o.listeners.length;i++){if(o.listeners[i]===k){if(k.onDetachFromLog){k.onDetachFromLog(j);}o.listeners.splice(i,1);return;}}}};}return o;}L.fatal=function(M,D,C,s){f(L.Level.FATAL,M,D,C,s);};L.error=function(M,D,C,s){f(L.Level.ERROR,M,D,C,s);};L.warning=function(M,D,C,s){f(L.Level.WARNING,M,D,C,s);};L.info=function(M,D,C,s){f(L.Level.INFO,M,D,C,s);};L.debug=function(M,D,C,s){f(L.Level.DEBUG,M,D,C,s);};L.trace=function(M,D,C,s){f(L.Level.TRACE,M,D,C,s);};L.setLevel=function(i,C,_){C=C||d||'';if(!_||m[C]==null){m[C]=i;var s;Object.keys(L.Level).forEach(function(j){if(L.Level[j]===i){s=j;}});f(L.Level.INFO,"Changing log level "+(C?"for '"+C+"' ":"")+"to "+s,"","sap.base.log");}};L.getLevel=function(C){return c(C||d);};L.isLoggable=function(i,C){return(i==null?L.Level.DEBUG:i)<=c(C||d);};L.logSupportInfo=function(E){b=E;};function f(i,M,D,C,s){if(!s&&!C&&typeof D==="function"){s=D;D="";}if(!s&&typeof C==="function"){s=C;C="";}C=C||d;if(i<=c(C)){var N=n(),j=new Date(N),k=Math.floor((N-Math.floor(N))*1000),q={time:p(j.getHours(),2)+":"+p(j.getMinutes(),2)+":"+p(j.getSeconds(),2)+"."+p(j.getMilliseconds(),3)+p(k,3),date:p(j.getFullYear(),4)+"-"+p(j.getMonth()+1,2)+"-"+p(j.getDate(),2),timestamp:N,level:i,message:String(M||""),details:String(D||""),component:String(C||"")};if(b&&typeof s==="function"){q.supportInfo=s();}if(a){if(l.length>=a){e();}l.push(q);}if(o){o.onLogEntry(q);}if(console){var r=D instanceof Error,t=q.date+" "+q.time+" "+q.message+" - "+q.details+" "+q.component;switch(i){case L.Level.FATAL:case L.Level.ERROR:r?console.error(t,"\n",D):console.error(t);break;case L.Level.WARNING:r?console.warn(t,"\n",D):console.warn(t);break;case L.Level.INFO:if(console.info){r?console.info(t,"\n",D):console.info(t);}else{r?console.log(t,"\n",D):console.log(t);}break;case L.Level.DEBUG:if(console.debug){r?console.debug(t,"\n",D):console.debug(t);}else{r?console.log(t,"\n",D):console.log(t);}break;case L.Level.TRACE:if(console.trace){r?console.trace(t,"\n",D):console.trace(t);}else{r?console.log(t,"\n",D):console.log(t);}break;}if(console.info&&q.supportInfo){console.info(q.supportInfo);}}return q;}}L.getLogEntries=function(){return l.slice();};L.getLogEntriesLimit=function(){return a;};L.setLogEntriesLimit=function(i){if(i<0){throw new Error("The log entries limit needs to be greater than or equal to 0!");}a=i;if(l.length>=a){e();}};L.addLogListener=function(o){g().attach(this,o);};L.removeLogListener=function(o){g().detach(this,o);};function h(C){this.fatal=function(i,j,k,s){L.fatal(i,j,k||C,s);return this;};this.error=function(i,j,k,s){L.error(i,j,k||C,s);return this;};this.warning=function(i,j,k,s){L.warning(i,j,k||C,s);return this;};this.info=function(i,j,k,s){L.info(i,j,k||C,s);return this;};this.debug=function(i,j,k,s){L.debug(i,j,k||C,s);return this;};this.trace=function(i,j,k,s){L.trace(i,j,k||C,s);return this;};this.setLevel=function(c,i){L.setLevel(c,i||C);return this;};this.getLevel=function(i){return L.getLevel(i||C);};this.isLoggable=function(c,i){return L.isLoggable(c,i||C);};}L.getLogger=function(C,D){if(!isNaN(D)&&m[C]==null){m[C]=D;}return new h(C);};return L;});
