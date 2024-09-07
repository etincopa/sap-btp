/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/unified/calendar/CalendarDate','sap/ui/core/date/UniversalDate'],function(C,U){"use strict";var Y={};Y.render=function(r,y){var t=y.getTooltip_AsString();var I=y.getId();var c=y._getDate();var a=c.getYear();var b=y.getYears();var d=y.getColumns();var w="";r.write("<div");r.writeControlData(y);r.addClass("sapUiCalYearPicker");r.writeClasses();if(t){r.writeAttributeEscaped('title',t);}r.writeAccessibilityState(y,{role:"grid",readonly:"true",multiselectable:"false"});r.write(">");var D=new C(c,y.getPrimaryCalendarType());D.setYear(D.getYear()-Math.floor(b/2));var e=false;var f=y._checkFirstDate(D);if(!f.isSame(D)){D=f;e=true;}if(d>0){w=(100/d)+"%";}else{w=(100/b)+"%";}for(var i=0;i<b;i++){var s=y._oFormatYyyymmdd.format(D.toUTCJSDate(),true);var A={role:"gridcell"};var E=true;if(e){E=y._checkDateEnabled(D);}if(d>0&&i%d==0){r.write("<div");r.writeAccessibilityState(null,{role:"row"});r.write(">");}r.write("<div");r.writeAttribute("id",I+"-y"+s);r.addClass("sapUiCalItem");if(D.getYear()==a){r.addClass("sapUiCalItemSel");A["selected"]=true;}else{A["selected"]=false;}if(!E){r.addClass("sapUiCalItemDsbl");A["disabled"]=true;}r.writeAttribute("tabindex","-1");r.writeAttribute("data-sap-year-start",s);r.addStyle("width",w);r.writeClasses();r.writeStyles();r.writeAccessibilityState(null,A);r.write(">");r.write(y._oYearFormat.format(U.getInstance(D.toUTCJSDate(),D.getCalendarType()),true));r.write("</div>");D.setYear(D.getYear()+1);if(d>0&&((i+1)%d==0)){r.write("</div>");}}r.write("</div>");};return Y;},true);
