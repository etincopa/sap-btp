sap.ui.define(["sap/ui/base/Object","sap/suite/ui/generic/template/js/StableIdHelper"],function(B,S){"use strict";function g(s,c,t,f,I,C){function a(e,b){var F=C&&C.key;var d=S.getStableId({type:"ObjectPageTable",subType:"SegmentedButton",sFacet:F});var h=S.getStableId({type:"ObjectPageTable",subType:"VariantSelection",sFacet:F});var o=c.byId(d)||c.byId(h);var p=o?o.getItems():[];for(var i=0;i<p.length;i++){var j=p[i];var k=j.getKey();b(k,j);}if(p.length>0){f(p[0].getKey());}}return{init:a};}return B.extend("sap.suite.ui.generic.template.ObjectPage.controller.MultipleViewsSingleTableModeHelper",{constructor:function(q,s,c,t,f,i,C){Object.assign(this,g(s,c,t,f,i,C));}});});
