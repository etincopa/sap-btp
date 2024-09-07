/*!
 * OpenUI5
 * (c) Copyright 2009-2022 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Renderer","./InputRenderer","sap/ui/Device","sap/ui/core/LabelEnablement"],function(R,I,D,L){"use strict";var N=R.extend(I);N.apiVersion=2;N.writeInnerAttributes=function(r,c){var s=c.getParent(),a=this.getAccessibilityState(c);r.attr("type",D.system.desktop?"text":"number");if(sap.ui.getCore().getConfiguration().getRTL()){r.attr("dir","ltr");}a.disabled=null;if(N._isStepInput(s)){r.accessibilityState(s,a);}};N.getAriaRole=function(c){return"spinbutton";};N.getAccessibilityState=function(n){var a=I.getAccessibilityState.apply(this,arguments),m,M,f,d,s,A,r,b,c,S=n.getParent(),v=n.getValue();if(!N._isStepInput(S)){return a;}m=S._getMin();M=S._getMax();f=S.getValue();d=S.getDescription();A=S.getAriaLabelledBy();r=L.getReferencingLabels(S);b=S.getAriaDescribedBy().join(" ");a.valuenow=f;if(D.system.desktop&&v){a.valuetext=v;}if(d){s=S._getInput().getId()+"-descr";if(A.indexOf(s)===-1){A.push(s);}}c=r.concat(A).join(" ");if(typeof m==="number"){a.valuemin=m;}if(typeof M==="number"){a.valuemax=M;}if(!S.getEditable()){a.readonly=true;}if(b){a.describedby=b;}if(c){a.labelledby=c;}return a;};N._isStepInput=function(c){return c&&c.getMetadata().getName()==="sap.m.StepInput";};return N;});
