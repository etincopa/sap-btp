/*
 * ! SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/base/ManagedObject','sap/ui/comp/odata/MetadataAnalyser','sap/ui/model/odata/AnnotationHelper','sap/ui/model/Context','sap/ui/thirdparty/jquery'],function(M,a,A,C,q){"use strict";var U=M.extend("sap.ui.comp.state.UIState",{metadata:{library:"sap.ui.comp",properties:{presentationVariant:{type:"object"},selectionVariant:{type:"object"},variantName:{type:"string"},valueTexts:{type:"object"}}}});U._getFilterNamesWithValuesForCurrentLanguage=function(v){var p=[],l=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().getLanguage();if(v&&v.Texts){v.Texts.some(function(t){if(t.Language===l){t.PropertyTexts.forEach(function(P){var o,f=false;for(var i=0;i<p.length;i++){if(p[i].filterName===P.PropertyName){o=p[i];f=true;break;}}if(P.PropertyName&&P.ValueTexts&&(Object.keys(P.ValueTexts).length>0)){P.ValueTexts.forEach(function(V){if(!o){o={filterName:P.PropertyName,keys:[]};}o.keys.push(V.PropertyValue);});}if(!f&&o&&o.keys.length){p.push(o);}});return true;}return false;});}return p;};U._getFilterNamesWithValuesFromSelectOption=function(s,i){var S=[];if(s&&s.SelectOptions){s.SelectOptions.forEach(function(o){var c=i?(i.indexOf(o.PropertyName)<0):true;if(c){var O={filterName:o.PropertyName,keys:[]};o.Ranges.forEach(function(r){if(r.Option==="EQ"&&r.Sign==="I"){O.keys.push(r.Low);}});S.push(O);}});}return S;};U._determineFiltersWithOnlyKeyValues=function(f,F){var b,I,c=[];f=f||[];F=F||[];F.forEach(function(o){var O={filterName:o.filterName,keys:[]};I=null;f.some(function(d){if(o.filterName===d.filterName){I=d;}return I!==null;});for(var i=0;i<o.keys.length;i++){b=false;if(I){for(var j=0;j<I.keys.length;j++){if(o.keys[i]===I.keys[j]){b=true;break;}}}if(!b){O.keys.push(o.keys[i]);}}if(O.keys.length){c.push(O);}});return c;};U.determineFiltersWithOnlyKeyValues=function(v,s,i){var V=U._getFilterNamesWithValuesForCurrentLanguage(v);var S=U._getFilterNamesWithValuesFromSelectOption(s,i);return U._determineFiltersWithOnlyKeyValues(V,S);};U.calculateValueTexts=function(s,d){var v=null;var f=function(p,e){var P=null;if(!v){v={"Texts":[{"ContextUrl":"","Language":sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().getLanguage(),"PropertyTexts":[]}]};}for(var i=0;i<v.Texts[0].PropertyTexts.length;i++){if(v.Texts[0].PropertyTexts[i].PropertyName===p){P=v.Texts[0].PropertyTexts[i];break;}}if(!P){P={"PropertyName":p,ValueTexts:[]};v.Texts[0].PropertyTexts.push(P);}P.ValueTexts.push({"PropertyValue":e.key,"Text":e.text});};if(d&&s&&s.SelectOptions){s.SelectOptions.forEach(function(S){if(d[S.PropertyName]){if(d[S.PropertyName].ranges){d[S.PropertyName].ranges.forEach(function(e){if(e.hasOwnProperty("text")){f(S.PropertyName,e);}});}if(d[S.PropertyName].items){d[S.PropertyName].items.forEach(function(e){if(e.hasOwnProperty("text")){f(S.PropertyName,e);}});}}});}return v;};U.enrichWithValueTexts=function(p,v){var e=false,t,l,P,E=p;l=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().getLanguage().toLowerCase();if(v&&v.Texts){v.Texts.some(function(o){if(o.Language&&o.Language.toLowerCase()===l){t=o;}return t!==null;});if(t&&t.PropertyTexts){if(!P){P=JSON.parse(p);}t.PropertyTexts.forEach(function(o){var b=P[o.PropertyName];if(b&&b.ranges&&o.ValueTexts){o.ValueTexts.forEach(function(V){var c=null,n=-1;if(V.Text){b.ranges.some(function(d,i){if(!d.exclude&&(d.operation==="EQ")&&(d.value1===V.PropertyValue)){c=d;n=i;}return(c!=null);});}if(c){e=true;if(!b.items){b.items=[];}b.items.push({key:V.PropertyValue,text:V.Text});P[o.PropertyName].ranges.splice(n,1);}});}});if(e){E=JSON.stringify(P);}}}return E;};U.createFromSelectionAndPresentationVariantAnnotation=function(v,s,p){var S={};if(s&&s.SelectOptions&&s.SelectOptions.length){S.SelectOptions=s.SelectOptions.map(function(o){return{PropertyName:o.PropertyName.PropertyPath,Ranges:o.Ranges.map(function(r){var m=new C(null,"/");return{Sign:a.getSelectionRangeSignType([r.Sign.EnumMember]),Option:a.getSelectionRangeOptionType([r.Option.EnumMember]),Low:r.Low&&A.format(m,r.Low)||undefined,High:r.High&&A.format(m,r.High)||undefined};})};});}var P={};if(p&&p.lineItemAnnotation){if(!P.Visualizations){P.Visualizations=[];}var f=[];if(p.lineItemAnnotation.fields){var l=p.lineItemAnnotation.labels;var u=p.lineItemAnnotation.urlInfo;var i=p.lineItemAnnotation.importance;var c=p.lineItemAnnotation.criticality;p.lineItemAnnotation.fields.forEach(function(F){var o={Value:F};o.Label=l[F]?l[F]:null;o.IconUrl=u[F]?u[F]:null;o.Importance=i[F]?i[F]:null;o.Criticality=c[F]?c[F]:null;f.push(o);});}P.Visualizations.push({Type:"LineItem",Content:f});}if(p&&p.chartAnnotation){if(!P.Visualizations){P.Visualizations=[];}P.Visualizations.push({Type:"Chart",Content:{ChartType:p.chartAnnotation.chartType,Measures:p.chartAnnotation.measureFields,MeasureAttributes:Object.keys(p.chartAnnotation.measureAttributes).map(function(b){return{Measure:b,Role:p.chartAnnotation.measureAttributes[b].role};}),Dimensions:p.chartAnnotation.dimensionFields,DimensionAttributes:Object.keys(p.chartAnnotation.dimensionAttributes).map(function(b){return{Dimension:b,Role:p.chartAnnotation.dimensionAttributes[b].role};})}});}if(p&&p.maxItems){P.MaxItems=parseInt(p.maxItems);}if(p&&p.sortOrderFields){P.SortOrder=p.sortOrderFields.map(function(F){return{Property:F.name,Descending:F.descending};});}if(p&&p.groupByFields){P.GroupBy=p.groupByFields;}if(p&&p.requestAtLeastFields){P.RequestAtLeast=p.requestAtLeastFields;}return new U({presentationVariant:!q.isEmptyObject(P)?P:undefined,selectionVariant:!q.isEmptyObject(S)?S:undefined,variantName:v?v:undefined});};return U;},true);
