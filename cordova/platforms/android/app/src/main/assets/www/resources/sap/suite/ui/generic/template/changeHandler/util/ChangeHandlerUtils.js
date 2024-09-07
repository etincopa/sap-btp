sap.ui.define(["sap/suite/ui/generic/template/js/AnnotationHelper","sap/suite/ui/generic/template/changeHandler/js/AnnotationHelperForDesignTime"],function(A,a){"use strict";var O="sap.suite.ui.generic.template.ObjectPage.view.Details";var L="com.sap.vocabularies.UI.v1.LineItem";var D="com.sap.vocabularies.UI.v1.DataFieldForAnnotation";var b="com.sap.vocabularies.UI.v1.DataFieldForAction";var I="com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation";var F="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";var c="com.sap.vocabularies.UI.v1.FieldGroup";var d="com.sap.vocabularies.UI.v1.Identification";var S="com.sap.vocabularies.UI.v1.SelectionFields";var R="com.sap.vocabularies.UI.v1.ReferenceFacet";var C="com.sap.vocabularies.UI.v1.CollectionFacet";var e={};var m;e.isReveal=false;e.isRevert=false;e.getMetaModel=function(s,p){if(m){return m;}m={};var i=(s.source&&s.source.id)||s.parentId||(s.removedElement&&s.removedElement.id)||(s.selector&&s.selector.id);jQuery.extend(true,m,p.modifier.bySelector(i,p.appComponent).getModel().getMetaModel());return m;};e.getComponent=function(M){var o;while(M){if(M instanceof sap.ui.core.mvc.View){o=M.getController().getOwnerComponent();break;}else if(M instanceof sap.ui.core.UIComponent){o=M;break;}if(M.getParent){M=M.getParent();}else{break;}}return o;};e.getODataEntitySet=function(o){var M=o.getModel();var E=M&&o.getEntitySet&&o.getEntitySet();var m=M&&M.getMetaModel();return E&&m.getODataEntitySet(E);};e.getEntityType=function(E){var s;if(E){if(E.getEntityType){s=E.getEntityType();}else{var o=e.getComponent(E);var f=o&&o.getEntitySet();var m=E.getModel().getMetaModel();var g=f&&m&&m.getODataEntitySet(f);s=g&&g.entityType;}}return s;};e.getODataEntityType=function(M){var o;if(M){var f=e.getComponent(M);var E=f&&f.getEntitySet&&f.getEntitySet();var g=M.getModel();var h=g&&g.getMetaModel();if(h){var i=h.getODataEntitySet(E);var s=i&&i.entityType;o=h.getODataEntityType(s);if(M.getId().indexOf(O)>-1){var j=M.getMetadata&&M.getMetadata().getElementName&&M.getMetadata().getElementName();switch(j){case"sap.ui.comp.smarttable.SmartTable":case"sap.m.Table":case"sap.m.Column":var k=A.getSmartTableControl(M);var n=k&&k.getTableBindingPath();if(n){o=A.getRelevantDataForAnnotationRecord(h,n+'/',o).entityType;}break;default:break;}}}}return o;};e.getSmartFormGroupInfo=function(g,f){var o,h,s;for(var i=0;i<f.length;i++){o=f[i];if(o&&o.Facets){h=e.getSmartFormGroupInfo(g,o.Facets);if(h){return h;}}else if(o&&o.Target&&o.Target.AnnotationPath&&(o.Target.AnnotationPath.indexOf(c)>=0)||(o.Target.AnnotationPath.indexOf(d)>=0)){s=(o.ID&&o.ID.String)||o.Target.AnnotationPath;if(s===g){return{aForm:f,oGroup:o};}}}};e.getCollectionFacet=function(s,f){var o;for(var i=0;i<f.length;i++){o=f[i];if(o&&o.ID&&o.ID.String===s){return o;}else if(o&&o.Facets){var g=e.getCollectionFacet(s,o.Facets);if(g){return g;}}}};e.createCollectionFacets=function(n,l){var N={"Label":{"String":l},"ID":{"String":"com.sap.vocabularies.UI.v1.CollectionFacet_"+a.getNextIdSuffix(true)},"Facets":n,"RecordType":"com.sap.vocabularies.UI.v1.CollectionFacet"};return N;};e.createNewFieldGroup=function(l){return{"Data":[{"Value":{"Path":l.Value?l.Value.Path:""},"RecordType":"com.sap.vocabularies.UI.v1.DataField"}],"RecordType":"com.sap.vocabularies.UI.v1.FieldGroupType"};};e.createFieldGroupTerm=function(E){var f="com.sap.vocabularies.UI.v1.FieldGroup#RTAGroup";var M=-1;for(var i in E){if(i.indexOf(f)>-1&&i.indexOf("RTAGroup")>-1){var s=i.substring(f.length);var g=parseInt(s,10);M=Math.max(g,M);}}M++;return f+M;};e.getSmartFilterBarControlConfiguration=function(v){var i=v.getContent()[0].getId();var f=i.substring(i.lastIndexOf("-")+1);var s=e.findSmartFilterBar(v);var o=s.getControlConfiguration().filter(function(g){return g.getKey()===f;})[0];return o;};e.findSmartFilterBar=function(E){if(!E){return;}if(E.getMetadata().getName()==="sap.ui.comp.smartfilterbar.SmartFilterBar"){return E;}else{return e.findSmartFilterBar(E.getParent());}};e.getIndexFromInstanceMetadataPath=function(o){var r=-1;var t=e.getTemplatingInfo(o);if(t&&t.path){r=parseInt(t.path.substring(t.path.lastIndexOf("/")+1),10);}return r;};e.fnIsSubsectionsPresent=function(f){return(f.RecordType===C&&f.Facets[0].RecordType===C&&f.Facets.length);};e.fnAddSubSection=function(p,f,t){var s="com.sap.vocabularies.UI.v1.FieldGroup#RTAGroup"+a.getNextIdSuffix(true);var n={"Label":{"String":"New Group"},"Target":{"AnnotationPath":"@"+s},"RecordType":R};var g=[];var i=e.getIndexFromInstanceMetadataPath(p);if(!e.fnIsSubsectionsPresent(f[i])){if(f[i].RecordType===R){g.push(f[i]);var E=e.createCollectionFacets(g,"New SubSection");}else{var E=f[i];}var N=e.createCollectionFacets([n],"New Subsection");var h=[E,N];var o=e.createCollectionFacets(h,f[i].Label.String);f.splice(i,1,o);}else{var h=[n];var o=e.createCollectionFacets(h,"New SubSection");f[i].Facets.splice(t,0,o);}return s;};e.fnMoveSubSection=function(u,U,i,f,g){var s=e.getIndexFromInstanceMetadataPath(u);var t=e.getIndexFromInstanceMetadataPath(U);var h=[];if(!e.fnIsSubsectionsPresent(g[t])){if(g[t].RecordType===R){h.push(g[t]);}else{for(var o in g[t].Facets){h.push(g[t].Facets[o]);}}if(h[0].RecordType===R){var T=e.createCollectionFacets(h,g[t].Label.String);if(g[s].Facets){var j=g[s].Facets[i];}else{var j=e.createCollectionFacets([g[s]],g[s].Label.String);}var r=[T];r.splice(f,0,j);}else{var j=g[s].Facets[i];var r=[j];for(var o in h){r.push(h[o]);}}var n=e.createCollectionFacets(r,g[t].Label.String);g.splice(t,1,n);if(!g[s].Facets||!g[s].Facets.length){g.splice(s,1);}else{g[s].Facets.splice(i,1);if(g[s].Facets&&!g[s].Facets.length){g.splice(s,1);}}}else if(g[s].RecordType===R){var k=g[s];var l=e.createCollectionFacets([k],g[s].Label.String);g[t].Facets.splice(f,0,l);g.splice(s,1);}else{if(g[s].Facets[0].RecordType===R){g[t].Facets.splice(f,0,g.splice(s,1)[0]);}else{g[t].Facets.splice(f,0,g[s].Facets.splice(i,1)[0]);if(g[s].Facets&&!g[s].Facets.length){g.splice(s,1);}}}};e.fnRemoveSubSection=function(r,f){var p=r.getParent();var i=e.getIndexFromInstanceMetadataPath(r);if(i>=0){var s=e.getIndexFromInstanceMetadataPath(p);f[s].Facets.splice(i,1);}};e.getUIHeaderFacets=function(o){var u=[];switch(o.getMetadata().getElementName()){case"sap.uxap.ObjectPageHeaderContent":u=o.getContent();break;case"sap.m.FlexBox":u=o.getItems();break;}return u;};e.getHeaderFacetIndex=function(h,f,u,g){if(h&&h.getMetadata().getElementName()==="sap.m.VBox"){if(e.getTemplatingInfo(h)){return e.getIndexFromInstanceMetadataPath(h);}else{if(h.getId().indexOf("AfterImageExtension")>-1){return 0;}if(!u){u=e.getUIHeaderFacets(h.getParent());}if(!g){for(var i=0;i<u.length;i++){if(u[i].getId()===h.getId()){g=i;break;}}}if(h.getId().indexOf("BeforeReferenceExtension")>-1){return e.getHeaderFacetIndex(u[g+1],f,u,g+1);}else if(h.getId().indexOf("AfterReferenceExtension")>-1){return e.getHeaderFacetIndex(u[g-1],f,u,g-1);}else{var o,j=f.length-1;for(var i=g;i<u.length;i++){o=u[i+1];if(o&&e.getTemplatingInfo(o)){j=e.getIndexFromInstanceMetadataPath(o)-1;break;}}return j;}}}else{return-1;}};e.getCustomDataObject=function(E){var f=E.getCustomData(),o={};if(!f){return;}for(var i=0;i<f.length;i++){o[f[i].getKey()]=f[i].getValue();}return o;};e.getGroupElements=function(E){var o;var g;if(E.getId().indexOf(O)>-1){E=E.getParent();g=A.getGroupElementQualifier(E.getCustomData());}o=e.getODataEntityType(E);return o&&o[g];};e.getGroupElementRecordIndex=function(E,g){if(!E||!g){return;}var t=e.getTemplatingInfo(E);var f=t.annotationContext;var r=-1;var G=g['Data'];if(f&&G&&G.length>0){for(var i=0;i<G.length;i++){if(f.RecordType&&(!G[i].RecordType||(G[i].RecordType!==f.RecordType))){continue;}if(f.Action&&f.Action.String&&(!G[i].Action||G[i].Action.String!==f.Action.String)){continue;}if(f.Action&&f.Action.Path&&(!G[i].Action||G[i].Action.Path!==f.Action.Path)){continue;}if(f.SemanticObject&&f.SemanticObject.String&&(!G[i].SemanticObject||(G[i].SemanticObject.String!==f.SemanticObject.String))){continue;}if(f.SemanticObject&&f.SemanticObject.Path&&(!G[i].SemanticObject||(G[i].SemanticObject.Path!==f.SemanticObject.Path))){continue;}if(f.Target&&f.Target.AnnotationPath&&(!G[i].Target||(G[i].Target.AnnotationPath!==f.Target.AnnotationPath))){continue;}if(f.Value&&f.Value.Path&&(!G[i].Value||(G[i].Value.Path!==f.Value.Path))){continue;}r=i;break;}}return r;};e.getLineItems=function(E){var o;var l=L;if(E.getId().indexOf(O)>-1){E=A.getSmartTableControl(E);var s=A.getLineItemQualifier(E.getCustomData());l=s?l+"#"+s:l;}o=e.getODataEntityType(E);return o&&o[l];};e.getLineItemRecordIndex=function(o,l){if(!o){return;}if(!l){l=e.getLineItems(o);}if(!l){return;}var r=-1,i,p=o.data("p13nData");if(!p||!l||l.length===0){return r;}if(!p.columnKey||p.columnKey.search("template::")===-1){for(i=0;i<l.length;i++){if(l[i].Value&&l[i].Value.Path===p.leadingProperty){return i;}}return r;}var t=p.columnKey.split("::");switch(t[1]){case"DataFieldForAction":for(i=0;i<l.length;i++){if(l[i].RecordType===b&&l[i].Action.String===t[2]){return i;}}break;case"DataFieldForAnnotation":for(i=0;i<l.length;i++){if(l[i].RecordType===D&&l[i].Target&&l[i].Target.AnnotationPath&&l[i].Target.AnnotationPath.replace("@","")===t[2]){return i;}}break;case"DataFieldWithIntentBasedNavigation":for(i=0;i<l.length;i++){if(l[i].RecordType===I&&l[i].SemanticObject.String===t[2]&&l[i].Action.String===t[3]){return i;}}break;case"DataFieldForIntentBasedNavigation":for(i=0;i<l.length;i++){if(l[i].RecordType===F&&l[i].SemanticObject.String===t[2]&&l[i].Action.String===t[3]&&l[i].Inline&&l[i].Inline.Bool==="true"){return i;}}break;default:for(i=0;i<l.length;i++){if(l[i].Value&&l[i].Value.Path===p.leadingProperty){return i;}}break;}return r;};e.getLineItemRecordIndexForButton=function(B,l){if(!l){l=e.getLineItems(B);}if(!l){return;}var o=e.getCustomDataObject(B),f=-1,E;for(var i=0;i<l.length;++i){E=l[i];if(E.RecordType===b&&E.Action&&E.Action.String===o.Action||E.RecordType===F&&E.Action&&E.Action.String===o.Action&&E.SemanticObject&&E.SemanticObject.String===o.SemanticObject){f=i;break;}}return f;};e.getRecordIndexForSelectionField=function(v){var t=-1,E=v.getParent().getParent().getEntityType(),m=v.getModel().getMetaModel(),o=m.getODataEntityType(E),s=o&&o[S];var T=e.getTemplatingInfo(e.getSmartFilterBarControlConfiguration(v));if(T&&T.annotation===S){s.some(function(f,i){if(f.PropertyPath===T.value){t=i;return true;}});}return t;};e.getLineItemRecordForButton=function(B){var l=e.getLineItems(B);if(!l){return;}var i=e.getLineItemRecordIndexForButton(B,l);return l[i];};e.getLineItemRecordForColumn=function(o){var l=e.getLineItems(o);if(!l){return;}var i=e.getLineItemRecordIndex(o,l);return l[i];};e.getTemplatingInfo=function(E){var t,T;if(E){T=E.data("sap-ui-custom-settings")&&E.data("sap-ui-custom-settings")["sap.ui.dt"]&&E.data("sap-ui-custom-settings")["sap.ui.dt"].annotation;if(T&&typeof(T)==="string"){t=JSON.parse(T);}}return t||T;};e.getPropertyOfColumn=function(o){var p=o.data("p13nData"),P=p&&p.leadingProperty;return P;};e.getODataPath=function(o,f){var s,t=-1,g,E=o.getElement(),m=E.getModel().getMetaModel(),h=o.getDesignTimeMetadata()&&o.getDesignTimeMetadata().getData();if(h&&jQuery.isFunction(h.getCommonInstanceData)){g=h.getCommonInstanceData(E);}if(!g){if(!f||!f.target){return;}for(var i=0;i<f.target.length;i++){if(f.target[i]==="EntityType"){t=i;break;}else if(f.target[i]==="EntitySet"){t=i;}}if(t>-1){var j=e.getEntityType(E);if(!m.getODataEntityType){return;}var k=m.getODataEntityType(j);switch(f.target[t]){case"EntityType":s=k&&k.namespace+"."+k.name;break;case"EntitySet":var l=e.getComponent(E);var n=e.getODataEntitySet(l);var p=n&&n.name;s=k&&k.namespace+"."+p;break;default:return;}}}else{s=g.target;}if(s&&f&&f.target){s+="/"+f.namespace+"."+f.annotation;}return s;};e.getEntityTypeFromAnnotationPath=function(E,s){var o;if(!E||!s){return o;}var m=E.getModel()&&E.getModel().getMetaModel();if(!m){return o;}o=e.getODataEntityType(E);if(s.search("/")>-1){o=A.getRelevantDataForAnnotationRecord(m,s,o).entityType;}return o;};e.fnAdaptTableStructures=function(t){var B=t.getBindingInfo("items");var o=t.getColumns(true);if(B&&B.template){var T=B.template;var f=T.getCells();if(f.length===o.length){var g=[];for(var i=0;i<o.length;i++){g.push(f[t.indexOfColumn(o[i])]);}B.template=null;t.unbindItems();t.removeAllColumns();T.removeAllCells();for(var i=0;i<o.length;i++){if(o[i].getVisible()){t.addColumn(o[i]);T.addCell(g[i]);}}B.template=T;t.bindItems(B,B.model);return;}}throw new Error("Unsupported Operation");};return e;});
