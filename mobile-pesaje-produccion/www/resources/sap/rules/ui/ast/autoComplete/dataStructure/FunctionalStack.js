sap.ui.define(["sap/rules/ui/ast/autoComplete/dataStructure/BaseStack","sap/rules/ui/ast/constants/Constants","sap/rules/ui/ast/autoComplete/node/TermNode","sap/rules/ui/ast/autoComplete/dataStructure/Stack"],function(B,C,T,S){"use strict";var F=function(){B.apply(this,arguments);this._name="";this._oFunction=null;};F.prototype=new B();F.prototype.constructor=B;F.prototype.push=function(t){var a=t.getTokenType();switch(a){case C.LEFTPARENTHESIS:return this.handleLeftParenthesisToken(t);case C.RIGHTPARENTHESIS:return this._handleRightParenthesisToken(t);case C.COMMA:if(this.getTop()&&"push"in this.getTop()){var r=this.getTop().push(t);if(r.bTokenPushed==false&&this.getHasOpenParenthesis()==true){return this._CloseArgumentAndCreateNextStack();}else if(r.bTokenPushed==false){return r;}}else{return{bTokenPushed:false,error:"invalid token comma"}}case C.WS:return{bTokenPushed:true};default:if(this.getTop()&&"push"in this.getTop()){return this._top.push(t);}else{return{bTokenPushed:false}}}};F.prototype._getArgSequenceDeterminingBusinessDataType=function(){var a=this.getFunction().getArgumentsMetadata();for(var l=0;l<a.length;l++){if(a[l][C.DETERMINESRETURNDATAOBJECTTYPE]==C.YES){return l;}}return-1;};F.prototype.getName=function(){return this._name;};F.prototype.setName=function(n){this._name=n;return this;};F.prototype.getFunction=function(){return this._oFunction;};F.prototype.setFunction=function(f){this._oFunction=f;return this;};F.prototype._handleRightParenthesisToken=function(t){if(this.getTop()&&"push"in this.getTop()){var r=this.getTop().push(t);if(r.bTokenPushed===false&&this.getHasOpenParenthesis()==true){return this._closeFunctionAndReturnCalculatedNode();}else if(r.bTokenPushed===true){return r;}else{return{bTokenPushed:false};}}else if(this.getTop()&&!("push"in this.getTop())&&this.getHasOpenParenthesis()==true){return this._closeFunctionAndReturnCalculatedNode();}else{return{bTokenPushed:false};}};F.prototype._closeFunctionAndReturnCalculatedNode=function(){this.setHasOpenParenthesis(false);var c=this.getFunction().getCategory();if(c==C.AGGREGATE||c==C.SELECTION){return this._closeAggregateFunction();}else{return this._closeFunction();}};F.prototype._closeFunction=function(){var c=new T();c.setName(this.getFunction().getName());c.setLabel(this.getFunction().getLabel());var s=this.getSize();var a=this.getFunction().getArgumentsMetadata();var b;var d;if(a==undefined){b=this.getFunction().getDefaultReturnBusinessDataType();d=this.getFunction().getDefaultReturnDataObjectType();}else if(a){var e=a[s-1];var t=this._getNodeRecursively(this._top);if(e){if(e.referenceIndex!=-1){var r=this._getNodeRecursively(this.peek(e.referenceIndex-1));var f=r.getBusinessDataType();var g=r.getDataObjectType();if(g=="S"){g="T";}if(f&&t&&"getBusinessDataType"in t&&t.getBusinessDataType()&&"referenceBusinessDataTypeCollection"in e&&e["referenceBusinessDataTypeCollection"]&&e["referenceBusinessDataTypeCollection"][f]){b=e["referenceBusinessDataTypeCollection"][f][t.getBusinessDataType()];}var h=t.getDataObjectType();if(h=="S"){h="T";}if(g&&t&&"getDataObjectType"in t&&t.getDataObjectType()&&"referenceDataObjectTypeCollection"in e&&e["referenceDataObjectTypeCollection"]&&e["referenceDataObjectTypeCollection"][g]){d=e["referenceDataObjectTypeCollection"][g][h];}if(d==undefined&&b==undefined){return{bTokenPushed:false,errorCode:10,errorMessage:"Mismatch in argument businessData type or dataObject type"};}}else{}}else{return{bTokenPushed:false,errorCode:9,errorMessage:"Mismatch in number of arguments"};}}else{return{bTokenPushed:false,errorCode:9,errorMessage:"Mismatch in number of arguments"};}c.setBusinessDataType(b);c.setDataObjectType(d);this._top=c;this._size=1;return{bTokenPushed:true,bFunctionClosed:true};};F.prototype._closeAggregateFunction=function(){var c=new T();c.setName(this.getFunction().getName());c.setLabel(this.getFunction().getLabel());var d=this.getFunction().getDefaultReturnDataObjectType();var r=this.getFunction().getProbableDataObjectTypeList();c.setDataObjectType(d);c.setBusinessDataType(this.getFunction().getDefaultReturnBusinessDataType());if(this.getTermPrefixId()&&this.getTermPrefixId()!=""){c.setId(this.getTermPrefixId());}var l=this._getArgSequenceDeterminingBusinessDataType();if(r&&r.length>=1&&l>-1&&this._determinetoChangeDataObjectType()){var n=this._getNodeRecursively(this.peek(l));if(n instanceof T){if(d==C.Element){c.setDataObjectType(C.Table);}else{c.setDataObjectType(C.Element);var b=n.getBusinessDataType();if(this.getFunction().getName()==C.COUNTDISTINCT){b=C.NUMBERBUSINESSDATATYPE;}c.setBusinessDataType(b);}}}this._top=c;this._size=1;return{bTokenPushed:true,bFunctionClosed:true};};F.prototype._determinetoChangeDataObjectType=function(){if(this.getFunction().getName()==C.COUNT){if(this.getSize()==1)return false;else return true;}else if(this.getSize()<=2)return true;return false;};F.prototype.handleLeftParenthesisToken=function(t){if(this.getHasOpenParenthesis()===false&&this.getSize()==0){this.setHasOpenParenthesis(true);this._top=new sap.rules.ui.ast.autoComplete.dataStructure.Stack(this.getTermPrefixId());var a=this.getFunction().getArgumentsMetadata();var p=[];var P=[];if(a){p=a[0].dataObjectTypeList;P=a[0].businessDataTypeList?a[0].businessDataTypeList:[];}this._top.setPrevious(this);this._top.setProbableDataObjectReturnTypeList(p);this._top.setProbableBusinessDataReturnTypeList(P);this._size+=1;return{bTokenPushed:true}}else if(this.getHasOpenParenthesis()==true&&this.getSize()>0&&this.getTop()&&"push"in this.getTop()){return this.getTop().push(t);}else{return{bTokenPushed:false}}};F.prototype._CloseArgumentAndCreateNextStack=function(){var n=this.getSize()+1;var t=this._getNodeRecursively(this._top);var a=this.getFunction().getArgumentsMetadata();if(this.getFunction().getNumberOfArguments()!="*"&&n>this.getFunction().getNumberOfArguments()){return{bTokenPushed:false,errorCode:11,errorMessage:"More number of arguments is been added"};}var b=new sap.rules.ui.ast.autoComplete.dataStructure.Stack(this.getTermPrefixId());if(this.getFunction().getCategory()==C.AGGREGATE||this.getFunction().getCategory()==C.SELECTION){if(this.getSize()<=a.length){b.setProbableDataObjectReturnTypeList(a[this.getSize()-1].dataObjectTypeList);b.setProbableBusinessDataReturnTypeList(a[this.getSize()-1].businessDataTypeList);}else{b.setProbableDataObjectReturnTypeList([]);b.setProbableBusinessDataReturnTypeList([]);}if(this.getSize()==1&&t instanceof T){this.setTermPrefixId(t.getId());}}else{var p;var c;if(a){var d=this.getSize();var e=a[d-1];var f=a[d];if(f.referenceIndex!=-1){var g=t.getBusinessDataType();var h=t.getDataObjectType();if(h=="S"){h="T";}if(g&&"referenceBusinessDataTypeCollection"in f&&f["referenceBusinessDataTypeCollection"]){var i=f["referenceBusinessDataTypeCollection"][g];if(i){p=Object.keys(i);}else{return{bTokenPushed:false,errorCode:13,errorMessage:"BusinessDatatype Mismatch for arguement :"+this.getSize()+"FunctionName :"+this.getFunction().getName()};}}if(h&&"referenceDataObjectTypeCollection"in f&&f["referenceDataObjectTypeCollection"]){var j=f["referenceDataObjectTypeCollection"][h];if(j){c=Object.keys(j);}else{return{bTokenPushed:false,errorCode:13,errorMessage:"BusinessDatatype Mismatch for arguement :"+this.getSize()+"FunctionName :"+this.getFunction().getName()};}}}else{}}else{return{bTokenPushed:false,errorCode:12,errorMessage:"Arguments information is missing : "+this.getFunction().getName()};}b.setProbableBusinessDataReturnTypeList(p);b.setProbableDataObjectReturnTypeList(c);}b.setTermPrefixId(this.getTermPrefixId());b.setPrevious(this._top);this._top=b;this._size+=1;return{bTokenPushed:true};};F.prototype.getProbableBusinessDataReturnTypeList=function(){return this.getFunction().getProbableBusinessDataTypeList();};F.prototype.getProbableDataObjectReturnTypeList=function(){return this.getFunction().getProbableDataObjectTypeList();};return F;},true);
