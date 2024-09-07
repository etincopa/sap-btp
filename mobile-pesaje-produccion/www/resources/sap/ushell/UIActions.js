sap.ui.define(function(){"use strict";var U=function(c){if(!c||!c.rootSelector||!c.containerSelector||!c.draggableSelector){throw new Error("No configuration object to initialize User Interaction module.");}this.animationDuration=null;this.captureStart=null;this.captureMove=null;this.captureEnd=null;this.clickCallback=null;this.clickEvent=null;this.clickHandler=null;this.clone=null;this.cloneClass=null;this.container=null;this.contextMenuEvent=null;this.debug=null;this.defaultDragStartEvent=null;this.defaultMouseMoveEvent=null;this.deltaTop=0;this.disabledDraggableSelector=null;this.dragAndScrollCallback=null;this.dragAndScrollDuration=null;this.dragAndScrollTimer=null;this.draggable=null;this.placeHolderClass=null;this.draggableSelector=null;this.draggableSelectorExclude=null;this.doubleTapCallback=null;this.doubleTapDelay=null;this.element=null;this.endDragAndScrollCallback;this.endX=null;this.endY=null;this.isLayoutEngine=null;this.isTouch=null;this.isCombi=null;this.lastElement=null;this.lastTapTime=null;this.lockMode=null;this.log=null;this.mode=null;this.mouseDownEvent=null;this.mouseMoveEvent=null;this.mouseUpEvent=null;this.moveTolerance=null;this.moveX=null;this.moveY=null;this.noop=null;this.onDragStartUIHandler=null;this.onDragEndUIHandler=null;this.preventClickFlag;this.preventClickTimeoutId;this.scrollContainer=null;this.scrollContainerSelector=null;this.scrollEvent=null;this.scrollTimer=null;this.startX=null;this.startY=null;this.switchModeDelay=null;this.tapsNumber=null;this.timer=null;this.scrollHandler=null;this.touchCancelEvent=null;this.dragCallback=null;this.onBeforeCreateClone=null;this.endCallback=null;this.touchEndEvent=null;this.touchMoveEvent=null;this.startCallback=null;this.touchStartEvent=null;this.wrapper=null;this.wrapperRect=null;this.scrollCallback=null;this.draggableElement;this.offsetLeft=0;this.elementsToCapture=null;this.init=function(c){this.startX=-1;this.startY=-1;this.moveX=-1;this.moveY=-1;this.endX=-1;this.endY=-1;this.noop=function(){};this.isLayoutEngine=c.isLayoutEngine||false;if(this.isLayoutEngine){this.moveDraggable=this.noop;}this.isTouch=c.isTouch?!!c.isTouch:false;this.isCombi=c.isCombi?!!c.isCombi:false;this.container=document.querySelector(c.containerSelector);this.scrollContainerSelector=c.scrollContainerSelector||c.containerSelector;this.switchModeDelay=c.switchModeDelay||1500;this.dragAndScrollDuration=c.dragAndScrollDuration||230;this.moveTolerance=c.moveTolerance===0?0:c.moveTolerance||10;this.draggableSelector=c.draggableSelector;this.draggableSelectorBlocker=c.draggableSelectorBlocker||c.rootSelector;this.draggableSelectorExclude=c.draggableSelectorExclude;this.mode='normal';this.debug=c.debug||false;this.root=document.querySelector(c.rootSelector)||document.querySelector("#canvas");this.animationDuration=c.animationDuration||330;this.tapsNumber=0;this.lastTapTime=0;this.log=this.debug?this.logToConsole:this.noop;this.lockMode=false;this.placeHolderClass=c.placeHolderClass||"";this.cloneClass=c.cloneClass||"";this.deltaTop=c.deltaTop||0;this.wrapper=c.wrapperSelector?document.querySelector(c.wrapperSelector):this.container.parentNode;this.clickCallback=typeof c.clickCallback==='function'?c.clickCallback:this.noop;this.startCallback=typeof c.startCallback==='function'?c.startCallback:this.noop;this.doubleTapCallback=typeof c.doubleTapCallback==='function'?c.doubleTapCallback:this.noop;this.endCallback=typeof c.endCallback==='function'?c.endCallback:this.noop;this.dragCallback=typeof c.dragCallback==='function'?c.dragCallback:this.noop;this.onBeforeCreateClone=typeof c.onBeforeCreateClone==='function'?c.onBeforeCreateClone:this.noop;this.dragAndScrollCallback=typeof c.dragAndScrollCallback==='function'?c.dragAndScrollCallback:this.noop;this.endDragAndScrollCallback=typeof c.endDragAndScrollCallback==='function'?c.endDragAndScrollCallback:this.noop;this.scrollCallback=typeof c.scrollCallback==='function'?c.scrollCallback:this.noop;this.doubleTapDelay=c.doubleTapDelay||500;this.wrapperRect=this.wrapper.getBoundingClientRect();this.scrollEvent='scroll';this.touchStartEvent='touchstart';this.touchMoveEvent='touchmove';this.touchEndEvent='touchend';this.mouseDownEvent='mousedown';this.mouseMoveEvent='mousemove';this.mouseUpEvent='mouseup';this.contextMenuEvent='contextmenu';this.touchCancelEvent='touchcancel';this.defaultDragStartEvent='dragstart';this.defaultMouseMoveEvent='mousemove';this.clickEvent='click';this.isVerticalDragOnly=c.isVerticalDragOnly||false;this.draggableElement=c.draggableElement;this.offsetLeft=c.offsetLeft;this.elementsToCapture=c.elementToCapture?jQuery(c.elementToCapture):this.root;this.disabledDraggableSelector=c.disabledDraggableSelector;this.onDragStartUIHandler=typeof c.onDragStartUIHandler==='function'?c.onDragStartUIHandler:this.noop;this.onDragEndUIHandler=typeof c.onDragEndUIHandler==='function'?c.onDragEndUIHandler:this.noop;this.defaultMouseMoveHandler=c.defaultMouseMoveHandler||function(e){e.preventDefault();};};this.forEach=function(s,a){return Array.prototype.forEach.call(s,a);};this.indexOf=function(s,i){return Array.prototype.indexOf.call(s,i);};this.insertBefore=function(s,i,r){var a,b,d;d=Array.prototype.splice;a=this.indexOf(s,i);b=this.indexOf(s,r);d.call(s,b-(a<b?1:0),0,d.call(s,a,1)[0]);};this.logToConsole=function(){window.console.log.apply(console,arguments);};this.getDraggableElement=function(a){var e,i=false,I=false;this.draggable=jQuery(this.draggableSelector,this.container);while(typeof e==='undefined'&&a!==this.root&&!jQuery(a).is(this.draggableSelectorBlocker)){i=i||jQuery(a).is(this.draggableElement)||this.draggableElement===undefined;if(!(jQuery(a).not(this.draggableSelectorExclude).length>0)){I=true;}if(!I&&i&&this.indexOf(this.draggable,a)>=0){e=a;}a=a.parentNode;}return e;};this.captureStart=function(e){var a;if(e.type==='touchstart'&&e.touches.length===1){a=e.touches[0];}else if(e.type==='mousedown'){a=e;if(e.which!=1){return;}}if(a){this.element=this.getDraggableElement(a.target);this.startX=this.moveX=a.pageX;this.startY=this.moveY=a.pageY;this.lastMoveX=0;this.lastMoveY=0;if(this.lastTapTime&&this.lastElement&&this.element&&(this.lastElement===this.element)&&Math.abs(Date.now()-this.lastTapTime)<this.doubleTapDelay){this.lastTapTime=0;this.tapsNumber=2;}else{this.lastTapTime=Date.now();this.tapsNumber=1;this.lastElement=this.element;}this.log('captureStart('+this.startX+', '+this.startY+')');}};this.startHandler=function(e){this.log('startHandler');if(this.isCombi&&!(e instanceof MouseEvent)){this.isTouchEvent=true;}clearTimeout(this.timer);delete this.timer;this.captureStart(e);if(this.element){this.startCallback(e,this.element);if(this.lockMode===false){if(this.tapsNumber===2){this.mode='double-tap';return;}if(this.isTouch||this.isTouchEvent){this.timer=setTimeout(function(){if(!jQuery(this.element).hasClass(this.disabledDraggableSelector)){this.log('mode switched to drag');this.mode='drag';this.onBeforeCreateClone(e,this.element);this.createClone();this.dragCallback(e,this.element);}else{this.onDragStartUIHandler();}this.isTouchEvent=false;}.bind(this),this.switchModeDelay);}}}}.bind(this);this.captureMove=function(e){var a;if(e.type==='touchmove'&&e.touches.length===1){a=e.touches[0];}else if(e.type==='mousemove'){a=e;}if(a){this.moveX=a.pageX;this.moveY=a.pageY;this.log('captureMove('+this.moveX+', '+this.moveY+')');}};this.moveHandler=function(e){var i;this.log('moveHandler');this.captureMove(e);if(this.element&&e.type==="mousemove"&&e.buttons===0){return this.endHandler(e);}switch(this.mode){case'normal':if((Math.abs(this.startX-this.moveX)>this.moveTolerance||Math.abs(this.startY-this.moveY)>this.moveTolerance)){if(this.isTouch||this.isTouchEvent){this.log('-> normal');clearTimeout(this.timer);delete this.timer;}else if(this.element){this.onDragStartUIHandler();if(!jQuery(this.element).hasClass(this.disabledDraggableSelector)){this.log('mode switched to drag');this.mode='drag';this.onBeforeCreateClone(e,this.element);this.createClone();}else{this.preventClick();this.element=null;}}}break;case'drag':e.preventDefault();this.onDragStartUIHandler();this.log('-> drag');if(this.isVerticalDragOnly){this.mode='vertical-drag';}else{this.mode='drag-and-scroll';}window.addEventListener(this.mouseUpEvent,this.endHandler,true);this.translateClone();this.scrollContainer=document.querySelector(this.scrollContainerSelector);this.dragAndScroll();if(!this.isTouch){this.dragCallback(e,this.element);}break;case'drag-and-scroll':e.stopPropagation();e.preventDefault();this.log('-> drag-and-scroll');i=this.dragAndScroll();this.translateClone();if(!i){this.moveDraggable();}this.dragAndScrollCallback({evt:e,clone:this.clone,isScrolling:i,moveX:this.moveX,moveY:this.moveY});break;case'vertical-drag':e.stopPropagation();e.preventDefault();i=this.dragAndScroll();this.translateClone();if(!i){this.moveDraggableVerticalOnly(this.moveX,this.moveY);}this.dragAndScrollCallback({evt:e,clone:this.clone,isScrolling:i,moveX:this.moveX,moveY:this.moveY});break;default:break;}}.bind(this);this.captureEnd=function(e){var a;if((e.type==='touchend'||e.type==='touchcancel')&&(e.changedTouches.length===1)){a=e.changedTouches[0];}else if(e.type==='mouseup'){a=e;}if(a){this.endX=a.pageX;this.endY=a.pageY;this.log('captureEnd('+this.endX+', '+this.endY+')');}};this.contextMenuHandler=function(e){if(this.isTouch){e.preventDefault();}}.bind(this);this.clickHandler=function(e){if(this.preventClickFlag){this.preventClickFlag=false;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();clearTimeout(this.preventClickTimeoutId);}this.clickCallback();}.bind(this);this.preventClick=function(){this.preventClickFlag=true;this.preventClickTimeoutId=setTimeout(function(){this.preventClickFlag=false;}.bind(this),100);};this.endCallbackAdapter=function(e,a,o){var b=this.endCallback.apply(null,arguments);jQuery.when(b).then(function(){this.removeClone(a,o.clone);this.onDragEndUIHandler(e);}.bind(this));this.preventClick();};this.endHandler=function(e){this.log('endHandler');this.captureEnd(e);switch(this.mode){case'normal':this.onDragEndUIHandler(e);this.log('-> normal');break;case'drag':this.log('-> drag');this.endCallbackAdapter(e,this.element,{clone:this.clone});break;case'drag-and-scroll':this.log('-> drag-and-scroll');window.removeEventListener(this.mouseUpEvent,this.endHandler,true);this.endCallbackAdapter(e,this.element,{deltaX:this.moveX-this.startX,deltaY:this.moveY-this.startY,clone:this.clone});e.stopPropagation();e.preventDefault();break;case'vertical-drag':this.log('-> vertical-drag');window.removeEventListener(this.mouseUpEvent,this.endHandler,true);this.endCallbackAdapter(e,this.element,{clone:this.clone});e.stopPropagation();e.preventDefault();break;case'double-tap':this.log('-> double-tap');this.doubleTapCallback(e,this.element);break;default:break;}clearTimeout(this.timer);delete this.timer;this.lastMoveX=0;this.lastMoveY=0;this.element=null;this.clone=null;this.mode='normal';}.bind(this);this.defaultDragStartHandler=function(e){e.preventDefault();};this.scrollHandler=function(){clearTimeout(this.scrollTimer);this.lockMode=true;this.scrollTimer=setTimeout(function(){this.lockMode=false;}.bind(this),500);}.bind(this);this.createClone=function(){var s,r;this.preventClickFlag=true;if(sap.ui.getCore().byId(this.element.id)&&sap.ui.getCore().byId(this.element.id).getBoundingRects){r=sap.ui.getCore().byId(this.element.id).getBoundingRects()[0];r.top=r.offset.y;r.left=r.offset.x;r.width+=5;}else{r=this.element.getBoundingClientRect();}this.clone=this.element.cloneNode(true);this.clone.removeAttribute("id");this.clone.removeAttribute("data-sap-ui");this.clone.className+=(' '+this.cloneClass);this.element.className+=(' '+this.placeHolderClass);s=this.clone.style;s.position='fixed';s.display='block';s.top=(r.top+this.deltaTop)+'px';s.left=r.left+'px';s.width=r.width+'px';s.zIndex='100';s.webkitTransition='-webkit-transform 0ms cubic-bezier(0.33, 0.66, 0.66, 1)';s.mozTransition='-moz-transform 0ms cubic-bezier(0.33, 0.66, 0.66, 1)';s.msTransition='-ms-transform 0ms cubic-bezier(0.33, 0.66, 0.66, 1)';s.transition='transform 0ms cubic-bezier(0.33, 0.66, 0.66, 1)';s.webkitTransform='translate3d(0px, 0px, 0px) ';s.mozTransform='translate3d(0px, 0px, 0px) ';s.msTransform='translate3d(0px, 0px, 0px) ';s.transform='translate3d(0px, 0px, 0px) ';this.root.appendChild(this.clone);this.log('createClone');};this.removeClone=function(e,a){this.preventClick();e.className=e.className.split(' '+this.placeHolderClass).join('');a.parentElement.removeChild(a);this.log('removeClone');};this.translateClone=function(){var d,a;d=this.moveX-this.startX;a=this.moveY-this.startY;this.clone.style.webkitTransform='translate3d('+d+'px, '+a+'px, 0px)';this.clone.style.mozTransform='translate3d('+d+'px, '+a+'px, 0px)';this.clone.style.msTransform='translate('+d+'px, '+a+'px)';this.clone.style.transform='translate3d('+d+'px, '+a+'px, 0px)';this.log('translateClone ('+d+', '+a+')');};this.dragAndScroll=function(){var d,a,s,t=this;function b(){s.webkitTransition='-webkit-transform '+a+'ms linear';s.transition='transform '+a+'ms linear';s.mozTransition='-moz-transform '+a+'ms linear';s.msTransition='-ms-transform '+a+'ms linear';s.webkitTransform='translate3d(0px, '+d+'px 0px)';s.mozTransform='translate3d(0px, '+d+'px 0px)';s.msTransform='translate3d(0px, '+d+'px 0px)';s.transform='translate3d(0px, '+d+'px 0px)';}function e(){s.webkitTransition='';s.mozTransition='';s.msTransition='';s.transition='';s.webkitTransform='';s.mozTransform='';s.msTransform='';s.transform='';t.wrapper.scrollTop-=d;}function g(){var r,h;if(t.clone){r=t.clone.getBoundingClientRect();h=t.wrapperRect.top-r.top;if(h>0){return h;}h=t.wrapper.offsetTop+t.wrapper.offsetHeight-(r.top+t.clone.offsetHeight);if(h<0){return h;}}return 0;}function i(){if(t.endDragAndScrollCallback(t.moveY)){return false;}if(d<0){return t.wrapper.getBoundingClientRect().top-(t.container.getBoundingClientRect().top+t.container.offsetHeight)+t.wrapper.offsetHeight<0;}return t.container.getBoundingClientRect().top-(t.wrapper.getBoundingClientRect().top+t.container.offsetTop)<0;}function f(){b();t.dragAndScrollTimer=setTimeout(function(){e();t.dragAndScrollTimer=undefined;if((d=g())!==0&&i()){f();}t.scrollCallback();},a);}d=g();if(d!==0&&!this.dragAndScrollTimer&&i()){a=this.dragAndScrollDuration;this.scrollContainer=this.scrollContainer||document.querySelector(this.scrollContainerSelector);s=this.scrollContainer.style;f();}this.log('dragAndScroll ('+d+')');return(d!=0)&&i();};this.moveDraggableVerticalOnly=function(){var h,i,r,m=true;this.forEach(this.draggable,function(a,b){if(!h){r=a.getBoundingClientRect();i=!(r.bottom<this.moveY||r.top>this.moveY);if(i){h=a;if(r.top+r.height/2<this.moveY){m=false;}}}}.bind(this));if(h&&this.element!==h){if(m){this.insertBefore(this.draggable,this.element,h);h.parentNode.insertBefore(this.element,h);}else{this.insertBefore(this.draggable,this.element,h.nextSibling);h.parentNode.insertBefore(this.element,h.nextSibling);}this.lastMoveX=this.moveX;this.lastMoveY=this.moveY;}this.log('moveDraggableVerticalonly');};this.moveDraggable=function(m,a){var e,h,b,i,d,r;this.forEach(this.draggable,function(f,g){if(!h){r=f.getBoundingClientRect();i=!(r.right<this.moveX||r.left>this.moveX);d=!(r.bottom<this.moveY||r.top>this.moveY);if(i&&d){h=f;b=g;}}}.bind(this));if(h&&this.element!==h){e=this.indexOf(this.draggable,this.element);if(Math.abs(this.lastMoveX-this.moveX)>=this.moveTolerance||Math.abs(this.lastMoveY-this.moveY)>=this.moveTolerance){if(b<=e){h.parentNode.insertBefore(this.element,h);this.insertBefore(this.draggable,this.element,h);}else if(b>e){h.parentNode.insertBefore(this.element,h.nextSibling);this.insertBefore(this.draggable,this.element,this.draggable[b+1]);}this.lastMoveX=this.moveX;this.lastMoveY=this.moveY;}}this.log('moveDraggable');};this.enable=function(){this.log('enable');this.root.addEventListener(this.touchMoveEvent,this.moveHandler,true);this.root.addEventListener(this.mouseMoveEvent,this.moveHandler,true);this.root.addEventListener(this.contextMenuEvent,this.contextMenuHandler,false);this.root.addEventListener(this.clickEvent,this.clickHandler,true);this.root.addEventListener(this.defaultDragStartEvent,this.defaultDragStartHandler,true);this.root.addEventListener(this.defaultMouseMoveEvent,this.defaultMouseMoveHandler,true);this.wrapper.addEventListener(this.scrollEvent,this.scrollHandler,false);if(this.elementsToCapture.length){var t=this;this.elementsToCapture.each(function(){this.addEventListener(t.touchStartEvent,t.startHandler,false);this.addEventListener(t.touchEndEvent,t.endHandler,false);this.addEventListener(t.touchCancelEvent,t.endHandler,false);this.addEventListener(t.mouseDownEvent,t.startHandler,false);this.addEventListener(t.mouseUpEvent,t.endHandler,false);});}else{this.elementsToCapture.addEventListener(this.touchStartEvent,this.startHandler,false);this.elementsToCapture.addEventListener(this.touchEndEvent,this.endHandler,false);this.elementsToCapture.addEventListener(this.touchCancelEvent,this.endHandler,false);this.elementsToCapture.addEventListener(this.mouseDownEvent,this.startHandler,false);this.elementsToCapture.addEventListener(this.mouseUpEvent,this.endHandler,false);}return this;};this.delete=function(){this.log('delete');this.disable();this.dragCallback=null;this.onBeforeCreateClone=null;this.endCallback=null;this.startCallback=null;this.scrollCallback=null;this.doubleTapCallback=null;this.clickCallback=null;this.dragAndScrollCallback=null;delete this;};this.disable=function(){this.log('disable');if(this.elementsToCapture.length){var t=this;this.elementsToCapture.each(function(){this.removeEventListener(t.touchStartEvent,t.startHandler,false);this.removeEventListener(t.touchEndEvent,t.endHandler,false);this.removeEventListener(t.touchCancelEvent,t.endHandler,false);this.removeEventListener(t.mouseDownEvent,t.startHandler,false);this.removeEventListener(t.mouseUpEvent,t.endHandler,false);});}else{this.elementsToCapture.removeEventListener(this.touchStartEvent,this.startHandler,false);this.elementsToCapture.removeEventListener(this.touchEndEvent,this.endHandler,false);this.elementsToCapture.removeEventListener(this.touchCancelEvent,this.endHandler,false);this.elementsToCapture.removeEventListener(this.mouseDownEvent,this.startHandler,false);this.elementsToCapture.removeEventListener(this.mouseUpEvent,this.endHandler,false);}this.root.removeEventListener(this.touchMoveEvent,this.moveHandler,true);this.root.removeEventListener(this.mouseMoveEvent,this.moveHandler,true);this.root.removeEventListener(this.contextMenuEvent,this.contextMenuHandler,false);this.root.removeEventListener(this.clickEvent,this.clickHandler,true);this.root.removeEventListener(this.defaultDragStartEvent,this.defaultDragStartHandler,true);this.root.removeEventListener(this.defaultMouseMoveEvent,this.defaultMouseMoveHandler,true);this.wrapper.removeEventListener(this.scrollEvent,this.scrollHandler,false);return this;};this.init(c);this.getMove=function(){return{x:this.moveX,y:this.moveY};};};return U;},true);
