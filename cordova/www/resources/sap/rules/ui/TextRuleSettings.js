/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global","sap/rules/ui/library","sap/ui/core/Control","sap/ui/layout/form/SimpleForm","sap/m/Label","sap/m/Switch","sap/m/Select","sap/m/MessageBox","sap/m/Table","sap/m/Column","sap/m/Text","sap/m/Input","sap/m/Button","sap/m/ComboBox","sap/rules/ui/ExpressionAdvanced","sap/ui/layout/VerticalLayout","sap/rules/ui/type/Expression","sap/rules/ui/oldast/lib/AstYamlConverter","sap/rules/ui/Constants","sap/rules/ui/AstExpressionBasic","sap/rules/ui/services/AstExpressionLanguage"],function(q,l,C,S,L,a,b,M,T,c,d,I,B,f,E,V,g,A,h,j,k){"use strict";var t=C.extend("sap.rules.ui.TextRuleSettings",{metadata:{library:"sap.rules.ui",properties:{modelName:{type:"string",defaultValue:""},newTextRule:{type:"boolean",defaultValue:false}},aggregations:{mainLayout:{type:"sap.ui.layout.form.SimpleForm",multiple:false}},defaultAggregation:"mainLayout",associations:{expressionLanguage:{type:"sap.rules.ui.services.ExpressionLanguage",multiple:false,singularName:"expressionLanguage"},astExpressionLanguage:{type:"sap.rules.ui.services.AstExpressionLanguage",multiple:false,singularName:"astExpressionLanguage"}}}});sap.rules.ui.TextRuleSettings.prototype._addNodeObject=function(e){var n=[];var o=sap.ui.getCore().byId(this.getAstExpressionLanguage());var i=o._astBunldeInstance.ASTUtil;var u=[];u.Root=e.Root;u.SequenceNumber=e.Sequence;u.ParentId=e.ParentId;u.Reference=e.Reference;u.Id=e.NodeId;u.Type=e.Type;u.Value=e.Value?e.Value:"";if(e.Type==="I"){u.Value=e.IncompleteExpression;}if(e.Function){u.Function=e.Function;}if(e.Type!=="P"&&!e.Function){var O=[];O.BusinessDataType=e.Output?e.Output.BusinessDataType:e.BusinessDataType;O.DataObjectType=e.Output?e.Output.DataObjectType:e.DataObjectType;u.Output=O;}i.createNode(u);};sap.rules.ui.TextRuleSettings.prototype._bindPredefinedTable=function(p,K){var e=this;this.oPredefinedTable.destroyItems();var m=this.getModel("oDataModel");var o;if(this.getExpressionLanguage()){o=sap.ui.getCore().byId(this.getExpressionLanguage());}else{o=sap.ui.getCore().byId(this.getAstExpressionLanguage());}var v=new sap.ui.model.odata.v2.ODataModel(o.getModel().sServiceUrl);var s;var H;var n;var r=function(w){if(w&&w.length>0){e.oPredefinedTable.setBusy(true);for(var i=0;i<w.length;i++){if(K==="/TextRuleResults"){H={RuleId:w[i].RuleId,Id:w[i].Id,RuleVersion:w[i].RuleVersion};s=m.createKey(K,H);n=new sap.ui.model.Context(m,s);}else{H={DataObjectId:w[i].DataObjectId,Id:w[i].Id,VocabularyId:w[i].VocabularyId};s=v.createKey(K,H);n=new sap.ui.model.Context(v,s);}e.oPredefinedTable.addItem(e._predefinedFactory("col-"+i,n));}e.oPredefinedTable.setBusy(false);e._internalModel.setProperty("/needToRefresh",false);}};if(K==="/TextRuleResults"){var u=this.getModel("TextRuleModel").getProperty("/textRuleResults");r(u);}else{if(this.getModel().getProperty("/ResultDataObjectId")){v.read(p,{urlParameters:{"$expand":"Attributes"},success:function(i){r(i.Attributes.results);},error:function(i){M.error(i.responseText,{title:e.oBundle.getText("ERROR_DIALOG"),actions:[sap.m.MessageBox.Action.OK]});}});}}};sap.rules.ui.TextRuleSettings.prototype._callRefreshResultsFunctionImport=function(){var e=this;var o=this.getModel("oDataModel");var m=this.getModel("TextRuleModel").getData();var i={groupId:"changes"};o.setDeferredGroups([i.groupId]);var s=function(r){if(r&&r.__batchResponses&&r.__batchResponses[0].message==="HTTP request failed"){M.error(r.__batchResponses[0].response.body,{title:e.oBundle.getText("refreshFailed"),actions:[sap.m.MessageBox.Action.OK]});}else{e._createPredefinedTable();e._internalModel.setProperty("/needToRefresh",false);}};var n=function(){var r=m.ruleId;o.callFunction("/RefreshRuleResultDataObject",{method:"POST",groupId:i.groupId,urlParameters:{RuleId:r}});o.submitChanges({groupId:i.groupId,success:s,});};if(this._internalModel.getProperty("/needToRefresh")){n();}};sap.rules.ui.TextRuleSettings.prototype._createInfoMessageStrip=function(e,i){var m=new sap.m.MessageStrip({visible:true,id:i,text:e,type:sap.ui.core.MessageType.Information,showIcon:true,showCloseButton:true}).addStyleClass("sapTextRuleSettingsMessageStrip");return m;};sap.rules.ui.TextRuleSettings.prototype._createLayout=function(){if(!this.oForm){this._destroyElements();this.oForm=new S("_formLayout",{editable:true,layout:"ResponsiveGridLayout",maxContainerCols:1,columnsL:1,columnsM:1,labelSpanM:1,content:[new L({text:this.oBundle.getText("output")}).setTooltip(this.oBundle.getText("output")),new sap.ui.layout.HorizontalLayout({content:[new b("__resultSelect",{width:"220px",items:{path:"settingModel>/results/resultsEnumeration",template:new sap.ui.core.Item({key:"{settingModel>id}",text:"{settingModel>label}"})},selectedKey:"{/ResultDataObjectId}",tooltip:this.oBundle.getText("chooseResultTooltip"),change:function(e){var D=this.getParent();var o=D.getButtons()[0];o.setEnabled(true);var s=e.getSource();var m=this.getModel().getData();if(m.ResultDataObjectStatus!=="C"){m.ResultDataObjectId=s.getSelectedKey();m.ResultDataObjectName=s._getSelectedItemText();m.ResultDataObjectStatus="U";if(m.ResultDataObjectId!==s.getSelectedKey()){this._updateRefreshFlags(false,false,false);}}this._internalModel.setProperty("/resultDataObjectChanged",true);if(this.getExpressionLanguage()&&this._internalModel.getProperty("/results/resultsEnumeration/0").id==="0"){this._internalModel.getProperty("/results/resultsEnumeration").splice(0,1);}this._createPredefinedTable();}.bind(this)}),this._createRefreshButton()]}),new L(),this._createVerticalLayout()]}).addStyleClass("sapTextRuleSettingsForm");}this.oForm.setBusyIndicatorDelay(0);return this.oForm;};sap.rules.ui.TextRuleSettings.prototype._createPredefinedTable=function(){if(!this.oPredefinedTable){this.oPredefinedTable=new T("idPredefinedTable",{backgroundDesign:sap.m.BackgroundDesign.Solid,showSeparators:sap.m.ListSeparators.All,swipeDirection:sap.m.SwipeDirection.Both,layoutData:new sap.ui.layout.form.GridContainerData({halfGrid:false}),columns:[new c({width:"45%",header:new sap.m.Label({text:this.oBundle.getText("PredefinedResultColumnHeaderText"),design:sap.m.LabelDesign.Bold})}),new c({width:"25%",header:new sap.m.Label({text:this.oBundle.getText("PredefinedAccessColumnHeaderText"),design:sap.m.LabelDesign.Bold})}),new c({width:"45%",header:new sap.m.Label({text:this.oBundle.getText("PredefinedValuesColumnHeaderText"),design:sap.m.LabelDesign.Bold})})]});}var r=this._internalModel.getProperty("/resultDataObjectChanged");var R=this._internalModel.getProperty("/refreshButtonClicked");var m=this.getModel("oDataModel");this._handleVisibilityForPredefinedResults();if(!r&&!R){this.oPredefinedTable.setModel(m);var e=[this.getModel("TextRuleModel").getProperty("/ruleBindingPath"),"/TextRule/TextRuleResults"].join("");this._bindPredefinedTable(e,"/TextRuleResults");this.oPredefinedTable.setBusyIndicatorDelay(0);return this.oPredefinedTable;}else{this._updatePredefinedTable(this.getModel().getData());}return null;};sap.rules.ui.TextRuleSettings.prototype._handleVisibilityForPredefinedResults=function(){if(this.getModel()&&!this.getModel().getProperty("/ResultDataObjectId")){this.oPredefinedTable.setVisible(false);if(sap.ui.getCore().byId("id_HiddenAccessMessageStrip")){sap.ui.getCore().byId("id_HiddenAccessMessageStrip").setVisible(false);}if(sap.ui.getCore().byId("id_EditableAccessMessageStrip")){sap.ui.getCore().byId("id_EditableAccessMessageStrip").setVisible(false);}}else{this.oPredefinedTable.setVisible(true);if(sap.ui.getCore().byId("id_HiddenAccessMessageStrip")){sap.ui.getCore().byId("id_HiddenAccessMessageStrip").setVisible(true);}if(sap.ui.getCore().byId("id_EditableAccessMessageStrip")){sap.ui.getCore().byId("id_EditableAccessMessageStrip").setVisible(true);}}};sap.rules.ui.TextRuleSettings.prototype._createRefreshButton=function(){var _=function(){this._internalModel.setProperty("/refreshButtonEnabled",true,null,true);return this.oBundle.getText("textRuleRefreshWarning");}.bind(this);var e=function(){this._updateRefreshFlags(true,false,true);}.bind(this);var i=_();var m=function(){var n=i;M.warning(n,{title:this.oBundle.getText("refeshResultWarningTitle"),actions:[sap.m.MessageBox.Action.OK,sap.m.MessageBox.Action.CANCEL],onClose:function(o){if(o===sap.m.MessageBox.Action.OK){e();}}});}.bind(this);var r=new B({layoutData:new sap.ui.layout.ResponsiveFlowLayoutData({weight:1}),icon:sap.ui.core.IconPool.getIconURI("synchronize"),width:"3rem",type:sap.m.ButtonType.Transparent,text:"",press:m,visible:true,enabled:"{settingModel>/refreshButtonEnabled}"}).setTooltip(this.oBundle.getText("refreshBtnTooltip"));this.refreshButton=r;return r;};sap.rules.ui.TextRuleSettings.prototype._createVerticalLayout=function(){var v=new sap.ui.layout.VerticalLayout("verticalLayout",{content:[this._createInfoMessageStrip(this.oBundle.getText("TRPredefinedMessageStripHiddenAccessInfoText"),"id_HiddenAccessMessageStrip"),this._createInfoMessageStrip(this.oBundle.getText("TRPredefinedMessageStripEditableAccessInfoText"),"id_EditableAccessMessageStrip"),this._createPredefinedTable()]});return v;};sap.rules.ui.TextRuleSettings.prototype._destroyElements=function(){if(sap.ui.getCore().byId("_formLayout")){sap.ui.getCore().byId("_formLayout").destroy();}if(sap.ui.getCore().byId("__elseCheckBox")){sap.ui.getCore().byId("__elseCheckBox").destroy();}if(sap.ui.getCore().byId("__resultSelect")){sap.ui.getCore().byId("__resultSelect").destroy();}if(sap.ui.getCore().byId("id_HiddenAccessMessageStrip")){sap.ui.getCore().byId("id_HiddenAccessMessageStrip").destroy();}if(sap.ui.getCore().byId("id_EditableAccessMessageStrip")){sap.ui.getCore().byId("id_EditableAccessMessageStrip").destroy();}if(sap.ui.getCore().byId("idPredefinedTable")){sap.ui.getCore().byId("idPredefinedTable").destroy();}};sap.rules.ui.TextRuleSettings.prototype._formRuleData=function(o,e){var r=o.getProperty("RuleId");var v=o.getProperty("Version");var R=q.extend({},this.getModel().oData);if(!R){R={};}if(!R.DecisionTable){R.DecisionTable={};}R.Type="DT";R.DecisionTable.metadata={};R.DecisionTable.RuleID=r;R.DecisionTable.version=v;R.DecisionTable.HitPolicy="FM";R.DecisionTable.DecisionTableColumns={};R.DecisionTable.DecisionTableColumns.results=[];R.DecisionTable.DecisionTableColumns.results.push({"metadata":{},"RuleId":r,"Id":1,"Version":v,"Sequence":1,"Type":"CONDITION","Condition":{"metadata":{},"RuleId":r,"Id":1,"Version":v,"Expression":e,"Description":null,"ValueOnly":false,"FixedOperator":null},"Result":null});R.DecisionTable.DecisionTableRows={};R.DecisionTable.DecisionTableRows.results=[];R.DecisionTable.DecisionTableColumnsCondition={};R.DecisionTable.DecisionTableColumnsCondition.results=[];R.DecisionTable.DecisionTableColumnsResult={};R.DecisionTable.DecisionTableColumnsResult.results=[];return R;};sap.rules.ui.TextRuleSettings.prototype._getAccessOptions=function(){var o={accessEnumration:[{key:h.KEY_EDITABLE,value:h.EDITABLE},{key:h.KEY_HIDDEN,value:h.HIDDEN}]};return o;};sap.rules.ui.TextRuleSettings.prototype._getASTExpressionBasic=function(o,e,i,m,n,p){var r=this;var s=sap.ui.getCore().byId(this.getAstExpressionLanguage());var u=m?m:sap.rules.ui.ExpressionType.NonComparison;var v=this._getExpressionFromAstNodes(o,p);var w=o.getObject(o.getPath());var x=w.DataObjectAttributeId?w.DataObjectAttributeId:w.Id;var R=this.getModel().getProperty("/ResultDataObjectId");var y="/"+R+"/"+x;if(v&&v.relString){v.relString=v.relString.replace(/\\/g,"\\\\").replace(/{/g,"\\{").replace(/}/g,"\\}");}var z=new j({id:e,value:v.relString?v.relString:"",placeholder:this.oBundle.getText("expressionPlaceHolder"),astExpressionLanguage:s,attributeInfo:y,valueState:v.valueState,change:function(D){var F=D.getSource();var G=o.getModel();var p=D.getParameter("astNodes");if(p&&p.length===1&&p[0].Type==="I"&&p[0].Value!==""){F.setValueState("Error");}else{F.setValueState("None");}r._internalModel.setProperty("/resultAttributeChanged",true);r._updateResultAttributeJSON(o,null,null,null,p,false,false);F._validateControl();}.bind(this)}).setBindingContext(o);return z;};sap.rules.ui.TextRuleSettings.prototype._getCurrentResult=function(){var m=this.getModel().getData();var e=this.getModel("TextRuleModel").getData();var H={Id:e.ruleId,Version:e.ruleVersion};var D=this.getModel("oDataModel");var p=D.createKey("/Rules",H);m.ResultDataObjectId=D.getProperty(p+"/ResultDataObjectId");m.ResultDataObjectName=D.getProperty(p+"/ResultDataObjectName");m.ResultDataObjectStatus="A";if(this.getExpressionLanguage()&&this._internalModel.getProperty("/results/resultsEnumeration/0").id==="0"){this._internalModel.getProperty("/results/resultsEnumeration").splice(0,1);}};sap.rules.ui.TextRuleSettings.prototype._getExpressionFieldForPredefined=function(o,e,i,m,n,p){var r;if(this.getAstExpressionLanguage()){r=this._getASTExpressionBasic(o,e,i,m,n,p);}else{r=this._getPredefinedExpressionAdvanced(o,e,i,m,n);}return r;};sap.rules.ui.TextRuleSettings.prototype._getExpressionFromAstNodes=function(o,e){var i=this;var m=sap.ui.getCore().byId(this.getAstExpressionLanguage());var n=m._astBunldeInstance.TermsProvider.TermsProvider;var p="";var P=o.getPath();var D=o.getObject(P);var r=m._astBunldeInstance.ASTUtil;r.clearNodes();var s=e?e:D.TextRuleResultASTs.__list;if(s&&s.length>0){for(var u in s){var v=o.getObject("/"+s[u])?o.getObject("/"+s[u]):s[u];this._addNodeObject(v);}var e=r.getNodes();p=r.toAstExpressionString(e);if(e&&e.length===1&&e[0].Type==="I"){p.valueState="Error";}else{p.valueState="None";}}return p;};sap.rules.ui.TextRuleSettings.prototype._getPredefinedExpressionAdvanced=function(o,i,m,n,p){var r=sap.ui.getCore().byId(this.getExpressionLanguage());var s=n?n:sap.rules.ui.ExpressionType.NonComparison;var u=this;return new E({expressionLanguage:r,placeholder:this.oBundle.getText("expressionPlaceHolder"),validateOnLoad:true,id:i,type:s,value:m,editable:true,attributeInfo:p,change:function(v){var w=v.getSource();var R=u._getConvertedExpression(w.getValue(),true,o);var x="";if(R&&R!==""){var y=R.output.decisionTableData.DecisionTable.DecisionTableColumns.results["0"].Condition.parserResults;if(y&&y.status!=="Error"){u._astUtils.Id=0;var P=o.getPath();var z=y.converted.ASTOutput;try{x=JSON.stringify(u._astUtils.parseConditionStatement(z));var D=o.oModel.oMetadata.mEntityTypes["/TextRuleConditions"].property;var F=0;if(D){for(var G=0;G<D.length;G++){if(D[G].name==="AST"){F=D[G].maxLength;}}if(x&&x.length>F){u._updateModelExpressionModelAst(P,o,x);}}}catch(e){console.log("Exception while converting ast for expression"+w.getValue()+" :"+e.message);}}}this._internalModel.setProperty("/resultAttributeChanged",true);this._updateResultAttributeJSON(o,null,w.getValue(),x,[],false,false);}.bind(this)}).setBindingContext(o);};sap.rules.ui.TextRuleSettings.prototype._getConvertedExpression=function(e,i,o){var m=sap.ui.getCore().byId(this.getExpressionLanguage());var r=this._formRuleData(o,e);var R;if(i){R=m.convertRuleToCodeValues(r);}else{R=m.convertRuleToDisplayValues(r);}return R;};sap.rules.ui.TextRuleSettings.prototype._getSelectedVisibilityStatus=function(s){if(s===h.HIDDEN){return h.KEY_HIDDEN;}else{return h.KEY_EDITABLE;}};sap.rules.ui.TextRuleSettings.prototype._initSettingsModel=function(r){var i={};i.predefinedResults=[];i.results=r;i.accessOptions=this._getAccessOptions();this._internalModel=new sap.ui.model.json.JSONModel(i);this.setModel(this._internalModel,"settingModel");};sap.rules.ui.TextRuleSettings.prototype._getResultsData=function(e){var o;var r={resultsEnumeration:[]};if(this.getExpressionLanguage()){o=sap.ui.getCore().byId(this.getExpressionLanguage());r={resultsEnumeration:o.getResults()};r.resultsEnumeration.unshift({id:"0",name:"",label:""});}else{o=sap.ui.getCore().byId(this.getAstExpressionLanguage());r={resultsEnumeration:o.getResults()};r.resultsEnumeration.unshift({id:undefined,name:this.oBundle.getText("textRuleNoDefaultResult"),label:this.oBundle.getText("textRuleNoDefaultResult")});}this._initSettingsModel(r);if(e){this._setDefaultResult();}else{this._getCurrentResult();}if(this.needCreateLayout){var i=this.getAggregation("mainLayout");if(i){i.destroy();}i=this._createLayout();this.setAggregation("mainLayout",i);this.needCreateLayout=false;}};sap.rules.ui.TextRuleSettings.prototype._predefinedFactory=function(i,o){var e=i.split("-")[1];var m="exp"+e;var n=o.getProperty("DataObjectAttributeLabel")?o.getProperty("DataObjectAttributeLabel"):o.getProperty("Label");var p=o.getProperty("DataObjectAttributeName")?o.getProperty("DataObjectAttributeName"):o.getProperty("Name");var r=n?n:p;var s=o.getProperty("DataObjectAttributeId")?o.getProperty("DataObjectAttributeId"):o.getProperty("Id");var u;var v;var w=o.getProperty("BusinessDataType");var x;var y=[];var z=this._internalModel.getProperty("/predefinedResults");var _=function(H){var J=[];for(var K in H){J.push(o.getObject("/"+H[K]));}return J;};if(this._internalModel.getProperty("/resultDataObjectChanged")){this._updateResultAttributeJSON(o,h.EDITABLE,"","",[],true,false);x=h.EDITABLE;u="";v="";}else if(this._internalModel.getProperty("/refreshButtonClicked")){var D=z[s];x=D?D.AccessMode:h.EDITABLE;u=D?D.Expression:"";v=D?D.AST:"";y=D?D.ASTNodes:[];this._updateResultAttributeJSON(o,x,u,v,y,false,true);}else{u=o.getProperty("Expression");v=o.getProperty("AST");x=o.getProperty("AccessMode");y=o.getProperty("TextRuleResultASTs");y=_(y);this._updateResultAttributeJSON(o,x,u,v,y,false,false);}var F=this._getSelectedVisibilityStatus(x);var G=false;if(this.getExpressionLanguage()){if(w===h.DATE_BUSINESS_TYPE||w===h.TIMESTAMP_BUSINESS_TYPE||w===h.NUMBER||w===h.STRING||w===h.BOOLEAN_BUSINESS_TYPE||w===h.BOOLEAN_ENHANCED_BUSINESS_TYPE){G=true;}}else{G=true;}if(G){return new sap.m.ColumnListItem({visible:true,cells:[new sap.m.Label({visible:true,design:sap.m.LabelDesign.Standard,text:r,labelFor:m,textAlign:sap.ui.core.TextAlign.Begin,textDirection:sap.ui.core.TextDirection.Inherit}).setBindingContext(o),new sap.m.Select({width:"65%",id:"select"+e,items:{path:"settingModel>/accessOptions/accessEnumration",template:new sap.ui.core.Item({key:"{settingModel>key}",text:"{settingModel>value}"})},selectedKey:F,change:function(H){this._setColumnAccessMode(o,H);}.bind(this)}).setBindingContext(o),this._getExpressionFieldForPredefined(o,m,u,w,s,y)]});}};sap.rules.ui.TextRuleSettings.prototype._setDefaultResult=function(){var m=this.getModel().getData();var r=this._internalModel.getProperty("/results/resultsEnumeration");if(r.length>0){m.ResultDataObjectId=r[0].Id;m.ResultDataObjectName=r[0].Name;m.ResultDataObjectStatus="A";}var D=this.getParent();var o=D.getButtons()[0];o.setEnabled(false);if(this.getExpressionLanguage()){o.setEnabled(false);}else{o.setEnabled(true);}};sap.rules.ui.TextRuleSettings.prototype._setColumnAccessMode=function(o,e){var s=e.getSource();var i="exp"+e.getSource().sId.split("select")[1];var m=sap.ui.getCore().byId(i);var n=s.getSelectedKey();if(m instanceof E){if(n===h.KEY_HIDDEN){m.setValue("");m.setValueStateText(this.oBundle.getText("PredefinedResultsValueStateText"));this._updateResultAttributeJSON(o,h.HIDDEN,null,null,null,false,false);}else{m.setValueStateText("");this._updateResultAttributeJSON(o,h.EDITABLE,null,null,null,false,false);}}else{if(n===h.KEY_HIDDEN){m.setValue("");m._input[0].classList.add("sapAstExpressionInputError");this._updateResultAttributeJSON(o,h.HIDDEN,null,null,null,false,false);}else{m._input[0].classList.remove("sapAstExpressionInputError");this._updateResultAttributeJSON(o,h.EDITABLE,null,null,null,false,false);}}this._internalModel.setProperty("/resultAttributeChanged",true);};sap.rules.ui.TextRuleSettings.prototype._updatePredefinedTable=function(r){if(this._internalModel.getProperty("/resultDataObjectChanged")){this._internalModel.setProperty("/predefinedResults",[]);}var D=this.getModel("oDataModel");var e=this.getModel("TextRuleModel").getData();var s="/DataObjects(VocabularyId='"+e.projectId+"',Id='"+r.ResultDataObjectId+"')";this.oPredefinedTable.setModel(D);this._bindPredefinedTable(s,"/Attributes");this.oPredefinedTable.setBusyIndicatorDelay(0);return this.oPredefinedTable;};sap.rules.ui.TextRuleSettings.prototype._updateRefreshFlags=function(n,i,e){this._internalModel.setProperty("/needToRefresh",n);this._internalModel.setProperty("/refreshButtonEnabled",i,null,true);this._internalModel.setProperty("/refreshButtonClicked",e);this._callRefreshResultsFunctionImport();};sap.rules.ui.TextRuleSettings.prototype._updateResultAttributeJSON=function(o,s,e,i,m,r,n){var p=o.getProperty("DataObjectAttributeId")?o.getProperty("DataObjectAttributeId"):o.getProperty("Id");var D="/predefinedResults/"+p;if(this._internalModel.getProperty("/predefinedResults")){if(this._internalModel.getProperty(D)){if(r){this._internalModel.setProperty(D+"/AccessMode",h.EDITABLE);this._internalModel.setProperty(D+"/Expression","");this._internalModel.setProperty(D+"/AST","");this._internalModel.setProperty(D+"/ASTNodes",[]);this._internalModel.setProperty(D+"/updatePredefinedResults",true);}if(n){this._internalModel.setProperty(D+"/isAttributeinBackend",true);this._internalModel.setProperty(D+"/AccessMode",s);this._internalModel.setProperty(D+"/Expression",e);this._internalModel.setProperty(D+"/AST",i);this._internalModel.setProperty(D+"/ASTNodes",m);this._internalModel.setProperty(D+"/updatePredefinedResults",true);}if(!r&&!n&&s){this._internalModel.setProperty(D+"/AccessMode",s);this._internalModel.setProperty(D+"/updatePredefinedResults",true);}if(!r&&!n&&(e||e==="")){this._internalModel.setProperty(D+"/Expression",e);this._internalModel.setProperty(D+"/updatePredefinedResults",true);}if(!r&&!n&&(i||i==="")){this._internalModel.setProperty(D+"/AST",i);this._internalModel.setProperty(D+"/updatePredefinedResults",true);}if(!r&&!n&&m){this._internalModel.setProperty(D+"/ASTNodes",m);this._internalModel.setProperty(D+"/updatePredefinedResults",true);}}else{this._internalModel.setProperty(D,o.getObject(o.sPath));this._internalModel.setProperty(D+"/ASTNodes",m);if(r){this._internalModel.setProperty(D+"/AccessMode",h.EDITABLE);this._internalModel.setProperty(D+"/Expression","");this._internalModel.setProperty(D+"/AST","");this._internalModel.setProperty(D+"/ASTNodes",[]);}if(n){this._internalModel.setProperty(D+"/AccessMode",s);this._internalModel.setProperty(D+"/Expression",e);this._internalModel.setProperty(D+"/AST",i);this._internalModel.setProperty(D+"/ASTNodes",m);this._internalModel.setProperty(D+"/isAttributeinBackend",true);}}}};sap.rules.ui.TextRuleSettings.prototype.getButtons=function(D){var e=[];var o=new B({text:this.oBundle.getText("cancelBtn")}).setTooltip(this.oBundle.getText("cancelBtnTooltip"));o.attachPress(function(){D.close();},this);var i=new B({text:this.oBundle.getText("applyChangesBtn")}).setTooltip(this.oBundle.getText("applyChangesBtnTooltip"));i.attachPress(function(){if(!this._applyButtonPressed){this._applySettingsModelChangesToOData(D);this._applyButtonPressed=true;}},this);e.push(i);e.push(o);return e;};sap.rules.ui.TextRuleSettings.prototype.init=function(){this.oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");this.needCreateLayout=true;this.firstLoad=true;this.setBusyIndicatorDelay(0);this._astUtils=A;this._applyButtonPressed=false;};sap.rules.ui.TextRuleSettings.prototype.onBeforeRendering=function(){if(this.firstLoad){var e=this.getProperty("newTextRule");this._getResultsData(e);this.firstLoad=false;}};sap.rules.ui.TextRuleSettings.prototype._applySettingsModelChangesToOData=function(D){var e=this;var _=this.getModel();var o=this.getModel("oDataModel");var m=this.getModel("TextRuleModel");var s=this._internalModel;var r=m.getProperty("/ruleId");var R=m.getProperty("/ruleVersion");var n=_.getProperty("/ResultDataObjectId");var p=s.getProperty("/resultDataObjectChanged");var u=s.getProperty("/resultAttributeChanged");var v=s.getProperty("/refreshButtonClicked");var w={groupId:"changes"};var x=false;var y=this.getProperty("newTextRule");var z=[];var F=function(){var i=[m.getProperty("/ruleBindingPath"),"/TextRule/TextRuleResults"].join("");var W={success:function(X){o.setDeferredGroups([w.groupId]);z=X.results;U();if(x){o.submitChanges({groupId:w.groupId,success:function(){D.setBusy(false);m.setProperty("/resultChanged",p);D.setState(sap.ui.core.ValueState.Success);D.close();return;}});}else{D.setBusy(false);m.setProperty("/resultChanged",p);D.setState(sap.ui.core.ValueState.Success);D.close();}}};if(e.getAstExpressionLanguage()){W.urlParameters={"$expand":"TextRuleResultASTs"};}o.read(i,W);};var G=function(){x=false;if(p){F();}else{D.setBusy(false);m.setProperty("/resultChanged",p);D.setState(sap.ui.core.ValueState.Success);D.close();}};o.setDeferredGroups([w.groupId]);var H=function(i,X){for(var Y in i){var Z={};if(i[Y].Root){Z.Sequence=1;Z.Root=true;}else{Z.Sequence=i[Y].SequenceNumber;Z.ParentId=i[Y].ParentId;}if(i[Y].Function){Z.Function=i[Y].Function?i[Y].Function:"";}if(i[Y].Type==="I"){Z.IncompleteExpression=i[Y].Value;}if(i[Y].Type!=="P"&&i[Y].Type!=="O"&&!i[Y].Function){Z.BusinessDataType=i[Y].Output?i[Y].Output.BusinessDataType:i[Y].BusinessDataType;Z.DataObjectType=i[Y].Output?i[Y].Output.DataObjectType:i[Y].DataObjectType;Z.Value=i[Y].Value?i[Y].Value:"";}else if(i[Y].Type==="O"){Z.Reference=i[Y].Reference;}Z.NodeId=i[Y].Id;Z.Type=i[Y].Type;Z.RuleId=r;Z.RuleVersion=R;Z.Id=X;var W={};W.properties=Z;W.groupId="changes";o.createEntry("/TextRuleResultASTs",W);}};var J=function(i){var W={};W.Id=i;W.RuleId=r;W.RuleVersion=R;o.callFunction("/DeleteTextRuleResultASTDraft",{method:"POST",groupId:"changes",urlParameters:W});};var K=function(){var X=s.getProperty("/predefinedResults");for(var Y in X){if(!X[Y].isAttributeinBackend){var Z={RuleId:X[Y].RuleId,RuleVersion:X[Y].RuleVersion,Id:X[Y].Id};var $=o.createKey("/TextRuleResults",Z);var a1=new sap.ui.model.Context(o,$);o.deleteCreatedEntry(a1);var b1=m.getProperty("/textRuleResultExpressions");for(var i=0;i<b1.length;i++){if(b1[i].ResultId===X[Y].Id){var c1={RuleId:X[Y].RuleId,RuleVersion:X[Y].RuleVersion,ResultId:X[Y].Id,ConditionId:b1[i].ConditionId};$=o.createKey("/TextRuleResultExpressions",c1);a1=new sap.ui.model.Context(o,$);o.deleteCreatedEntry(a1);}}}}};var N=function(){var W={};var i={RuleId:r,RuleVersion:R};var X=o.createKey("/TextRules",i);if(!o.getData(X)){W.properties=i;o.createEntry("/TextRules",W);}var Y={RuleId:r,RuleVersion:R,Sequence:1};W.properties=Y;o.createEntry("/TextRuleBranches",W);};var O=function(){var i=s.getProperty("/predefinedResults");if(i){var X;for(X in i){if(i[X].updatePredefinedResults){x=true;var Y=i[X].AccessMode;var Z=i[X].Expression?i[X].Expression:"";var $=i[X].AST?i[X].AST:"";var a1="/PredefinedResults(RuleId='"+r+"',DataObjectAttributeId='"+X+"')";var b1={AccessMode:Y,AST:$,Type:"TextRule"};var W={groupId:w.groupId};if(e.getAstExpressionLanguage()&&i[X].ASTNodes){var c1=i[X].Id;if(p||v){for(var d1 in z){if(z[d1].DataObjectAttributeId===X){c1=z[d1].Id;break;}}}var e1="/TextRuleResults(RuleId='"+r+"',RuleVersion='"+R+"',Id='"+c1+"')";var f1={BusinessDataType:i[X].BusinessDataType};o.update(e1,f1,W);J(c1);H(i[X].ASTNodes,c1);}else{b1.Expression=Z;}o.update(a1,b1,W);}}}};var P=function(){o.callFunction("/SetRuleResultDataObject",{method:"POST",groupId:w.groupId,urlParameters:{RuleId:r,ResultDataObjectId:n}});};var Q=function(){o.callFunction("/RefreshRuleResultDataObject",{method:"POST",groupId:w.groupId,urlParameters:{RuleId:r}});};D.setBusy(true);var U=function(){if(u){O();}var i=s.getProperty("/needToRefresh");if(i){x=true;Q();}if(y){x=true;N();}};if(v){K();}if(p){x=true;P();}else if(v){F();}else{U();}var W={};W.success=G;W.groupId=w.groupId;if(x){o.submitChanges(W);if(!p){return;}}else if(!v&&!p&&!u){D.setState(sap.ui.core.ValueState.Success);D.setBusy(false);D.close();}};return t;},true);
