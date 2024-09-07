/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/mdc/experimental/provider/adapter/base/ObjectAdapter","sap/ui/mdc/experimental/provider/adapter/odata/v4/ODataBaseAdapter","sap/ui/mdc/experimental/provider/adapter/AdapterFactory"],function(O,a,F){"use strict";function s(p,w){p.then(function(A){w.field=A;delete w.fieldPromise;});}var b=O.extend("sap.ui.mdc.experimental.provider.adapter.odata.v4.ODataObjectAdapter",{_schemaCache:{},aExpand:[],constructor:function(m,M,c){O.prototype.constructor.apply(this,[m,M,c,a]);}});b.prototype.keys=function(){var i,k=[],K=[];var t=this;var r=new Promise(function(c){c(t);});function p(P){P.then(function(A){A._parentCache={};A._parentCache[t.sMetaPath]=r;K.push(A);});}return new Promise(function(c,d){for(i=0;i<t.schema.$Key.length;i++){k.push(F.newAdapter("field",t.oModel,t.sModelName,t.sContextName,t.sMetaPath+t.schema.$Key[i],true));}Promise.all(k).then(function(){for(var i=0;i<k.length;i++){p(k[i]);}c(K);},function(R){d(R);});});};b.prototype.fields=function(){var k,f,o,c=[],d=[];var t=this;var r=new Promise(function(e){e(t);});function p(P){P.then(function(A){A._parentCache={};A._parentCache[t.sMetaPath]=r;d.push(A);});}return new Promise(function(e,g){for(k in t.schema){if(k[0]!=="$"){f=t.sMetaPath+k;o=t.oMetaModel.getProperty(f);if(o&&o.$kind&&o.$kind=="Property"){c.push(F.newAdapter("field",t.oModel,t.sModelName,t.sContextName,f,true));}}}Promise.all(c).then(function(){for(var i=0;i<c.length;i++){p(c[i]);}e(d);},function(R){g(R);});});};b.prototype.relations=function(){var k,r=a.utils.getAnnotation("./$NavigationPropertyBinding",this),R=[],c=[];var t=this;function p(P){P.then(function(A){c.push(A);});}return new Promise(function(d,e){for(k in r){R.push(F.newAdapter("object",t.oModel,t.sModelName,t.sContextName,"/"+r[k]+"/",true));}Promise.all(R).then(function(){for(var i=0;i<R.length;i++){p(R[i]);}d(c);},function(v){e(v);});});};b.prototype.filterRestrictions=function(){var f=a.utils.getAnnotation("./@"+a.annotations.FILTER_RESTRICTIONS,this)||{};return{noFilter:a.collectionToArray(f.NonFilterableProperties),requiredFilter:a.collectionToArray(f.RequiredProperties),filterable:f.Filterable!=null?f.Filterable:true,requiresFilter:f.RequiresFilter!=null?f.RequiresFilter:false,maxLevels:f.MaxLevels||-1};};b.prototype.sortRestrictions=function(){var S=a.utils.getAnnotation("./@"+a.annotations.SORT_RESTRICTIONS,this)||{};return{sortable:S.Sortable!=="false",noSort:a.collectionToArray(S.NonSortableProperties),ascOnly:a.collectionToArray(S.AscendingOnlyProperties),descOnly:a.collectionToArray(S.DescendingOnlyProperties)};};b.prototype.determineNavigationRestrictions=function(){var n=a.utils.getAnnotation("./@"+a.annotations.NAVIGATION_RESTRICTIONS,this)||{};return{type:n.Navigability,restrictedProperties:a.collectionToArray(n.RestrictedProperties)};};b.prototype.chartInfo=function(q){var c=a.utils.getVisualAnno(a.annotations.CHART,this,q);var t=this;function g(d,D){var A=D?c.DimensionAttributes:c.MeasureAttributes;var r=D?a.annotations.DIMENSION_ROLES:a.annotations.MEASURE_ROLES;var k=D?"Dimension":"Measure";var o={Role:r[""]};if(A){for(var l=0;l<A.length;l++){if(A[l][k].$PropertyPath==d){o={Role:r[A[l].Role.$EnumMember]};break;}}}return o;}return new Promise(function(r,d){if(c){var D=[],C={Title:c.Title?c.Title:"",Dimensions:[],Measures:[]};var j,f;for(j=0;j<c.Dimensions.length;j++){f=c.Dimensions[j].$PropertyPath;D.push(F.newAdapter("field",t.oModel,t.sModelName,t.sContextName,t.sMetaPath+"/"+f,true));C.Dimensions.push({name:f,fieldPromise:D[D.length-1],attributes:g(f,true)});}for(j=0;j<c.Measures.length;j++){f=c.Measures[j].$PropertyPath;D.push(F.newAdapter("field",t.oModel,t.sModelName,t.sContextName,t.sMetaPath+"/"+f,true));C.Measures.push({name:f,fieldPromise:D[D.length-1],attributes:g(f,false)});}Promise.all(D).then(function(){for(var k=0;k<D.length;k++){var o;if(k<C.Dimensions.length){o=C.Dimensions[k];}else{o=C.Measures[k-C.Dimensions.length];}s(D[k],o);}r(C);},function(R){d(R);});}else{r(null);}});};b.prototype.tableInfo=function(q){var t=a.utils.getVisualAnno(a.annotations.TABLE,this,q);var c=this;return new Promise(function(r,d){if(t){var i,l,C=[];var T={ModelName:c.sModelName,Set:"/"+c.name,Columns:[],Actions:[]};for(i=0;i<t.length;i++){l=t[i];switch(l.$Type){case a.annotations.DATA_FIELD.FIELD:C.push(F.newAdapter("field",c.oModel,c.sModelName,c.sContextName,c.sMetaPath+"/"+l.Value.$Path,true));T.Columns.push({label:l.Label,fieldPromise:C[C.length-1],model:c.sModelName});break;case a.annotations.DATA_FIELD.ACTION:}}Promise.all(C).then(function(){for(var k=0;k<C.length;k++){s(C[k],T.Columns[k]);}r(T);},function(R){d(R);});}else{r(null);}});};b.prototype.contactInfo=function(q){};b.prototype.relation=function(p){};return b;});
