sap.ui.define(['sap/ushell/renderers/fiori2/search/appsearch/TileLoader'],function(T){"use strict";var A=function(){this.init.apply(this,arguments);};A.prototype={init:function(p){this.tileLoader=new T(p);},search:function(q){q.scope='allTiles';return this.tileLoader.search(q);},prefetchTiles:function(){return this.tileLoader.getTiles();}};return A;});
