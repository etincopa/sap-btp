// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["jquery.sap.global",'sap/ushell/renderers/fiori2/search/appsearch/AppSearch'],function($,A){"use strict";function S(a,c){this.init.apply(this,arguments);}S.prototype={init:function(a,c,p,s){this.oAdapter=a;this.oContainerInterface=c;this.oLpdService=sap.ushell.Container.getService("LaunchPage");var b={optimizedAppSearch:false};if(s&&s.config&&s.config.optimizedAppSearch!==undefined){b.optimizedAppSearch=s.config.optimizedAppSearch;}this.appSearch=new A(b);},isSearchAvailable:function(){return this.oAdapter.isSearchAvailable();},getSina:function(){return this.oAdapter.getSina();},prefetch:function(){return this.appSearch.prefetch();},queryApplications:function(q){q.top=q.top||10;q.skip=q.skip||0;return this.appSearch.search(q).then(function(s){return{totalResults:s.totalCount,searchTerm:q.searchTerm,getElements:function(){return s.tiles;}};}.bind(this));}};S.hasNoAdapter=false;return S;},true);
