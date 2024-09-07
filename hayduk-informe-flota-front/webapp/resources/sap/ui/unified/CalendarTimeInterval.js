/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/Control','sap/ui/core/LocaleData','sap/ui/unified/calendar/CalendarUtils','./calendar/Header','./calendar/TimesRow','./calendar/DatesRow','./calendar/MonthPicker','./calendar/YearPicker','sap/ui/core/date/UniversalDate','./library','sap/ui/core/format/DateFormat','sap/ui/Device','sap/ui/core/Locale','sap/ui/core/library',"./CalendarTimeIntervalRenderer"],function(q,C,L,a,H,T,D,M,Y,U,l,b,c,d,e,f){"use strict";var g=e.CalendarType;var h=C.extend("sap.ui.unified.CalendarTimeInterval",{metadata:{library:"sap.ui.unified",properties:{width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},startDate:{type:"object",group:"Data"},intervalSelection:{type:"boolean",group:"Behavior",defaultValue:false},singleSelection:{type:"boolean",group:"Behavior",defaultValue:true},items:{type:"int",group:"Appearance",defaultValue:12},intervalMinutes:{type:"int",group:"Appearance",defaultValue:60},pickerPopup:{type:"boolean",group:"Appearance",defaultValue:false},minDate:{type:"object",group:"Misc",defaultValue:null},maxDate:{type:"object",group:"Misc",defaultValue:null}},aggregations:{selectedDates:{type:"sap.ui.unified.DateRange",multiple:true,singularName:"selectedDate"},specialDates:{type:"sap.ui.unified.DateTypeRange",multiple:true,singularName:"specialDate"},header:{type:"sap.ui.unified.calendar.Header",multiple:false,visibility:"hidden"},timesRow:{type:"sap.ui.unified.calendar.TimesRow",multiple:false,visibility:"hidden"},datesRow:{type:"sap.ui.unified.calendar.Month",multiple:false,visibility:"hidden"},monthPicker:{type:"sap.ui.unified.calendar.MonthPicker",multiple:false,visibility:"hidden"},yearPicker:{type:"sap.ui.unified.calendar.YearPicker",multiple:false,visibility:"hidden"},calendarPicker:{type:"sap.ui.unified.Calendar",multiple:false,visibility:"hidden"}},associations:{ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"},legend:{type:"sap.ui.unified.CalendarLegend",multiple:false}},events:{select:{},cancel:{},startDateChange:{}}}});h.prototype.init=function(){this._iMode=0;this._oYearFormat=b.getDateInstance({format:"y"});this.data("sap-ui-fastnavgroup","true",true);this._oMinDate=new U(new Date(Date.UTC(1,0,1)));this._oMinDate.getJSDate().setUTCFullYear(1);this._oMaxDate=new U(new Date(Date.UTC(9999,11,31,23,59,59)));this._initializeHeader();this._initializeTimesRow();this._initilizeMonthPicker();this._initilizeYearPicker();this.setPickerPopup(false);this._iItemsHead=15;};h.prototype._initializeHeader=function(){var $=new H(this.getId()+"--Head");$.attachEvent("pressPrevious",this._handlePrevious,this);$.attachEvent("pressNext",this._handleNext,this);this.setAggregation("header",$);};h.prototype._initializeTimesRow=function(){var $=new T(this.getId()+"--TimesRow");$.attachEvent("focus",G,this);$.attachEvent("select",F,this);$._bNoThemeChange=true;this.setAggregation("timesRow",$);};h.prototype._initilizeMonthPicker=function(){this.setAggregation("monthPicker",this._createMonthPicker());};h.prototype._initilizeYearPicker=function(){this.setAggregation("yearPicker",this._createYearPicker());};h.prototype._createDatesRow=function(){var $=new D(this.getId()+"--DatesRow",{days:18,selectedDates:[new sap.ui.unified.DateRange(this.getId()+"--Range")]});$.attachEvent("focus",K,this);$.attachEvent("select",J,this);$._bNoThemeChange=true;$.getIntervalSelection=function(){return this.getProperty("intervalSelection");};$.getSingleSelection=function(){return this.getProperty("singleSelection");};$.getSelectedDates=function(){return this.getAggregation("selectedDates",[]);};$.getSpecialDates=function(){return this.getAggregation("specialDates",[]);};$.getAriaLabelledBy=function(){return this.getAssociation("ariaLabelledBy",[]);};return $;};h.prototype._createMonthPicker=function(){var $=new M(this.getId()+"--MP",{columns:0,months:6});$.attachEvent("select",N,this);$._bNoThemeChange=true;$.attachEvent("pageChange",X,this);return $;};h.prototype._createYearPicker=function(){var $=new Y(this.getId()+"--YP",{columns:0,years:6});$.attachEvent("select",O,this);$.attachEvent("pageChange",Z,this);$._oMinDate.setYear(this._oMinDate.getUTCFullYear());$._oMaxDate.setYear(this._oMaxDate.getUTCFullYear());return $;};h.prototype.exit=function(){if(this._sInvalidateContent){q.sap.clearDelayedCall(this._sInvalidateContent);}};h.prototype.onBeforeRendering=function(){var $=this.getAggregation("timesRow");var a1=this._getFocusedDate();u.call(this);$.displayDate(a._createLocalDate(a1,true));};h.prototype._getCalendarPicker=function(){var $=this.getAggregation("calendarPicker");if(!$){$=new sap.ui.unified.Calendar(this.getId()+"--Cal",{});$.setPopupMode(true);$.attachEvent("select",I,this);$.attachEvent("cancel",function(a1){this._oPopup.close();},this);this.setAggregation("calendarPicker",$);}return $;};h.prototype.setStartDate=function($){a._checkJSDateObject($);if(q.sap.equal(this.getStartDate(),$)){return this;}var a1=$.getFullYear();a._checkYearInValidRange(a1);var b1=this.getMinDate();if(b1&&$.getTime()<b1.getTime()){q.sap.log.warning("startDate < minDate -> minDate as startDate set",this);$=new Date(b1);}var c1=this.getMaxDate();if(c1&&$.getTime()>c1.getTime()){q.sap.log.warning("startDate > maxDate -> maxDate as startDate set",this);$=new Date(c1);}this.setProperty("startDate",$,true);var d1=this.getAggregation("timesRow");d1.setStartDate($);this._oUTCStartDate=new U(d1._getStartDate().getTime());u.call(this);var e1=a._createLocalDate(this._getFocusedDate(),true);if(!d1.checkDateFocusable(e1)){this._setFocusedDate(this._oUTCStartDate);d1.displayDate($);}return this;};h.prototype.invalidate=function($){if(!this._bDateRangeChanged&&(!$||!($ instanceof sap.ui.unified.DateRange))){if(!$||(!($ instanceof D||$ instanceof M||$ instanceof Y||$ instanceof H))){C.prototype.invalidate.apply(this,arguments);}}else if(this.getDomRef()&&this._iMode==0&&!this._sInvalidateContent){this._sInvalidateContent=q.sap.delayedCall(0,this,P);}};h.prototype.removeAllSelectedDates=function(){this._bDateRangeChanged=true;var $=this.removeAllAggregation("selectedDates");return $;};h.prototype.destroySelectedDates=function(){this._bDateRangeChanged=true;var $=this.destroyAggregation("selectedDates");return $;};h.prototype.removeAllSpecialDates=function(){this._bDateRangeChanged=true;var $=this.removeAllAggregation("specialDates");return $;};h.prototype.destroySpecialDates=function(){this._bDateRangeChanged=true;var $=this.destroyAggregation("specialDates");return $;};h.prototype.setIntervalMinutes=function($){if($>=720){throw new Error("Only intervals < 720 minutes are allowed; "+this);}if(1440%$>0){throw new Error("A day must be divisible by the interval size; "+this);}this.setProperty("intervalMinutes",$,false);var a1=this.getAggregation("timesRow");var b1=a._createLocalDate(this._getFocusedDate(),true);if(!a1.checkDateFocusable(b1)){var c1=i.call(this);this._setFocusedDate(c1);a1.setDate(a._createLocalDate(c1,true));}return this;};h.prototype.setLocale=function($){if(this._sLocale!=$){this._sLocale=$;this._oLocaleData=undefined;this.invalidate();}return this;};h.prototype.getLocale=function(){if(!this._sLocale){this._sLocale=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();}return this._sLocale;};h.prototype._getFocusedDate=function(){if(!this._oFocusedDate){k.call(this);}return this._oFocusedDate;};h.prototype._setFocusedDate=function($){if(!($ instanceof U)){throw new Error("Date must be a UniversalDate object "+this);}this._oFocusedDate=new U($.getTime());};h.prototype.focusDate=function($){var a1=false;var b1=this.getAggregation("timesRow");if(!b1.checkDateFocusable($)){var c1=a._createUniversalUTCDate($,undefined,true);Q.call(this,c1);a1=true;}z.call(this,$,false);if(a1){this.fireStartDateChange();}return this;};h.prototype.displayDate=function($){z.call(this,$,true);return this;};h.prototype.setItems=function($){this.setProperty("items",$,true);$=this._getItems();var a1=this.getAggregation("timesRow");a1.setItems($);var b1=a._createLocalDate(this._getFocusedDate(),true);if(!a1.checkDateFocusable(b1)){var c1=i.call(this);this._setFocusedDate(c1);a1.setDate(a._createLocalDate(c1,true));}if(!this.getPickerPopup()){var d1=this.getAggregation("datesRow");var e1=Math.floor($*1.5);if(e1>31){e1=31;}d1.setDays(e1);var f1=this.getAggregation("monthPicker");var g1=Math.floor($/2);if(g1>12){g1=12;}f1.setMonths(g1);var h1=this.getAggregation("yearPicker");var i1=Math.floor($/2);if(i1>20){i1=20;}h1.setYears(i1);}u.call(this);if(this.getDomRef()){if(this._getShowItemHeader()){this.$().addClass("sapUiCalIntHead");}else{this.$().removeClass("sapUiCalIntHead");}}return this;};h.prototype._getItems=function(){var $=this.getItems();if(c.system.phone&&$>6){return 6;}else{return $;}};h.prototype._getLocaleData=function(){if(!this._oLocaleData){var $=this.getLocale();var a1=new d($);this._oLocaleData=L.getInstance(a1);}return this._oLocaleData;};h.prototype.setPickerPopup=function($){var a1=this.getAggregation("header"),b1,c1,d1;this.setProperty("pickerPopup",$,true);if(b1){b1.destroy();}if($){a1.setVisibleButton0(false);a1.setVisibleButton1(true);a1.setVisibleButton2(false);a1.detachEvent("pressButton1",B,this);a1.attachEvent("pressButton1",B,this);if(this.getAggregation("datesRow")){this.getAggregation("datesRow").destroy();}if(this.getAggregation("monthPicker")){this.getAggregation("monthPicker").destroy();}if(this.getAggregation("yearPicker")){this.getAggregation("yearPicker").destroy();}}else{a1.setVisibleButton0(true);a1.setVisibleButton1(true);a1.setVisibleButton2(true);a1.detachEvent("pressButton0",A,this);a1.attachEvent("pressButton0",A,this);a1.detachEvent("pressButton1",B,this);a1.attachEvent("pressButton1",B,this);a1.detachEvent("pressButton2",E,this);a1.attachEvent("pressButton2",E,this);if(!this.getAggregation("datesRow")){this.setAggregation("datesRow",this._createDatesRow());}if(!this.getAggregation("yearPicker")){this.setAggregation("yearPicker",this._createYearPicker());}if(!this.getAggregation("monthPicker")){this.setAggregation("monthPicker",this._createMonthPicker());}c1=this.getAggregation("monthPicker");d1=this.getAggregation("yearPicker");c1.setColumns(0);c1.setMonths(6);d1.setColumns(0);d1.setYears(6);}return this;};h.prototype.setMinDate=function($){var a1,b1,c1,d1;if(q.sap.equal($,this.getMinDate())){return this;}if(!$){a._updateUTCDate(this._oMinDate.getJSDate(),1,0,1,0,0,0,0);}else{a._checkJSDateObject($);this._oMinDate=a._createUniversalUTCDate($,undefined,true);a1=this.getAggregation("timesRow");this._oMinDate=a1._getIntervalStart(this._oMinDate);b1=this._oMinDate.getUTCFullYear();a._checkYearInValidRange(b1);if(this._oMaxDate.getTime()<this._oMinDate.getTime()){q.sap.log.warning("minDate > maxDate -> maxDate set to end of the month",this);this._oMaxDate=a._createUniversalUTCDate($,undefined,true);a._updateUTCDate(this._oMaxDate,null,this._oMaxDate.getUTCMonth()+1,0,23,59,59,0);this.setProperty("maxDate",a._createLocalDate(this._oMaxDate,true),true);}if(this._oFocusedDate){if(this._oFocusedDate.getTime()<this._oMinDate.getTime()){q.sap.log.warning("focused date < minDate -> minDate focused",this);this.focusDate($);}}if(this._oUTCStartDate&&this._oUTCStartDate.getTime()<this._oMinDate.getTime()){q.sap.log.warning("start date < minDate -> minDate set as start date",this);_.call(this,new U(this._oMinDate.getTime()),true,true);}}this.setProperty("minDate",$,false);if(this.getPickerPopup()){d1=this._getCalendarPicker();d1.setMinDate($);}else{c1=this.getAggregation("yearPicker");c1._oMinDate.setYear(this._oMinDate.getUTCFullYear());}return this;};h.prototype.setMaxDate=function($){var a1,b1,c1,d1,e1,f1;if(q.sap.equal($,this.getMaxDate())){return this;}if(!$){a._updateUTCDate(this._oMaxDate.getJSDate(),9999,11,31,23,59,59,0);}else{a._checkJSDateObject($);this._oMaxDate=a._createUniversalUTCDate($,undefined,true);a1=this.getAggregation("timesRow");this._oMaxDate=a1._getIntervalStart(this._oMaxDate);this._oMaxDate.setUTCMinutes(this._oMaxDate.getUTCMinutes()+this.getIntervalMinutes());this._oMaxDate.setUTCMilliseconds(-1);b1=this._oMaxDate.getUTCFullYear();a._checkYearInValidRange(b1);if(this._oMinDate.getTime()>this._oMaxDate.getTime()){q.sap.log.warning("maxDate < minDate -> minDate set to begin of the month",this);this._oMinDate=a._createUniversalUTCDate($,undefined,true);a._updateUTCDate(this._oMinDate,null,null,1,0,0,0,0);this.setProperty("minDate",a._createLocalDate(this._oMinDate,true),true);}if(this._oFocusedDate){if(this._oFocusedDate.getTime()>this._oMaxDate.getTime()){q.sap.log.warning("focused date > maxDate -> maxDate focused",this);this.focusDate($);}}if(this._oUTCStartDate){c1=new U(this._oUTCStartDate.getTime());c1.setUTCMinutes(c1.getUTCMinutes()+this.getIntervalMinutes()*(this._getItems()-1));if(c1.getTime()>this._oMaxDate.getTime()){d1=new U(this._oMaxDate.getTime());d1.setUTCMinutes(d1.getUTCMinutes()-this.getIntervalMinutes()*(this._getItems()-1));if(d1.getTime()>=this._oMinDate.getTime()){q.sap.log.warning("end date > maxDate -> maxDate set as end date",this);_.call(this,d1,true,true);}}}}this.setProperty("maxDate",$,false);if(this.getPickerPopup()){f1=this._getCalendarPicker();f1.setMaxDate($);}else{e1=this.getAggregation("yearPicker");e1._oMaxDate.setYear(this._oMaxDate.getUTCFullYear());}return this;};h.prototype.onclick=function($){if($.isMarked("delayedMouseEvent")){return;}if($.target.id==this.getId()+"-cancel"){this.onsapescape($);}};h.prototype.onmousedown=function($){$.preventDefault();$.setMark("cancelAutoClose");};h.prototype.onsapescape=function($){if(this.getPickerPopup()){m.call(this);this.fireCancel();}else{switch(this._iMode){case 0:this.fireCancel();break;case 1:o.call(this);break;case 2:r.call(this);break;case 3:t.call(this);break;}}};h.prototype.onsaptabnext=function($){var a1=this.getAggregation("header"),b1,c1,d1;if(q.sap.containsOrEquals(this.getDomRef("content"),$.target)){if(this.getPickerPopup()){q.sap.focus(a1.getDomRef("B1"));}else{q.sap.focus(a1.getDomRef("B0"));}if(!this._bPoupupMode){d1=this.getAggregation("timesRow");q(d1._oItemNavigation.getItemDomRefs()[d1._oItemNavigation.getFocusedIndex()]).attr("tabindex","-1");if(!this.getPickerPopup()){b1=this.getAggregation("monthPicker");c1=this.getAggregation("yearPicker");if(b1.getDomRef()){q(b1._oItemNavigation.getItemDomRefs()[b1._oItemNavigation.getFocusedIndex()]).attr("tabindex","-1");}if(c1.getDomRef()){q(c1._oItemNavigation.getItemDomRefs()[c1._oItemNavigation.getFocusedIndex()]).attr("tabindex","-1");}}}$.preventDefault();}else if($.target.id==a1.getId()+"-B0"){q.sap.focus(a1.getDomRef("B1"));$.preventDefault();}else if(!this.getPickerPopup()&&($.target.id==a1.getId()+"-B1")){q.sap.focus(a1.getDomRef("B2"));$.preventDefault();}};h.prototype.onsaptabprevious=function($){var a1=this.getAggregation("header"),b1,c1,d1;if(q.sap.containsOrEquals(this.getDomRef("content"),$.target)){if(this._bPoupupMode){q.sap.focus(a1.getDomRef("B2"));$.preventDefault();}}else if($.target.id==a1.getId()+"-B0"){d1=this.getAggregation("timesRow");switch(this._iMode){case 0:d1._oItemNavigation.focusItem(d1._oItemNavigation.getFocusedIndex());break;case 2:if(!this.getPickerPopup()){b1=this.getAggregation("monthPicker");b1._oItemNavigation.focusItem(b1._oItemNavigation.getFocusedIndex());}break;case 3:if(!this.getPickerPopup()){c1=this.getAggregation("yearPicker");c1._oItemNavigation.focusItem(c1._oItemNavigation.getFocusedIndex());}break;}$.preventDefault();}else if($.target.id==a1.getId()+"-B2"){q.sap.focus(a1.getDomRef("B1"));$.preventDefault();}else if($.target.id==a1.getId()+"-B1"){if(!this.getPickerPopup()){q.sap.focus(a1.getDomRef("B0"));}else{d1=this.getAggregation("timesRow");d1._oItemNavigation.focusItem(d1._oItemNavigation.getFocusedIndex());}$.preventDefault();}};h.prototype.onfocusin=function($){if($.target.id==this.getId()+"-end"){var a1=this.getAggregation("header"),b1,c1,d1;if(this.getPickerPopup()){q.sap.focus(a1.getDomRef("B1"));}else{q.sap.focus(a1.getDomRef("B2"));}if(!this._bPoupupMode){b1=this.getAggregation("timesRow");q(b1._oItemNavigation.getItemDomRefs()[b1._oItemNavigation.getFocusedIndex()]).attr("tabindex","-1");if(!this.getPickerPopup()){c1=this.getAggregation("monthPicker");d1=this.getAggregation("yearPicker");if(c1.getDomRef()){q(c1._oItemNavigation.getItemDomRefs()[c1._oItemNavigation.getFocusedIndex()]).attr("tabindex","-1");}if(d1.getDomRef()){q(d1._oItemNavigation.getItemDomRefs()[d1._oItemNavigation.getFocusedIndex()]).attr("tabindex","-1");}}}}this.$("end").attr("tabindex","-1");};h.prototype.onsapfocusleave=function($){if(!$.relatedControlId||!q.sap.containsOrEquals(this.getDomRef(),sap.ui.getCore().byId($.relatedControlId).getFocusDomRef())){this.$("end").attr("tabindex","0");if(!this._bPoupupMode){var a1,b1,c1;switch(this._iMode){case 0:a1=this.getAggregation("timesRow");q(a1._oItemNavigation.getItemDomRefs()[a1._oItemNavigation.getFocusedIndex()]).attr("tabindex","0");break;case 2:if(!this.getPickerPopup()){b1=this.getAggregation("monthPicker");q(b1._oItemNavigation.getItemDomRefs()[b1._oItemNavigation.getFocusedIndex()]).attr("tabindex","0");}break;case 3:if(!this.getPickerPopup()){c1=this.getAggregation("yearPicker");q(c1._oItemNavigation.getItemDomRefs()[c1._oItemNavigation.getFocusedIndex()]).attr("tabindex","0");}break;}}}};h.prototype._handlePrevious=function($){var a1=this._getFocusedDate(),b1,c1,d1,e1,f1,g1,h1,i1;switch(this._iMode){case 0:b1=this._getItems();c1=new U(i.call(this).getTime());d1=this.getIntervalMinutes();c1.setUTCMinutes(c1.getUTCMinutes()-b1*d1);a1.setUTCMinutes(a1.getUTCMinutes()-b1*d1);this._setFocusedDate(a1);_.call(this,c1,true);break;case 1:if(!this.getPickerPopup()){e1=this.getAggregation("datesRow");f1=a._createUniversalUTCDate(e1.getDate());g1=e1.getDays();if(f1.getUTCDate()<=g1){f1.setUTCDate(1);}else{f1.setUTCDate(f1.getUTCDate()-g1);}R.call(this,f1);}break;case 2:if(!this.getPickerPopup()){h1=this.getAggregation("monthPicker");if(h1.getMonths()<12){h1.previousPage();v.call(this);}else{a1.setUTCFullYear(a1.getUTCFullYear()-1);Q.call(this,a1);this._setFocusedDate(a1);u.call(this);W.call(this,a1.getUTCFullYear(),h1);this.fireStartDateChange();}}break;case 3:if(!this.getPickerPopup()){i1=this.getAggregation("yearPicker");i1.previousPage();w.call(this);}break;}};h.prototype._handleNext=function($){var a1=this._getFocusedDate();switch(this._iMode){case 0:var b1=this._getItems();var c1=new U(i.call(this).getTime());var d1=this.getIntervalMinutes();c1.setUTCMinutes(c1.getUTCMinutes()+b1*d1);a1.setUTCMinutes(a1.getUTCMinutes()+b1*d1);this._setFocusedDate(a1);_.call(this,c1,true);break;case 1:if(!this.getPickerPopup()){var e1=this.getAggregation("datesRow");var f1=a._createUniversalUTCDate(e1.getDate());var g1=new U(f1.getTime());g1.setUTCDate(1);g1.setUTCMonth(g1.getUTCMonth()+1);g1.setUTCDate(0);var h1=e1.getDays();if(f1.getUTCDate()+h1>g1.getUTCDate()){f1.setUTCDate(g1.getUTCDate());}else{f1.setUTCDate(f1.getUTCDate()+h1);}R.call(this,f1);}break;case 2:if(!this.getPickerPopup()){var i1=this.getAggregation("monthPicker");if(i1.getMonths()<12){i1.nextPage();v.call(this);}else{a1.setUTCFullYear(a1.getUTCFullYear()+1);Q.call(this,a1);this._setFocusedDate(a1);u.call(this);W.call(this,a1.getUTCFullYear(),i1);this.fireStartDateChange();}}break;case 3:if(!this.getPickerPopup()){var j1=this.getAggregation("yearPicker");j1.nextPage();w.call(this);}break;}};h.prototype._getShowItemHeader=function(){var $=this.getItems();if($>this._iItemsHead){return true;}else{return false;}};function _($,a1,b1){var c1=new U(this._oMaxDate.getTime());c1.setUTCMinutes(c1.getUTCMinutes()-this.getIntervalMinutes()*(this._getItems()-1));if(c1.getTime()<this._oMinDate.getTime()){c1=new U(this._oMinDate.getTime());c1.setUTCMinutes(c1.getUTCMinutes()+this.getIntervalMinutes()*(this._getItems()-1));}if($.getTime()<this._oMinDate.getTime()){$=new U(this._oMinDate.getTime());}else if($.getTime()>c1.getTime()){$=c1;}var d1=this.getAggregation("timesRow");var e1=a._createLocalDate($,true);d1.setStartDate(e1);this._oUTCStartDate=new U(d1._getStartDate().getTime());e1=a._createLocalDate(this._oUTCStartDate,true);this.setProperty("startDate",e1,true);u.call(this);if(a1){var f1=a._createLocalDate(this._getFocusedDate(),true);if(!d1.checkDateFocusable(f1)){this._setFocusedDate($);d1.setDate(e1);}else{d1.setDate(f1);}}if(!b1){this.fireStartDateChange();}}function i(){if(!this._oUTCStartDate){var $=this.getAggregation("timesRow");$.setStartDate(a._createLocalDate(this._getFocusedDate(),true));this._oUTCStartDate=new U($._getStartDate().getTime());this._setFocusedDate(this._oUTCStartDate);}return this._oUTCStartDate;}function j($){var a1=this._getFocusedDate();var b1=this.getAggregation("timesRow");if(!$){b1.setDate(a._createLocalDate(a1,true));}else{b1.displayDate(a._createLocalDate(a1,true));}u.call(this);}function k(){var $=this.getSelectedDates();if($&&$[0]&&$[0].getStartDate()){this._oFocusedDate=a._createUniversalUTCDate($[0].getStartDate(),undefined,true);}else{var a1=new Date();this._oFocusedDate=a._createUniversalUTCDate(a1,undefined,true);}if(this._oFocusedDate.getTime()<this._oMinDate.getTime()){this._oFocusedDate=new U(this._oMinDate.getTime());}else if(this._oFocusedDate.getTime()>this._oMaxDate.getTime()){this._oFocusedDate=new U(this._oMaxDate.getTime());}}h.prototype._showCalendarPicker=function(){var $=a._createLocalDate(this._getFocusedDate(),true);var a1=this._getCalendarPicker();var b1=new sap.ui.unified.DateRange({startDate:$});a1.displayDate($,false);a1.removeAllSelectedDates();a1.addSelectedDate(b1);a1.setMinDate(this.getMinDate());a1.setMaxDate(this.getMaxDate());S.call(this,a1);this._showOverlay();};h.prototype._showOverlay=function(){this.$("contentOver").css("display","");};h.prototype._hideOverlay=function(){this.$("contentOver").css("display","none");};function m($){if(this._oPopup&&this._oPopup.isOpen()){this._oPopup.close();}this._hideOverlay();if(!$){j.call(this);var a1=this.getAggregation("timesRow");q(a1._oItemNavigation.getItemDomRefs()[a1._oItemNavigation.getFocusedIndex()]).attr("tabindex","0");}}function n(){if(this._iMode==3){t.call(this,true);}else if(this._iMode==2){r.call(this,true);}var $=this._getFocusedDate();var a1=this._getItems();var b1=this.getAggregation("datesRow");var c1=b1.getSelectedDates()[0];c1.setStartDate(a._createLocalDate($,true));var d1=new U($.getTime());d1.setUTCDate(1);d1.setUTCMonth(d1.getUTCMonth()+1);d1.setUTCDate(0);var e1=d1.getUTCDate();var f1=Math.floor(a1*1.5);if(f1>e1){f1=e1;}b1.setDays(f1);if(b1.getDomRef()){b1.$().css("display","");}else{var g1=sap.ui.getCore().createRenderManager();var h1=this.$("content");g1.renderControl(b1);g1.flush(h1[0],false,true);g1.destroy();}this._showOverlay();R.call(this,$);if(this._iMode==0){var i1=this.getAggregation("timesRow");q(i1._oItemNavigation.getItemDomRefs()[i1._oItemNavigation.getFocusedIndex()]).attr("tabindex","-1");}this._iMode=1;}function o($){this._iMode=0;var a1=this.getAggregation("datesRow");a1.$().css("display","none");this._hideOverlay();if(!$){j.call(this);var b1=this.getAggregation("timesRow");q(b1._oItemNavigation.getItemDomRefs()[b1._oItemNavigation.getFocusedIndex()]).attr("tabindex","0");}}function p(){if(this._iMode==1){o.call(this,true);}else if(this._iMode==3){t.call(this,true);}var $=this._getFocusedDate();var a1=this.getAggregation("monthPicker");if(a1.getDomRef()){a1.$().css("display","");}else{var b1=sap.ui.getCore().createRenderManager();var c1=this.$("content");b1.renderControl(a1);b1.flush(c1[0],false,true);b1.destroy();}this._showOverlay();a1.setMonth($.getUTCMonth());W.call(this,$.getUTCFullYear(),a1);if(this._iMode==0){var d1=this.getAggregation("timesRow");q(d1._oItemNavigation.getItemDomRefs()[d1._oItemNavigation.getFocusedIndex()]).attr("tabindex","-1");}this._iMode=2;v.call(this);}function r($){this._iMode=0;var a1=this.getAggregation("monthPicker");a1.$().css("display","none");this._hideOverlay();if(!$){j.call(this);var b1=this.getAggregation("timesRow");q(b1._oItemNavigation.getItemDomRefs()[b1._oItemNavigation.getFocusedIndex()]).attr("tabindex","0");}}function s(){if(this._iMode==1){o.call(this,true);}else if(this._iMode==2){r.call(this,true);}var $=this._getFocusedDate();var a1=this.getAggregation("yearPicker");if(a1.getDomRef()){a1.$().css("display","");}else{var b1=sap.ui.getCore().createRenderManager();var c1=this.$("content");b1.renderControl(a1);b1.flush(c1[0],false,true);b1.destroy();}this._showOverlay();a1.setDate($.getJSDate());if(this._iMode==0){var d1=this.getAggregation("timesRow");q(d1._oItemNavigation.getItemDomRefs()[d1._oItemNavigation.getFocusedIndex()]).attr("tabindex","-1");}w.call(this);this._iMode=3;}function t($){this._iMode=0;var a1=this.getAggregation("yearPicker");a1.$().css("display","none");this._hideOverlay();if(!$){j.call(this);var b1=this.getAggregation("timesRow");q(b1._oItemNavigation.getItemDomRefs()[b1._oItemNavigation.getFocusedIndex()]).attr("tabindex","0");}}function u(){x.call(this);v.call(this,true);}function v($){var a1=new U(i.call(this).getTime());var b1=this._getItems();var c1=a1.getJSDate().getUTCFullYear();var d1=this._oMaxDate.getJSDate().getUTCFullYear();var e1=this._oMinDate.getJSDate().getUTCFullYear();var f1=a1.getJSDate().getUTCMonth();var g1=this._oMaxDate.getJSDate().getUTCMonth();var h1=this._oMinDate.getJSDate().getUTCMonth();var i1=a1.getJSDate().getUTCDate();var j1=this._oMaxDate.getJSDate().getUTCDate();var k1=this._oMinDate.getJSDate().getUTCDate();var l1=a1.getJSDate().getUTCHours();var m1=this._oMaxDate.getJSDate().getUTCHours();var n1=this._oMinDate.getJSDate().getUTCHours();var o1=a1.getJSDate().getUTCMinutes();var p1=this._oMaxDate.getJSDate().getUTCMinutes();var q1=this._oMinDate.getJSDate().getUTCMinutes();var r1=this.getAggregation("header");if(this._iMode==2&&!$){var s1=this.getAggregation("monthPicker");var t1=s1.getMonths();var u1=s1.getStartMonth();var v1=u1+t1-1;if(u1==0||(c1==e1&&u1<=h1)){r1.setEnabledPrevious(false);}else{r1.setEnabledPrevious(true);}if(v1>10||(c1==d1&&v1>=g1)){r1.setEnabledNext(false);}else{r1.setEnabledNext(true);}return;}if((c1<e1||(c1==e1&&(!$||(f1<h1||(f1==h1&&(i1<k1||(i1==k1&&(l1<n1||(l1==n1&&o1<=q1)))))))))||((this._iMode==1||this._iMode==2)&&this.getPickerPopup())){r1.setEnabledPrevious(false);}else{r1.setEnabledPrevious(true);}a1.setUTCMinutes(a1.getUTCMinutes()+(b1)*this.getIntervalMinutes()-1);c1=a1.getJSDate().getUTCFullYear();f1=a1.getJSDate().getUTCMonth();i1=a1.getJSDate().getUTCDate();l1=a1.getJSDate().getUTCHours();o1=a1.getJSDate().getUTCMinutes();if((c1>d1||(c1==d1&&(!$||(f1>g1||(f1==g1&&(i1>j1||(i1==j1&&(l1>m1||(l1==m1&&o1>=p1)))))))))||((this._iMode==1||this._iMode==2)&&this.getPickerPopup())){r1.setEnabledNext(false);}else{r1.setEnabledNext(true);}}function w(){var $=this.getAggregation("yearPicker");var a1=$.getYears();var b1=a._createUniversalUTCDate($.getFirstRenderedDate());b1.setUTCFullYear(b1.getUTCFullYear()+Math.floor(a1/2));var c1=this.getAggregation("header");var d1=new U(this._oMaxDate);d1.setUTCFullYear(d1.getUTCFullYear()-Math.ceil(a1/2));d1.setUTCMonth(11,31);var e1=new U(this._oMinDate);e1.setUTCFullYear(e1.getUTCFullYear()+Math.floor(a1/2)+1);e1.setUTCMonth(0,1);if(b1.getTime()>d1.getTime()){c1.setEnabledNext(false);}else{c1.setEnabledNext(true);}if(b1.getTime()<e1.getTime()){c1.setEnabledPrevious(false);}else{c1.setEnabledPrevious(true);}}function x(){var $=this.getAggregation("header");var a1;var b1=i.call(this);var c1;var d1=this._getLocaleData();var e1=[];var f1=[];var g1;var h1=false;var i1;var j1=g.Gregorian;var k1=false;if(d1.oLocale.sLanguage.toLowerCase()==="ja"||d1.oLocale.sLanguage.toLowerCase()==="zh"){i1=b.getDateInstance({format:"d"}).format(b1,true);}else{i1=(b1.getUTCDate()).toString();}if(this._bLongMonth||!this._bNamesLengthChecked){e1=d1.getMonthsStandAlone("wide");}else{h1=true;e1=d1.getMonthsStandAlone("abbreviated");f1=d1.getMonthsStandAlone("wide");}var l1=b1.getUTCMonth();a1=e1[l1];if(h1){g1=f1[e1[l1]];}if(!this.getPickerPopup()){$.setTextButton0(i1);$.setTextButton1(a1);$.setTextButton2(this._oYearFormat.format(b1,true));}else{c1=b.getInstance({style:"long",strictParsing:true,relative:k1,calendarType:j1},d1.oLocale);g1=i1=c1.format(a._createLocalDate(b1,true));$.setTextButton1(i1);}if(h1){$.setAriaLabelButton1(g1);}}function y($,a1){var b1;var c1=false;if($.getTime()<this._oMinDate.getTime()){b1=this._oMinDate;c1=true;}else if($.getTime()>this._oMaxDate.getTime()){b1=this._oMaxDate;c1=true;}else{b1=$;}this._setFocusedDate(b1);if(c1||a1){Q.call(this,b1);j.call(this,false);this.fireStartDateChange();}}function z($,a1){if($&&(!this._oFocusedDate||this._oFocusedDate.getTime()!=$.getTime())){a._checkJSDateObject($);$=a._createUniversalUTCDate($,undefined,true);var b1=$.getUTCFullYear();a._checkYearInValidRange(b1);if($.getTime()<this._oMinDate.getTime()||$.getTime()>this._oMaxDate.getTime()){throw new Error("Date must not be in valid range (minDate and maxDate); "+this);}this._setFocusedDate($);if(this.getDomRef()&&this._iMode==0){j.call(this,a1);}}}function A($){if(this._iMode!=1){n.call(this);}else{o.call(this);}}function B($){if(this.getPickerPopup()){this._showCalendarPicker();}else{if(this._iMode!=2){p.call(this);}else{r.call(this);}}}function E($){if(this._iMode!=3){s.call(this);}else{t.call(this);}}function F($){this.fireSelect();}function G($){var a1=a._createUniversalUTCDate($.getParameter("date"),undefined,true);var b1=$.getParameter("notVisible");y.call(this,a1,b1);}function I($){var a1=$.getSource(),b1=a1.getSelectedDates()[0].getStartDate();var c1=new U(this._getFocusedDate().getTime());var d1=a._createUniversalUTCDate(b1);c1.setUTCDate(d1.getUTCDate());c1.setUTCMonth(d1.getUTCMonth());c1.setUTCFullYear(d1.getUTCFullYear());y.call(this,c1,true);m.call(this);}function J($){var a1=new U(this._getFocusedDate().getTime());var b1=$.oSource;var c1=b1.getSelectedDates()[0];var d1=a._createUniversalUTCDate(c1.getStartDate());if(!this.getPickerPopup()||d1.getUTCMonth()==a1.getUTCMonth()){a1.setUTCDate(d1.getUTCDate());a1.setUTCMonth(d1.getUTCMonth());a1.setUTCFullYear(d1.getUTCFullYear());y.call(this,a1,true);o.call(this);}}function K($){var a1=new U(this._getFocusedDate().getTime());var b1=a._createUniversalUTCDate($.getParameter("date"),undefined,true);var c1=$.getParameter("otherMonth");if(c1&&b1.getUTCMonth()==a1.getUTCMonth()&&b1.getUTCFullYear()==a1.getUTCFullYear()){R.call(this,b1);}}function N($){var a1=new U(this._getFocusedDate().getTime());var b1=this.getAggregation("monthPicker");var c1=b1.getMonth();a1.setUTCMonth(c1);if(c1!=a1.getUTCMonth()){a1.setUTCDate(0);}y.call(this,a1,true);r.call(this);}function O($){var a1=new U(this._getFocusedDate().getTime());var b1=this.getAggregation("yearPicker");var c1=a._createUniversalUTCDate(b1.getDate());var d1=a1.getUTCMonth();c1.setUTCMonth(a1.getUTCMonth(),a1.getUTCDate());c1.setUTCHours(a1.getUTCHours());c1.setUTCMinutes(a1.getUTCMinutes());a1=c1;if(d1!=a1.getUTCMonth()){a1.setUTCDate(0);}y.call(this,a1,true);t.call(this);}function P(){this._sInvalidateContent=undefined;var $=this.getAggregation("timesRow");$._bDateRangeChanged=true;$._bInvalidateSync=true;$.invalidate();$._bInvalidateSync=undefined;this._bDateRangeChanged=undefined;}function Q($){var a1=this.getAggregation("timesRow");var b1=i.call(this);var c1=a1._oItemNavigation.getFocusedIndex();b1=new U($.getTime());b1.setUTCMinutes(b1.getUTCMinutes()-c1*this.getIntervalMinutes());_.call(this,b1,false,true);}function R($){var a1=this.getAggregation("datesRow");var b1=this.getAggregation("header");if(!this.getPickerPopup()){var c1=new U($.getTime());c1.setUTCDate(1);c1.setUTCMonth(c1.getUTCMonth()+1);c1.setUTCDate(0);var d1=a1.getDays();var e1=new U($.getTime());e1.setUTCDate(1+(Math.ceil($.getUTCDate()/d1)-1)*d1);if(c1.getUTCDate()-e1.getUTCDate()<d1){e1.setUTCDate(c1.getUTCDate()-d1+1);}a1.setStartDate(a._createLocalDate(e1,true));var f1=e1.getJSDate().getUTCFullYear();var g1=this._oMaxDate.getJSDate().getUTCFullYear();var h1=this._oMinDate.getJSDate().getUTCFullYear();var i1=e1.getJSDate().getUTCMonth();var j1=this._oMaxDate.getJSDate().getUTCMonth();var k1=this._oMinDate.getJSDate().getUTCMonth();var l1=e1.getJSDate().getUTCDate();var m1=this._oMaxDate.getJSDate().getUTCDate();var n1=this._oMinDate.getJSDate().getUTCDate();if(l1<=1||(f1==h1&&i1==k1&&l1<=n1)){b1.setEnabledPrevious(false);}else{b1.setEnabledPrevious(true);}if((l1+d1)>=c1.getUTCDate()||(f1==g1&&i1==j1&&l1>=m1)){b1.setEnabledNext(false);}else{b1.setEnabledNext(true);}}else{b1.setEnabledPrevious(false);b1.setEnabledNext(false);}a1.setDate(a._createLocalDate($,true));}function S($){if(!this._oPopup){q.sap.require("sap.ui.core.Popup");this._oPopup=new sap.ui.core.Popup();this._oPopup.setAutoClose(true);this._oPopup.setAutoCloseAreas([this.getDomRef()]);this._oPopup.setDurations(0,0);this._oPopup._oCalendar=this;this._oPopup.attachClosed(V,this);this._oPopup.onsapescape=function(c1){this._oCalendar.onsapescape(c1);};}this._oPopup.setContent($);var a1=this.getAggregation("header");var b1=sap.ui.core.Popup.Dock;this._oPopup.open(0,b1.CenterTop,b1.CenterTop,a1,null,"flipfit",true);}function V($){m.call(this);}function W($,a1){var b1=0;var c1=11;if($==this._oMinDate.getUTCFullYear()){b1=this._oMinDate.getUTCMonth();}if($==this._oMaxDate.getUTCFullYear()){c1=this._oMaxDate.getUTCMonth();}a1.setMinMax(b1,c1);}function X($){v.call(this);}function Z($){w.call(this);}return h;});
