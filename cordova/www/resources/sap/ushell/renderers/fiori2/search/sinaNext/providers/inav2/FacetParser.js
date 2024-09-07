// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sinaDefine(['../../core/core','./pivotTableParser','../../sina/SearchQuery','./typeConverter'],function(c,p,S,t){"use strict";return c.defineClass({_init:function(a){this.provider=a;this.sina=a.sina;},parse:function(q,d){var f=[];if(!d.ResultsetFacets||!d.ResultsetFacets.Elements){return[];}for(var i=0;i<d.ResultsetFacets.Elements.length;i++){var a=d.ResultsetFacets.Elements[i];var b=a.Metadata.Cube.ObjectName;if(b==='$$DataSources$$'){f.push(this.parseDataSourceFacet(q,a));}else{if(q.filter.dataSource.type===q.sina.DataSourceType.Category){continue;}f.push(this.parseChartFacet(q,a));}}return c.Promise.all(f);},parseDataSourceFacet:function(q,f){var d=q;if(q instanceof S){d=this.sina.createDataSourceQuery({dataSource:q.filter.dataSource,filter:q.filter.clone()});}var a=p.parse(f.ResultSet);var b=[];for(var i=0;i<a.cells.length;i++){var e=a.cells[i];var g=this.sina.getDataSource(e.$$DataSource$$[0].Value);if(!g){g=this.sina._createDataSource({type:this.sina.DataSourceType.Category,id:e.$$DataSource$$[0].Value,label:e.$$DataSource$$[0].ValueFormatted});}b.push(this.sina._createDataSourceResultSetItem({dataSource:g,dimensionValueFormatted:e.$$DataSource$$[0].ValueFormatted,measureValue:e.Value,measureValueFormatted:e.ValueFormatted}));}var r=this.sina._createDataSourceResultSet({title:q.filter.dataSource.label,items:b,query:d});if(q instanceof S){return d._setResultSet(r);}return r;},createAttributeFilterCondition:function(a,m,b){switch(b.$$AttributeValue$$.length){case 2:return this.sina.createSimpleCondition({attribute:a,value:t.ina2Sina(m.type,b.$$AttributeValue$$[0].Value),attributeLabel:m.label,valueLabel:b.$$AttributeValue$$[0].ValueFormatted});case 3:var d=this.sina.createComplexCondition({attributeLabel:m.label,valueLabel:b.$$AttributeValue$$[0].ValueFormatted,operator:this.sina.LogicalOperator.And});var e=[];if(b.$$AttributeValue$$[1].Value){e.push(this.sina.createSimpleCondition({attribute:a,operator:this.sina.ComparisonOperator.Ge,value:t.ina2Sina(m.type,b.$$AttributeValue$$[1].Value)}));}if(b.$$AttributeValue$$[2].Value){e.push(this.sina.createSimpleCondition({attribute:a,operator:this.sina.ComparisonOperator.Le,value:t.ina2Sina(m.type,b.$$AttributeValue$$[2].Value)}));}d.conditions=e;return d;default:throw new c.Exception('parse error facets');}},parseChartFacet:function(q,f){var d=this.sina.getDataSource(f.Metadata.Cube.DataSource.ObjectName);var a=f.Metadata.Cube.ObjectName;var m=d.getAttributeMetadata(a);var b=q;if(q instanceof S){var e=q.filter.clone();e.setDataSource(d);e.setRootCondition(q.filter.rootCondition.clone());b=this.sina.createChartQuery({filter:e,dimension:f.Metadata.Cube.ObjectName});}var g=p.parse(f.ResultSet);var h=[];for(var i=0;i<g.cells.length;i++){var j=g.cells[i];h.push(this.sina._createChartResultSetItem({filterCondition:this.createAttributeFilterCondition(a,m,j),dimensionValueFormatted:j.$$AttributeValue$$[0].ValueFormatted||j.$$AttributeValue$$[0].Value,measureValue:j.Value,measureValueFormatted:j.ValueFormatted}));}var r=this.sina._createChartResultSet({title:m.label,items:h,query:b});if(q instanceof S){return b._setResultSet(r);}return r;}});});
