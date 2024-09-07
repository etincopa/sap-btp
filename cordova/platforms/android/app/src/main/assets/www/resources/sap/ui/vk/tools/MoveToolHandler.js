sap.ui.define(["sap/ui/base/EventProvider","sap/m/Menu","sap/m/MenuItem","../getResourceBundle","../threejs/thirdparty/three","./CoordinateSystem"],function(E,M,a,g,t,C){"use strict";var b=E.extend("sap.ui.vk.tools.MoveToolHandler",{metadata:{},constructor:function(c){this._tool=c;this._gizmo=c.getGizmo();this._rect=null;this._rayCaster=new THREE.Raycaster();this._handleIndex=-1;this._gizmoIndex=-1;this._handleAxis=new THREE.Vector3();this._gizmoOrigin=new THREE.Vector3();this._gizmoScale=1;this._objectSpace=new THREE.Matrix4();this._mouse=new THREE.Vector2();}});b.prototype._updateMouse=function(e){var s=this.getViewport().getRenderer().getSize();this._mouse.x=((e.x-this._rect.x)/s.width)*2-1;this._mouse.y=((e.y-this._rect.y)/s.height)*-2+1;this._rayCaster.setFromCamera(this._mouse,this.getViewport().getCamera().getCameraRef());};b.prototype._updateHandles=function(e,h){var p=this._handleIndex;this._handleIndex=-1;if(e.n===1||(e.event&&e.event.type==="contextmenu")){for(var i=0,l=this._gizmo.getGizmoCount();i<l;i++){var c=this._gizmo.getTouchObject(i);var f=this._rayCaster.intersectObject(c,true);if(f.length>0){this._handleIndex=c.children.indexOf(f[0].object);if(this._handleIndex>=0){this._gizmoIndex=i;this._gizmoOrigin.setFromMatrixPosition(c.matrixWorld);this._gizmoScale=c.scale.x;this._objectSpace.extractRotation(c.matrixWorld);if(this._gizmo._coordinateSystem!==C.World){this._objectSpace.copyPosition(c.matrixWorld);}if(this._handleIndex<3){this._handleAxis.setFromMatrixColumn(c.matrixWorld,this._handleIndex).normalize();}else if(this._handleIndex<6){this._handleAxis.setFromMatrixColumn(c.matrixWorld,this._handleIndex-3).normalize();}}}}}this._gizmo.highlightHandle(this._handleIndex,h||this._handleIndex===-1);if(p!==this._handleIndex){this.getViewport().setShouldRenderFrame();}};b.prototype.hover=function(e){if(this._inside(e)&&!this._gesture){this._updateMouse(e);this._updateHandles(e,true);e.handled|=this._handleIndex>=0;}};b.prototype.click=function(e){if(this._inside(e)&&!this._gesture){this._updateMouse(e);this._updateHandles(e,true);this._gizmo.selectHandle(this._handleIndex,this._gizmoIndex);e.handled|=this._handleIndex>=0;}};var d=new THREE.Vector3();b.prototype._getAxisOffset=function(){var r=this._rayCaster.ray;var c=this._handleAxis.clone().cross(r.direction).cross(r.direction).normalize();d.copy(r.origin).sub(this._gizmoOrigin);return c.dot(d)/c.dot(this._handleAxis);};b.prototype._getPlaneOffset=function(){var r=this._rayCaster.ray;d.copy(this._gizmoOrigin).sub(r.origin);var c=this._handleAxis.dot(d)/this._handleAxis.dot(r.direction);return r.direction.clone().multiplyScalar(c).sub(d);};b.prototype.beginGesture=function(e){if(this._inside(e)&&!this._gesture){this._updateMouse(e);this._updateHandles(e,false);if(this._handleIndex>=0){this._gesture=true;e.handled=true;this._gizmo.selectHandle(this._handleIndex,this._gizmoIndex);this._gizmo.beginGesture();if(this._handleIndex<3){this._dragOrigin=this._getAxisOffset();}else if(this._handleIndex<6){this._dragOrigin=this._getPlaneOffset();}}}};b.prototype._setOffset=function(o){if(this._tool.getEnableStepping()){var s=Math.pow(10,Math.round(Math.log10(this._gizmoScale)))*0.1;var m=new THREE.Matrix4().getInverse(this._objectSpace);var c=this._gizmoOrigin.clone().applyMatrix4(m);var p=this._gizmoOrigin.clone().add(o).applyMatrix4(m);for(var i=0;i<3;i++){var e=p.getComponent(i);if(Math.abs(e-c.getComponent(i))>s*1e-5){var f=Math.round(e/s)*s;d.setFromMatrixColumn(this._objectSpace,i).multiplyScalar(f-e);o.add(d);}}}if(isFinite(o.x)&&isFinite(o.y)&&isFinite(o.z)){this._gizmo._setOffset(o,this._gizmoIndex);}};b.prototype.move=function(e){if(this._gesture){e.handled=true;this._updateMouse(e);if(this._handleIndex<3){if(isFinite(this._dragOrigin)){this._setOffset(this._handleAxis.clone().multiplyScalar(this._getAxisOffset()-this._dragOrigin));}}else if(this._handleIndex<6){if(isFinite(this._dragOrigin.x)&&isFinite(this._dragOrigin.y)&&isFinite(this._dragOrigin.z)){this._setOffset(this._getPlaneOffset().sub(this._dragOrigin));}}}};b.prototype.endGesture=function(e){if(this._gesture){this._gesture=false;e.handled=true;this._updateMouse(e);this._gizmo.endGesture();this._dragOrigin=undefined;this._updateHandles(e,true);this.getViewport().setShouldRenderFrame();}};b.prototype.contextMenu=function(e){if(this._inside(e)){this._updateMouse(e);this._updateHandles(e,true);if(this._handleIndex>=0){e.handled=true;var m=new M({items:[new a({text:g().getText("TOOL_COORDINATE_SYSTEM_WORLD"),key:C.World}),new a({text:g().getText("TOOL_COORDINATE_SYSTEM_LOCAL"),key:C.Local}),new a({text:g().getText("TOOL_COORDINATE_SYSTEM_SCREEN"),key:C.Screen}),new a({text:g().getText("TOOL_COORDINATE_SYSTEM_CUSTOM"),key:C.Custom})],itemSelected:function(e){var i=e.getParameters("item").item;this._tool.setCoordinateSystem(i.getKey());}.bind(this)});m.openAsContextMenu(e.event,this.getViewport());}}};b.prototype.getViewport=function(){return this._tool._viewport;};b.prototype._getOffset=function(o){var r=o.getBoundingClientRect();var p={x:r.left+window.pageXOffset,y:r.top+window.pageYOffset};return p;};b.prototype._inside=function(e){if(this._rect===null||true){var i=this._tool._viewport.getIdForLabel();var c=document.getElementById(i);if(c===null){return false;}var o=this._getOffset(c);this._rect={x:o.x,y:o.y,w:c.offsetWidth,h:c.offsetHeight};}return(e.x>=this._rect.x&&e.x<=this._rect.x+this._rect.w&&e.y>=this._rect.y&&e.y<=this._rect.y+this._rect.h);};return b;});
