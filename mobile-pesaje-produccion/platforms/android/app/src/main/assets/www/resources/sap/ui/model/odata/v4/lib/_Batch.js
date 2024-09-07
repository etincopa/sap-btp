/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.script","./_Helper","sap/base/strings/escapeRegExp"],function(q,_,e){"use strict";var a={"POST":true,"PUT":true,"PATCH":true,"DELETE":true},b,r=/\$\d+/,c=/(\S*?)=(?:"(.+)"|(\S+))/;function g(C){var B=d(C,"boundary"),m=C.trim().indexOf("multipart/mixed");if(m!==0||!B){throw new Error('Invalid $batch response header "Content-Type": '+C);}B=e(B);return new RegExp('--'+B+'(?:[ \t]*\r\n|--)');}function d(H,p){var P,i=H.split(";"),m;p=p.toLowerCase();for(P=1;P<i.length;P+=1){m=c.exec(i[P]);if(m[1].toLowerCase()===p){return m[2]||m[3];}}}function f(m){var C=j(m,"content-type");return C.indexOf("multipart/mixed;")===0?C:undefined;}function h(m){var C=j(m,"content-id"),R;if(!C){throw new Error("Content-ID MIME header missing for the change set response.");}R=parseInt(C);if(isNaN(R)){throw new Error("Invalid Content-ID value in change set response.");}return R;}function j(H,m){var i,n,o=H.split("\r\n");for(i=0;i<o.length;i+=1){n=o[i].split(":");if(n[0].toLowerCase().trim()===m){return n[1].trim();}}}function k(C,R,I){var B=R.split(g(C)),m=[];B=B.slice(1,-1);B.forEach(function(n){var o,p,t,H,u,v,w,x,y,z,i,M,A,D={},E;A=n.indexOf("\r\n\r\n");M=n.slice(0,A);y=n.indexOf("\r\n\r\n",A+4);x=n.slice(A+4,y);o=f(M);if(o){m.push(k(o,n.slice(A+4),true));return;}w=x.split("\r\n");z=w[0].split(" ");D.status=parseInt(z[1]);D.statusText=z.slice(2).join(' ');D.headers={};for(i=1;i<w.length;i+=1){H=w[i];t=H.indexOf(':');u=H.slice(0,t).trim();v=H.slice(t+1).trim();D.headers[u]=v;if(u.toLowerCase()==="content-type"){p=d(v,"charset");if(p&&p.toLowerCase()!=="utf-8"){throw new Error('Unsupported "Content-Type" charset: '+p);}}}D.responseText=n.slice(y+4,-2);if(I){E=h(M);m[E]=D;}else{m.push(D);}});return m;}function s(H){var i,m=[];for(i in H){m=m.concat(i,":",H[i],"\r\n");}return m;}function l(R,C){var B=(C!==undefined?"changeset_":"batch_")+_.uid(),i=C!==undefined,m=[];if(i){m=m.concat("Content-Type: multipart/mixed;boundary=",B,"\r\n\r\n");}R.forEach(function(o,n){var p="",u=o.url;if(i){p="Content-ID:"+n+"."+C+"\r\n";}m=m.concat("--",B,"\r\n");if(Array.isArray(o)){if(i){throw new Error('Change set must not contain a nested change set.');}m=m.concat(l(o,n).body);}else{if(i&&!a[o.method]){throw new Error("Invalid HTTP request method: "+o.method+". Change set must contain only POST, PUT, PATCH or DELETE requests.");}u=u.replace(r,"$&."+C);m=m.concat("Content-Type:application/http\r\n","Content-Transfer-Encoding:binary\r\n",p,"\r\n",o.method," ",u," HTTP/1.1\r\n",s(_.resolveIfMatchHeader(o.headers)),"\r\n",JSON.stringify(o.body)||"","\r\n");}});m=m.concat("--",B,"--\r\n");return{body:m,batchBoundary:B};}b={deserializeBatchResponse:function(C,R){return k(C,R,false);},serializeBatchRequest:function(R){var B=l(R);return{body:B.body.join(""),headers:{"Content-Type":"multipart/mixed; boundary="+B.batchBoundary,"MIME-Version":"1.0"}};}};return b;},false);
