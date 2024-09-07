sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(C,F,a){'use strict';return C.extend("sap.ovp.cards.rta.SelectKPI",{onInit:function(){},onAfterRendering:function(){},_filterTable:function(e,f,I){var q=e.getParameter("query"),g=null,b=[];for(var i=0;i<f.length;i++){b.push(new F(f[i],a.Contains,q));}if(q){g=new F(b,false);}this.getView().byId(I).getBinding("items").filter(g,"Application");},onSearch:function(e){var v=this.getView(),m=v.getModel(),l;this._filterTable(e,["GroupTitle","KPITitle","GroupID","KPIID","KPIQualifier"],"KPITable");l=v.byId("KPITable").getBinding("items").getLength();m.setProperty("/NoOfKPIItem",l);m.refresh(true);},onItemPress:function(e){var s=e.getSource(),S=s.getBindingContext(),v=S.getObject();this.updateKPIItemPath(v,e);}});});
