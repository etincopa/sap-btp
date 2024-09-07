/**
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/layout/library"],function(B){"use strict";function e(){var g=0;for(var i=0;i<this.virtualGridMatrix.length;i++){if(this.virtualGridMatrix[i][0]!==0){g++;}}if(g>0){this.addEmptyRows(g);}}function a(c){return c===0;}var V=B.extend("sap.f.VirtualGrid");V.prototype.init=function(s){this.virtualGridMatrix=[[]];this.numberOfCols=s.numberOfCols?s.numberOfCols:1;this.numberOfRows=s.numberOfRows?s.numberOfRows:1;this.cellWidth=s.cellWidth?s.cellWidth:5;this.cellHeight=s.cellHeight?s.cellHeight:5;this.unitOfMeasure=s.unitOfMeasure?s.unitOfMeasure:"rem";this.iGapSize=s.gapSize?s.gapSize:1;this.bAllowDenseFill=s.allowDenseFill?s.allowDenseFill:false;this.items={};this.rtl=s.rtl;this.width=s.width;this.topOffset=s.topOffset?s.topOffset:0;this.leftOffset=s.topOffset?s.leftOffset:0;for(var r=0;r<this.numberOfRows;r++){for(var c=0;c<this.numberOfCols;c++){this.virtualGridMatrix[r][c]=0;}}this.lastItemPosition={top:-1,left:-1};};V.prototype.addEmptyRows=function(n){var l=this.virtualGridMatrix.length;for(var i=l;i<l+n;i++){this.virtualGridMatrix[i]=Array.apply(null,Array(this.numberOfCols)).map(Number.prototype.valueOf,0);}};V.prototype.getItems=function(){return this.items;};V.prototype.getMatrix=function(){return this.virtualGridMatrix;};V.prototype.getWidth=function(){if(!this.virtualGridMatrix[0]){return 0;}var c=this.virtualGridMatrix[0].length;return c*this.cellWidth+(c-1)*this.iGapSize;};V.prototype.getHeight=function(){var r=0;for(var b=0;b<this.virtualGridMatrix.length;b++){if(!this.virtualGridMatrix[b].every(a)){r++;}}return r*this.cellHeight+(r-1)*this.iGapSize;};V.prototype.calculatePositions=function(){var r,c,i,b,d;for(r=0;r<this.virtualGridMatrix.length;r++){for(c=0;c<this.virtualGridMatrix[r].length;c++){if(!this.virtualGridMatrix[r][c]){continue;}if(!this.items[this.virtualGridMatrix[r][c]].calculatedCoords){i=this.items[this.virtualGridMatrix[r][c]];b=c*(this.cellWidth+this.iGapSize)+this.leftOffset;d=i.cols*(this.cellHeight+this.iGapSize)-this.iGapSize;if(this.rtl){b=this.width-b-d;}i.top=r*(this.cellHeight+this.iGapSize)+this.topOffset+this.unitOfMeasure;i.left=b+this.unitOfMeasure;i.width=d+this.unitOfMeasure;i.height=(i.rows*(this.cellWidth+this.iGapSize)-this.iGapSize)+this.unitOfMeasure;i.calculatedCoords=true;}}}};V.prototype.fitElement=function(i,w,h,g,s){var p,t=this,b=Math.min(w,this.numberOfCols),l=t.lastItemPosition.top,c=t.lastItemPosition.left;this.items[i]={rows:h,cols:b,calculatedCoords:false};if(h>this.virtualGridMatrix.length){this.addEmptyRows(h-this.virtualGridMatrix.length);}if(g){e.call(this);}this.virtualGridMatrix.forEach(function(d,r,f){d.forEach(function(j,k,m){var n=t.bAllowDenseFill||r>l||(r==l&&k>c);if(n&&t.virtualGridMatrix[r][k]===0&&!p){if(t.shouldElementFit(r,k,b,h)){t.fillElement(r,k,b,h,i);p=true;}}});});if(!p&&!s){this.fitElement(i,w,h,true,true);}};V.prototype.shouldElementFit=function(r,c,w,h){var t=r+h;var b=c+w;var m=this.virtualGridMatrix;for(var i=r;i<t;i++){for(var j=c;j<b;j++){if((m[i][j]!==0)||(m.length<t)||(m[i].length<c+w)){return false;}}}return true;};V.prototype.fillElement=function(r,c,w,h,b){for(var i=r;i<r+h;i++){for(var j=c;j<c+w;j++){this.virtualGridMatrix[i][j]=b;}}this.lastItemPosition={top:r,left:c};};return V;});
