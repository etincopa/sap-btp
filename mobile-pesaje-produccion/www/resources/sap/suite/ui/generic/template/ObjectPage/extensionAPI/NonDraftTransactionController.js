sap.ui.define(["sap/ui/base/Object"],function(B){"use strict";function g(t,c,s){return{attachAfterSave:function(f){t.oComponentUtils.attach(c,"AfterSave",f);},detachAfterSave:function(f){t.oComponentUtils.detach(c,"AfterSave",f);},attachAfterDelete:function(f){t.oComponentUtils.attach(c,"AfterDelete",f);},attachAfterLineItemDelete:function(f){t.oComponentUtils.attach(c,"AfterLineItemDelete",f);},detachAfterDelete:function(f){t.oComponentUtils.detach(c,"AfterDelete",f);},attachAfterCancel:function(f){t.oComponentUtils.attach(c,"AfterCancel",f);},detachAfterCancel:function(f){t.oComponentUtils.detach(c,"AfterCancel",f);},registerUnsavedDataCheckFunction:function(h){s.aUnsavedDataCheckFunctions=s.aUnsavedDataCheckFunctions||[];s.aUnsavedDataCheckFunctions.push(h);}};}return B.extend("sap.suite.ui.generic.template.ObjectPage.extensionAPI.NonDraftTransactionController",{constructor:function(t,c,s){Object.assign(this,g(t,c,s));}});});
