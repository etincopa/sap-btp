// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/_ClientSideTargetResolution/Utils","sap/ushell/services/_ClientSideTargetResolution/VirtualInbounds","sap/ushell/services/_ClientSideTargetResolution/Formatter"],function(u,v,f){"use strict";var A=[undefined,"GUI","WDA","UI5"];function a(M,I){var r=M.inbound.resolutionResult;if(!r){return"";}return["applicationType","ui5ComponentName","url","additionalInformation","text"].map(function(K){if(I){return r.hasOwnProperty(K)?K+":"+r[K]:"";}return r.hasOwnProperty(K)?r[K]:"";}).join("");}function b(M){return M.sort(function(p,q){if((p["sap-priority"]||0)-(q["sap-priority"]||0)!==0){return-((p["sap-priority"]||0)-(q["sap-priority"]||0));}if(p.priorityString<q.priorityString){return 1;}if(p.priorityString>q.priorityString){return-1;}return(a(p)<a(q))?1:-1;});}function e(I,M){var s;if(I&&I["sap-priority"]&&I["sap-priority"][0]){s=parseInt(I["sap-priority"][0],10);if(!isNaN(s)){M["sap-priority"]=s;}}return;}function m(V,F,K,M){var s;if(!F){return true;}if(!V&&V!==""){return false;}s=F.value;if(F.format==="reference"){if(/UserDefault\.extended\./.test(s)){jQuery.sap.log.error("Illegal inbound: extended user default '"+s+"' used as filter");return false;}if(K.hasOwnProperty(s)){return V===K[s];}M[s]=true;return true;}if(F.format==="value"||F.format==="plain"||F.format===undefined){return V===F.value;}else if(F.format==="regexp"){return!!V.match("^"+F.value+"$");}else{jQuery.sap.log.error("Illegal oFilter format");return false;}}function g(M){return M.inbound&&M.inbound.resolutionResult&&M.inbound.resolutionResult["sap.ui"]&&M.inbound.resolutionResult["sap.ui"].technology;}function c(I,s,K,M,D){var p={},q={};Object.keys(I).forEach(function(P){if(P!=="sap-ushell-defaultedParameterNames"){p[P]=I[P];}});if(!s){return p;}Object.keys(s).forEach(function(P){var t=s[P],T,V=false;if(!p[P]&&t.hasOwnProperty("defaultValue")){if(t.defaultValue.format&&t.defaultValue.format==="reference"){T=t.defaultValue.value;if(K.hasOwnProperty(T)){if(typeof K[T]==="string"){p[P]=[K[T]];V=true;}else if(typeof K[T]==="object"){p[P]=K[T];V=true;}}else{p[P]=[t.defaultValue];M.push(t.defaultValue.value);}}else{p[P]=[t.defaultValue.value];V=true;}if(V){q[P]=true;}}});Object.keys(q).sort().forEach(function(P){D.push(P);});return p;}function d(M,I){M.resolutionResult={};if(I&&I.resolutionResult&&I.resolutionResult.hasOwnProperty("sap.platform.runtime")){M.resolutionResult["sap.platform.runtime"]=I.resolutionResult["sap.platform.runtime"];}Object.keys(M.intentParamsPlusAllDefaults).slice(0).forEach(function(N){if(!jQuery.isArray(M.intentParamsPlusAllDefaults[N])){if(!M.resolutionResult.oNewAppStateMembers){M.resolutionResult.oNewAppStateMembers={};}M.resolutionResult.oNewAppStateMembers[N]=M.intentParamsPlusAllDefaults[N];}});}function h(r,M){r.forEach(function(R){M[R]=true;});}function i(M){var t=M.intentParamsPlusAllDefaults["sap-ui-tech-hint"]&&M.intentParamsPlusAllDefaults["sap-ui-tech-hint"][0];var I=M.defaultedParamNames&&(M.defaultedParamNames.indexOf("sap-ui-tech-hint")>=0);if(t&&g(M)===t){return I?1:2;}return 0;};function j(M){function p(N){var s="000"+N;return s.substr(s.length-3);}M.priorityString=[M.genericSO?"g":"x","TECM="+i(M),"MTCH="+p(M.countMatchingParams),"MREQ="+p(M.countMatchingRequiredParams),"NFIL="+p(M.countMatchingFilterParams),"NDEF="+p(M.countDefaultedParams),"POT="+p(M.countPotentiallyMatchingParams),"RFRE="+p(999-M.countFreeInboundParams),"TECP="+k(M)].join(" ");};function k(M){var t=g(M);var p=A.indexOf(t);return Math.max(0,p);}function l(I,p){var q=false;if(I.signature.additionalParameters==="allowed"||I.signature.additionalParameters==="ignored"){return true;}if(I.signature.additionalParameters==="notallowed"||I.signature.additionalParameters===undefined){q=Object.keys(p).every(function(P){return(!I.signature.parameters[P]&&P.indexOf("sap-")!==0)?false:true;});}else{jQuery.sap.log.error("Unexpected value of inbound for signature.additionalParameters");}return q;}function n(I,p,K,D){var M=p.reduce(function(r,q){var s=o(I,q,K,r.missingReferences);if(s.matches){r.matchResults.push(s);}else if(D){(function(){var N=r.noMatchReasons;var t=f.formatInbound(q);N[t]=s.noMatchReason+(s.noMatchDebug?"| DEBUG: "+s.noMatchDebug:"");})();}return r;},{matchResults:[],noMatchReasons:{},missingReferences:{}});return jQuery.when(M);}function o(I,p,K,M){var q={inbound:p};function N(E,F,G){E.matches=false;E.noMatchReason=F;E.noMatchDebug=G;return E;}function r(E){E.matches=true;E.matchesVirtualInbound=v.isVirtualInbound(p);return E;}q.genericSO=(p.semanticObject==="*");if(!(I.semanticObject===undefined||I.semanticObject===p.semanticObject||p.semanticObject==='*')){return N(q,"Semantic object \""+I.semanticObject+"\" did not match");}if(!(I.action===undefined||I.action===p.action)){return N(q,"Action \""+I.action+"\" did not match");}if(p.deviceTypes&&!(I.formFactor===undefined||p.deviceTypes[I.formFactor])){return N(q,"Form factor \""+I.formFactor+"\" did not match","Inbound: ["+Object.keys(p.deviceTypes).filter(function(E){return!!p.deviceTypes[E];}).join(", ")+"]");}var t=I.params&&I.params["sap-ui-tech-hint"]&&I.params["sap-ui-tech-hint"][0];if(I.treatTechHintAsFilter&&t){var s=g({inbound:p});if(s!==t){return N(q,"Tech Hint as filter \""+t+"\" did not match","Inbound: ["+s+"]");}}var R=[],D=[],w=I.params||{};var x=c(w,p.signature&&p.signature.parameters,K,R,D);q.intentParamsPlusAllDefaults=x;q.defaultedParamNames=D;e(x,q);var y=0,z=0,B=0,C=0;var S=Object.keys(p.signature.parameters).every(function(P){var V=x[P],E=V&&V[0],F=p.signature.parameters[P],G=w.hasOwnProperty(P);if(F.required&&(E===null||E===undefined)){return false;}if(F.filter){if(!m(E,F.filter,K,M)){return false;}if(G){++B;}}if(G&&F.required){++z;}if(G){++y;}if(!G&&(E===null||E===undefined)){++C;}var H=u.constructParameterDominatorMap(p.signature.parameters);var J=u.removeSpuriousDefaultedValues(q.intentParamsPlusAllDefaults,q.defaultedParamNames,H);q.intentParmsPlusAllDefaults=J.intentParmsPlusAllDefaults;q.defaultedParamNames=J.defaultedParamNames;return true;});q.countMatchingParams=y;q.countMatchingRequiredParams=z;q.countMatchingFilterParams=B;q.countDefaultedParams=D.length;q.countPotentiallyMatchingParams=Object.keys(w).length;q.countFreeInboundParams=C;if(!S){return N(q,"Inbound parameter signature did not match",f.formatInboundSignature(p.signature));}if(!l(p,x)){return N(q,"Additional parameters not allowed",f.formatInboundSignature(p.signature));}if(p.signature.additionalParameters==="ignored"){u.filterObjectKeys(x,function(E){if(E.indexOf("sap-")===0){return true;}if(p.signature.parameters.hasOwnProperty(E)){return true;}return false;},true);q.countPotentiallyMatchingParams=Object.keys(w).filter(function(E){return p.signature.parameters.hasOwnProperty(E);}).length;}d(q,p);j(q);h(R,M);return r(q);};return{match:n,matchOne:o,sortMatchingResultsDeterministic:b,matchesFilter:m,checkAdditionalParameters:l,addDefaultParameterValues:c,extractSapPriority:e,serializeMatchingResult:a};});
