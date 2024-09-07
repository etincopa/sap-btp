sap.ui.define(["sap/suite/ui/generic/template/changeHandler/util/ChangeHandlerUtils","sap/suite/ui/generic/template/changeHandler/util/AnnotationChangeUtilsV2","sap/suite/ui/generic/template/designtime/utils/DesigntimeUtils"],function(U,A,D){"use strict";var G={},a="com.sap.vocabularies.UI.v1.DataFieldForAnnotation",b="com.sap.vocabularies.UI.v1.DataField",c="com.sap.vocabularies.UI.v1.DataFieldWithUrl",I="com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation",d="com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath",F="com.sap.vocabularies.UI.v1.FieldGroup",C="com.sap.vocabularies.Communication.v1.Contact",e="com.sap.vocabularies.Communication.v1.Address",f="Datafield",g="Contact",h="Address",i="DataFieldWithIntentBasedNavigation",j="DatafieldWithUrl",k="DataFieldWithNavigationPath";G.getGroupElementRecord=function(E){var t=U.getTemplatingInfo(E);if(t&&t.annotationContext){return t.annotationContext;}};G.createNewRecord=function(r,o){var p,l={Criticality:{},CriticalityRepresentation:{},IconUrl:{}},R={};R[b]=Object.assign({},l,{Label:{},Value:{}});R[c]=Object.assign({},l,{Label:{},Value:{Path:""},Url:{Path:""}});R[a]=Object.assign({},l,{Label:{String:""},Target:{AnnotationPath:""}});R[I]=Object.assign({},l,{Label:{},SemanticObject:{String:"Semantic_Object"},Action:{},Value:{}});R[d]=Object.assign({},l,{Label:{},Value:{Path:""},Target:{NavigationPropertyPath:""}});var n={"com.sap.vocabularies.UI.v1.Importance":{"EnumMember":"com.sap.vocabularies.UI.v1.ImportanceType/High"},"RecordType":r,"EdmType":"Edm.String"};jQuery.extend(true,n,R[r]);for(p in n){if(p!=="RecordType"&&p!=="Target"&&o&&o[p]){jQuery.extend(n[p],o[p]);}if(jQuery.isEmptyObject(n[p])){delete n[p];}}return n;};G.getGroupElementTypeValues=function(){var v={Datafield:{displayName:"Data Field"},DatafieldWithUrl:{displayName:"Data Field with URL"},Contact:{displayName:"Contact"},Address:{displayName:"Address"},DataFieldWithIntentBasedNavigation:{displayName:"Intent Based Navigation"},DataFieldWithNavigationPath:{displayName:"DataField with Navigation Path"}};return v;};G.getGroupElementType=function(E){var r=G.getGroupElementRecord(E);var s;if(r){switch(r.RecordType){case a:var l=r.Target.AnnotationPath;if(l){if(r.Target.AnnotationPath.indexOf(C)>-1){s=g;}else if(r.Target.AnnotationPath.indexOf(e)>-1){s=h;}}break;case I:s=i;break;case b:s=f;break;case c:s=j;break;case d:s=k;break;default:break;}}return s;};G.setGroupElementType=function(o,n,l){l.noRefreshOnChange=true;l.delayRefresh=false;var O=G.getGroupElementType(o);if(O===n){return;}var r="";var m={};var E={};var p=[];var q=[];var s="";var t=[];var u=-1;var v={};var w=[];var T={};var x="";var M=o.getModel();m=M&&M.getMetaModel();T=U.getTemplatingInfo(o);E=m.getODataEntityType(T.target);s=T.annotation;p=E[s];q=JSON.parse(JSON.stringify(p));t=(s.indexOf(F)>=0)?p.Data:p;u=U.getIndexFromInstanceMetadataPath(o);if(u===-1){throw"invalid index for old group element";}l.refreshPropertiesPane=true;switch(n){case f:r=b;break;case j:r=c;break;case i:r=I;break;case g:x=G.fixQualifierForNewGroupElement(o,t,C,undefined);var y=D.createNewContact();v=A.createCustomAnnotationTermChange(T.target,y,{},x);w.push(v);r=a;break;case h:x=G.fixQualifierForNewGroupElement(o,t,e,undefined);var z=D.createNewAddress();v=A.createCustomAnnotationTermChange(T.target,z,{},x);w.push(v);r=a;break;case k:r=d;break;default:break;}if(!r){return;}var B=G.getGroupElementRecord(o);var N=G.createNewRecord(r,B);switch(n){case g:if(!N.Label.String){N.Label.String="New Contact";}N.Target.AnnotationPath="@"+x;break;case h:if(!N.Label.String){N.Label.String="New Address";}N.Target.AnnotationPath="@"+x;break;case i:N.SemanticObject.String=N.SemanticObject.String+"_"+parseInt(u,10);break;default:break;}var H={"annotation":s,"annotationContext":N,"path":T.path,"target":E.namespace+"."+E.name,"value":N.Value&&N.Value.Path||N.Target&&N.Target.AnnotationPath};o.data("sap-ui-custom-settings")["sap.ui.dt"].annotation=H;t.splice(u,1,N);v=A.createCustomAnnotationTermChange(T.target,p,q,s);w.push(v);return w;};G.fixQualifierForNewGroupElement=function(o,l,t,B){var m=U.getIndexFromInstanceMetadataPath(o);var s=D.fixQualifierForAnnotationPath(l,t,B,m);return s;};return G;});
